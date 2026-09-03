import Complaint from "../models/Complaint.js";

/**
 * AI Text Classifier for Public Utility Complaints.
 * Analyzes citizen issue text and determines Category, Urgency Priority, and Department.
 * @param {string} title 
 * @param {string} description 
 * @returns {object} { category, priority, department, confidence }
 */
export function classifyGrievanceText(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  let category = "Roads/potholes";
  let priority = "Medium";
  let department = "Public Works Department (PWD)";
  let confidence = 85;

  // Keyword Rule Sets
  const keywordsMap = {
    "Streetlights/ Electricity": {
      keywords: ["light", "streetlight", "electricity", "power", "outage", "transformer", "wire", "blackout", "spark", "current", "pole", "bulb", "darkness"],
      department: "Electricity Board & Energy Department",
      defaultPriority: "High"
    },
    "Water supply/leakages": {
      keywords: ["water", "pipe", "pipeline", "leakage", "burst", "drinking water", "contamination", "tap", "supply", "dirty water", "pressure", "no water"],
      department: "Water Supply & Sanitation Department",
      defaultPriority: "High"
    },
    "Roads/potholes": {
      keywords: ["pothole", "road", "bus stand", "asphalt", "tar", "accident hazard", "crack", "pavement", "bridge", "divider", "highway", "traffic hazard"],
      department: "Public Works Department (PWD)",
      defaultPriority: "High"
    },
    "Garbage collection/ Waste Management": {
      keywords: ["garbage", "dump", "trash", "waste", "cleaning", "smell", "filth", "dustbin", "litter", "overflowing", "collector", "hygiene"],
      department: "Solid Waste Management Department",
      defaultPriority: "Medium"
    },
    "Public toilets": {
      keywords: ["toilet", "bathroom", "washroom", "restroom", "latrine", "urinal", "public toilet", "sanitation block"],
      department: "Public Sanitation & Health Department",
      defaultPriority: "Medium"
    },
    "Parks": {
      keywords: ["park", "garden", "bench", "playground", "tree", "plant", "lawn", "flower", "greenery"],
      department: "Horticulture & Parks Department",
      defaultPriority: "Low"
    },
    "Public facilities": {
      keywords: ["bus stand facility", "public hall", "community center", "shelter", "stadium", "library", "auditorium", "public building"],
      department: "Public Infrastructure & Facilities Department",
      defaultPriority: "Medium"
    }
  };


  // Score each category based on keyword occurrence
  let bestCategory = null;
  let maxMatches = 0;

  for (const [catName, config] of Object.entries(keywordsMap)) {
    let matches = 0;
    for (const kw of config.keywords) {
      if (text.includes(kw)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = catName;
    }
  }

  if (bestCategory) {
    category = bestCategory;
    department = keywordsMap[bestCategory].department;
    priority = keywordsMap[bestCategory].defaultPriority;
    confidence = Math.min(98, 70 + maxMatches * 10);
  }

  // Priority Escalation Keywords
  if (text.includes("large") || text.includes("severe") || text.includes("bus stand") || text.includes("school") || text.includes("hospital") || text.includes("highway") || text.includes("dangerous") || text.includes("injury") || text.includes("urgent")) {
    priority = "High";
  }

  if (text.includes("sparking") || text.includes("live wire") || text.includes("flood") || text.includes("burst") || text.includes("fire") || text.includes("poison") || text.includes("emergency") || text.includes("critical")) {
    priority = "Critical";
  }

  return {
    category,
    priority,
    department,
    confidence
  };
}

/**
 * Calculates distance between two lat/lng pairs in meters using Haversine formula.
 */
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Searches for existing active complaints in the same category within a 300m radius
 * to automatically group duplicates into a unified ticket cluster.
 * @param {array} coordinates - [lng, lat]
 * @param {string} category 
 * @param {string} userId 
 * @returns {Promise<object|null>} Primary parent complaint if duplicate detected
 */
export async function findDuplicateCluster(coordinates, category, userId) {
  const lng = coordinates?.[0] || 0;
  const lat = coordinates?.[1] || 0;
  if (lat === 0 && lng === 0) return null;

  try {
    // Look back last 14 days for open tickets in same category
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const candidateComplaints = await Complaint.find({
      createdAt: { $gte: fourteenDaysAgo },
      status: { $in: ["Pending", "Assigned", "Accepted"] },
      isDuplicate: { $ne: true } // Only group under primary main tickets
    });

    for (let primary of candidateComplaints) {
      const pLng = primary.location?.coordinates?.[0] || 0;
      const pLat = primary.location?.coordinates?.[1] || 0;
      if (pLat === 0 && pLng === 0) continue;

      const primaryCategory = primary.utilityCategory || primary.grievance;
      if (primaryCategory !== category) continue;

      const distance = getDistanceMeters(lat, lng, pLat, pLng);

      // If within 300 meters, group under primary ticket!
      if (distance <= 300) {
        // Increment primary ticket duplicate counter and add report log
        primary.duplicateCount = (primary.duplicateCount || 1) + 1;
        primary.duplicateReportedBy = primary.duplicateReportedBy || [];
        primary.duplicateReportedBy.push({ user: userId, reportedAt: new Date() });
        
        // Elevate priority if 3 or more citizens report the same issue
        if (primary.duplicateCount >= 3 && primary.urgency !== "Critical") {
          primary.urgency = "High";
        }
        await primary.save();

        return {
          primaryTicket: primary,
          distanceMeters: Math.round(distance)
        };
      }
    }
  } catch (err) {
    console.error("Error in duplicate cluster search:", err.message);
  }
  return null;
}
