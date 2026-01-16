import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { scanPackage } from "./app/service/osv";
import { sendSlackDM } from "./app/service/slack";
import type {
  PackageScan,
  RiskLevel,
  ScanEvent,
  ScanTotals,
} from "./lib/scan-model";
import { maxRisk, riskFromVulns } from "./lib/risk";
import { getOrCreateProjectId, updateLastScan } from "./lib/project-id";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type Args = Record<string, string | boolean>;

function parseArgs(argv: string[]): { cmd: string; args: Args } {
  const [cmd = "scan", ...rest] = argv;
  const args: Args = {};
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return { cmd, args };
}

function toStringArg(
  value: string | boolean | undefined,
  fallback?: string
): string | undefined {
  if (typeof value === "string") return value;
  return fallback;
}

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
  msg += `Overall: ${event.overallRisk.toUpperCase()}\n`;
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

async function scanOnce(opts: {
  repoPath: string;
  projectId: string;
  dashboardUrl?: string;
  dashboardApiKey?: string;
  slack?: boolean;
}): Promise<ScanEvent> {
  const pkgPath = path.resolve(opts.repoPath, "package.json");
  const lockPath = path.resolve(opts.repoPath, "package-lock.json");

  const pkg = await readJson(pkgPath);
  const lock = await readJson(lockPath);

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

  const totals = computeTotals(packages);
  const event: ScanEvent = {
    timestamp: new Date().toISOString(),
    projectId: opts.projectId,
    overallRisk: computeOverallRisk(packages),
    totals,
    packages,
  };

  if (opts.dashboardUrl) {
    const url = new URL("/api/ingest", opts.dashboardUrl).toString();
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (opts.dashboardApiKey)
      headers.authorization = `Bearer ${opts.dashboardApiKey}`;

    try {
      await axios.post(url, event, {
        headers,
        timeout: 10000, // 10 second timeout
      });

      console.log(
        `✅ Dashboard updated: ${new URL(
          `/dashboard?projectId=${encodeURIComponent(opts.projectId)}`,
          opts.dashboardUrl
        ).toString()}`
      );
    } catch (error: any) {
      console.error("⚠️  Failed to send scan results to dashboard:");
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error("   Network error: Could not reach dashboard");
      } else {
        console.error(`   Error: ${error.message}`);
      }
      console.error("   Scan results saved locally only.");
    }
  } else {
    console.log("💡 No DASHBOARD_URL provided; skipping dashboard ingest.");
  }

  if (opts.slack) {
    await sendSlackDM(formatSlackSummary(event));
  }

  return event;
}

async function main() {
  const { cmd, args } = parseArgs(process.argv.slice(2));

  if (cmd === "help" || args.help) {
    console.log(
      `Usage:\n  osv-slack-scanner scan [--repo <path>] [--dashboard <url>] [--key <apiKey>] [--slack]\n\nProject IDs:\n  - Auto-generated on first scan and saved to .osv-scanner-config.json\n  - Reused on subsequent scans from the same directory\n\nEnv (optional):\n  DASHBOARD_URL, DASHBOARD_API_KEY\n  SLACK_BOT_TOKEN, SLACK_USER_ID, SLACK_NOTIFY=true\n`
    );
    return;
  }

  const repoPath = toStringArg(args.repo, process.cwd())!;

  // Auto-generate or reuse Project ID
  const projectId = await getOrCreateProjectId(repoPath);

  const dashboardUrl = toStringArg(args.dashboard, process.env.DASHBOARD_URL);
  const dashboardApiKey = toStringArg(args.key, process.env.DASHBOARD_API_KEY);
  const slackNotify = (process.env.SLACK_NOTIFY || "").toLowerCase();
  const slack =
    Boolean(args.slack) || slackNotify === "true" || slackNotify === "1";

  if (cmd !== "scan") {
    console.error(`Unknown command: ${cmd}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Scanning repo: ${repoPath}`);
  console.log(`Project ID: ${projectId}`);

  const event = await scanOnce({
    repoPath,
    projectId,
    dashboardUrl,
    dashboardApiKey,
    slack,
  });

  // Update last scan timestamp
  await updateLastScan(repoPath);

  // Display scan summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SCAN COMPLETE");
  console.log("=".repeat(60));
  console.log(`Overall Risk: ${event.overallRisk.toUpperCase()}`);
  console.log(`Vulnerabilities Found: ${event.totals.vulnerabilities}`);
  console.log(`  - High: ${event.totals.high}`);
  console.log(`  - Average: ${event.totals.avg}`);
  console.log(`  - Low: ${event.totals.low}`);
  console.log("=".repeat(60));

  // Display Project ID and Dashboard info
  console.log("\n🔑 Project ID: " + projectId);

  if (dashboardUrl) {
    const dashboardLink = new URL(
      `/dashboard?projectId=${encodeURIComponent(projectId)}`,
      dashboardUrl
    ).toString();

    console.log("\n📈 View full results on the web dashboard:");
    console.log("🔗 " + dashboardLink);
    console.log("\n💡 To claim this project:");
    console.log("   1. Visit the dashboard link above");
    console.log("   2. Sign in with GitHub");
    console.log("   3. Enter your Project ID to claim and manage it");
  } else {
    console.log("\n💡 Tip: Set DASHBOARD_URL to view results online");
    console.log("   Example: DASHBOARD_URL=https://your-dashboard.vercel.app");
  }

  console.log("\n" + "=".repeat(60) + "\n");
}

main().catch((err) => {
  console.error("CLI failed:", err);
  process.exitCode = 1;
});
