<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/subplans/subplan-customization-preview-and-saved-themes.md -->
# Subplan - Customization Preview and Saved Themes

## Goal
Deliver preview fidelity, reset-to-saved behavior, and persistent saved-theme sets without auth-collision regressions.

## Work Items
- Verify preview route uses real component composition and stable iframe container behavior.
- Ensure reset action returns to last persisted institution colors.
- Implement saved-theme create/store/reapply flows.
- Preserve unsaved live preview updates via messaging without persisting until save.

## Evidence Required
- Focused tests for customization state and preview synchronization.
- Manual parity checks for reset and saved-theme workflows.
