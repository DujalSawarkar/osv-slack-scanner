import { getMongoClient, getMongoDbName } from "@/lib/mongo-client";

export type ProjectRecord = {
  projectId: string;
  ownerUserId: string;
  createdAt: string;
};

export function isGitHubProjectId(projectId: string): boolean {
  return projectId.startsWith("gh:");
}

export function githubFullNameFromProjectId(projectId: string): string | null {
  if (!isGitHubProjectId(projectId)) return null;
  const fullName = projectId.slice("gh:".length).trim();
  // Basic safety: owner/repo allowed chars.
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(fullName)) return null;
  return fullName;
}

async function collection() {
  const g = globalThis as any;
  if (g.__osvProjectsCollection) {
    return g.__osvProjectsCollection;
  }

  const coll = await dbCollection();
  g.__osvProjectsCollection = coll;
  return coll;
}

async function dbCollection() {
  const client = await getMongoClient();
  const db = client.db(getMongoDbName());
  const coll = db.collection<ProjectRecord>("projects");
  await coll.createIndex({ projectId: 1 }, { unique: true });
  return coll;
}

export async function ensureOwnedProject(
  projectId: string,
  ownerUserId: string
): Promise<ProjectRecord> {
  const coll = await collection();
  const existing = await coll.findOne({ projectId });
  if (existing) {
    if (existing.ownerUserId !== ownerUserId) {
      throw new Error("forbidden");
    }
    return existing;
  }

  const doc: ProjectRecord = {
    projectId,
    ownerUserId,
    createdAt: new Date().toISOString(),
  };
  await coll.insertOne(doc);
  return doc;
}
