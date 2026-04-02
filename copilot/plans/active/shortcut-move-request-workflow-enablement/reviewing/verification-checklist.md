<!-- copilot/plans/active/shortcut-move-request-workflow-enablement/reviewing/verification-checklist.md -->
# Verification Checklist

## Implementation
- [x] Request creation callable implemented.
- [x] Home modal confirm wired to callable.
- [x] Owner notifications created (email queue + in-app).
- [x] Owner review UI implemented.
- [x] Resolve callable implemented for approve/reject.

## Security
- [x] `shortcutMoveRequests` rules implemented with least privilege.
- [x] Cross-tenant request access denied.
- [x] Non-owner resolve attempts denied.

## Validation
- [x] `npm run lint` passed.
- [x] `npx tsc --noEmit` passed.
- [x] Impacted unit tests passed.
- [x] Rules tests passed.
- [x] `get_errors` clean on touched files.

## Documentation
- [x] Lossless report created.
- [x] Codebase explanations updated.
- [x] Plan lifecycle synced.

