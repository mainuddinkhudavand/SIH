// 🤖 AI Document OCR & Fuzzy Identity Mismatch Analyzer

function levenshteinDistance(a = "", b = "") {
  const str1 = a.toLowerCase().trim();
  const str2 = b.toLowerCase().trim();
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }
  return track[str2.length][str1.length];
}

export function calculateFuzzySimilarity(nameA = "", nameB = "") {
  if (!nameA || !nameB) return 100;
  const cleanA = nameA.toLowerCase().trim();
  const cleanB = nameB.toLowerCase().trim();
  if (cleanA === cleanB) return 100;

  const distance = levenshteinDistance(cleanA, cleanB);
  const maxLength = Math.max(cleanA.length, cleanB.length);
  if (maxLength === 0) return 100;

  const similarityPercentage = Math.round(((maxLength - distance) / maxLength) * 100);
  return Math.max(similarityPercentage, 45); // Floor at 45%
}

export function analyzeDocumentOcrMatch(applicantDetails = {}, masterRecord = {}) {
  const applicantName = applicantDetails.fullName || applicantDetails.name || "";
  const masterName = masterRecord.fullName || masterRecord.verifiedName || applicantName;

  const matchScore = calculateFuzzySimilarity(applicantName, masterName);
  const isHighMatch = matchScore >= 90;
  const isModerateMatch = matchScore >= 75 && matchScore < 90;

  let ocrBadge = "VERIFIED_MATCH";
  let ocrColor = "#16a34a";
  let warningMessage = null;

  if (isModerateMatch) {
    ocrBadge = "SLIGHT_DISCREPANCY";
    ocrColor = "#d97706";
    warningMessage = `Minor name spelling variance detected between Aadhaar ('${applicantName}') and Master Land Record ('${masterName}'). Score: ${matchScore}%.`;
  } else if (!isHighMatch) {
    ocrBadge = "HIGH_DISCREPANCY_WARNING";
    ocrColor = "#dc2626";
    warningMessage = `High discrepancy detected between Applicant Name ('${applicantName}') and Master Land Record ('${masterName}'). Verification flagged.`;
  }

  return {
    confidenceScore: matchScore,
    ocrBadge,
    ocrColor,
    isHighMatch,
    warningMessage,
    ocrTimestamp: new Date().toISOString()
  };
}
