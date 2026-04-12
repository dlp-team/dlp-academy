<!-- copilot/plans/active/autopilot-plan-notifications-topic-2026-04-12/reviewing/verification-checklist-2026-04-12.md -->
# Verification Checklist (2026-04-12)

## Functional
- [x] Notifications unified across Header/Home/Topic with centralized component(s).
- [x] Home copy/paste toast appears bottom-left and fully visible on desktop/mobile.
- [x] Light and dark theme variants verified for notification UI.
- [x] Notification center icon no longer mailbox/letter-based.
- [x] Subject-share notifications render sharer name + photo.
- [x] Direct messages restricted to same institution users.
- [x] Student can message teacher from Subject class section.
- [x] Topic study guide visibility/interactions work for teachers (not admin-only).

## Security / Multi-Tenancy
- [x] Firestore rules enforce same-institution messaging.
- [x] No broad rule relaxations introduced.
- [x] Topic/subject permissions remain least-privilege.

## Technical
- [x] `get_errors` clean for touched files.
- [x] `npm run lint` passes.
- [x] `npm run test` passes (or documented existing failures not introduced by this plan).
- [x] `npx tsc --noEmit` passes.

## Documentation
- [x] Lossless report(s) created under date folder.
- [x] Codebase explanation files updated with dated changelog entries.
- [x] BRANCH_LOG updated with touched files and final status.
