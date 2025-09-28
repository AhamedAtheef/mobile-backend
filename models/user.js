import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, //check email is unique
    },
    password: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
   role: {
      type:String,
      default:"user"
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isEmailverifyed:{
        type:Boolean,
        default:false 
    }
},{timestamps:true});
const USER = mongoose.model("User", userSchema);
export default USER