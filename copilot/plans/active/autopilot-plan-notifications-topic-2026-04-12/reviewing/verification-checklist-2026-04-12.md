<!-- copilot/plans/active/autopilot-plan-notifications-topic-2026-04-12/reviewing/verification-checklist-2026-04-12.md -->
# Verification Checklist (2026-04-12)

## Functional
- [ ] Notifications unified across Header/Home/Topic with centralized component(s).
- [ ] Home copy/paste toast appears bottom-left and fully visible on desktop/mobile.
- [ ] Light and dark theme variants verified for notification UI.
- [ ] Notification center icon no longer mailbox/letter-based.
- [ ] Subject-share notifications render sharer name + photo.
- [ ] Direct messages restricted to same institution users.
- [ ] Student can message teacher from Subject class section.
- [ ] Topic study guide visibility/interactions work for teachers (not admin-only).

## Security / Multi-Tenancy
- [ ] Firestore rules enforce same-institution messaging.
- [ ] No broad rule relaxations introduced.
- [ ] Topic/subject permissions remain least-privilege.

## Technical
- [ ] `get_errors` clean for touched files.
- [ ] `npm run lint` passes.
- [ ] `npm run test` passes (or documented existing failures not introduced by this plan).
- [ ] `npx tsc --noEmit` passes.

## Documentation
- [ ] Lossless report(s) created under date folder.
- [ ] Codebase explanation files updated with dated changelog entries.
- [ ] BRANCH_LOG updated with touched files and final status.
