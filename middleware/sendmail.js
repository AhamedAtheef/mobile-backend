import { createTransport } from "nodemailer";

//  Create transport once, with pooling enabled
const transport = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,       // use true if port 465
    requireTLS: true,
    auth: {
        user: process.env.GMAIL, // Gmail address
        pass: process.env.PASS,  // Gmail App Password
    },
    pool: true,           // ✅ keep connection alive
    maxConnections: 5,    // optional - number of parallel connections
    maxMessages: 100,     // optional - reuse connection for multiple emails
});

//  Send mail using the already-opened transport
const sendMail = async (email, subject, message) => {
    try {
        const info = await transport.sendMail({
            from: `"Ecom Shop" <${process.env.GMAIL}>`,
            to: email,
            subject,
            text: message,
        });

        console.log(`✅ Email sent to ${email} (ID: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error("❌ Email failed:", error);
        throw error;
    }
};

export default sendMail;


