import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 180 // auto delete after 180 seconds = 3 minutes
  }
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
