import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env");

if (!existsSync(envPath)) {
  console.error("Missing .env. Create it from .env.example and set NOTION_TOKEN.");
  process.exit(1);
}

const env = readFileSync(envPath, "utf8");
const match = env.match(/^NOTION_TOKEN=(.+)$/m);

if (!match || !match[1].trim()) {
  console.error("NOTION_TOKEN is empty in .env.");
  process.exit(1);
}

console.log("NOTION_TOKEN is configured locally.");
