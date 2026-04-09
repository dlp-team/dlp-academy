<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/phases/phase-05-customization-preview-reset-and-saved-themes.md -->
# Phase 05 - Customization Preview, Reset, and Saved Themes

## Status
- PLANNED

## Objective
Stabilize institution customization behavior for preview fidelity, reset-to-saved behavior, and reusable saved theme sets.

## Scope
- Preserve live preview architecture and eliminate any hardcoded mock UI regressions.
- Ensure reset action restores last persisted colors, not default hardcoded palette.
- Add saved theme-set management (create, persist, and reapply color groups).
- Keep live unsaved preview updates deterministic and non-persistent until save.

## Risks
- Preview rendering paths can diverge from live app layout over time.
- Theme-set persistence schema may require migration-safe handling.

## Validation
- Targeted tests for customization state reducers and preview message flow.
- Manual checks for reset, save, and theme-set apply flows.
- `get_errors`, `npm run lint`, `npx tsc --noEmit`.

## Exit Criteria
- Preview path remains real-component based and stable.
- Reset returns to saved snapshot.
- Saved themes can be stored and reapplied reliably.
