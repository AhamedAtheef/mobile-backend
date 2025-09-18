import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { addproducts, deleteproduct, getproducts, updateproduct } from "../controller/productcontroller.js";

const productRouter = express.Router();

// Route: POST /productnew
productRouter.post("/productnew", isAuth,addproducts);
productRouter.get("/getproducts", getproducts);
productRouter.put("/:id",isAuth, updateproduct);
productRouter.delete("/:id",isAuth, deleteproduct);

export default productRouter;

 