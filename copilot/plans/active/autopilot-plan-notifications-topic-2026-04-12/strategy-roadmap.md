<!-- copilot/plans/active/autopilot-plan-notifications-topic-2026-04-12/strategy-roadmap.md -->
# Strategy Roadmap

## Execution Order
1. `phase-01-intake-governance` - COMPLETED
2. `phase-02-notification-centralization` - COMPLETED
3. `phase-03-share-notification-identity` - COMPLETED
4. `phase-04-direct-messages-same-institution` - COMPLETED
5. `phase-05-subject-class-student-to-teacher` - COMPLETED
6. `phase-06-topic-study-guide-teacher-access` - COMPLETED
7. `phase-07-validation-docs-closure` - COMPLETED

## Why This Order
- Notification centralization first creates stable primitives reused by later feature blocks.
- Share-notification rendering depends on normalized notification model/components.
- Direct messaging introduces new data/rules and class-context UI; isolated before permission fix to reduce cross-risk.
- Subject-class student-to-teacher messaging lands after messaging core APIs are stable.
- Topic study-guide access fix lands after messaging/rules scaffolding to avoid mixed permission debugging.
- Final validation/docs closure runs last to confirm no regressions.

## Required Artifacts
- Lossless reports per major block under [copilot/explanations/temporal/lossless-reports/2026-04-12/](../../../../explanations/temporal/lossless-reports/2026-04-12/)
- Updated codebase explanations for touched modules under [copilot/explanations/codebase/](../../../../explanations/codebase/)
- Review checklist in [reviewing/verification-checklist-2026-04-12.md](reviewing/verification-checklist-2026-04-12.md)

## Immediate Next Action
- Phase implementation complete. Awaiting potential follow-up scope from user.
