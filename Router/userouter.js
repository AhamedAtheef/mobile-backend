import express from "express";
import { adminValidate, createuser,  generateotp, getuser, login, myprofile, resetPassword, verifyOTP,  } from "../controller/usercontroller.js";
import { isAuth } from "../middleware/isAuth.js";


const userRouter = express.Router();

userRouter.post("/",createuser)
userRouter.post("/login",login)
userRouter.post("/getotp",generateotp)
userRouter.post("/verifyotp",verifyOTP)
userRouter.post("/resetpassword",resetPassword)
userRouter.get("/",isAuth,getuser)
userRouter.get("/isadmin",isAuth,adminValidate,)
userRouter.get("/profile",isAuth,myprofile,)


export default userRouter