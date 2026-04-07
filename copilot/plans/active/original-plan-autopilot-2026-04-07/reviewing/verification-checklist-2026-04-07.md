<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/reviewing/verification-checklist-2026-04-07.md -->
# Verification Checklist (2026-04-07)

## Functional Verification
- [x] Selection mode move/filter/share/undo behaviors verified.
- [ ] Bin grid/list style and option behavior parity verified.
- [ ] Settings header toggle option and system theme consistency verified.
- [ ] Institution customization live iframe preview and save confirmation verified.
- [ ] Scrollbar theme + layout stability verified.
- [ ] Topic create actions restored and verified.

## Regression Verification
- [ ] Adjacent modes/tabs maintain original behavior.
- [ ] Role/permission visibility rules unchanged unless explicitly requested.
- [ ] Empty/loading/error states still render correctly.

## Tooling Verification
- [x] `get_errors` clean for touched files.
- [x] Targeted tests pass.
- [ ] `npm run lint` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes (if required by touched areas).

## Documentation Verification
- [x] Lossless report created/updated.
- [x] Codebase explanation docs updated for touched files.
- [x] Plan lifecycle and phase statuses synchronized.

## Git Verification
- [ ] Commits are atomic with conventional messages.
- [ ] Security scans passed before commit and push.
- [ ] Push completed after each major block.
