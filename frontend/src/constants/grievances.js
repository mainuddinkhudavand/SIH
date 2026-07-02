// Central grievance list with keys, labels, and icons
export const grievances = [
  { key: "waterIssue", icon: "🚰" },
  { key: "electricityIssue", icon: "⚡" },
  { key: "roadDamage", icon: "🛣️" },
  { key: "streetlightsIssue", icon: "💡" },
  { key: "sanitation", icon: "🗑️" },
  { key: "health", icon: "❤️" },
  { key: "education", icon: "📚" },
  { key: "wasteManagement", icon: "♻️" },
  { key: "publicSafety", icon: "🚨" },
  { key: "other", icon: "⋯" },
];

// Helper to quickly get grievance by key
export const getGrievanceByKey = (key) =>
  grievances.find((g) => g.key === key);