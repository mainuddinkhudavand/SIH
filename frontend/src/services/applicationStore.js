import API from "./api";

// 🏛️ Centralized Store Key for LocalStorage
const STORAGE_KEY = "egram_applications_master";
const SYNC_EVENT = "egram_application_updated";

// Initial Master Applications Data set to empty array so only real dynamically created applications exist
const INITIAL_MASTER_APPLICATIONS = [];


// Helper to sanitize application object and prevent nested object rendering bugs
export const sanitizeApp = (app) => {
  if (!app) return app;
  let amount = 50;
  if (app.governmentFee !== undefined && app.governmentFee !== null) {
    if (typeof app.governmentFee === "number" || typeof app.governmentFee === "string") {
      amount = app.governmentFee;
    } else if (typeof app.governmentFee === "object") {
      const rawAmt = app.governmentFee.amount;
      if (typeof rawAmt === "number" || typeof rawAmt === "string") {
        amount = rawAmt;
      } else if (typeof rawAmt === "object" && rawAmt !== null) {
        amount = typeof rawAmt.amount === "number" || typeof rawAmt.amount === "string" ? rawAmt.amount : 50;
      }
    }
  }
  return {
    ...app,
    governmentFee: {
      amount: typeof amount === "object" ? 50 : amount,
      isPaid: app.governmentFee?.isPaid !== undefined ? Boolean(app.governmentFee.isPaid) : true
    }
  };
};

// Helper to get master applications from LocalStorage or initialize default
export const getAllApplicationsFromStore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((a) => {
          const id = (a.applicationId || "").toUpperCase();
          const name = (a.applicantDetails?.fullName || a.applicantDetails?.name || "").toLowerCase();
          const isLegacyDemo =
            ["APP-401928", "APP-509124", "CERT-102948", "APP-884920", "APP-302910", "CERT-847291", "CERT-672910", "CERT-INC-9001", "CERT-INC-9002", "APP-PROP-9003", "CERT-BIRTH-9004", "CERT-908123", "APP-718290"].includes(id) ||
            name.includes("ramesh patil") || name.includes("anita sharma") || name.includes("sunil kumar") || name.includes("pavan kumar") || name.includes("suresh deshmukh");
          return !isLegacyDemo;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return filtered.map(sanitizeApp);
      }
    }
  } catch (err) {
    console.error("Error loading application store:", err);
  }
  return [];
};

// Helper to filter applications for a specific office portal ("Municipality", "Tehsildar", "Revenue", "Talati") & target city
export const getOfficeApplicationsFromStore = (officeName, targetCity) => {
  const allApps = getAllApplicationsFromStore();
  return allApps.filter((app) => {
    const isOffice =
      app.currentOffice === officeName ||
      app.primaryOffice === officeName ||
      (Array.isArray(app.officeChain) && app.officeChain.includes(officeName));

    if (!isOffice) return false;

    if (targetCity) {
      const appCity = (app.location?.city || app.applicantDetails?.city || app.applicantDetails?.town || "Hubli").toLowerCase();
      const cityFilter = targetCity.toLowerCase();
      const isMatch =
        appCity === cityFilter ||
        (appCity.includes("hubl") && cityFilter.includes("hubl")) ||
        (appCity.includes("dharwad") && cityFilter.includes("dharwad")) ||
        (appCity.includes("belagavi") && cityFilter.includes("belagavi")) ||
        (appCity.includes("mysuru") && cityFilter.includes("mysuru")) ||
        (appCity.includes("bengaluru") && cityFilter.includes("bengaluru")) ||
        (appCity.includes("mumbai") && cityFilter.includes("mumbai")) ||
        (appCity.includes("pune") && cityFilter.includes("pune")) ||
        (appCity.includes("nagpur") && cityFilter.includes("nagpur")) ||
        (appCity.includes("ahmedabad") && cityFilter.includes("ahmedabad"));
      return isMatch;
    }

    return true;
  });
};

// Helper to find a specific application by ID or custom applicationId
export const getApplicationByIdFromStore = (id) => {
  const allApps = getAllApplicationsFromStore();
  const searchId = (id || "").toString().trim().toLowerCase();
  return (
    allApps.find(
      (a) =>
        (a._id && a._id.toString().toLowerCase() === searchId) ||
        (a.applicationId && a.applicationId.toString().toLowerCase() === searchId)
    ) || null
  );
};

// Helper to update application status & stage verifications seamlessly
export const updateApplicationInStore = (appId, updatePayload, notifyBackend = true) => {
  const allApps = getAllApplicationsFromStore();
  let updatedApp = null;

  const targetId = typeof appId === "object" ? (appId.applicationId || appId._id) : String(appId || "");
  const altId = typeof appId === "object" ? (appId._id || appId.applicationId) : String(appId || "");

  const action = updatePayload.action;
  const officerRemarks = updatePayload.officerRemarks || updatePayload.note || "";
  const verifiedBy = updatePayload.verifiedBy || `${updatePayload.officeName || "Office"} Officer`;

  const updatedApps = allApps.map((item) => {
    const isMatch =
      item._id === targetId ||
      item.applicationId === targetId ||
      (altId && (item._id === altId || item.applicationId === altId));

    if (isMatch) {
      const stageIdx = item.currentStageIndex || 0;
      const officeChain = item.officeChain || [item.currentOffice || "Municipality"];
      const stageOtp = Math.floor(100000 + Math.random() * 900000).toString();

      let updatedVerifications = (item.stageVerifications || []).map((s, idx) => {
        if (idx === stageIdx || s.officeName === item.currentOffice) {
          return {
            ...s,
            status: action === "approve" ? "cleared" : action === "discrepancy" ? "discrepancy" : "rejected",
            officerRemarks: officerRemarks || s.officerRemarks || `Officer Action: ${action ? action.toUpperCase() : "UPDATED"}`,
            verifiedBy: verifiedBy || `${item.currentOffice || 'Office'} Officer`,
            verifiedAt: new Date().toISOString(),
            stageOtp: stageOtp
          };
        }
        return s;
      });

      let nextStatus = item.status;
      let nextOffice = item.currentOffice;
      let nextStageIdx = stageIdx;
      let approvalDate = item.approvalDate;
      let issuedCertificate = item.issuedCertificate;
      let rejectionReason = item.rejectionReason;

      let timelineNote = "";
      if (action === "approve") {
        const nextIdx = stageIdx + 1;
        if (nextIdx < officeChain.length) {
          nextStageIdx = nextIdx;
          nextOffice = officeChain[nextIdx];
          nextStatus = `${nextOffice} Verification Pending`;
          timelineNote = `${officerRemarks || item.currentOffice + ' stage verified.'} Passed to ${nextOffice}. (Stage OTP: ${stageOtp})`;
        } else {
          // Final office clearance -> Application fully Approved
          nextOffice = "Completed";
          nextStatus = "Approved";
          approvalDate = new Date().toISOString();
          issuedCertificate = item.issuedCertificate || {
            certificateId: `CERT-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
            issuedAt: new Date().toISOString(),
            digitalSignature: `SIG-DIGI-OFFICIAL-EGRAM-${Date.now()}`,
            qrCodeData: `https://egram.gov.in/verify/${item.applicationId || targetId}`
          };
          timelineNote = `${officerRemarks || item.currentOffice + ' final approval completed. Certificate issued.'} (Stage OTP: ${stageOtp})`;
        }
      } else if (action === "discrepancy") {
        nextStatus = "Discrepancy Found";
        rejectionReason = officerRemarks || "Discrepancy flagged by officer during verification.";
        timelineNote = `Officer Action: ${officerRemarks || 'Discrepancy noted'}. Action required from citizen. (Stage OTP: ${stageOtp})`;
      } else if (action === "reject") {
        nextStatus = "Rejected";
        rejectionReason = officerRemarks || "Application rejected during office review.";
        timelineNote = `Rejection reason: ${officerRemarks || 'Rejected during review'}. (Stage OTP: ${stageOtp})`;
      }

      const updatedTimeline = [
        ...(item.timeline || []),
        ...(action ? [{
          stage: action === "approve" ? `Office Clearance (${item.currentOffice})` : action === "discrepancy" ? `Discrepancy Flagged (${item.currentOffice})` : `Application Rejected (${item.currentOffice})`,
          status: nextStatus,
          updatedBy: verifiedBy || `${item.currentOffice || 'Office'} Officer`,
          note: timelineNote,
          timestamp: new Date().toISOString()
        }] : [])
      ];

      updatedApp = sanitizeApp({
        ...item,
        ...updatePayload,
        status: action ? nextStatus : (updatePayload.status || item.status),
        currentOffice: action ? nextOffice : (updatePayload.currentOffice || item.currentOffice),
        currentStageIndex: nextStageIdx,
        stageVerifications: updatedVerifications,
        timeline: updatedTimeline,
        approvalDate: approvalDate,
        issuedCertificate: issuedCertificate,
        rejectionReason: rejectionReason,
        updatedAt: new Date().toISOString()
      });
      return updatedApp;
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedApps));

  // Dispatch custom event to notify all active UI components for instant re-render
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { appId: targetId, updatedApp } }));

  // Also sync with backend asynchronously if backend is available
  if (notifyBackend && targetId && action) {
    API.put(`/applications/${targetId}/verify-stage`, {
      action,
      officerRemarks,
      verifiedBy
    }).catch((err) => console.warn("Backend sync notice (offline mode active):", err.message));
  }

  // 📧 Dispatch Official Email Notification to Applicant Email after Each Stage Approval
  if (updatedApp && action) {
    const applicantEmail = (
      updatedApp.applicantDetails?.email ||
      updatedApp.applicantEmail ||
      "citizen@egram.gov.in"
    ).toLowerCase().trim();

    const applicantName = updatedApp.applicantDetails?.fullName || updatedApp.applicantDetails?.name || "Citizen";
    const appTitle = updatedApp.title || updatedApp.serviceType || "Government Application";
    const appNum = updatedApp.applicationId || targetId;

    const emailSubject = `📧 E-Gov Official Notification: Application #${appNum} Status Updated to '${updatedApp.status}'`;
    const emailBody = `Dear ${applicantName},\n\nYour application #${appNum} for '${appTitle}' has been updated to '${updatedApp.status}' by ${verifiedBy}.\n\nOfficer Remarks: ${officerRemarks || 'Stage verification completed.'}\n\nPlease log in to your Citizen Portal to view full tracking details.\n\nE-Governance Public Authority`;

    console.log(`[EMAIL DISPATCH] Sent approval notification email to: ${applicantEmail}`);

    API.post("/notifications/send-email", {
      to: applicantEmail,
      subject: emailSubject,
      message: emailBody,
      applicationId: appNum,
      status: updatedApp.status,
      verifiedBy: verifiedBy
    }).catch((err) => console.warn("Email API notification dispatch note:", err.message));

    const notificationEntry = {
      id: `NOTIF-${Date.now()}`,
      to: applicantEmail,
      subject: emailSubject,
      sentAt: new Date().toISOString(),
      type: "EMAIL_APPROVAL_NOTIFICATION"
    };

    updatedApp.notifications = [...(updatedApp.notifications || []), notificationEntry];
  }

  return updatedApp;
};

// Helper for Citizen Dues Payment
export const payDuesInStore = (appId, paymentPayload) => {
  const allApps = getAllApplicationsFromStore();
  let updatedApp = null;
  const receiptNo = `PAY-RC-${Math.floor(100000 + Math.random() * 900000)}`;

  const updatedApps = allApps.map((item) => {
    if (item._id === appId || item.applicationId === appId) {
      const nextIdx = (item.currentStageIndex || 0) + 1;
      const nextOffice = item.officeChain?.[nextIdx] || "Completed";

      const updatedVerifications = (item.stageVerifications || []).map((s) => {
        if (s.status === "dues_pending" || s.officeName === item.currentOffice) {
          return {
            ...s,
            status: "cleared",
            officerRemarks: `Dues ₹${item.pendingDues?.amount || 450} paid via ${paymentPayload.paymentMethod} (${paymentPayload.bankName || "Online Bank"}). Receipt: ${receiptNo}`,
            verifiedBy: "Online Dues Engine",
            verifiedAt: new Date().toISOString()
          };
        }
        return s;
      });

      const isFinal = nextIdx >= (item.officeChain?.length || 1);

      updatedApp = sanitizeApp({
        ...item,
        status: isFinal ? "Approved" : `${nextOffice} Verification Pending`,
        currentOffice: isFinal ? "Completed" : nextOffice,
        currentStageIndex: nextIdx,
        approvalDate: isFinal ? new Date().toISOString() : item.approvalDate,
        issuedCertificate: isFinal
          ? {
              certificateId: `CERT-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
              issuedAt: new Date().toISOString(),
              digitalSignature: `SIG-DIGI-OFFICIAL-EGRAM-${Date.now()}`,
              qrCodeData: `https://egram.gov.in/verify/${item.applicationId}`
            }
          : item.issuedCertificate,
        pendingDues: {
          ...item.pendingDues,
          isPaid: true,
          paymentMethod: paymentPayload.paymentMethod,
          bankName: paymentPayload.bankName,
          accountNumber: paymentPayload.accountNumber,
          accountHolderName: paymentPayload.accountHolderName,
          ifscCode: paymentPayload.ifscCode,
          upiId: paymentPayload.upiId,
          cardType: paymentPayload.cardType,
          paymentReceiptNo: receiptNo,
          paidAt: new Date().toISOString()
        },
        stageVerifications: updatedVerifications,
        updatedAt: new Date().toISOString()
      });
      return updatedApp;
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedApps));
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { appId, updatedApp } }));

  // Asynchronously attempt backend sync
  API.post(`/applications/${appId}/pay-dues`, paymentPayload).catch((err) =>
    console.warn("Backend dues payment sync notice (offline mode active):", err.message)
  );

  return updatedApp;
};

// Helper to create & insert a new application into the central store seamlessly
export const createNewApplicationInStore = (payload) => {
  const serviceId = payload.serviceId || "custom-service";
  const isCert = serviceId.includes("certificate") || serviceId.includes("extract") || serviceId.includes("cert");
  const prefix = isCert ? "CERT" : "APP";
  const applicationId = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

  let primaryOffice = "Municipality";
  let officeChain = ["Municipality"];

  if (serviceId.includes("income") || serviceId.includes("caste") || serviceId.includes("domicile") || serviceId.includes("residence") || serviceId.includes("solvency") || serviceId.includes("heir")) {
    primaryOffice = "Tehsildar";
    officeChain = ["Talati", "Tehsildar"];
  } else if (serviceId.includes("land") || serviceId.includes("mutation") || serviceId.includes("revenue") || serviceId.includes("tax")) {
    primaryOffice = "Revenue";
    officeChain = ["Talati", "Revenue"];
  } else if (serviceId.includes("7-12") || serviceId.includes("8-a") || serviceId.includes("crop") || serviceId.includes("extract")) {
    primaryOffice = "Talati";
    officeChain = ["Talati"];
  }

  let feeAmount = 50;
  if (typeof payload.governmentFee === "number" || typeof payload.governmentFee === "string") {
    feeAmount = payload.governmentFee;
  } else if (typeof payload.governmentFee === "object" && payload.governmentFee !== null) {
    if (typeof payload.governmentFee.amount === "number" || typeof payload.governmentFee.amount === "string") {
      feeAmount = payload.governmentFee.amount;
    }
  }

  const userObj = JSON.parse(localStorage.getItem("user") || "{}");
  const appLocation = payload.location || {
    state: payload.applicantDetails?.state || userObj.state || userObj.address?.state || "Karnataka",
    district: payload.applicantDetails?.district || userObj.district || userObj.address?.district || "Dharwad",
    city: payload.applicantDetails?.city || payload.applicantDetails?.town || userObj.city || userObj.address?.town || "Hubli"
  };

  const newApp = sanitizeApp({
    _id: `app-local-${Date.now()}`,
    applicationId,
    serviceId,
    serviceType: payload.serviceType || "E-Governance Public Service",
    title: payload.title || payload.serviceTitle || `${serviceId.replace("-", " ").toUpperCase()} Request`,
    primaryOffice,
    currentOffice: officeChain[0],
    officeChain,
    currentStageIndex: 0,
    location: appLocation,
    governmentFee: {
      amount: feeAmount,
      isPaid: true
    },
    status: `${officeChain[0]} Verification Pending`,
    applicantDetails: {
      fullName: payload.applicantDetails?.fullName || "Citizen Resident",
      phone: payload.applicantDetails?.phone || "+91 98765 43210",
      email: payload.applicantDetails?.email || "citizen@egram.gov.in",
      aadhaarId: payload.applicantDetails?.aadhaarId || "9876-5432-1000",
      address: payload.applicantDetails?.address || "Village Ward #2, Gram Panchayat Zone",
      state: appLocation.state,
      district: appLocation.district,
      city: appLocation.city,
      ...payload.applicantDetails
    },
    documents: payload.documents || [
      { docType: "Aadhaar Identity Proof", fileUrl: "/uploads/aadhaar.pdf" },
      { docType: "Address Verification Slip", fileUrl: "/uploads/proof.pdf" }
    ],
    stageVerifications: officeChain.map((off, idx) => ({
      officeName: off,
      stageName: `Step ${idx + 1}: ${off} Verification Audit`,
      status: "pending"
    })),
    createdAt: new Date().toISOString()
  });

  const allApps = getAllApplicationsFromStore();
  const updatedApps = [newApp, ...allApps];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedApps));

  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { appId: applicationId, updatedApp: newApp } }));

  // Asynchronously attempt backend API creation if connected
  API.post("/applications/submit", payload).catch((err) =>
    console.warn("Backend API submit notice (offline local store active):", err.message)
  );

  return newApp;
};

// Subscribe helper for components to re-render automatically on updates
export const subscribeToAppStore = (callback) => {
  const handler = (e) => callback(e.detail);
  window.addEventListener(SYNC_EVENT, handler);
  return () => window.removeEventListener(SYNC_EVENT, handler);
};
