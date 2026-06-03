import { existsSync } from "node:fs";
import { appendFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { requireApproval } from "../approval-gate";
import { artifactFiles } from "../workflow-stages";

export async function maybeRunNotionAgileExport(
  outputDir: string,
  stageId: string,
): Promise<{ warnings: string[]; approvalMissing: boolean }> {
  const warnings: string[] = [];
  const config = await detectNotionConfig(outputDir);

  if (!config.token || !config.pageId) {
    warnings.push("Automatic Notion Agile Board export skipped: NOTION_TOKEN or parent page ID is not configured in .env or environment.");
    return { warnings, approvalMissing: false };
  }

  const approval = await requireApproval({
    outputDir,
    action: "notion_agile_export",
    stageId,
    target: config.pageId,
    reason: "Release stage wants to create or update Notion Agile Board and User Stories outside the local workspace",
  });

  if (!approval.approved) {
    warnings.push(approval.message);
    await appendFile(
      join(outputDir, artifactFiles.release_notes),
      [
        "",
        "## Approval Gate",
        "",
        `- Status: partial`,
        `- External action blocked: notion_agile_export`,
        `- Target: ${config.pageId}`,
        `- Reason: ${approval.message}`,
        "",
      ].join("\n"),
      "utf8",
    );
    return { warnings, approvalMissing: true };
  }

  try {
    const scriptPath = join(process.cwd(), "tooling", "scripts", "publish-notion-stories.mjs");
    execFileSync("node", [scriptPath, config.pageId, outputDir], { stdio: "inherit" });
    warnings.push(`Notion Agile Board export completed with approval for ${config.pageId}.`);
  } catch (publishError) {
    const msg = publishError instanceof Error ? publishError.message : String(publishError);
    warnings.push(`Automatic Notion Agile Board export failed: ${msg}`);
  }

  return { warnings, approvalMissing: false };
}

async function detectNotionConfig(outputDir: string): Promise<{ token?: string; pageId?: string }> {
  let token = process.env.NOTION_TOKEN;
  let pageId = process.env.NOTION_PAGE_ID || process.env.NOTION_PARENT_PAGE_ID || process.env.NOTION_TARGET;

  const envPath = join(process.cwd(), ".env");
  if (existsSync(envPath)) {
    try {
      const envContent = await readFile(envPath, "utf8");
      if (!token) {
        const tokenMatch = envContent.match(/^NOTION_TOKEN=(.+)$/m);
        if (tokenMatch?.[1]?.trim()) {
          token = tokenMatch[1].trim();
        }
      }
      if (!pageId) {
        const pageIdMatch = envContent.match(/^(?:NOTION_PAGE_ID|NOTION_PARENT_PAGE_ID|NOTION_TARGET)=(.+)$/m);
        if (pageIdMatch?.[1]?.trim()) {
          pageId = pageIdMatch[1].trim();
        }
      }
    } catch {
      // Ignore local config read failures; the caller records a skipped export.
    }
  }

  if (!pageId) {
    const scaffoldPath = join(outputDir, "workflow-scaffold.md");
    if (existsSync(scaffoldPath)) {
      try {
        const scaffoldContent = await readFile(scaffoldPath, "utf8");
        const match = scaffoldContent.match(/(?:notion_target|Notion Target|Page ID):\s*(.+)$/im);
        if (match?.[1]?.trim()) {
          pageId = match[1].trim();
        }
      } catch {
        // Ignore scaffold read failures.
      }
    }
  }

  if (!pageId) {
    const runStatePath = join(outputDir, "run-state.json");
    if (existsSync(runStatePath)) {
      try {
        const runStateContent = await readFile(runStatePath, "utf8");
        const parsed = JSON.parse(runStateContent) as { notion_target?: string };
        if (parsed.notion_target) {
          pageId = parsed.notion_target;
        }
      } catch {
        // Ignore run state parse failures.
      }
    }
  }

  return { token, pageId };
}
