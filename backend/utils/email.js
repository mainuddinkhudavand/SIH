import nodemailer from "nodemailer";
//import statHelpers from "./statHelpers.js";

const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const smtpPort = Number(process.env.SMTP_PORT || "587");
const smtpUser = (process.env.SMTP_USER || "pavangoudar503@gmail.com").trim();
const smtpPass = (process.env.SMTP_PASS || "mtrwpkfcusrwpomt").trim();
const fromEmail = (process.env.FROM_EMAIL || "Municipality <pavangoudar503@gmail.com>").trim();

console.log("SMTP_HOST:", smtpHost);
console.log("SMTP_USER:", smtpUser);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};
