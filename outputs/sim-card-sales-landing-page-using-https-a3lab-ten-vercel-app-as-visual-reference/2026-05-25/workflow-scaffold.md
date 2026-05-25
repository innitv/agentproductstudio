# Landing Workflow Scaffold

Goal: SIM card sales landing page using https://a3lab-ten.vercel.app/ as visual reference
Date: 2026-05-25

Mode: no-api-key Codex agent pack scaffold.

Route plan:
1. intake
2. research
3. prd
4. ia
5. design
6. copywriting
7. screens
8. prototype
9. frontend
10. visualReferenceReview
11. testBench
12. qaReview
13. release

Agents SDK layer:
- Orchestrator: orchestrator
- Specialists: 12
- Route tools: run_research, create_prd, create_ia_brief, create_design_brief, create_copy_deck, generate_screens, build_prototype, implement_frontend, create_visual_reference_review, create_test_bench, run_qa_review, create_release_notes

Required artifacts:
- run_plan
- handoff_bundle
- stage_gate_ledger
- recursive_brief
- research_summary
- competitive_analysis
- proto_personas
- synthetic_interviews
- swot
- prd
- ia_brief
- reference_analysis
- design_brief
- screens
- copy_deck
- prototype_report
- frontend_result
- visual_reference_review
- test_bench_result
- qa_report
- release_notes

Stage gates:
- 00-intake: Intake and Recursive Brief
  owner: orchestrator
  artifacts: run-plan.md, handoff-bundle.md, stage-gate-ledger.md, recursive-brief.md
- 01-research: Deep Research
  owner: research
  artifacts: research-summary.md, competitive-analysis.md, proto-personas.md, synthetic-interviews.md, swot.md
- 02-prd: Product Requirements
  owner: prd
  artifacts: prd.md
- 03-ia: Information Architecture
  owner: ia
  artifacts: ia-brief.md
- 04-design: Design Brief
  owner: design
  artifacts: reference-analysis.md, design-brief.md
- 05-copy: Copy Deck
  owner: copywriting
  artifacts: copy-deck.md
- 06-screens: Screens
  owner: design-generator
  artifacts: screens.md
- 07-prototype: Prototype
  owner: prototype
  artifacts: prototype-report.md
- 08-frontend: Frontend
  owner: frontend
  artifacts: frontend-result.md
- 09-visual-reference: Visual Reference Review
  owner: qa-review
  artifacts: visual-reference-review.md
- 10-test-bench: Test Bench
  owner: test-bench
  artifacts: test-bench-result.md
- 11-qa: QA Review
  owner: qa-review
  artifacts: qa-report.md
- 12-release: Release
  owner: release
  artifacts: release-notes.md

Validation:
- yarn workflow:validate outputs/sim-card-sales-landing-page-using-https-a3lab-ten-vercel-app-as-visual-reference/2026-05-25 --through 00-intake
- yarn workflow:validate outputs/sim-card-sales-landing-page-using-https-a3lab-ten-vercel-app-as-visual-reference/2026-05-25

Next step: run the workflow through Codex using AGENTS.md and the specialist instructions.
