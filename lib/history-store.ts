import fs from "fs/promises";
import path from "path";
import type { ScanEvent } from "./scan-model";
import type { Collection } from "mongodb";
import { ObjectId } from "mongodb";
import { getMongoClient, getMongoDbName } from "@/lib/mongo-client";

export function sanitizeProjectId(input: string): string {
  const cleaned = (input || "default").trim();
  if (cleaned.length === 0) return "default";
  return cleaned.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function normalizeProjectId(input: string): string {
  const cleaned = (input || "default").trim();
  return cleaned.length === 0 ? "default" : cleaned;
}

export function historyFilePath(projectId: string): string {
  const safeId = sanitizeProjectId(projectId);
  return path.resolve("./data/history", `${safeId}.json`);
}

function mongoEnabled(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

function mongoCollectionName(): string {
  return process.env.MONGODB_COLLECTION || "scan_events";
}

function mongoMaxEvents(): number {
  const raw = process.env.MONGODB_MAX_EVENTS;
  const n = raw ? Number(raw) : 2000;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 2000;
}

async function getMongo(): Promise<MongoState> {
  const g = globalThis as any;
  if (g.__osvMongoEventsCollection) {
    return { collection: g.__osvMongoEventsCollection as Collection };
  }

  const client = await getMongoClient();
  const db = client.db(getMongoDbName());
  const collection = db.collection(mongoCollectionName());
  await collection.createIndex({ projectId: 1, timestamp: 1 });
  g.__osvMongoEventsCollection = collection;
  return { collection };
}

type MongoState = {
  collection: Collection;
};

async function safeReadJsonArray(filePath: string): Promise<any[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendHistory(event: ScanEvent): Promise<void> {
  if (mongoEnabled()) {
    const { collection } = await getMongo();
    const normalized: ScanEvent = {
      ...event,
      projectId: normalizeProjectId(event.projectId),
      timestamp: new Date(event.timestamp).toISOString(),
    };

    await collection.insertOne(normalized as any);

    // Keep per-project history bounded (best-effort).
    const max = mongoMaxEvents();
    const count = await collection.countDocuments({
      projectId: normalized.projectId,
    });
    if (count > max) {
      const excess = count - max;
      const ids = await collection
        .find(
          { projectId: normalized.projectId },
          { projection: { _id: 1 }, sort: { timestamp: 1 }, limit: excess }
        )
        .toArray();
      const toDelete = ids
        .map((d: any) => d?._id)
        .filter((id: any) => id instanceof ObjectId);
      if (toDelete.length > 0) {
        await collection.deleteMany({ _id: { $in: toDelete } } as any);
      }
    }
    return;
  }

  const filePath = historyFilePath(event.projectId);
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const history = await safeReadJsonArray(filePath);
  history.push(event);

  // Keep file bounded.
  const bounded =
    history.length > 2000 ? history.slice(history.length - 2000) : history;
  await fs.writeFile(
    filePath,
    JSON.stringify(bounded, null, 2) + "\n",
    "utf-8"
  );
}

export async function readHistory(projectId: string): Promise<ScanEvent[]> {
  if (mongoEnabled()) {
    const { collection } = await getMongo();
    const id = normalizeProjectId(projectId);
    const max = mongoMaxEvents();
    const docs = await collection
      .find({ projectId: id }, { sort: { timestamp: 1 }, limit: max })
      .toArray();
    return docs.map((d: any) => {
      const { _id, ...rest } = d || {};
      return rest as ScanEvent;
    });
  }

  const filePath = historyFilePath(projectId);
  const items = await safeReadJsonArray(filePath);
  return items as ScanEvent[];
}
