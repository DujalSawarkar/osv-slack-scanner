import fs from "fs/promises";
import path from "path";
import { scanPackage } from "./osv";
import { sendSlackDM } from "./slack";

const packageJsonPath = path.resolve(
  process.env.PACKAGE_JSON_PATH || "./package.json"
);
const lockFilePath = path.resolve("./package-lock.json");

let currentDependencies: Record<string, string> = {};
let lockFileCache: any = {};

function formatMessage(results: any[]): string {
  let message = `OSV Scan Report\n`;
  message += `Timestamp: ${new Date().toLocaleString()}\n\n`;

  results.forEach((res) => {
    message += `Package: ${res.packageName}@${res.version}\n`;

    if (res.vulnerabilities.length === 0) {
      message += `Result: No vulnerabilities were found.\n`;
    } else {
      message += `Vulnerabilities Found:\n`;
      res.vulnerabilities.forEach((vuln: any) => {
        message += `  ID: ${vuln.id}\n`;
        message += `  Summary: ${vuln.summary}\n`;
        message += `  ---\n`;
      });
    }
    message += "\n"; // Adds a space before the next package report
  });

  return message;
}

async function checkFileForUpdates() {
  try {
    const fileContent = await fs.readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(fileContent);
    const newDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const changedPackages = Object.keys(newDependencies).filter(
      (key) => newDependencies[key] !== currentDependencies[key]
    );

    if (changedPackages.length > 0) {
      console.log("Change detected! New or updated packages:", changedPackages);

      const lockFileContent = await fs.readFile(lockFilePath, "utf-8");
      lockFileCache = JSON.parse(lockFileContent);

      const scanResults = [];
      for (const pkg of changedPackages) {
        // This line gets the EXACT version from the lock file
        const exactVersion =
          lockFileCache.packages[`node_modules/${pkg}`]?.version;

        if (exactVersion) {
          const vulnerabilities = await scanPackage(pkg, exactVersion);
          scanResults.push({
            packageName: pkg,
            version: exactVersion,
            vulnerabilities,
          });
        } else {
          console.warn(
            `Could not find exact version for ${pkg} in package-lock.json`
          );
        }
      }

      const reportMessage = formatMessage(scanResults);
      await sendSlackDM(reportMessage);

      currentDependencies = newDependencies;
      console.log("State updated. Now monitoring for new changes.");
    }
  } catch (error) {
    console.error(" Error during file check:", error);
  }
}

export async function startPolling(interval: number = 15000) {
  try {
    const fileContent = await fs.readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(fileContent);
    currentDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    console.log(
      `✅ Initial state captured with ${
        Object.keys(currentDependencies).length
      } dependencies.`
    );
    setInterval(checkFileForUpdates, interval);
  } catch (error) {
    console.error(" Could not perform initial dependency check.", error);
  }
}
