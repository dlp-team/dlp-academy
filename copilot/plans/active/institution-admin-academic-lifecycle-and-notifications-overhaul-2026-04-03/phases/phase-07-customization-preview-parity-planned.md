<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-07-customization-preview-parity-planned.md -->
# Phase 07 - Customization Preview Parity (PLANNED)

## Objective
Resolve preview full-screen black screen bug and improve mock preview fidelity to mirror real UI behavior.

## Planned Changes
- Fix full-screen rendering/layering issue.
- Rebuild preview content paths to match real Home/Subject/Topic structures.
- Ensure materials (formulas, exams, quizzes, files) are represented consistently with production components.

## Risks and Controls
- Risk: preview-specific branching diverges from real components.
  - Control: share rendering helpers/components with production where possible.

## Exit Criteria
- Full-screen preview works reliably.
- Visual/structural parity between preview and live pages is significantly improved.
