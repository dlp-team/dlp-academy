<!-- copilot/plans/inReview/autopilot-plan-messages-hub-2026-04-12/strategy-roadmap.md -->
# Strategy Roadmap

## Execution Order
1. `phase-01-intake-governance` - COMPLETED
2. `phase-02-messaging-domain-and-rules` - COMPLETED
3. `phase-03-messages-hub-route-shell` - COMPLETED
4. `phase-04-conversation-list-and-thread` - COMPLETED
5. `phase-05-profile-context-and-common-subjects` - COMPLETED
6. `phase-06-subject-entrypoint-integration` - COMPLETED
7. `phase-07-notification-message-unification` - COMPLETED
8. `phase-08-validation-tests-docs` - COMPLETED
9. `phase-09-optimization-risk-review` - COMPLETED

## Why This Order
- Data model/rules and multi-tenant safeguards must be validated before broad UI wiring.
- Messages hub shell and routing are foundational for conversation/list components.
- Profile context and subject-entrypoint integrations depend on stable thread primitives.
- Notification split/unification must happen after message events are normalized.
- Validation/docs/optimization close the plan with deterministic regression checks.

## Required Artifacts
- Lossless report(s) under [copilot/explanations/temporal/lossless-reports/2026-04-12/](../../../../explanations/temporal/lossless-reports/2026-04-12/)
- Codebase explanation updates in [copilot/explanations/codebase/](../../../../explanations/codebase/)
- Verification checklist in [reviewing/verification-checklist-2026-04-12.md](reviewing/verification-checklist-2026-04-12.md)

## Immediate Next Action
- Execute final closure verification gate and transition lifecycle to `finished` when approved.

