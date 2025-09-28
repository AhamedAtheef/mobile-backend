import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { addproducts, deleteproduct, getproducts, productdetailes, updateproduct } from "../controller/productcontroller.js";

const productRouter = express.Router();

// Route: POST /productnew
productRouter.post("/productnew", isAuth,addproducts);
productRouter.get("/getproducts", getproducts);
productRouter.get("/:id", productdetailes);
productRouter.put("/:productid",isAuth, updateproduct);
productRouter.delete("/:productid",isAuth, deleteproduct);

export default productRouter;

 