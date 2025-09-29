import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import userRouter from "./Router/userouter.js";
import productRouter from "./Router/productrouter.js";
import orderRouter from "./Router/orderrouter.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Allowed Origins
const allowedOrigins = [
    "http://localhost:8080",              // frontend local
    "https://supercell-city.netlify.app"  // deployed frontend
];

// ✅ CORS Setup
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true); // allow Postman/curl
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error("CORS not allowed: " + origin), false);
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);


// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

// MongoDB + Server
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("✅ Database connected");
        app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err);
    });
