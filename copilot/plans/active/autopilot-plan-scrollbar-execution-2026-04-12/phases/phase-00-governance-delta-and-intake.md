<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/phases/phase-00-governance-delta-and-intake.md -->
# Phase 00 - Governance Delta and Intake

## Objective
Confirm governance rules are explicit about commit/push happening on the branch being worked, then start implementation from a clean intake baseline.

## Scope
- Verify the branch-rule wording in:
  - `copilot/protocols/plan-creation-protocol.md`
  - `.github/skills/create-plan/SKILL.md`
  - `copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md`
- Apply updates only where wording is missing/ambiguous.
- Record evidence in lossless report and execution log.

## Acceptance Criteria
- Branch-specific commit/push rule exists in all three surfaces and is unambiguous.
- No contradictory instructions remain.
- Intake sources are linked in README and roadmap.

## Validation
- `get_errors` on touched governance docs.
- `git diff` audit confirms scope-limited changes.