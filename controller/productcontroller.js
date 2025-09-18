import Product from "../models/product.js";

export async function addproducts(req, res) {
    try {
        if (!req.user.role == "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        const { title, description, price, category, labeledprice, stock } = req.body;
        const image = req.file;
        const generateId = Math.floor(Math.random() * 1000000);
        const productId = `product${generateId}`;
        const product = await Product.create({ title, description, price, category, labeledprice, stock, image: image?.path, productid: productId });
        res.status(201).json({ message: "product added successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

}

export async function getproducts(req, res) {
    try {
        const products = await Product.find({});
        res.status(200).json({ message: "products fetched successfully", products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

}


export async function updateproduct(req, res) {
    const productdata = req.body;
    const productId = req.params.id;

    try {
        // find and update in one go
        const updatedProduct = await Product.findOneAndUpdate(
            { productid: productId },
            { $set: productdata },
            { new: true } // ✅ return the updated product instead of old one
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "product not found" });
        }

        res.status(200).json({
            message: "product updated successfully",
            updatedProduct
        });

    } catch (error) {
        res.status(500).json({ message: "something went wrong", error: error.message });
    }
}

export async function deleteproduct(req, res) {
    const productId = req.params.id;
    try{
        const deletedProduct = await Product.findOneAndDelete({ productid: productId });
        if (!deletedProduct) {
            return res.status(404).json({ message: "product not found" });
        }
        res.status(200).json({ message: "product deleted successfully", deletedProduct });
    }catch(err){
        res.status(500).json({ message: err.message });
       
    }
}
