<!-- copilot/plans/finished/autopilot-plan-messages-hub-2026-04-12/reviewing/verification-checklist-2026-04-12.md -->
# Verification Checklist (2026-04-12)

## Functional
- [x] Dedicated Messages section lists all user conversations.
- [x] Conversation thread UI supports send/read/update flows.
- [x] Subject profile/class entrypoint still opens/sends direct messages.
- [x] Participant profile context shows shared subjects and user role.
- [x] Header message notifications are separated from non-message notifications.
- [x] Shared notification/message component renders both channels consistently.

## Security / Multi-Tenancy
- [x] Same-institution constraint enforced on all message reads/writes.
- [x] No cross-institution conversation discovery.
- [x] Least-privilege Firestore rules preserved for non-message collections.

## Technical
- [x] `get_errors` clean for touched files.
- [x] `npm run lint` passes.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run test` passes with deterministic coverage updates.

## Documentation
- [x] Lossless report created under date folder.
- [x] Codebase explanation docs updated for all touched modules.
- [x] BRANCH_LOG and plan phases synced to final status.
- [x] Out-of-scope risks recorded in [copilot/plans/out-of-scope-risk-log.md](../../../out-of-scope-risk-log.md) when applicable.


