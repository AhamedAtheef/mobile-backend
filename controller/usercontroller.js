import bcrypt from "bcrypt"
import USER from "../models/user.js"
import jwt from "jsonwebtoken";
import sendMail from "../middleware/sendmail.js";
import OTP from "../models/otp.js";


export async function createuser(req, res) {
    const { name, email, password, role } = req.body
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
            role
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


export async function generateotp(req, res) {
    const { email } = req.body
    try {
        const existinguser = await USER.findOne({ email })
        if (!existinguser) {
            return res.status(400).json({ message: "user not found" })
        }
        // generate otp 
        const OTPcode = Math.floor(10000 + Math.random() * 900000);
        console.log(OTPcode)

        await OTP.deleteMany({ email })
        await OTP.create({ email, otp: OTPcode })
        console.log(email, OTPcode)

        const message = `Please Verify Your Account Using OTP Vaide 3 minutes\n YOUR OTP IS :-${OTPcode}`
        await sendMail(email, "verify your account", message)
        res.status(200).json({ message: "otp sent successfully" })

    } catch (error) {
        res.status(500).json({ message: "something went wrong" })
    }

}

export async function verifyOTP(req, res) {
    const { email, otp } = req.body;

    try {
        // Check if OTP matches email + otp
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Remove OTP after verification
        await OTP.deleteOne({ email, otp });

        return res.status(200).json({ message: "OTP verifyed successfully" });
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
            message: "Failed to verify OTP",
            error: error.message,
        });
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
    const {page,limit} = req.params
    if (req.user && req.user.role === "admin") {
        try {
            const countProducts = await USER.countDocuments();
            const totalPages = Math.ceil(countProducts / limit);
            const users = await USER.find({}).select("-password").skip((page-1) * limit).limit(limit);
            return res.json({ message: "users fetched successfully", users,totalPages });
        } catch (error) {
            return res.status(500).json({ message: "Failed to fetch users", error: error.message });
        }
    } else {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
}


export async function myprofile(req, res) {
    try {
        const user = await USER.findOne({ _id: req.user.id }).select("-password");
        return res.json(user, { message: "user fetched successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
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
        const user = await USER.findByIdAndDelete(req.params.userid);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
}