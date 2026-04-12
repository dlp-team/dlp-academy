<!-- copilot/plans/active/autopilot-plan-messages-hub-2026-04-12/reviewing/verification-checklist-2026-04-12.md -->
# Verification Checklist (2026-04-12)

## Functional
- [ ] Dedicated Messages section lists all user conversations.
- [ ] Conversation thread UI supports send/read/update flows.
- [ ] Subject profile/class entrypoint still opens/sends direct messages.
- [ ] Participant profile context shows shared subjects and user role.
- [ ] Header message notifications are separated from non-message notifications.
- [ ] Shared notification/message component renders both channels consistently.

## Security / Multi-Tenancy
- [ ] Same-institution constraint enforced on all message reads/writes.
- [ ] No cross-institution conversation discovery.
- [ ] Least-privilege Firestore rules preserved for non-message collections.

## Technical
- [ ] `get_errors` clean for touched files.
- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run test` passes with deterministic coverage updates.

## Documentation
- [ ] Lossless report created under date folder.
- [ ] Codebase explanation docs updated for all touched modules.
- [ ] BRANCH_LOG and plan phases synced to final status.
- [ ] Out-of-scope risks recorded in [copilot/plans/out-of-scope-risk-log.md](../../../out-of-scope-risk-log.md) when applicable.
