import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  findLatestApprovalRecord,
  listApprovals,
  recordApproval,
  recordApprovalDenial,
  requireApproval,
  type ApprovalAction,
} from "./approval-gate";

interface TestCase {
  name: string;
  run: () => Promise<void>;
}

let tempDir = "";

const testCases: TestCase[] = [
  {
    name: "missing approval blocks request",
    run: async () => {
      const decision = await requireApproval({
        outputDir: tempDir,
        action: "model_provider_call",
        stageId: "02-prd",
        target: "openai_agents_sdk:prd:02-prd",
        reason: "test",
      });

      assert(!decision.approved, "decision should be blocked");
      assert(decision.message.includes("Требуется подтверждение"), "message should explain approval requirement");
    },
  },
  {
    name: "target-specific approval requires exact target",
    run: async () => {
      await recordApproval(tempDir, approval("model_provider_call", "openai_agents_sdk:prd:02-prd"));

      const matching = await requireApproval({
        outputDir: tempDir,
        action: "model_provider_call",
        stageId: "02-prd",
        target: "openai_agents_sdk:prd:02-prd",
        reason: "test",
      });
      assert(matching.approved, "matching target should be approved");

      const differentTarget = await requireApproval({
        outputDir: tempDir,
        action: "model_provider_call",
        stageId: "03-ia",
        target: "openai_agents_sdk:ia:03-ia",
        reason: "test",
      });
      assert(!differentTarget.approved, "different target should not inherit approval");
    },
  },
  {
    name: "approval without target does not satisfy targeted request",
    run: async () => {
      await recordApproval(tempDir, approval("figma_write"));
      const decision = await requireApproval({
        outputDir: tempDir,
        action: "figma_write",
        stageId: "04-design",
        target: "figma:file:123",
        reason: "test",
      });

      assert(!decision.approved, "targeted request should require matching target");
    },
  },
  {
    name: "targeted approval does not satisfy targetless request",
    run: async () => {
      await recordApproval(tempDir, approval("external_write", "external-system:demo"));
      const decision = await requireApproval({
        outputDir: tempDir,
        action: "external_write",
        stageId: "12-release",
        reason: "test",
      });

      assert(!decision.approved, "targetless request should not inherit targeted approval");
    },
  },
  {
    name: "denial is recorded but does not approve",
    run: async () => {
      await recordApprovalDenial(tempDir, {
        action: "notion_agile_export",
        approved_by: "test",
        target: "notion-page",
        notes: "denied in test",
      });

      const approvals = await listApprovals(tempDir);
      const denial = approvals.find((item) => item.action === "notion_agile_export");
      assert(Boolean(denial), "denial record should exist");
      assert(denial?.approved === false, "denial record should have approved=false");

      const decision = await requireApproval({
        outputDir: tempDir,
        action: "notion_agile_export",
        stageId: "12-release",
        target: "notion-page",
        reason: "test",
      });
      assert(!decision.approved, "denial must not approve request");
    },
  },
  {
    name: "latest matching denial overrides earlier approval",
    run: async () => {
      await recordApproval(tempDir, approval("deploy", "preview-env"));
      await recordApprovalDenial(tempDir, {
        action: "deploy",
        approved_by: "test",
        target: "preview-env",
        notes: "revoked in test",
      });

      const decision = await requireApproval({
        outputDir: tempDir,
        action: "deploy",
        stageId: "12-release",
        target: "preview-env",
        reason: "test",
      });

      assert(!decision.approved, "latest denial should override earlier approval");
      assert(decision.message.includes("Последняя matching-запись является отказом"), "message should mention latest denial");
    },
  },
  {
    name: "findLatestApprovalRecord returns latest matching target record",
    run: async () => {
      const approvals = [
        approval("model_provider_call", "openai_agents_sdk:prd:02-prd"),
        approval("model_provider_call", "openai_agents_sdk:ia:03-ia"),
        {
          action: "model_provider_call" as ApprovalAction,
          approved: false,
          approved_by: "test",
          target: "openai_agents_sdk:prd:02-prd",
          notes: "revoked in test",
        },
      ];

      const latestPrd = findLatestApprovalRecord(approvals, "model_provider_call", "openai_agents_sdk:prd:02-prd");
      const latestIa = findLatestApprovalRecord(approvals, "model_provider_call", "openai_agents_sdk:ia:03-ia");

      assert(latestPrd?.approved === false, "latest PRD record should be denial");
      assert(latestIa?.approved === true, "latest IA record should remain approval");
    },
  },
  {
    name: "guardrail action ids can be recorded with exact targets",
    run: async () => {
      const actions: ApprovalAction[] = [
        "external_research_provider_call",
        "delete_data",
        "change_secrets",
        "send_external_message",
      ];

      for (const action of actions) {
        await recordApproval(tempDir, approval(action, `${action}:target`));
        const decision = await requireApproval({
          outputDir: tempDir,
          action,
          stageId: "guardrail-test",
          target: `${action}:target`,
          reason: "test",
        });

        assert(decision.approved, `${action} should be approvable by exact target`);
      }
    },
  },
];

async function runTests(): Promise<void> {
  console.log("=== Запуск тестов approval gate ===");
  let passed = 0;
  let failed = 0;

  tempDir = await mkdtemp(join(tmpdir(), "product-agent-studio-approval-"));

  try {
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

function approval(action: ApprovalAction, target?: string) {
  return {
    action,
    approved: true,
    approved_by: "test",
    target,
    notes: "approved in test",
  };
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
