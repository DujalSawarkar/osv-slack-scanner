export type RiskLevel = "low" | "avg" | "high" | "unknown";

export type PackageScan = {
  name: string;
  version: string;
  vulnerabilityCount: number;
  risk: RiskLevel;
  vulnerabilityIds?: string[];
};

export type ScanTotals = {
  vulnerabilities: number;
  low: number;
  avg: number;
  high: number;
  unknown: number;
};

export type ScanEvent = {
  timestamp: string; // ISO
  projectId: string;
  overallRisk: RiskLevel;
  totals: ScanTotals;
  packages: PackageScan[];
  changes?: {
    added: string[];
    updated: string[];
    removed: string[];
  };
};
