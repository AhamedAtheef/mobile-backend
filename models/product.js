import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productid:{
        type:String,
        required:true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: [String],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    labeledprice: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    stock: {
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});

const Product = mongoose.model("Product", productSchema);
export default Product;