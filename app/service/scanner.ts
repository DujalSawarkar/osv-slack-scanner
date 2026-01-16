import fs from "fs/promises";
import path from "path";
import { scanPackage } from "./osv";
import { sendSlackDM } from "./slack";
import type {
  PackageScan,
  RiskLevel,
  ScanEvent,
  ScanTotals,
} from "../../lib/scan-model";
import {
  appendHistory,
  readHistory,
  normalizeProjectId,
} from "../../lib/history-store";
import { maxRisk, riskFromVulns } from "../../lib/risk";

const packageJsonPath = path.resolve(
  process.env.PACKAGE_JSON_PATH || "./package.json"
);
const lockFilePath = path.resolve(
  process.env.PACKAGE_LOCK_PATH || "./package-lock.json"
);

let currentDependencies: Record<string, string> = {};

async function readJson(filePath: string): Promise<any> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

function normalizeVersion(range: string): string {
  return (range || "")
    .trim()
    .replace(/^[^0-9]*/, "")
    .replace(/[^0-9.].*$/, "");
}

function getExactVersionFromLock(
  lock: any,
  packageName: string,
  fallbackRange: string
): string {
  const fromPackages = lock?.packages?.[`node_modules/${packageName}`]?.version;
  if (typeof fromPackages === "string" && fromPackages.length > 0)
    return fromPackages;

  const fromDeps = lock?.dependencies?.[packageName]?.version;
  if (typeof fromDeps === "string" && fromDeps.length > 0) return fromDeps;

  return normalizeVersion(fallbackRange);
}

function computeTotals(packages: PackageScan[]): ScanTotals {
  const totals: ScanTotals = {
    vulnerabilities: 0,
    low: 0,
    avg: 0,
    high: 0,
    unknown: 0,
  };
  for (const p of packages) {
    totals.vulnerabilities += p.vulnerabilityCount;
    totals[p.risk] += 1;
  }
  return totals;
}

function computeOverallRisk(packages: PackageScan[]): RiskLevel {
  let overall: RiskLevel = "low";
  for (const p of packages) overall = maxRisk(overall, p.risk);
  return overall;
}

function formatSlackSummary(event: ScanEvent): string {
  const top = [...event.packages]
    .filter((p) => p.vulnerabilityCount > 0)
    .sort((a, b) => b.vulnerabilityCount - a.vulnerabilityCount)
    .slice(0, 10);

  let msg = `OSV Dashboard Scan\n`;
  msg += `Project: ${event.projectId}\n`;
  msg += `Time: ${new Date(event.timestamp).toLocaleString()}\n`;
  msg += `Overall: ${String(event.overallRisk).toUpperCase()}\n`;
  msg += `Totals: vulns=${event.totals.vulnerabilities} | high=${event.totals.high} | avg=${event.totals.avg} | low=${event.totals.low} | unknown=${event.totals.unknown}\n\n`;

  if (top.length === 0) {
    msg += `No vulnerable packages found.`;
    return msg;
  }

  msg += `Top packages:\n`;
  for (const p of top) {
    msg += `- ${p.name}@${p.version} (${p.risk}) vulns=${p.vulnerabilityCount}\n`;
  }
  return msg;
}

function diffChanges(prev: ScanEvent | undefined, nextPackages: PackageScan[]) {
  const prevMap = new Map<string, string>();
  if (prev?.packages) {
    for (const p of prev.packages as any[]) {
      if (p?.name && p?.version) prevMap.set(String(p.name), String(p.version));
    }
  }

  const nextMap = new Map<string, string>();
  for (const p of nextPackages as any[]) {
    if (p?.name && p?.version) nextMap.set(String(p.name), String(p.version));
  }

  const added: string[] = [];
  const updated: string[] = [];
  const removed: string[] = [];

  for (const [name, version] of nextMap.entries()) {
    const prevVersion = prevMap.get(name);
    if (!prevVersion) added.push(`${name}@${version}`);
    else if (prevVersion !== version) updated.push(`${name}@${version}`);
  }
  for (const [name, version] of prevMap.entries()) {
    if (!nextMap.has(name)) removed.push(`${name}@${version}`);
  }

  return { added, updated, removed };
}

async function scanAllDependencies(projectId: string): Promise<ScanEvent> {
  const pkg = await readJson(packageJsonPath);
  const lock = await readJson(lockFilePath);

  const deps: Record<string, string> = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };
  const names = Object.keys(deps).sort();

  const packages: PackageScan[] = [];
  for (const name of names) {
    const version = getExactVersionFromLock(lock, name, deps[name]);
    const vulns = await scanPackage(name, version);
    const risk = riskFromVulns(vulns);
    packages.push({
      name,
      version,
      vulnerabilityCount: Array.isArray(vulns) ? vulns.length : 0,
      risk,
      vulnerabilityIds: Array.isArray(vulns)
        ? vulns.map((v: any) => v?.id).filter(Boolean)
        : undefined,
    });
  }

  const history = await readHistory(projectId);
  const prev = history.slice(-1)[0];

  const totals = computeTotals(packages);
  const event: ScanEvent = {
    timestamp: new Date().toISOString(),
    projectId,
    overallRisk: computeOverallRisk(packages),
    totals,
    packages,
    changes: diffChanges(prev, packages),
  };

  await appendHistory(event);
  return event;
}

async function checkFileForUpdates() {
  try {
    const pkg = await readJson(packageJsonPath);
    const newDependencies: Record<string, string> = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    const allKeys = new Set([
      ...Object.keys(currentDependencies),
      ...Object.keys(newDependencies),
    ]);
    const changedPackages = [...allKeys].filter(
      (k) => currentDependencies[k] !== newDependencies[k]
    );

    if (changedPackages.length === 0) return;

    currentDependencies = newDependencies;

    const projectId = normalizeProjectId(process.env.PROJECT_ID || "default");

    console.log(
      `Dependencies changed (${changedPackages.length}). Running full scan for project=${projectId}...`
    );

    const event = await scanAllDependencies(projectId);
    console.log(
      `Recorded scan: overall=${event.overallRisk} vulns=${event.totals.vulnerabilities}`
    );

    const slackNotify = (process.env.SLACK_NOTIFY || "").toLowerCase();
    const slack = slackNotify === "true" || slackNotify === "1";
    if (slack) await sendSlackDM(formatSlackSummary(event));
  } catch (error) {
    console.error("Error during file check:", error);
  }
}

export async function startPolling(interval: number = 15000) {
  try {
    const pkg = await readJson(packageJsonPath);
    currentDependencies = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    setInterval(checkFileForUpdates, interval);
  } catch (error) {
    console.error("Could not perform initial dependency check.", error);
  }
}
