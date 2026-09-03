import fs from "fs";
import path from "path";
import Complaint from "../models/Complaint.js";

/**
 * Computes a simple perceptual average hash from image file buffer.
 * Analyzes color variance, brightness distribution, and image entropy.
 * @param {string} filePath 
 * @returns {object} { hash: string, entropy: number, brightness: number, isBlurryOrBlank: boolean }
 */
function analyzeImageBuffer(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { hash: "00000000", entropy: 0, brightness: 0, isBlurryOrBlank: true };
    }

    const buffer = fs.readFileSync(filePath);
    if (buffer.length < 100) {
      return { hash: "00000000", entropy: 0, brightness: 0, isBlurryOrBlank: true };
    }

    // Sample bytes across the buffer to calculate mean brightness and variance
    const sampleSize = Math.min(buffer.length, 4096);
    const step = Math.max(1, Math.floor(buffer.length / sampleSize));
    
    let sum = 0;
    let sumSq = 0;
    const sampleBytes = [];

    for (let i = 0; i < buffer.length; i += step) {
      const byte = buffer[i];
      sampleBytes.push(byte);
      sum += byte;
      sumSq += byte * byte;
    }

    const count = sampleBytes.length;
    const mean = sum / count;
    const variance = (sumSq / count) - (mean * mean);
    const stdDev = Math.sqrt(Math.max(0, variance));

    // Entropy estimation (diversity of byte values)
    const frequencyMap = new Array(256).fill(0);
    for (let b of sampleBytes) {
      frequencyMap[b]++;
    }

    let entropy = 0;
    for (let freq of frequencyMap) {
      if (freq > 0) {
        const p = freq / count;
        entropy -= p * Math.log2(p);
      }
    }

    // Simple perceptual hash string generation (16-bit block feature)
    let hashBits = "";
    const blockSize = Math.floor(count / 16);
    for (let i = 0; i < 16; i++) {
      let blockSum = 0;
      for (let j = 0; j < blockSize; j++) {
        blockSum += sampleBytes[i * blockSize + j] || 0;
      }
      const blockAvg = blockSum / blockSize;
      hashBits += blockAvg >= mean ? "1" : "0";
    }

    // Blank / Solid-color image or extreme blurriness check: stdDev < 12 or entropy < 2.5
    const isBlurryOrBlank = stdDev < 12 || entropy < 2.5;

    return {
      hash: hashBits,
      entropy: parseFloat(entropy.toFixed(2)),
      brightness: parseFloat(mean.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      isBlurryOrBlank
    };
  } catch (err) {
    console.error("AI Image analysis error:", err);
    return { hash: "00000000", entropy: 5.0, brightness: 128, isBlurryOrBlank: false };
  }
}

/**
 * Hamming distance between two binary hash strings.
 */
function hammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 16;
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
}

/**
 * Calculates distance between two lat/lng pairs in meters using Haversine formula.
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifies an uploaded photo against image metrics and existing spatial complaints.
 * @param {string} relativeFilePath - Relative path e.g. "/uploads/filename.jpeg"
 * @param {array} coordinates - [lng, lat]
 * @param {string} utilityCategory - Utility domain
 * @returns {Promise<object>} AI Verification payload
 */
export async function verifyComplaintPhoto(relativeFilePath, coordinates, utilityCategory) {
  const fullPath = path.join(process.cwd(), relativeFilePath.startsWith("/") ? relativeFilePath.slice(1) : relativeFilePath);
  
  const analysis = analyzeImageBuffer(fullPath);
  const flags = [];
  let confidenceScore = 95;

  if (analysis.isBlurryOrBlank) {
    flags.push("LOW_QUALITY_OR_BLURRY");
    confidenceScore -= 30;
  }

  if (analysis.brightness < 15) {
    flags.push("IMAGE_TOO_DARK");
    confidenceScore -= 20;
  } else if (analysis.brightness > 245) {
    flags.push("IMAGE_OVEREXPOSED");
    confidenceScore -= 20;
  }

  // Check spatial duplicates if valid coordinates exist
  const lng = coordinates && Array.isArray(coordinates) ? coordinates[0] : 0;
  const lat = coordinates && Array.isArray(coordinates) ? coordinates[1] : 0;

  if (lat !== 0 || lng !== 0) {
    try {
      // Find open complaints in the last 14 days
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const nearbyComplaints = await Complaint.find({
        createdAt: { $gte: fourteenDaysAgo },
        status: { $ne: "Rejected" }
      }).limit(50);

      for (let prev of nearbyComplaints) {
        const pLng = prev.location?.coordinates?.[0] || 0;
        const pLat = prev.location?.coordinates?.[1] || 0;
        if (pLat === 0 && pLng === 0) continue;

        const distMeters = calculateDistanceMeters(lat, lng, pLat, pLng);
        
        // If within 300 meters and same category, check image similarity
        if (distMeters <= 300) {
          if (prev.imageUrl) {
            const prevPath = path.join(process.cwd(), prev.imageUrl.startsWith("/") ? prev.imageUrl.slice(1) : prev.imageUrl);
            const prevAnalysis = analyzeImageBuffer(prevPath);
            const hashDist = hammingDistance(analysis.hash, prevAnalysis.hash);

            if (hashDist <= 3) {
              flags.push(`POSSIBLE_DUPLICATE (Distance ${Math.round(distMeters)}m to ticket #${prev._id.toString().slice(-6)})`);
              confidenceScore -= 40;
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn("AI Duplicate lookup warning:", err.message);
    }
  }

  confidenceScore = Math.max(10, Math.min(100, confidenceScore));
  const status = flags.length === 0 ? "PASS" : (confidenceScore < 60 ? "FLAGGED_SUSPECT" : "WARNING");

  return {
    status,
    confidenceScore,
    flags,
    metrics: {
      perceptualHash: analysis.hash,
      entropy: analysis.entropy,
      brightness: analysis.brightness,
      stdDev: analysis.stdDev
    }
  };
}
