import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true,
    },
    products: [
        {
            productId: { type: String },
            quantity: { type: Number, default: 1 },
            productimage : {type : String}
        },
    ],
    name: { type: String, required: true },
    address: { type: Object, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "shipped", "delivered", "cancelled"],
    },
    totalPrice: { type: Number, required: true }
}, { timestamps: true });

const ORDER = mongoose.model("Order", orderSchema);
export default ORDER;