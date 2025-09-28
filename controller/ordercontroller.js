import sendMail from "../middleware/sendmail.js";
import ORDER from "../models/orders.js";
import Product from "../models/product.js";

export async function createOrder(req, res) {
    try {
        const { email, products, name, address, phone, totalPrice } = req.body;

        // Extract all product IDs from request
        const productIds = products.map(p => p.productId);

        // Find existing products
        const existingProducts = await Product.find({ productid: { $in: productIds } });


        // Compare requested IDs vs found IDs
        const existingIds = existingProducts.map(p => p.productid);
        const missingIds = productIds.filter(id => !existingIds.includes(id));

        // If some are missing, send both info
        if (missingIds.length > 0) {
            return res.status(404).json({
                message: "Some products not found",
                existingProductIds: existingIds,
                missingProductIds: missingIds
            });
        }


        const lastOrder = await ORDER.findOne().sort({ createdAt: -1 });

        let newOrderId;
        if (lastOrder) {
            const lastId = lastOrder.orderId;
            const numberPart = parseInt(lastId.replace(/\D/g, ""));
            newOrderId = String(numberPart + 1);
        } else {
            newOrderId = `00100`;
        }


        const order = new ORDER({
            orderId: "ORD-" + newOrderId,
            products,
            name,
            address,
            phone,
            email,
            totalPrice,
        });

        await order.save();

        res.status(201).json({
            message: "Order created successfully",
            order
        });

        const message = `
🛒 Your Order Summary

Order ID: ${order.orderId}
Name: ${order.name}
Email: ${order.email}
Phone: ${order.phone}
Status: ${order.status}
Total: Rs.${order.totalPrice}

Shipping Address:
${order.address.street || ""}, ${order.address.city || ""}, ${order.address.zip || ""}

Products:
${order.products.map((p, i) =>
            `${i + 1}. Product ID: ${p.productId}  
   Qty: ${p.quantity}  
   Image: ${p.productimage}`
        ).join("\n\n")}

✅ Thanks for shopping with us!
`;

        await sendMail(email, "Order Summary", message);

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}


export async function getOrders(req, res) {
    try {
        const { page, limit } = req.params;

        if (req.user.role === "admin") {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;

            const countorders = await ORDER.countDocuments({});
            const totalpage = Math.ceil(countorders / limitNum);

            const orders = await ORDER.find({})
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);

            return res.status(200).json({
                message: "Orders fetched successfully",
                orders,
                totalpage,
            });
        } else {
            const orders = await ORDER.find({ email: req.user.email });
            return res.status(200).json({
                message: "Orders fetched successfully",
                orders,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message,
        });
    }
}


export async function updateOrder(req, res) {
    try {
        const { orderId } = req.params; // ensure param name matches route
        const updateData = req.body;

        const updatedOrder = await ORDER.findOneAndUpdate(
            { orderId: orderId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order updated successfully",
            updatedOrder
        });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}


export async function deleteOrder(req, res) {
    try {
        const { orderId } = req.params;
        
        if (req.user === null){
            return res.status(404).json({ message: "User not found" });
        }

        const deletedOrder = await ORDER.findOneAndDelete({ orderId: orderId });

        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order deleted successfully",
            deletedOrder
        });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}


