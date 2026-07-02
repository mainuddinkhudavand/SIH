import nodemailer from "nodemailer";
//import statHelpers from "./statHelpers.js";

console.log("SMTP_HOST:", process.env.SMTP_HOST); // debug
console.log("SMTP_USER:", process.env.SMTP_USER); // debug

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // must be smtp.gmail.com // process.env.SMTP_HOST
  port: Number(587) || 587,
  secure: false, // Gmail = false with port 587
  auth: {
    user: "pavangoudar503@gmail.com", //process.env.SMTP_USER
    pass: "mtrwpkfcusrwpomt", //process.env.SMTP_PASS
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: "Municipality <pavangoudar503@gmail.com>", //process.env.FROM_EMAIL
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
