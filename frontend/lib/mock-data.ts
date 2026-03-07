export type RiskLevel = "safe" | "suspicious" | "fraud";

export type VerificationResult = {
  level: RiskLevel;
  score: number;
  label: string;
  communityTrust: "High" | "Moderate" | "Low";
  reports: number;
  commonScamType?: string;
  highlights: string[];
};

export const verificationMap: Record<string, VerificationResult> = {
  "trusted@upi": {
    level: "safe",
    score: 12,
    label: "Likely Safe",
    communityTrust: "High",
    reports: 0,
    highlights: ["Consistent transaction history", "No suspicious velocity", "No community complaints"]
  },
  "cashback@upi": {
    level: "suspicious",
    score: 54,
    label: "Medium Risk",
    communityTrust: "Moderate",
    reports: 3,
    highlights: ["Recent activity spike", "Pattern mismatch in payment requests", "Early-stage community flags"]
  },
  "refundhelp@upi": {
    level: "fraud",
    score: 87,
    label: "High Risk Detected",
    communityTrust: "Low",
    reports: 27,
    commonScamType: "Fake Refund",
    highlights: ["Unusual amount behavior", "Repeated reports", "Suspicious activity pattern"]
  }
};

export function getMockVerification(upiId: string): VerificationResult {
  const key = upiId.trim().toLowerCase();
  if (verificationMap[key]) return verificationMap[key];

  const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (hash % 5 === 0) return verificationMap["refundhelp@upi"];
  if (hash % 2 === 0) return verificationMap["cashback@upi"];
  return verificationMap["trusted@upi"];
}

export const trendData = [
  { day: "Mon", fraud: 34, checks: 1300 },
  { day: "Tue", fraud: 46, checks: 1490 },
  { day: "Wed", fraud: 39, checks: 1710 },
  { day: "Thu", fraud: 58, checks: 1930 },
  { day: "Fri", fraud: 64, checks: 2100 },
  { day: "Sat", fraud: 51, checks: 1880 },
  { day: "Sun", fraud: 42, checks: 1600 }
];

export const riskPieData = [
  { name: "Safe", value: 68 },
  { name: "Medium", value: 21 },
  { name: "Fraud", value: 11 }
];

export const heatmapHours = [
  { hour: "00:00", risk: 12 },
  { hour: "03:00", risk: 18 },
  { hour: "06:00", risk: 27 },
  { hour: "09:00", risk: 43 },
  { hour: "12:00", risk: 62 },
  { hour: "15:00", risk: 71 },
  { hour: "18:00", risk: 56 },
  { hour: "21:00", risk: 39 }
];

export const recentLogs = [
  "blockpay@upi flagged for fake refund sequence",
  "shopqr@upi passed with low risk score",
  "offers247@upi reported by 3 users in 5 minutes",
  "safevendor@upi verified as trusted",
  "loanquick@upi detected with unusual velocity"
];

export const statItems = [
  { label: "Total Verifications", value: 1250000, suffix: "+" },
  { label: "Fraud Detected", value: 13240, suffix: "" },
  { label: "Fraud Rate", value: 1.1, suffix: "%" },
  { label: "Community Reports", value: 50000, suffix: "+" }
];
