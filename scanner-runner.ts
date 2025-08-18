// scanner-runner.ts
import dotenv from "dotenv";
import path from "path";
import { startPolling } from "./app/service/scanner";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

console.log("Scanner starting up...");
startPolling(5000);
