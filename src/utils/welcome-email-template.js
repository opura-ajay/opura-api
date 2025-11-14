import nodemailer from "nodemailer";

export const sendVerificationEmail = async (
  email,
  firstName,
  token,
  defaultPassword
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}?token=${token}`;

    const html = `
      <div style="font-family:Arial;padding:20px;background:#f5f5f5;">
        <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px;padding:30px;">
          <h2 style="color:#1E40AF;">Welcome to Our Platform, ${
            firstName || "User"
          } 👋</h2>
          <p>Your account has been created with a default password <b>"${defaultPassword}"</b></p>
          <p>Please verify your email and set a new password to activate your account.</p>
          <a href="${verifyUrl}"
             style="display:inline-block;margin-top:20px;padding:12px 24px;background:#2563EB;color:white;border-radius:6px;text-decoration:none;font-weight:500;">
            Verify & Set Password
          </a>
          <p style="margin-top:20px;font-size:12px;color:#777;">
            ⚠️ This link will expire in <b>7 days</b>.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Welcome! Verify Your Account",
      html,
    });

    console.log(`📧 Verification email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending verification email:", err);
  }
};
