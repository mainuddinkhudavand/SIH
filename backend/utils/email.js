import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend", ".env") });
dotenv.config();

function getTransporter() {
  const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const smtpPort = Number(process.env.SMTP_PORT || "465");
  const smtpUser = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || "";
  const smtpPass = rawPass.replace(/\s+/g, "").trim();

  const isSecure = smtpPort === 465;

  return {
    transporter: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    }),
    fromEmail: (process.env.FROM_EMAIL || `E-Governance Portal <${smtpUser || "noreply@govconnect.in"}>`).trim(),
    smtpUser,
    smtpPass
  };
}

export const sendEmail = async (to, subject, html) => {
  try {
    const { transporter, fromEmail, smtpUser, smtpPass } = getTransporter();

    if (!smtpUser || !smtpPass || smtpPass === "testpass" || smtpPass === "your_email_app_password") {
      console.log(`[EMAIL MOCK - NO REAL SMTP CREDENTIALS SET IN ENV] To: ${to} | Subject: ${subject}`);
      return { messageId: "mock_id_set_env_vars" };
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
    console.error("❌ Primary SMTP failed, trying port 587 TLS fallback:", err.message);
    try {
      const { fromEmail, smtpUser, smtpPass } = getTransporter();
      const fallbackTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false }
      });
      const info = await fallbackTransporter.sendMail({ from: fromEmail, to, subject, html });
      console.log("✅ Fallback Gmail OTP Sent to:", to, "| Message ID:", info.messageId);
      return info;
    } catch (fallbackErr) {
      console.error("❌ Fallback SMTP also failed:", fallbackErr.message);
      return null;
    }
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

/**
 * Sends Stage Verification OTP & Office Transition Alert Email
 */
export const sendStageVerificationOtpEmail = async ({
  to,
  otp,
  applicationId,
  serviceTitle,
  actingOffice,
  action,
  nextOffice,
  officerRemarks,
  verifiedBy
}) => {
  if (!to) return null;

  const actionText = action === "approve"
    ? (nextOffice ? `Approved by ${actingOffice} & Forwarded to ${nextOffice}` : `Final Clearance by ${actingOffice} - Certificate Issued`)
    : action === "discrepancy"
    ? `Discrepancy Flagged by ${actingOffice}`
    : `Application Rejected by ${actingOffice}`;

  const statusColor = action === "approve" ? "#16a34a" : action === "discrepancy" ? "#d97706" : "#dc2626";

  const subject = `🔔 Application Stage Alert [${applicationId}]: ${actingOffice} ${action.toUpperCase()} (OTP: ${otp})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; background: #ffffff;">
      <div style="background-color: #0f172a; padding: 18px; border-radius: 8px 8px 0 0; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 1.3rem;">🏛️ State E-Governance & Revenue Portal</h2>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">Stage Verification & Inter-Office Tracking Alert</p>
      </div>
      <div style="padding: 20px 0;">
        <p style="font-size: 1rem; color: #334155; margin-top: 0;">Dear Citizen,</p>
        <p style="font-size: 1rem; color: #334155;">
          Your official application <strong>#${applicationId}</strong> for <strong>${serviceTitle || 'E-Governance Service'}</strong> has undergone stage review by <strong>${actingOffice}</strong>.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 0.95rem; color: #475569;"><strong>Reviewing Office:</strong> ${actingOffice} (${verifiedBy || actingOffice + ' Officer'})</p>
          <p style="margin: 0 0 8px 0; font-size: 0.95rem; color: ${statusColor}; font-weight: bold;"><strong>Stage Status:</strong> ${actionText}</p>
          ${nextOffice ? `<p style="margin: 0 0 8px 0; font-size: 0.95rem; color: #0284c7;"><strong>Passed To Next Office:</strong> ${nextOffice}</p>` : ''}
          ${officerRemarks ? `<p style="margin: 0; font-size: 0.95rem; color: #334155;"><strong>Officer Remarks:</strong> ${officerRemarks}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 24px 0; background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 10px; padding: 18px;">
          <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: #0369a1; font-weight: bold; letter-spacing: 1px;">STAGE SECURITY VERIFICATION OTP</p>
          <span style="font-size: 2.5rem; font-weight: bold; letter-spacing: 8px; color: #0284c7;">
            ${otp}
          </span>
          <p style="margin: 8px 0 0 0; font-size: 0.8rem; color: #64748b;">Keep this OTP for your official records and stage verification tracking on your portal.</p>
        </div>

        <p style="font-size: 0.9rem; color: #64748b; margin-top: 24px;">
          You can track real-time status updates and download official certificates from your <a href="http://localhost:3000/citizen-portal" style="color: #0284c7; text-decoration: underline;">Citizen Dashboard</a>.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(to, subject, html);
};
