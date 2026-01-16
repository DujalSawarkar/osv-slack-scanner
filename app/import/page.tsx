import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listRepos } from "@/lib/github-api";
import { getGitHubAccessTokenForUser } from "@/lib/github-token";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ImportPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-2xl p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              Import from GitHub
            </h1>
            <ThemeToggle />
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Please sign in first.
            </p>
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

  const userId = (session.user as any)?.id as string | undefined;
  const token = userId ? await getGitHubAccessTokenForUser(userId) : null;
  if (!token) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-2xl p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              Import from GitHub
            </h1>
            <ThemeToggle />
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Missing GitHub access token. Try signing out and signing in again.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const repos = await listRepos(token);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Import from GitHub
            </h1>
            <p className="text-sm text-muted-foreground">
              Pick a repo to open its dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/">
              <Button variant="outline" type="button">
                Back
              </Button>
            </a>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {repos.slice(0, 50).map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm">{r.full_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.private ? "private" : "public"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <a
                  className="text-sm text-muted-foreground hover:underline"
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on GitHub
                </a>
                <a
                  href={`/dashboard?projectId=${encodeURIComponent(
                    `gh:${r.full_name}`
                  )}`}
                >
                  <Button type="button">Open Dashboard</Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
