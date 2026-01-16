import { MongoClient } from "mongodb";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function getMongoDbName(): string {
  return process.env.MONGODB_DB || "osv-dashboard";
}

export async function getMongoClient(): Promise<MongoClient> {
  const uri = requiredEnv("MONGODB_URI");

  // Cache across hot reloads in dev.
  const g = globalThis as any;
  if (g.__osvMongoClient) return g.__osvMongoClient as MongoClient;

  const client = new MongoClient(uri);
  await client.connect();
  g.__osvMongoClient = client;
  return client;
}
