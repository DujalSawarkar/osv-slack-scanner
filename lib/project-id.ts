import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const CONFIG_FILE_NAME = ".osv-scanner-config.json";

interface ProjectConfig {
  projectId: string;
  createdAt: string;
  lastScan?: string;
}

/**
 * Generate a unique, readable Project ID
 * Format: osv-abc123 (prefix + 6 random alphanumeric chars)
 */
export function generateProjectId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const randomBytes = crypto.randomBytes(4);
  let randomPart = "";

  for (let i = 0; i < 6; i++) {
    const index = randomBytes[i % 4] % chars.length;
    randomPart += chars[index];
  }

  return `osv-${randomPart}`;
}

/**
 * Get the config file path for the given repository directory
 */
function getConfigPath(repoPath: string): string {
  return path.resolve(repoPath, CONFIG_FILE_NAME);
}

/**
 * Load existing project config from the repo directory
 * Returns null if config doesn't exist
 */
export async function loadProjectConfig(
  repoPath: string
): Promise<ProjectConfig | null> {
  const configPath = getConfigPath(repoPath);

  try {
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);

    if (config.projectId && typeof config.projectId === "string") {
      return config;
    }

    return null;
  } catch (error: any) {
    // Config file doesn't exist or can't be read
    if (error.code === "ENOENT") {
      return null;
    }

    console.warn(`Warning: Could not read config file: ${error.message}`);
    return null;
  }
}

/**
 * Save project config to the repo directory
 */
export async function saveProjectConfig(
  repoPath: string,
  projectId: string
): Promise<void> {
  const configPath = getConfigPath(repoPath);

  const config: ProjectConfig = {
    projectId,
    createdAt: new Date().toISOString(),
    lastScan: new Date().toISOString(),
  };

  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * Update the lastScan timestamp in the config
 */
export async function updateLastScan(repoPath: string): Promise<void> {
  const config = await loadProjectConfig(repoPath);

  if (!config) {
    console.warn("Warning: No config found to update");
    return;
  }

  config.lastScan = new Date().toISOString();
  const configPath = getConfigPath(repoPath);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * Get or create a Project ID for the given repository
 * - If config exists with a projectId, return it
 * - Otherwise, generate a new one, save it, and return it
 */
export async function getOrCreateProjectId(repoPath: string): Promise<string> {
  const existingConfig = await loadProjectConfig(repoPath);

  if (existingConfig?.projectId) {
    console.log(`Using existing Project ID: ${existingConfig.projectId}`);
    return existingConfig.projectId;
  }

  const newProjectId = generateProjectId();
  await saveProjectConfig(repoPath, newProjectId);
  console.log(`Generated new Project ID: ${newProjectId}`);

  return newProjectId;
}
