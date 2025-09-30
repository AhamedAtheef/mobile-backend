import bcrypt from "bcrypt"
import USER from "../models/user.js"
import jwt from "jsonwebtoken";
import sendMail from "../middleware/sendmail.js";
import OTP from "../models/otp.js";
import axios from "axios"

export async function createuser(req, res) {
    const { name, email, mobile, password, role } = req.body
    try {
        const existinguser = await USER.findOne({ email })
        if (existinguser) {
            return res.status(400).json({ message: "user already exist" })
        }
        const passwordhash = bcrypt.hashSync(password, 10)
        const userdata = {
            name,
            email,
            password: passwordhash,
            role,
            mobile
        }
        console.log(userdata)
        const user = new USER(userdata)
        await user.save()
        res.status(201).json({ message: "user created successfully" })
    } catch (err) {
        res.status(500).json({ message: "something went wrong" })

    }

}

export async function login(req, res) {
    const { email, password } = req.body
    try {
        const existinguser = await USER.findOne({ email: email })
        if (!existinguser) {
            return res.status(400).json({ message: "user not found" })
        }
        const isvalid = bcrypt.compareSync(password, existinguser.password)
        if (!isvalid) {
            return res.status(400).json({ message: "wrong email or password" })
        }
        //create a token and send it to the user
        const token = jwt.sign({
            email: existinguser.email,
            name: existinguser.name,
            role: existinguser.role,
            id: existinguser._id
        }, process.env.JWT_KEY, { expiresIn: "15d" })
        res.status(200).json({ message: "login successfull", token: token, role: existinguser.role, id: existinguser._id })

    } catch (err) {
        res.status(500).json({ message: "login failed something went wrong" })
        console.log(err.message)

    }

}

export async function googlelogin(req, res) {
    const googletoken = req.body.token;
    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${googletoken}` }
        });

        const { email, name, given_name, family_name } = response.data;

        if (!email) {
            return res.status(400).json({ message: "Google did not return an email" });
        }

        let user = await USER.findOne({ email });

        if (user) {
            const token = jwt.sign(
                { email: user.email, name: user.name, role: user.role, isBlocked: user.isBlocked },
                process.env.JWT_KEY,
                { expiresIn: "7d" }
            );
            return res.json({ token, role: user.role, message: "Login Success" });
        }

        // create new user
        const newuser = new USER({
            email,
            name: name || `${given_name || ""} ${family_name || ""}`.trim(),
            role: "user",
            isBlocked: false,
            isEmailverifyed: true,
            password: "123456" // dummy password
        });

        await newuser.save();

        const token = jwt.sign(
            { email: newuser.email, name: newuser.name, role: newuser.role, isBlocked: newuser.isBlocked },
            process.env.JWT_KEY,
            { expiresIn: "7d" }
        );

        return res.json({ token, role: newuser.role, message: "Login Success" });

    } catch (error) {
        console.error("Google login error:", error.response?.data || error.message);
        res.status(500).json({
            message: "Failed to login",
            error: error.response?.data || error.message
        });
    }
}


export async function generateOtp(req, res) {
    const { email } = req.body;

    try {
        console.log("📩 OTP request for:", email);

        const user = await USER.findOne({ email });
        if (!user) {
            console.log("❌ No user found");
            return res.status(400).json({ message: "User not found" });
        }

        // ✅ Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000);

        // ✅ Remove old OTPs
        await OTP.deleteMany({ email });

        // ✅ Save new OTP with expiry
        await OTP.create({
            email,
            otp: otpCode,
            expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
        });

        console.log("✅ OTP generated:", otpCode);

        // ✅ Branded Mail
        const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; background: #ffffff;">
        
        <!-- Header -->
        <div style="text-align: center; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
          <img src="/images/logo.png" alt="Super Cell-City" style="max-height: 60px; margin-bottom: 10px;" />
          <h1 style="color: #4CAF50; margin: 0;">Super Cell-City</h1>
          <p style="font-size: 14px; color: #777; margin: 5px 0 0;">Secure Verification Service</p>
        </div>

        <!-- OTP Section -->
        <div style="padding: 20px; text-align: center;">
          <p style="font-size: 16px; color: #333;">Hello 👋</p>
          <p style="font-size: 16px; color: #333;">
            Please use the OTP below to verify your account:
          </p>
          <h2 style="font-size: 32px; color: #4CAF50; margin: 20px 0; letter-spacing: 4px;">
            ${otpCode}
          </h2>
          <p style="font-size: 14px; color: #777;">
            ⚠️ This code will expire in <b>3 minutes</b>.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 15px; text-align: center; background: #f9f9f9; border-top: 1px solid #ddd; font-size: 12px; color: #555;">
          <p>✅ Sent securely via SendGrid</p>
          <p>© 2025 Super Cell-City. All Rights Reserved.</p>
        </div>
      </div>
    `;

        // ✅ Use middleware to send mail
        await sendMail(
            email,
            "🔐 Super Cell-City | Your OTP Code (Valid for 3 minutes)",
            htmlTemplate
        );

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("❌ Generate OTP error:", err);
        return res.status(500).json({ message: err.message || "Failed to send OTP" });
    }
}

// Verify OTP
export async function verifyOtp(req, res) {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (otpRecord.expiresAt < Date.now()) {
            await OTP.deleteOne({ email, otp });
            return res.status(400).json({ message: "OTP expired" });
        }

        await OTP.deleteOne({ email, otp });

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Verify OTP error:", error.message);
        return res.status(500).json({ message: "Failed to verify OTP" });
    }
}




export async function resetPassword(req, res) {
    const { email, password } = req.body;

    try {
        const user = await USER.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        // Correct update syntax
        await USER.updateOne(
            { email: email },            // filter
            { $set: { password: passwordHash } } // update
        );

        res.status(200).json({ message: "Password successfully reset" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            message: "Failed to reset password",
            error: error.message,
        });
    }
}
export async function adminValidate(req, res) {
    if (isAdmin(req)) {
        try {
            const user = await USER.findOne({ _id: req.user.id }).select("-password");
            return res.json(user, { message: "user fetched successfully" });
        } catch {
            res.status(500).json({ message: "Failed to fetch users", error: error.message });
        }
    } else {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
}

export function isAdmin(req) {
    if (req.user == null) {
        return false;
    }

    if (req.user.role == "admin") {
        return true;
    } else {
        return false;
    }
}
export async function getuser(req, res) {
    const { page, limit } = req.params
    if (req.user && req.user.role === "admin") {
        try {
            const countProducts = await USER.countDocuments();
            const totalPages = Math.ceil(countProducts / limit);
            const users = await USER.find({}).select("-password").skip((page - 1) * limit).limit(limit);
            return res.json({ message: "users fetched successfully", users, totalPages });
        } catch (error) {
            return res.status(500).json({ message: "Failed to fetch users", error: error.message });
        }
    } else {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
}


export async function myprofile(req, res) {
    try {
        const user = await USER.findOne({ email: req.user.email }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ user, message: "User fetched successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
}

export async function updateuser(req, res) {
    try {
        const user = await USER.findOneAndUpdate(
            { _id: req.params.userid },
            req.body,
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ user, message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user", error: error.message });
    }
}

export async function deleteuser(req, res) {
    try {
        const user = await USER.findByIdAndDelete({ _id: req.params.userid });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
}