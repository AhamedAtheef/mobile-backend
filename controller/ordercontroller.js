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

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}


export async function getOrders(req, res) {
    try {
        if (req.user.role == "admin") {
            const orders = await ORDER.find({});
            res.status(200).json({
                message: "Orders fetched successfully",
                orders
            });
        } else {
            const orderId = req.body.orderId;
            const orders = await ORDER.find({ orderId: orderId });
            res.status(200).json({
                message: "Orders fetched successfully",
                orders
            });
        }
    }
    catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message
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

        // Only admin can delete
        if (req.user.role?.toLowerCase() !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
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


