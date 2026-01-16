import type { ScanEvent } from "@/lib/scan-model";
import type { RiskLevel } from "@/lib/scan-model";
import { normalizeProjectId, readHistory } from "@/lib/history-store";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessRepo } from "@/lib/github-api";
import { getGitHubAccessTokenForUser } from "@/lib/github-token";
import {
  ensureOwnedProject,
  githubFullNameFromProjectId,
} from "@/lib/project-access";
import { Badge } from "@/components/ui/badge";
import { AuthBar } from "@/components/auth-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function labelForRisk(risk: RiskLevel): string {
  if (risk === "avg") return "Avg Risk";
  if (risk === "high") return "High Risk";
  if (risk === "low") return "Low Risk";
  return "Unknown";
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function sinceHours(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

type ChangeRow = {
  when: string;
  type: "added" | "updated" | "removed";
  pkg: string;
  overallRisk: RiskLevel;
};

function buildRecentChanges(history: ScanEvent[], hours: number): ChangeRow[] {
  const cutoff = sinceHours(hours).getTime();
  const rows: ChangeRow[] = [];

  for (const e of history) {
    const ts = new Date(e.timestamp).getTime();
    if (!Number.isFinite(ts) || ts < cutoff) continue;
    const changes = e.changes;
    if (!changes) continue;
    for (const pkg of changes.added || [])
      rows.push({
        when: e.timestamp,
        type: "added",
        pkg,
        overallRisk: e.overallRisk,
      });
    for (const pkg of changes.updated || [])
      rows.push({
        when: e.timestamp,
        type: "updated",
        pkg,
        overallRisk: e.overallRisk,
      });
    for (const pkg of changes.removed || [])
      rows.push({
        when: e.timestamp,
        type: "removed",
        pkg,
        overallRisk: e.overallRisk,
      });
  }

  rows.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
  return rows;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-2xl p-6">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Please sign in.</p>
            <div className="mt-4">
              <a href="/login">
                <Button type="button">Go to login</Button>
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const sp = (await searchParams) || {};
  const projectId = normalizeProjectId(
    typeof sp.projectId === "string" ? sp.projectId : ""
  );

  if (!sp.projectId) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Open a project to view scans.
              </p>
            </div>
            <AuthBar userName={session.user?.name} projectId="default" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Open a Project</CardTitle>
              <CardDescription>
                GitHub projects use{" "}
                <span className="font-mono">gh:owner/repo</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/dashboard" method="get" className="flex gap-3">
                <input
                  name="projectId"
                  placeholder="e.g. gh:my-org/my-repo"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
                <Button type="submit">Open</Button>
              </form>
              <div className="mt-3">
                <a href="/import">
                  <Button variant="outline" type="button">
                    Import from GitHub
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Authorization
  const userId = (session.user as any)?.id as string | undefined;
  if (!userId) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-2xl p-6">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Missing user id. Try signing out and signing in again.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const ghFullName = githubFullNameFromProjectId(projectId);
  if (ghFullName) {
    const token = await getGitHubAccessTokenForUser(userId);
    if (!token) {
      return (
        <main className="min-h-screen bg-background">
          <div className="container mx-auto max-w-2xl p-6">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Missing GitHub access token. Try signing out and signing in
                again.
              </p>
            </div>
          </div>
        </main>
      );
    }

    const ok = await canAccessRepo(token, ghFullName);
    if (!ok) {
      return (
        <main className="min-h-screen bg-background">
          <div className="container mx-auto max-w-2xl p-6">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm font-medium">Access denied</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You don’t have access to{" "}
                <span className="font-mono">{ghFullName}</span>.
              </p>
            </div>
          </div>
        </main>
      );
    }
  } else {
    const customEnabled =
      (process.env.CUSTOM_PROJECTS_ENABLED || "").toLowerCase() === "true";
    if (!customEnabled) {
      return (
        <main className="min-h-screen bg-background">
          <div className="container mx-auto max-w-2xl p-6">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm font-medium">Custom project ids disabled</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use a GitHub project id like{" "}
                <span className="font-mono">gh:owner/repo</span>.
              </p>
            </div>
          </div>
        </main>
      );
    }

    try {
      await ensureOwnedProject(projectId, userId);
    } catch {
      return (
        <main className="min-h-screen bg-background">
          <div className="container mx-auto max-w-2xl p-6">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm font-medium">Access denied</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This project id is owned by another user.
              </p>
            </div>
          </div>
        </main>
      );
    }
  }

  const history = await readHistory(projectId);
  const totalScans = history.length;
  const latest = history[history.length - 1];

  const recentChanges = buildRecentChanges(history, 24);

  const latestPackages = (latest?.packages || [])
    .slice()
    .sort(
      (a, b) =>
        numberOrZero(b.vulnerabilityCount) - numberOrZero(a.vulnerabilityCount)
    );

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              OSV Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Project: {projectId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={latest?.overallRisk || "unknown"}>
                {labelForRisk(latest?.overallRisk || "unknown")}
              </Badge>
            </div>
            <AuthBar userName={session.user?.name} projectId={projectId} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Scans</CardTitle>
              <CardDescription>All recorded scans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {totalScans}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">All time</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Vulnerabilities</CardTitle>
              <CardDescription>
                Total OSV findings in latest scan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {latest?.totals?.vulnerabilities ?? 0}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {latest
                  ? new Date(latest.timestamp).toLocaleString()
                  : "No scans yet"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Packages (Low / Avg / High)</CardTitle>
              <CardDescription>Risk distribution (latest scan)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {latest?.totals?.low ?? 0} / {latest?.totals?.avg ?? 0} /{" "}
                {latest?.totals?.high ?? 0}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                low / avg / high
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Package Changes</CardTitle>
              <CardDescription>Added/updated/removed packages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {recentChanges.length}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Last 24 hours
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Installed/Updated Packages (Last 24h)</CardTitle>
              <CardDescription>What changed recently</CardDescription>
            </CardHeader>
            <CardContent>
              {recentChanges.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No package changes in the last 24 hours.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentChanges.slice(0, 25).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(row.when).toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">{row.type}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {row.pkg}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={row.overallRisk}>
                            {labelForRisk(row.overallRisk)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scan Timeline</CardTitle>
              <CardDescription>Latest runs and overall risk</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No scans yet. Run the CLI scan to populate history.
                </div>
              ) : (
                <div className="space-y-3">
                  {[...history]
                    .reverse()
                    .slice(0, 20)
                    .map((scan, idx) => (
                      <div key={idx} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium">
                              {new Date(scan.timestamp).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              vulns={scan.totals.vulnerabilities} | low=
                              {scan.totals.low} avg={scan.totals.avg} high=
                              {scan.totals.high}
                            </div>
                          </div>
                          <Badge variant={scan.overallRisk}>
                            {labelForRisk(scan.overallRisk)}
                          </Badge>
                        </div>

                        {scan.changes &&
                        scan.changes.added.length +
                          scan.changes.updated.length +
                          scan.changes.removed.length >
                          0 ? (
                          <div className="mt-3 text-sm">
                            <div className="text-xs font-medium text-muted-foreground">
                              Changes
                            </div>
                            <div className="mt-1 space-y-1">
                              {scan.changes.added.slice(0, 8).map((p) => (
                                <div
                                  key={`a-${p}`}
                                  className="font-mono text-xs"
                                >
                                  + {p}
                                </div>
                              ))}
                              {scan.changes.updated.slice(0, 8).map((p) => (
                                <div
                                  key={`u-${p}`}
                                  className="font-mono text-xs"
                                >
                                  ~ {p}
                                </div>
                              ))}
                              {scan.changes.removed.slice(0, 8).map((p) => (
                                <div
                                  key={`r-${p}`}
                                  className="font-mono text-xs"
                                >
                                  - {p}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Latest Packages</CardTitle>
              <CardDescription>
                Sorted by vulnerability count (latest scan)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!latest ? (
                <div className="text-sm text-muted-foreground">
                  No scans yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead className="text-right">Vulns</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestPackages.slice(0, 50).map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">
                          {p.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {p.version}
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.risk}>{labelForRisk(p.risk)}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.vulnerabilityCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
