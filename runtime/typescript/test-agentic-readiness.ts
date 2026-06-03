import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { recordApproval, recordApprovalDenial } from "./approval-gate";
import { formatModelProviderApprovalTarget } from "./agentic-approval-targets";
import { formatAgenticApprovalCommands, formatAgenticPreflight, formatAgenticReadiness } from "./run-workflow-engine";

interface TestCase {
  name: string;
  run: () => Promise<void>;
}

let tempDir = "";
const originalOpenAiKey = process.env.OPENAI_API_KEY;

const testCases: TestCase[] = [
  {
    name: "readiness is false without model key",
    run: async () => {
      delete process.env.OPENAI_API_KEY;
      const result = await formatAgenticReadiness(tempDir);

      assert(!result.ready, "readiness should be false without OPENAI_API_KEY");
      assert(result.report.includes("OPENAI_API_KEY: missing"), "report should mention missing model key");
      assert(result.report.includes("Approval |"), "report should include approval table");
    },
  },
  {
    name: "readiness is false when approvals are missing",
    run: async () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = await formatAgenticReadiness(tempDir);

      assert(!result.ready, "readiness should be false without approvals");
      assert(result.report.includes("OPENAI_API_KEY: configured"), "report should mention configured model key");
      assert(result.report.includes("missing"), "report should show missing approvals");
    },
  },
  {
    name: "readiness is true with model key and exact approvals",
    run: async () => {
      process.env.OPENAI_API_KEY = "test-key";
      await recordApproval(tempDir, {
        action: "model_provider_call",
        approved: true,
        approved_by: "test",
        target: "openai_agents_sdk:prd:02-prd",
        notes: "Тестовое подтверждение для PRD.",
      });
      await recordApproval(tempDir, {
        action: "model_provider_call",
        approved: true,
        approved_by: "test",
        target: "openai_agents_sdk:ia:03-ia",
        notes: "Тестовое подтверждение для IA.",
      });

      const result = await formatAgenticReadiness(tempDir);

      assert(result.ready, "readiness should be true with key and all exact approvals");
      assert(result.report.includes("Ready: yes"), "report should show ready yes");
      assert(result.report.includes("approved"), "report should show approved targets");
    },
  },
  {
    name: "readiness does not require approval for completed rollout stage",
    run: async () => {
      process.env.OPENAI_API_KEY = "test-key";
      const partialRunDir = await mkdtemp(join(tmpdir(), "product-agent-studio-partial-agentic-run-"));
      try {
        await writeMinimalRunState(partialRunDir, "agentic", { "02-prd": "completed", "03-ia": "pending" });
        await recordApproval(partialRunDir, {
          action: "model_provider_call",
          approved: true,
          approved_by: "test",
          target: "openai_agents_sdk:ia:03-ia",
          notes: "Тестовое подтверждение для IA.",
        });

        const result = await formatAgenticReadiness(partialRunDir);

        assert(result.ready, "readiness should be true when completed PRD does not need approval and IA is approved");
        assert(result.report.includes("not required (completed)"), "report should show completed stage does not require approval");
      } finally {
        await rm(partialRunDir, { recursive: true, force: true });
      }
    },
  },
  {
    name: "strict readiness fails when active blockers exist",
    run: async () => {
      process.env.OPENAI_API_KEY = "test-key";
      const blockedRunDir = await mkdtemp(join(tmpdir(), "product-agent-studio-blocked-agentic-run-"));
      try {
        await writeMinimalRunState(blockedRunDir, "agentic", {
          "02-prd": "completed",
          "03-ia": "completed",
          "04-design": "blocked",
        });

        const result = await formatAgenticReadiness(blockedRunDir);
        const preflight = await formatAgenticPreflight(blockedRunDir, "outputs/test-run/2026-06-01", "reviewer", result);

        assert(result.ready, "model-provider readiness should be true when enabled rollout stages are completed");
        assert(!result.strictReady, "strict readiness should fail when active blockers exist");
        assert(result.report.includes("Strict gate: fail"), "report should show strict gate failure");
        assert(result.report.includes("Blocking stages: 04-design:blocked"), "report should list blocked stage");
        assert(preflight.includes("Для strict gate нужно снять blockers"), "preflight should explain blocker follow-up");
      } finally {
        await rm(blockedRunDir, { recursive: true, force: true });
      }
    },
  },
  {
    name: "latest denial makes readiness false after earlier approval",
    run: async () => {
      process.env.OPENAI_API_KEY = "test-key";
      await recordApproval(tempDir, {
        action: "model_provider_call",
        approved: true,
        approved_by: "test",
        target: "openai_agents_sdk:prd:02-prd",
        notes: "Тестовое подтверждение для PRD.",
      });
      await recordApproval(tempDir, {
        action: "model_provider_call",
        approved: true,
        approved_by: "test",
        target: "openai_agents_sdk:ia:03-ia",
        notes: "Тестовое подтверждение для IA.",
      });
      await recordApprovalDenial(tempDir, {
        action: "model_provider_call",
        approved_by: "test",
        target: "openai_agents_sdk:ia:03-ia",
        notes: "Тестовый отзыв подтверждения для IA.",
      });

      const result = await formatAgenticReadiness(tempDir);

      assert(!result.ready, "readiness should be false when latest matching IA record is denial");
      assert(result.report.includes("denied"), "report should show denied target");
    },
  },
  {
    name: "readiness is false when outputDir is missing",
    run: async () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = await formatAgenticReadiness(join(tempDir, "missing-run"));

      assert(!result.ready, "readiness should be false for missing outputDir");
      assert(result.report.includes("не найдено:"), "report should mention missing outputDir");
    },
  },
  {
    name: "readiness is false when run-state is missing",
    run: async () => {
      process.env.OPENAI_API_KEY = "test-key";
      const noStateDir = await mkdtemp(join(tmpdir(), "product-agent-studio-no-run-state-"));
      try {
        const result = await formatAgenticReadiness(noStateDir);

        assert(!result.ready, "readiness should be false without run-state.json");
        assert(result.report.includes("Workflow run-state: missing"), "report should mention missing run-state");
      } finally {
        await rm(noStateDir, { recursive: true, force: true });
      }
    },
  },
  {
    name: "readiness is false when run-state mode is local",
    run: async () => {
      process.env.OPENAI_API_KEY = "test-key";
      const localRunDir = await mkdtemp(join(tmpdir(), "product-agent-studio-local-run-state-"));
      try {
        await writeMinimalRunState(localRunDir, "local");
        await recordApproval(localRunDir, {
          action: "model_provider_call",
          approved: true,
          approved_by: "test",
          target: "openai_agents_sdk:prd:02-prd",
          notes: "Тестовое подтверждение для PRD.",
        });
        await recordApproval(localRunDir, {
          action: "model_provider_call",
          approved: true,
          approved_by: "test",
          target: "openai_agents_sdk:ia:03-ia",
          notes: "Тестовое подтверждение для IA.",
        });

        const result = await formatAgenticReadiness(localRunDir);

        assert(!result.ready, "readiness should be false when execution_mode is local");
        assert(result.report.includes("Workflow execution mode: local"), "report should mention local execution mode");
      } finally {
        await rm(localRunDir, { recursive: true, force: true });
      }
    },
  },
  {
    name: "approval commands include exact rollout targets",
    run: async () => {
      const output = formatAgenticApprovalCommands("outputs/test-run/2026-06-01", "reviewer");

      assert(output.includes("yarn workflow:approve"), "output should include approval command");
      assert(output.includes("openai_agents_sdk:prd:02-prd"), "output should include PRD approval target");
      assert(output.includes("openai_agents_sdk:ia:03-ia"), "output should include IA approval target");
      assert(output.includes("--by reviewer"), "output should include provided approver");
      assert(output.includes("workflow:agentic-readiness"), "output should include strict readiness follow-up");
    },
  },
  {
    name: "model provider approval target helper keeps stable format",
    run: async () => {
      const target = formatModelProviderApprovalTarget({ id: "02-prd", owner: "prd" });

      assert(target === "openai_agents_sdk:prd:02-prd", "model provider target format should stay stable");
    },
  },
  {
    name: "approval commands skip active approvals when approvals are provided",
    run: async () => {
      const output = formatAgenticApprovalCommands("outputs/test-run/2026-06-01", "reviewer", [
        {
          action: "model_provider_call",
          approved: true,
          approved_by: "test",
          target: "openai_agents_sdk:prd:02-prd",
          notes: "Тестовое подтверждение для PRD.",
        },
      ]);

      assert(!output.includes("openai_agents_sdk:prd:02-prd --by reviewer"), "output should skip active PRD approval");
      assert(output.includes("openai_agents_sdk:ia:03-ia"), "output should still include missing IA approval");
    },
  },
  {
    name: "approval commands include denied targets when approvals are provided",
    run: async () => {
      const output = formatAgenticApprovalCommands("outputs/test-run/2026-06-01", "reviewer", [
        {
          action: "model_provider_call",
          approved: true,
          approved_by: "test",
          target: "openai_agents_sdk:prd:02-prd",
          notes: "Тестовое подтверждение для PRD.",
        },
        {
          action: "model_provider_call",
          approved: false,
          approved_by: "test",
          target: "openai_agents_sdk:prd:02-prd",
          notes: "Тестовый отзыв подтверждения для PRD.",
        },
      ]);

      assert(output.includes("openai_agents_sdk:prd:02-prd"), "output should include denied PRD target");
      assert(output.includes("openai_agents_sdk:ia:03-ia"), "output should include missing IA target");
    },
  },
  {
    name: "approval commands skip completed rollout stages",
    run: async () => {
      const output = formatAgenticApprovalCommands(
        "outputs/test-run/2026-06-01",
        "reviewer",
        [],
        { "02-prd": "completed", "03-ia": "pending" },
      );

      assert(!output.includes("openai_agents_sdk:prd:02-prd"), "output should skip completed PRD target");
      assert(output.includes("openai_agents_sdk:ia:03-ia"), "output should still include pending IA target");
    },
  },
  {
    name: "preflight includes next actions when not ready",
    run: async () => {
      delete process.env.OPENAI_API_KEY;
      const output = await formatAgenticPreflight(tempDir, "outputs/test-run/2026-06-01", "reviewer");

      assert(output.includes("# Agentic Readiness"), "preflight should include readiness report");
      assert(output.includes("## Next Actions"), "preflight should include next actions");
      assert(output.includes("OPENAI_API_KEY"), "preflight should mention missing model key");
      assert(output.includes("workflow:approve"), "preflight should include approval command hints");
      assert(output.includes("--by reviewer"), "preflight should use provided approver");
    },
  },
  {
    name: "preflight suggests resume when ready",
    run: async () => {
      process.env.OPENAI_API_KEY = "test-key";
      await recordApproval(tempDir, {
        action: "model_provider_call",
        approved: true,
        approved_by: "test",
        target: "openai_agents_sdk:prd:02-prd",
        notes: "Тестовое подтверждение для PRD.",
      });
      await recordApproval(tempDir, {
        action: "model_provider_call",
        approved: true,
        approved_by: "test",
        target: "openai_agents_sdk:ia:03-ia",
        notes: "Тестовое подтверждение для IA.",
      });

      const output = await formatAgenticPreflight(tempDir, "outputs/test-run/2026-06-01", "reviewer");

      assert(output.includes("Ready: yes"), "preflight should show ready yes");
      assert(output.includes("workflow:resume outputs/test-run/2026-06-01"), "preflight should suggest resume command");
      assert(output.includes("Agentic model-provider preflight готов"), "preflight should clarify model-provider readiness");
      assert(!output.includes("workflow:approve outputs/test-run/2026-06-01"), "ready preflight should not repeat approval commands");
    },
  },
];

async function runTests(): Promise<void> {
  console.log("=== Запуск тестов agentic readiness ===");
  let passed = 0;
  let failed = 0;

  tempDir = await mkdtemp(join(tmpdir(), "product-agent-studio-agentic-readiness-"));

  try {
    await writeMinimalRunState(tempDir, "agentic");

    for (const testCase of testCases) {
      try {
        await testCase.run();
        console.log(`PASS: ${testCase.name}`);
        passed++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`FAIL: ${testCase.name}: ${message}`);
        failed++;
      }
    }
  } finally {
    restoreOpenAiKey();
    await rm(tempDir, { recursive: true, force: true });
  }

  console.log("\n=== Итоги тестирования ===");
  console.log(`Всего проверок: ${passed + failed}`);
  console.log(`Успешно: ${passed}`);
  console.log(`Ошибок: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

async function writeMinimalRunState(
  outputDir: string,
  executionMode: "local" | "agentic",
  stageStatuses: Record<string, string> = {},
): Promise<void> {
  const stages = Object.fromEntries(Object.entries(stageStatuses).map(([stageId, status]) => [stageId, {
    id: stageId,
    title: stageId,
    status,
    attempts: 1,
    artifacts: [],
    updated_at: "2026-06-01T00:00:00.000Z",
  }]));

  await writeFile(join(outputDir, "run-state.json"), JSON.stringify({
    goal: "Тестовый agentic readiness run",
    output_dir: outputDir,
    current_stage_index: 0,
    profile: "standard",
    execution_mode: executionMode,
    stages,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  }, null, 2), "utf8");
}

function restoreOpenAiKey(): void {
  if (typeof originalOpenAiKey === "undefined") {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalOpenAiKey;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

runTests().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
