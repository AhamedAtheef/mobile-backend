import express from "express";
import dotenv from "dotenv";
import userRouter from "./Router/userouter.js";
import mongoose from "mongoose";
import productRouter from "./Router/productrouter.js";
import orderRouter from "./Router/orderrouter.js";
import cors from "cors";


dotenv.config();


const app = express();
const port = process.env.PORT || 5000;

// Middleware
import cors from "cors";
app.use(cors({
    origin: "*", // or "https://your-netlify-app.netlify.app"
    credentials: true
}));

app.use(express.json());

// routes
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

// Connect to DB first, then start server
app.listen(port, () => {
    console.log(`Server is running on http://${port}`);
});

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("database connected")
}).catch(() => {
    console.log("failed to connect database")
})
