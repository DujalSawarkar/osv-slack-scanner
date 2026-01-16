import { NextResponse } from "next/server";
import {
  appendHistory,
  readHistory,
  normalizeProjectId,
} from "@/lib/history-store";
import { upsertProject } from "@/lib/project-store";
import type { ScanEvent } from "@/lib/scan-model";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function POST(req: Request) {
  const requireKey =
    (process.env.REQUIRE_INGEST_API_KEY || "").toLowerCase() === "true" ||
    (process.env.NODE_ENV === "production" &&
      (process.env.REQUIRE_INGEST_API_KEY || "").toLowerCase() !== "false");

  const apiKey = process.env.DASHBOARD_API_KEY;
  if (requireKey) {
    if (!apiKey) return unauthorized();
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ")
      ? auth.slice("Bearer ".length)
      : "";
    if (token !== apiKey) return unauthorized();
  } else if (apiKey) {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ")
      ? auth.slice("Bearer ".length)
      : "";
    if (token !== apiKey) return unauthorized();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const event = body as Partial<ScanEvent>;
  if (
    !event.projectId ||
    !event.timestamp ||
    !Array.isArray(event.packages) ||
    !event.totals
  ) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const projectId = normalizeProjectId(event.projectId);

  const prev = (await readHistory(projectId)).slice(-1)[0];
  const prevMap = new Map<string, string>();
  if (prev?.packages) {
    for (const p of prev.packages as any[]) {
      if (p?.name && p?.version) prevMap.set(String(p.name), String(p.version));
    }
  }

  const nextMap = new Map<string, string>();
  for (const p of event.packages as any[]) {
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

  const normalized: ScanEvent = {
    timestamp: new Date(event.timestamp).toISOString(),
    projectId,
    overallRisk: event.overallRisk || "unknown",
    totals: event.totals as any,
    packages: event.packages as any,
    changes: { added, updated, removed },
  };

  // Store scan event
  await appendHistory(normalized);

  // Create or update project metadata
  await upsertProject(projectId, normalized.timestamp);

  return NextResponse.json({ ok: true });
}
