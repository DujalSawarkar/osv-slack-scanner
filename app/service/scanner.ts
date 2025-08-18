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
  // LOG 3: Log the data this function receives
  console.log("--- formatMessage function received this data: ---");
  console.log(JSON.stringify(results, null, 2));
  console.log("-------------------------------------------");

  let message = `OSV Scan Report\n`;
  message += `Timestamp: ${new Date().toLocaleString()}\n\n`;

  results.forEach((res) => {
    // LOG 4: Log the version being added to the message
    console.log(
      `Formatting message for ${res.packageName} with version ${res.version}`
    );
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
    message += "\n";
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

      const scanResults = [];
      for (const pkg of changedPackages) {
        const versionString = newDependencies[pkg];

        const exactVersion = versionString.replace(/[^\d.]/g, "");

        const vulnerabilities = await scanPackage(pkg, exactVersion);
        scanResults.push({
          packageName: pkg,
          version: exactVersion,
          vulnerabilities,
        });
      }

      const reportMessage = formatMessage(scanResults);
      await sendSlackDM(reportMessage);

      // ... (rest of the function for history and state updates remains the same)
      currentDependencies = newDependencies;
    }
  } catch (error) {
    console.error("Error during file check:", error);
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

    setInterval(checkFileForUpdates, interval);
  } catch (error) {
    console.error(" Could not perform initial dependency check.", error);
  }
}
