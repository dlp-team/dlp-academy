<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-04-institution-customization-preview-stabilization.md -->
# Phase 04 - Institution Customization Preview Stabilization

## Status
COMPLETED

## Objective
Deliver deterministic role-based customization previews without iframe instability.

## Implemented Changes
- Introduced mock preview component with teacher/student role simulation.
- Added viewport toggles to validate responsive preview behavior during customization.
- Rewired customization tab to use deterministic mock preview integration.
- Added targeted unit coverage for preview rendering behavior.

## Risks Addressed
- Non-deterministic iframe failures and dependency on runtime app state.
- Difficult visual validation for institution admins across role contexts.

## Validation Evidence
- Preview component tests passed.
- Lint checks passed for institution customization modules.

## Completion Notes
This phase removed a fragile preview dependency and improved confidence in branding/theme validation workflows.
