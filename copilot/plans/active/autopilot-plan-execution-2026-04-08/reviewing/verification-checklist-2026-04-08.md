<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/reviewing/verification-checklist-2026-04-08.md -->
# Verification Checklist

## Core Functional Gates
- [ ] Selection mode supports drag-drop parity for selected batches.
- [x] Folder/child selection de-duplication behaves as specified.
- [x] Selection mode disables create-subject button and styles exit button border with primary-related color.
- [ ] Batch move confirmation applies to all selected items (no single-item regression).
- [x] Global undo supports actions except creation.
- [x] Undo toast appears for 5 seconds and Ctrl+Z remains valid until replaced by newer action.

## Bin UX Gates
- [x] Grid press opacity is softened and options reveal has no delay.
- [x] Grid/list press styling parity is preserved.
- [x] Border highlight appears only in bin selection mode.
- [x] "Ver contenido" routes to read-only content view without mutation capability.

## Institution Customization Gates
- [ ] Color card click selects card only.
- [ ] Swatch click opens color picker with propagation guard.
- [ ] Hex input can update color.
- [ ] Save and reset actions use confirmation overlays.
- [ ] Preview uses `theme-preview` mock route and does not use real secondary auth account.
- [ ] Unsaved colors update preview via iframe `postMessage`.

## Platform Gates
- [ ] Global scrollbar is theme-adaptive and overlay-like without layout cut-offs.
- [x] Notification events fire for share/assignment/enrollment paths.
- [x] Topic create actions (quizzes/exams/study guides) are restored to prior baseline behavior.

## Quality Gates
- [x] `get_errors` clean for touched files.
- [x] `npm run lint` passes.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run test` passes for impacted suite.
- [x] Lossless report generated for each major block.
