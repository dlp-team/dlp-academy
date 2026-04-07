<!-- copilot/plans/active/component-centralization-deep-audit-2026-04-07/reviewing/review-checklist.md -->
# Review Checklist

## Functional Validation
- [ ] All targeted modal migrations preserve open/close behavior.
- [ ] Backdrop click and close-block guards work correctly.
- [ ] Keyboard interactions remain correct (ESC/submit where supported).
- [ ] Three-dots menus open/close correctly and keep permission logic intact.
- [ ] Menu positioning logic remains stable on different viewport sizes.

## Regression Validation
- [ ] Existing role/permission checks are preserved.
- [ ] Shared/shortcut edge cases still behave as before.
- [ ] No visual breakage on desktop/mobile in migrated surfaces.

## Quality Gates
- [ ] get_errors clean for touched files.
- [ ] npm run lint passes.
- [ ] npm run test passes.
- [ ] npx tsc --noEmit passes for TypeScript changes.

## Documentation and Governance
- [ ] Component registry updated with real shared components and usage rules.
- [ ] Lossless report created for each implementation wave.
- [ ] Out-of-scope risks logged in [copilot/plans/out-of-scope-risk-log.md](../../out-of-scope-risk-log.md) if identified.
