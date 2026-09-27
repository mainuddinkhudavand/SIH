import { sendEmail } from "../utils/email.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// In-Memory / Local Disk Officer Profile Registry
let officerRegistry = [
  {
    id: "off-talati-hubli",
    officerName: "Officer Mainuddin K (Talati)",
    role: "talati",
    officeName: "Talati Office",
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubli",
    email: "talati.hubli@egram.gov.in",
    mobile: "+91 98765 43210",
    officeAddress: "Talati Chavadi & Village Circle Office, Hubli City, Dharwad, Karnataka"
  },
  {
    id: "off-tehsildar-hubli",
    officerName: "Officer Ramesh Patil (Tehsildar)",
    role: "tehsildar",
    officeName: "Tehsildar Office",
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubli",
    email: "tehsildar.hubli@egram.gov.in",
    mobile: "+91 98765 43211",
    officeAddress: "Tehsildar Sub-Division Office, Mini Vidhana Soudha, Hubli, Dharwad, Karnataka"
  },
  {
    id: "off-revenue-hubli",
    officerName: "Officer Suresh Deshmukh (Revenue Officer)",
    role: "revenue",
    officeName: "Revenue Office",
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubli",
    email: "revenue.hubli@egram.gov.in",
    mobile: "+91 98765 43212",
    officeAddress: "District Revenue Circle & Land Ledger Office, Hubli City, Dharwad, Karnataka"
  },
  {
    id: "off-muni-hubli",
    officerName: "Officer Vikram Rao (Municipal Officer)",
    role: "municipality",
    officeName: "Municipality Office",
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubli",
    email: "municipality.hubli@egram.gov.in",
    mobile: "+91 98765 43213",
    officeAddress: "Hubli-Dharwad Municipal Corporation (HDMC) Headquarters, Hubli, Karnataka"
  }
];

// Logged Negligence Disciplinary Warnings Sent
let negligenceNoticesSent = [];

// 📋 Get All Registered Officer Profiles by Jurisdiction (Database + Registry)
export const getOfficerProfiles = async (req, res) => {
  const { state, district, city } = req.query;
  let combined = [...officerRegistry];

  if (mongoose.connection.readyState === 1) {
    try {
      const dbUsers = await User.find({
        role: { $in: ["talati", "tehsildar", "revenue", "municipality", "resolver", "official"] }
      });

      dbUsers.forEach(u => {
        const mapped = {
          id: u._id.toString(),
          officerName: u.name,
          role: u.role,
          officeName: u.officeName || `${u.role.toUpperCase()} Office`,
          state: u.state || "Karnataka",
          district: u.district || "Dharwad",
          city: u.city || "Hubli",
          email: u.email,
          mobile: u.phone || "+91 98765 43210",
          officeAddress: `${u.officeName || u.role.toUpperCase() + ' Sub-Division Office'}, ${u.city || 'Hubli'}, ${u.district || 'Dharwad'}, ${u.state || 'Karnataka'}`
        };

        const existingIdx = combined.findIndex(o => o.email.toLowerCase() === u.email.toLowerCase() || (o.role.toLowerCase() === u.role.toLowerCase() && o.city.toLowerCase() === (u.city || "hubli").toLowerCase()));
        if (existingIdx >= 0) {
          combined[existingIdx] = mapped;
        } else {
          combined.unshift(mapped);
        }
      });
    } catch (e) {
      console.warn("Notice fetching db officers in resolver:", e.message);
    }
  }

  let result = combined;

  if (city) {
    result = result.filter(o => o.city.toLowerCase() === city.toLowerCase());
  } else if (district) {
    result = result.filter(o => o.district.toLowerCase() === district.toLowerCase());
  } else if (state) {
    result = result.filter(o => o.state.toLowerCase() === state.toLowerCase());
  }

  return res.json({ success: true, count: result.length, officers: result });
};

// 📝 Register or Update Officer Profile with Location Jurisdiction
export const updateOfficerProfile = (req, res) => {
  const { officerName, role, officeName, state, district, city, email, mobile, officeAddress } = req.body;

  if (!role || !city) {
    return res.status(400).json({ success: false, message: "Role and City jurisdiction are required" });
  }

  const existingIndex = officerRegistry.findIndex(
    o => o.role.toLowerCase() === role.toLowerCase() && o.city.toLowerCase() === city.toLowerCase()
  );

  const updatedProfile = {
    id: existingIndex >= 0 ? officerRegistry[existingIndex].id : `off-${role}-${Date.now()}`,
    officerName: officerName || `Officer ${role.toUpperCase()}`,
    role: role.toLowerCase(),
    officeName: officeName || `${role.toUpperCase()} Office`,
    state: state || "Karnataka",
    district: district || "Dharwad",
    city: city || "Hubli",
    email: email || `${role.toLowerCase()}.hubli@egram.gov.in`,
    mobile: mobile || "+91 98765 43210",
    officeAddress: officeAddress || `${role.toUpperCase()} Sub-Division Office, ${city}, ${district}, ${state}`
  };

  if (existingIndex >= 0) {
    officerRegistry[existingIndex] = updatedProfile;
  } else {
    officerRegistry.push(updatedProfile);
  }

  return res.json({
    success: true,
    message: `Officer Profile updated for ${updatedProfile.officerName} in ${updatedProfile.city} City`,
    profile: updatedProfile
  });
};

// 🚨 Dispatch Negligence Warning Email & System Notice to Delayed Officer
export const sendNegligenceNotice = async (req, res) => {
  const { applicationId, officerRole, officerEmail, officerName, officerMobile, officeAddress, city, district, state, pendingHours, reason } = req.body;

  const recipientEmail = officerEmail || "mainuddinkhudavand531@gmail.com";
  const targetOfficer = officerName || "Duty Officer";
  const appNo = applicationId || "APP-48HOUR-EXCEEDED";
  const hoursDelay = pendingHours || 48;

  const subject = `🚨 OFFICIAL DISCIPLINARY NOTICE: Negligence Warning for Application #${appNo}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #fff1f2;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #991b1b; margin: 0;">🚨 RESOLVER PORTAL - OFFICIAL DISCIPLINARY NOTICE</h2>
        <p style="color: #991b1b; font-weight: bold; font-size: 0.9rem; margin-top: 4px;">GOVERNMENT E-GOVERNANCE ESCALATION AUTHORITY</p>
      </div>

      <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #fca5a5; margin-bottom: 16px;">
        <h3 style="color: #7f1d1d; margin-top: 0;">Attention: ${targetOfficer} (${(officerRole || 'Officer').toUpperCase()})</h3>
        <p><strong>Office Address:</strong> ${officeAddress || 'Mini Vidhana Soudha, Hubli, Dharwad, Karnataka'}</p>
        <p><strong>Jurisdiction Location:</strong> ${city || 'Hubli'} City | ${district || 'Dharwad'} District | ${state || 'Karnataka'} State</p>
        <p><strong>Contact Details:</strong> Email: ${recipientEmail} | Mobile: ${officerMobile || '+91 98765 43210'}</p>
      </div>

      <div style="background-color: #fee2e2; padding: 14px; border-radius: 8px; color: #991b1b; margin-bottom: 16px; border-left: 5px solid #dc2626;">
        <h4 style="margin: 0 0 8px 0;">⚠️ MANDATORY 48-HOUR SLA BREACH & NEGLIGENCE WARNING:</h4>
        <p style="margin: 0; font-size: 0.92rem; line-height: 1.5;">
          Application <strong>#${appNo}</strong> submitted in <strong>${city || 'Hubli'} City</strong> has remained <strong>UNRESPONDED / UNAPPROVED for ${hoursDelay}+ Hours</strong>, exceeding the statutory 48-hour service guarantee limit.
        </p>
        <p style="margin: 8px 0 0 0; font-size: 0.88rem; font-weight: bold;">
          Reason / Escalation Note: ${reason || 'Officer failed to act or approve application within mandatory 48-hour window.'}
        </p>
      </div>

      <div style="text-align: center; color: #7f1d1d; font-size: 0.85rem; padding-top: 10px; border-top: 1px solid #fca5a5;">
        <p style="margin: 0;"><strong>REQUIRED ACTION:</strong> Log into your ${officerRole?.toUpperCase() || 'OFFICE'} Portal immediately to approve or process Application #${appNo}.</p>
        <p style="margin: 4px 0 0 0; color: #991b1b;">Issued by: State Resolver & Administrative Ombudsman Authority</p>
      </div>
    </div>
  `;

  try {
    const mailResult = await sendEmail(recipientEmail, subject, html);

    const noticeRecord = {
      id: `NOTICE-${Date.now()}`,
      applicationId: appNo,
      officerName: targetOfficer,
      officerEmail: recipientEmail,
      officerRole,
      pendingHours: hoursDelay,
      sentAt: new Date().toISOString(),
      status: "Dispatched",
      messageId: mailResult?.messageId || "SMTP_DISPATCHED"
    };

    negligenceNoticesSent.push(noticeRecord);

    return res.json({
      success: true,
      message: `🚨 Official Negligence Notice sent successfully to ${targetOfficer} (${recipientEmail}) for Application #${appNo}!`,
      notice: noticeRecord
    });
  } catch (err) {
    console.error("Error sending negligence notice:", err);
    return res.status(500).json({ success: false, message: "Error sending negligence notice", error: err.message });
  }
};
