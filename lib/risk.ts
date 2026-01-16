import type { RiskLevel } from "./scan-model";

function clampNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return Math.max(0, Math.min(10, value));
}

function cvssScoreFromOsvVuln(vuln: any): number | undefined {
  const severity = vuln?.severity;
  if (!Array.isArray(severity)) return undefined;

  let max: number | undefined;
  for (const s of severity) {
    const score = clampNumber(s?.score);
    if (score === undefined) continue;
    if (max === undefined || score > max) max = score;
  }
  return max;
}

function labelFromDatabaseSpecific(vuln: any): string | undefined {
  const label = vuln?.database_specific?.severity;
  return typeof label === "string" ? label.toUpperCase() : undefined;
}

export function riskFromVuln(vuln: any): RiskLevel {
  const label = labelFromDatabaseSpecific(vuln);
  if (label === "CRITICAL" || label === "HIGH") return "high";
  if (label === "MODERATE" || label === "MEDIUM") return "avg";
  if (label === "LOW") return "low";

  const score = cvssScoreFromOsvVuln(vuln);
  if (score === undefined) return "unknown";
  if (score >= 7) return "high";
  if (score >= 4) return "avg";
  return "low";
}

export function riskFromVulns(vulns: any[]): RiskLevel {
  if (!Array.isArray(vulns) || vulns.length === 0) return "low";

  let current: RiskLevel = "low";
  for (const v of vulns) {
    const r = riskFromVuln(v);
    if (r === "high") return "high";
    if (r === "avg") current = current === "high" ? "high" : "avg";
    if (r === "unknown" && current === "low") current = "unknown";
  }
  return current;
}

export function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  const rank: Record<RiskLevel, number> = {
    low: 0,
    unknown: 1,
    avg: 2,
    high: 3,
  };
  return rank[a] >= rank[b] ? a : b;
}
