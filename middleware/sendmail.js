import { createTransport } from "nodemailer";

const sendMail = async (email, subject, message) => {
    try {
        const transport = createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for 587
            auth: {
                user: process.env.GMAIL,
                pass: process.env.PASS, // App Password if Gmail 2FA is on
            },
        });

        await transport.sendMail({
            from: process.env.GMAIL,
            to: email,
            subject: subject,
            text: message, // ✅ must be "text" or "html"
        });

        console.log(`✅ Email sent to ${email}`);
    } catch (error) {
        console.error("❌ Email failed:", error.message);
    }
};

export default sendMail;
