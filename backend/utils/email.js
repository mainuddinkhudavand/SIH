import nodemailer from "nodemailer";

function getTransporter() {
  const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpUser = (process.env.SMTP_USER || "sridhar83452816@gmail.com").trim();
  const smtpPass = (process.env.SMTP_PASS || "").trim();

  return {
    transporter: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // TLS
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    }),
    fromEmail: (process.env.FROM_EMAIL || `Citizen Grievance System <${smtpUser}>`).trim(),
    smtpPass
  };
}

export const sendEmail = async (to, subject, html) => {
  try {
    const { transporter, fromEmail, smtpPass } = getTransporter();

    if (!smtpPass || smtpPass === "testpass") {
      console.log(`[EMAIL MOCK - NO APP PASS SET] To: ${to} | Subject: ${subject}`);
      return { messageId: "mock_id_set_app_password" };
    }

    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });
    console.log("✅ Real Gmail OTP / Notification Sent to:", to, "| Message ID:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error sending real email via Gmail SMTP:", err.message);
    return null;
  }
};

/**
 * Sends OTP Email Verification
 */
export const sendOtpEmail = async (to, otp) => {
  const subject = "🔐 Citizen Grievance Portal - OTP Verification Code";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
      <h2 style="color: #0284c7; margin-top: 0;">Ministry of Rural Development / State Govt</h2>
      <h3 style="color: #1e293b;">Citizen Grievance & Public Utility Portal</h3>
      <p style="font-size: 1rem; color: #475569;">Your OTP verification code for secure account access is:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 2.2rem; font-weight: bold; letter-spacing: 6px; color: #0284c7; background: #f0f9ff; padding: 12px 28px; border-radius: 8px; border: 1px dashed #0284c7; display: inline-block;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 0.85rem; color: #64748b;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
  return await sendEmail(to, subject, html);
};

/**
 * Sends Complaint Status Tracking Notification Email
 */
export const sendComplaintStatusEmail = async (to, complaintTitle, status, notes = "") => {
  const statusColors = {
    Pending: "#eab308",
    Assigned: "#3b82f6",
    Accepted: "#0284c7",
    Completed: "#16a34a",
    Rejected: "#ef4444",
    Escalated: "#dc2626"
  };

  const color = statusColors[status] || "#3b82f6";
  const subject = `📌 Complaint Update: "${complaintTitle}" is now [${status}]`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; background: #ffffff;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px;">
        <h3 style="color: #0f172a; margin: 0;">Smart Public Utility Tracking System</h3>
      </div>
      <p style="font-size: 1rem; color: #334155;">Hello Citizen,</p>
      <p style="font-size: 1rem; color: #334155;">
        Your reported public infrastructure complaint <strong>"${complaintTitle}"</strong> status has been updated:
      </p>
      
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 1.2rem; font-weight: bold; color: #ffffff; background-color: ${color}; padding: 10px 24px; border-radius: 20px; display: inline-block;">
          Status: ${status}
        </span>
      </div>

      ${notes ? `
        <div style="background-color: #f8fafc; padding: 14px; border-left: 4px solid ${color}; border-radius: 6px; margin-bottom: 16px;">
          <strong>Department Notes:</strong> ${notes}
        </div>
      ` : ""}

      <p style="font-size: 0.9rem; color: #64748b; margin-top: 24px;">
        You can track real-time resolution progress and view before/after evidence photos on your <a href="http://localhost:3000/my-complaints" style="color: #0284c7; text-decoration: underline;">My Complaints Dashboard</a>.
      </p>
    </div>
  `;
  return await sendEmail(to, subject, html);
};
