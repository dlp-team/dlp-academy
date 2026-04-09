<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/reviewing/verification-checklist-2026-04-09.md -->
# Verification Checklist

## Core Functional Gates
- [ ] Selection mode supports grouped drag/drop behavior for all selected entries.
- [ ] Nested list selection no longer renders clipped/cropped border visuals.
- [x] Batch move confirmation applies a single confirmation action to all selected entries.
- [x] Ctrl+Z can undo most recent supported action until replaced by a new action.

## Bin UX Gates
- [x] Grid press scales card and text without visual duplication artifacts.
- [x] Grid press does not apply background opacity reduction.
- [x] List mode press-state styling is visually consistent with grid behavior.

## Shortcut & Ownership Gates
- [x] `Ctrl+C`/`Ctrl+V` copy creates owner-scoped non-shared duplicate.
- [x] `Ctrl+X`/`Ctrl+V` supports undo restoration via `Ctrl+Z`.
- [x] Copy includes nested topic content (quizzes/documents/exams) and required metadata handling.

## Institution Customization Gates
- [ ] Preview behavior remains parity-safe and does not require secondary auth account.
- [ ] Reset action restores to last saved colors, not hardcoded defaults.
- [x] Saved theme sets can be persisted and reapplied.

## Visual System Gates
- [x] Global scrollbar has transparent track and neutral theme-adaptive thumb colors.
- [x] Undo card visual style is cleaner and lower contrast.
- [x] Notification cards appear bottom-left, auto-dismiss in 10 seconds, and do not duplicate same event instance.
- [x] Notification history cards use updated icon/style parity.

## Quality Gates
- [x] `get_errors` clean for touched files.
- [x] `npm run lint` passes.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run test` passes for impacted suite.
- [x] Lossless report generated for each major block.
