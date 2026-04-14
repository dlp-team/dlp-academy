<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/reviewing/verification-checklist-2026-04-14.md -->
# Verification Checklist (2026-04-14)

## Functional Validation
- [x] Message notifications and general notifications use distinct icon contracts.
- [x] Topic visible-content events generate student notifications.
- [x] Test and task notification types render with dedicated icons.
- [x] Settings toggle disables new-content notifications.
- [x] 24h deliverable due-soon notification is generated once.
- [x] Header messages icon hover shows up to 3 unread messages only while hovering.
- [x] Bell dropdown click routes to notifications page, and then item click follows hyperlink.
- [x] Formula references in messages render only processed LaTeX without duplicate plain text.

## Regression Validation
- [x] Existing direct message read-marking behavior preserved.
- [x] Existing notification read/mark-all behavior preserved.
- [x] Existing institution scoping and permission checks preserved.

## Technical Validation
- [x] get_errors clean on touched files.
- [x] Targeted tests pass for modified areas.
- [x] npm run lint passes.

## Documentation Validation
- [x] Lossless report created/updated.
- [x] Codebase explanation docs updated.
- [x] Plan roadmap and implementation log synchronized.
