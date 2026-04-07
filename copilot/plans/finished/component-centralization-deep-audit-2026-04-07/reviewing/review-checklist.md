<!-- copilot/plans/finished/component-centralization-deep-audit-2026-04-07/reviewing/review-checklist.md -->
# Review Checklist

## Functional Validation
- [x] All targeted modal migrations preserve open/close behavior.
- [x] Backdrop click and close-block guards work correctly.
- [x] Keyboard interactions remain correct (ESC/submit where supported).
- [x] Three-dots menus open/close correctly and keep permission logic intact.
- [x] Menu positioning logic remains stable on different viewport sizes.

## Regression Validation
- [x] Existing role/permission checks are preserved.
- [x] Shared/shortcut edge cases still behave as before.
- [x] No visual breakage on desktop/mobile in migrated surfaces.

## Quality Gates
- [x] get_errors clean for touched files.
- [x] npm run lint passes.
- [x] npm run test passes.
- [x] npx tsc --noEmit passes for TypeScript changes.

## Documentation and Governance
- [x] Component registry updated with real shared components and usage rules.
- [x] Lossless report created for each implementation wave.
- [x] Out-of-scope risks logged in [copilot/plans/out-of-scope-risk-log.md](../../out-of-scope-risk-log.md) if identified.
