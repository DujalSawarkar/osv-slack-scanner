import { ObjectId } from "mongodb";
import { getMongoClient, getMongoDbName } from "@/lib/mongo-client";

/**
 * Project document in MongoDB
 */
export interface Project {
  _id?: ObjectId;
  projectId: string; // osv-abc123
  userId?: ObjectId; // Owner user ID (null if unclaimed)
  claimedAt?: string; // ISO timestamp when claimed
  createdAt: string; // First scan timestamp
  lastScanAt: string; // Most recent scan timestamp
  projectName?: string; // Optional user-provided name
  githubRepo?: string; // If linked to GitHub repo
  source: "cli" | "github"; // Origin of the project
}

function mongoEnabled(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

function projectsCollectionName(): string {
  return process.env.MONGODB_PROJECTS_COLLECTION || "projects";
}

async function getProjectsCollection() {
  const client = await getMongoClient();
  const db = client.db(getMongoDbName());
  const collection = db.collection<Project>(projectsCollectionName());

  // Create indexes
  await collection.createIndex({ projectId: 1 }, { unique: true });
  await collection.createIndex({ userId: 1 });
  await collection.createIndex({ createdAt: 1 });

  return collection;
}

/**
 * Create or update a project entry (from CLI scan)
 */
export async function upsertProject(
  projectId: string,
  timestamp: string
): Promise<void> {
  if (!mongoEnabled()) {
    return; // No MongoDB, skip
  }

  const collection = await getProjectsCollection();

  const existing = await collection.findOne({ projectId });

  if (existing) {
    // Update last scan time
    await collection.updateOne(
      { projectId },
      { $set: { lastScanAt: timestamp } }
    );
  } else {
    // Create new unclaimed project
    await collection.insertOne({
      projectId,
      source: "cli",
      createdAt: timestamp,
      lastScanAt: timestamp,
    });
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(
  projectId: string
): Promise<Project | null> {
  if (!mongoEnabled()) {
    return null;
  }

  const collection = await getProjectsCollection();
  return await collection.findOne({ projectId });
}

/**
 * Get all projects for a user
 */
export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  if (!mongoEnabled()) {
    return [];
  }

  const collection = await getProjectsCollection();
  const oid = new ObjectId(userId);

  return await collection
    .find({ userId: oid })
    .sort({ lastScanAt: -1 })
    .toArray();
}

/**
 * Claim a project (link it to a user account)
 */
export async function claimProject(
  projectId: string,
  userId: string,
  projectName?: string
): Promise<{ success: boolean; error?: string }> {
  if (!mongoEnabled()) {
    return { success: false, error: "MongoDB not configured" };
  }

  const collection = await getProjectsCollection();
  const project = await collection.findOne({ projectId });

  if (!project) {
    return { success: false, error: "Project not found" };
  }

  if (project.userId) {
    return { success: false, error: "Project already claimed" };
  }

  const oid = new ObjectId(userId);

  await collection.updateOne(
    { projectId },
    {
      $set: {
        userId: oid,
        claimedAt: new Date().toISOString(),
        ...(projectName && { projectName }),
      },
    }
  );

  return { success: true };
}

/**
 * Check if a project is claimed
 */
export async function isProjectClaimed(projectId: string): Promise<boolean> {
  if (!mongoEnabled()) {
    return false;
  }

  const collection = await getProjectsCollection();
  const project = await collection.findOne({ projectId });

  return Boolean(project?.userId);
}

/**
 * Get all unclaimed projects (for admin/debugging)
 */
export async function getUnclaimedProjects(limit = 50): Promise<Project[]> {
  if (!mongoEnabled()) {
    return [];
  }

  const collection = await getProjectsCollection();

  return await collection
    .find({ userId: { $exists: false } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}
