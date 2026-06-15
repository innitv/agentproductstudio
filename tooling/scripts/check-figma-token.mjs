import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env");

if (!existsSync(envPath)) {
  console.error("❌ Missing .env file in project root.");
  process.exit(1);
}

const env = readFileSync(envPath, "utf8");
const match = env.match(/^FIGMA_API_TOKEN=(.+)$/m);

if (!match || !match[1].trim()) {
  console.error("❌ FIGMA_API_TOKEN is empty or missing in .env.");
  process.exit(1);
}

const token = match[1].trim();
const fileKey = "4ufM1XdtXzSwbCNpulxETA"; // Target design file used for token smoke checks.

console.log(`Checking Figma API Token for read permissions on file: ${fileKey}...`);

try {
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: {
      "X-Figma-Token": token,
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.log("✅ Connection SUCCESSFUL!");
    console.log(`📂 File Name: "${data.name}"`);
    console.log(`🔧 Last Modified: ${data.lastModified}`);
    console.log(`🎨 Version: ${data.version}`);
  } else {
    console.error(`❌ Connection FAILED with status code: ${response.status}`);
    const errorText = await response.text();
    console.error(`Error details: ${errorText}`);
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Network or API error occurred during check:", error);
  process.exit(1);
}
