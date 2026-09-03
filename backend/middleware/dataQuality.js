// Exception Handling & Data Quality Checks Middleware

export const dataQualityInspector = (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    let qualityFlags = [];
    let score = 100;

    const bodyStr = JSON.stringify(req.body);

    // 1. Script / SQL Injection Check
    if (/<script|select\s|insert\s|delete\s|drop\s|javascript:/i.test(bodyStr)) {
      return res.status(400).json({
        message: "Data Quality Exception: Invalid or malicious characters detected in input payload.",
        flags: ["SECURITY_EXCEPTION"]
      });
    }

    // 2. Format & Completeness Checks
    const { email, phone, aadhaarNumber } = req.body.applicantDetails || req.body;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      qualityFlags.push("INVALID_EMAIL_FORMAT");
      score -= 20;
    }

    if (phone && !/^\+?[0-9]{10,14}$/.test(phone.replace(/[\s-]/g, ""))) {
      qualityFlags.push("INVALID_PHONE_FORMAT");
      score -= 20;
    }

    if (aadhaarNumber && !/^[0-9]{12}$/.test(aadhaarNumber.replace(/[\s-]/g, ""))) {
      qualityFlags.push("INVALID_AADHAAR_FORMAT");
      score -= 15;
    }

    // Attach Quality Audit Metadata to Request
    req.dataQuality = {
      score: Math.max(score, 0),
      flags: qualityFlags,
      isClean: qualityFlags.length === 0,
      inspectedAt: new Date()
    };
  }

  next();
};

export default dataQualityInspector;
