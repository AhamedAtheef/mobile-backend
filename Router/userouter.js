import express from "express";
import { adminValidate, createuser,  deleteuser,  generateotp, getuser, googlelogin, login, myprofile, resetPassword, updateuser, verifyOTP,  } from "../controller/usercontroller.js";
import { isAuth } from "../middleware/isAuth.js";


const userRouter = express.Router();

userRouter.post("/",createuser)
userRouter.post("/login",login)
userRouter.post("/google-login",googlelogin)
userRouter.post("/getotp",generateotp)
userRouter.post("/verifyotp",verifyOTP)
userRouter.post("/resetpassword",resetPassword)
userRouter.put("/:userid",isAuth,updateuser)
userRouter.delete("/:userid",isAuth,deleteuser)
userRouter.get("/:page/:limit",isAuth,getuser)
userRouter.get("/isadmin",isAuth,adminValidate,)
userRouter.get("/profile",isAuth,myprofile,)


export default userRouter