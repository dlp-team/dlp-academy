<!-- copilot/plans/active/component-centralization-deep-audit-2026-04-07/phases/phase-03-modal-centralization-wave.md -->
# Phase 03 - Modal Centralization Wave

## Objective
Migrate high-impact custom modal wrappers to shared modal shells while preserving behavior.

## Candidate Targets
- [src/components/modals/CreateContentModal.tsx](../../../../../src/components/modals/CreateContentModal.tsx)
- [src/components/modals/QuizModal.tsx](../../../../../src/components/modals/QuizModal.tsx)
- [src/pages/Topic/components/CategorizFileModal.tsx](../../../../../src/pages/Topic/components/CategorizFileModal.tsx)
- [src/pages/Profile/modals/EditProfileModal.tsx](../../../../../src/pages/Profile/modals/EditProfileModal.tsx)

## Tasks
1. Standardize wrapper/backdrop/container behavior via shared shell.
2. Preserve per-modal content layout and feature-specific logic.
3. Add targeted tests for close behavior where missing.
4. Validate behavior parity.

## Exit Gate
- Target modals use shared shell abstractions and pass regression checks.

## Status
PLANNED
