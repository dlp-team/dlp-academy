<!-- copilot/plans/active/autopilot-plan-messages-hub-2026-04-12/strategy-roadmap.md -->
# Strategy Roadmap

## Execution Order
1. `phase-01-intake-governance` - COMPLETED
2. `phase-02-messaging-domain-and-rules` - PLANNED
3. `phase-03-messages-hub-route-shell` - PLANNED
4. `phase-04-conversation-list-and-thread` - PLANNED
5. `phase-05-profile-context-and-common-subjects` - PLANNED
6. `phase-06-subject-entrypoint-integration` - PLANNED
7. `phase-07-notification-message-unification` - PLANNED
8. `phase-08-validation-tests-docs` - PLANNED
9. `phase-09-optimization-risk-review` - PLANNED

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
- Start phase 02 discovery for domain/rules gaps and message hub data requirements.
