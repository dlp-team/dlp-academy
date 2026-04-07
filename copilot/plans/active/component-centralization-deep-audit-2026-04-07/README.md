<!-- copilot/plans/active/component-centralization-deep-audit-2026-04-07/README.md -->
# Component Centralization Deep Audit Plan (2026-04-07)

## Status
- Lifecycle: active
- Overall status: IN_PROGRESS
- Current phase: Phase 05 (in progress)
- Owner: Copilot + human reviewer

## Problem Statement
The repository now has a Component Registry, but the codebase still contains repeated modal wrappers, repeated three-dots menu portal logic, and repeated action/button styling patterns across pages and modules. Centralization must be improved so new work reuses shared UI primitives by default.

## Source Inputs
- [copilot/REFERENCE/COMPONENT_REGISTRY.md](../../../REFERENCE/COMPONENT_REGISTRY.md)
- [.github/instructions/ui-component-centralization.instructions.md](../../../../.github/instructions/ui-component-centralization.instructions.md)
- [.github/copilot-instructions.md](../../../../.github/copilot-instructions.md)
- [AGENTS.md](../../../../AGENTS.md)

## Requested Outcomes
1. Build a deep duplication map for components and repeated UI behavior.
2. Prioritize and execute high-impact centralization waves (modals, menu overlays, actions).
3. Align registry entries with real reusable components in the codebase.
4. Reduce copy-paste UI logic and improve consistency for future Copilot tasks.

## Scope
- Audit all frontend surfaces under [src](../../../../src) for repeated modal, menu, and action patterns.
- Introduce or extend shared components/utilities only when reuse is clear.
- Refactor high-impact duplicated implementations in phased waves.
- Update component registry and related instructions to match actual architecture.
- Validate with lint/tests/get_errors after each implementation block.

## Out of Scope
- Firestore schema/rules changes.
- Backend function logic unrelated to UI centralization.
- Full visual redesign of existing screens.
- Bulk migration of every page in one block without phased validation.

## Initial Audit Signals (Phase 01 Started)
- Custom modal wrappers exist in multiple places despite [BaseModal](../../../../src/components/ui/BaseModal.tsx) and [DashboardOverlayShell](../../../../src/components/ui/DashboardOverlayShell.tsx).
- Three-dots context menu portal logic is duplicated in:
  - [src/components/modules/ListItems/SubjectListItem.tsx](../../../../src/components/modules/ListItems/SubjectListItem.tsx)
  - [src/components/modules/ListItems/FolderListItem.tsx](../../../../src/components/modules/ListItems/FolderListItem.tsx)
  - [src/components/modules/SubjectCard/SubjectCardFront.tsx](../../../../src/components/modules/SubjectCard/SubjectCardFront.tsx)
  - [src/components/modules/FolderCard/FolderCardBody.tsx](../../../../src/components/modules/FolderCard/FolderCardBody.tsx)
- High-priority custom modal candidates include:
  - [src/components/modals/CreateContentModal.tsx](../../../../src/components/modals/CreateContentModal.tsx)
  - [src/components/modals/QuizModal.tsx](../../../../src/components/modals/QuizModal.tsx)
  - [src/pages/Topic/components/CategorizFileModal.tsx](../../../../src/pages/Topic/components/CategorizFileModal.tsx)
  - [src/pages/Profile/modals/EditProfileModal.tsx](../../../../src/pages/Profile/modals/EditProfileModal.tsx)

## Success Criteria
- Deep audit artifact created with grouped duplication findings and migration priorities.
- At least one reusable abstraction introduced for each major duplicate cluster.
- First migration wave lands with no regressions.
- Registry reflects real components and practical usage rules.
- Final optimization and deep risk review phase completed before closure.

## Progress Snapshot
- Completed: Phase 01 deep inventory and duplication map.
- Completed: Phase 02 registry reconciliation and target architecture.
  - Updated [copilot/REFERENCE/COMPONENT_REGISTRY.md](../../../../copilot/REFERENCE/COMPONENT_REGISTRY.md) to match real active components.
  - Updated [.github/instructions/ui-component-centralization.instructions.md](../../../../.github/instructions/ui-component-centralization.instructions.md) to reference existing modal primitives.
- Completed: Phase 04 menu centralization wave.
  - Added shared utility: [src/components/modules/shared/menuPositionUtils.ts](../../../../src/components/modules/shared/menuPositionUtils.ts)
  - Added shared portal shell: [src/components/modules/shared/ContextActionMenuPortal.tsx](../../../../src/components/modules/shared/ContextActionMenuPortal.tsx)
  - Adopted in list and card items:
    - [src/components/modules/ListItems/SubjectListItem.tsx](../../../../src/components/modules/ListItems/SubjectListItem.tsx)
    - [src/components/modules/ListItems/FolderListItem.tsx](../../../../src/components/modules/ListItems/FolderListItem.tsx)
    - [src/components/modules/SubjectCard/SubjectCardFront.tsx](../../../../src/components/modules/SubjectCard/SubjectCardFront.tsx)
    - [src/components/modules/FolderCard/FolderCardBody.tsx](../../../../src/components/modules/FolderCard/FolderCardBody.tsx)
  - Added unit tests: [tests/unit/utils/menuPositionUtils.test.js](../../../../tests/unit/utils/menuPositionUtils.test.js)
  - Added component tests: [tests/unit/components/ContextActionMenuPortal.test.jsx](../../../../tests/unit/components/ContextActionMenuPortal.test.jsx)
- Completed: Phase 03 modal centralization wave.
  - Added shared shell: [src/components/modals/shared/AIGenerationModalShell.tsx](../../../../src/components/modals/shared/AIGenerationModalShell.tsx)
  - Migrated AI modal wrappers in:
    - [src/components/modals/CreateContentModal.tsx](../../../../src/components/modals/CreateContentModal.tsx)
    - [src/components/modals/QuizModal.tsx](../../../../src/components/modals/QuizModal.tsx)
  - Migrated remaining priority wrappers to BaseModal:
    - [src/pages/Topic/components/CategorizFileModal.tsx](../../../../src/pages/Topic/components/CategorizFileModal.tsx)
    - [src/pages/Profile/modals/EditProfileModal.tsx](../../../../src/pages/Profile/modals/EditProfileModal.tsx)
  - Added/updated tests:
    - [tests/unit/components/AIGenerationModalShell.test.jsx](../../../../tests/unit/components/AIGenerationModalShell.test.jsx)
    - [tests/unit/pages/topic/CategorizFileModal.test.jsx](../../../../tests/unit/pages/topic/CategorizFileModal.test.jsx)
    - [tests/unit/pages/profile/EditProfileModal.test.jsx](../../../../tests/unit/pages/profile/EditProfileModal.test.jsx)
- In progress: Phase 05 button/form primitive centralization.
  - Added shared form primitive: [src/components/modals/shared/ReferencePdfUploadField.tsx](../../../../src/components/modals/shared/ReferencePdfUploadField.tsx)
  - Migrated first adopter pair:
    - [src/components/modals/CreateContentModal.tsx](../../../../src/components/modals/CreateContentModal.tsx)
    - [src/components/modals/QuizModal.tsx](../../../../src/components/modals/QuizModal.tsx)
  - Added tests: [tests/unit/components/ReferencePdfUploadField.test.jsx](../../../../tests/unit/components/ReferencePdfUploadField.test.jsx)

## Validation Strategy
- Each implementation wave:
  - get_errors on touched files
  - npm run lint
  - targeted test runs plus full npm run test at major gates
- Regression checks for modal close behavior, keyboard handling, and menu interactions.

## Rollback Strategy
1. Keep each centralization wave in isolated commits.
2. Revert by wave if regressions are found.
3. Re-run lint/tests/get_errors after rollback.
4. Keep registry and docs synchronized with actual reverted state.

## Residual Risks and Follow-Ups
- Over-generalization risk: avoid creating abstractions that do not fit real usage.
- Behavior drift risk in menu permissions logic during extraction.
- Follow-up needed for lower-priority custom overlays after high-impact waves.

## Plan Artifacts
- Roadmap: [strategy-roadmap.md](strategy-roadmap.md)
- User updates intake: [user-updates.md](user-updates.md)
- Phases: [phases/](phases)
- Working notes: [working/](working)
- Reviewing: [reviewing/](reviewing)
- Subplans index: [subplans/README.md](subplans/README.md)
