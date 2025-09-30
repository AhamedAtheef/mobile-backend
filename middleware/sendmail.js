import { createTransport } from "nodemailer";

const sendMail = async (email, subject, message) => {
  try {
    const transport = createTransport({
      host: "smtp.gmail.com",
      port: 587,        
      secure: false,    
      requireTLS: true,  
      auth: {
        user: process.env.GMAIL, 
        pass: process.env.PASS,  
      },
    });

    const info = await transport.sendMail({
      from: `"Super Cell-city" <${process.env.GMAIL}>`, // sender
      to: email,       // receiver
      subject: subject,
      text: message,   // plain text
      // html: `<p>${message}</p>` // optional HTML
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
};

export default sendMail;

