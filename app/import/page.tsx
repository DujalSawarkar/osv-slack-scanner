"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function ImportPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/github/repos");
        if (!res.ok) throw new Error("Failed to fetch repos");
        const data = await res.json();
        setRepos(data.repos || []);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      }
      setLoading(false);
    }
    fetchRepos();
  }, []);

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
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size={32} />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : repos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No repositories found.
            </div>
          ) : (
            repos.slice(0, 50).map((r) => (
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
            ))
          )}
        </div>
      </div>
    </main>
  );
}
