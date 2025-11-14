// test-mail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // ✅ loads .env file

// ✅ 1. Create transporter instance
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // false for STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ 2. Verify connection
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection failed ❌:", error);
  } else {
    console.log("SMTP server is ready ✅");
  }
});

// ✅ 3. Send test email
const testMail = async () => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: "dkulkarni867@gmail.com",
      subject: "SMTP Test Mail",
      text: "If you receive this email, SMTP is working fine!",
    });

    console.log("✅ Email sent successfully:", info.messageId);
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};

testMail();
