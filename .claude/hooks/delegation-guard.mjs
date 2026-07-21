#!/usr/bin/env node
// PreToolUse (matcher: use_figma|generate_figma_design):
// «замок делегации» по research-паттерну №1 (agent_id-aware).
// Поле stdin.agent_id присутствует ТОЛЬКО когда tool-вызов идёт из субагента.
// Если его нет — вызов пришёл из ГЛАВНОЙ СЕССИИ (оркестратора): для многошаговой
// Figma/DS-сборки это нарушение manager-style. Пока — МЯГКИЙ режим (напоминание +
// audit-лог), НЕ жёсткий block: на части версий CLI поле может не приходить в субагенте
// (github issue #34692) — жёсткий block включать после sanity по логам ниже.
import { appendFileSync, mkdirSync } from 'node:fs';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let j = {};
  try { j = JSON.parse(input); } catch {}
  const agentId = j.agent_id ?? null;
  const agentType = j.agent_type ?? null;
  const tool = j.tool_name ?? '';
  const fromOrchestrator = agentId === null;

  // audit-лог (research №4 scorecard): собираем факты, кто ведёт Figma-write.
  try {
    mkdirSync('.claude/logs', { recursive: true });
    appendFileSync(
      '.claude/logs/delegation-audit.jsonl',
      JSON.stringify({ t: new Date().toISOString(), tool, agent_id: agentId, agent_type: agentType, fromOrchestrator }) + '\n',
    );
  } catch {}

  if (fromOrchestrator) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext:
            '🔴 ДЕЛЕГАЦИЯ: этот Figma-write вызван из ГЛАВНОЙ СЕССИИ (оркестратор), не из субагента (agent_id отсутствует). ' +
            'Правило manager-style: многошаговую Figma/DS/визуальную сборку веди через субагента (design-generator / design / qa-review), НЕ вручную в оркестраторе. ' +
            'Допустимо из оркестратора: разовое read/screenshot, точечная approval-gated правка, финальный синтез. ' +
            'Если это шаг многошаговой сборки — ОСТАНОВИСЬ и делегируй.',
        },
      }),
    );
  }
  process.exit(0);
});
