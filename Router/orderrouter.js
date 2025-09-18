import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { createOrder, deleteOrder, getOrders, updateOrder } from "../controller/ordercontroller.js";

const orderRouter = express.Router();

orderRouter.post("/",isAuth,createOrder)
orderRouter.get("/",isAuth,getOrders)
orderRouter.put("/:orderId", isAuth, updateOrder);
orderRouter.delete("/:orderId", isAuth, deleteOrder);

export default orderRouter