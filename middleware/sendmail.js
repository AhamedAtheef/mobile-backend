import dotenv from "dotenv";
dotenv.config();

import sgMail from "@sendgrid/mail";

// ✅ Ensure API key exists
if (!process.env.SENDGRID_API_KEY) {
    throw new Error("🚨 SENDGRID_API_KEY is missing in .env file");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (email, subject, message) => {
    try {
        const msg = {
            to: email,
            from: {
                email: "ahdatheef451@gmail.com", // ✅ verified in SendGrid
                name: "Super Cell-City Support"
            },
            subject,
            text: message.replace(/<[^>]+>/g, ""), // plain-text fallback
            html: message, // HTML
        };

        const [response] = await sgMail.send(msg);
        console.log("✅ Email sent with status:", response.statusCode);
        return response;
    } catch (error) {
        console.error("❌ Email error:", error.response?.body || error.message);
        throw error;
    }
};

export default sendMail;

