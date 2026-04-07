<!-- copilot/plans/active/component-centralization-deep-audit-2026-04-07/working/baseline-component-audit.md -->
# Baseline Component Audit

## Audit Date
- 2026-04-07

## Summary
Deep scan confirms high duplication in two primary clusters:
1. Modal wrappers/backdrops/container shells.
2. Three-dots context-menu portal and position logic in card/list surfaces.

## Cluster A - Modal Wrapper Duplication

### Existing Shared Foundations
- [src/components/ui/BaseModal.tsx](../../../../../src/components/ui/BaseModal.tsx)
- [src/components/ui/DashboardOverlayShell.tsx](../../../../../src/components/ui/DashboardOverlayShell.tsx)

### High-Priority Custom Modal Wrappers
- [src/components/modals/CreateContentModal.tsx](../../../../../src/components/modals/CreateContentModal.tsx)
- [src/components/modals/QuizModal.tsx](../../../../../src/components/modals/QuizModal.tsx)
- [src/pages/Topic/components/CategorizFileModal.tsx](../../../../../src/pages/Topic/components/CategorizFileModal.tsx)
- [src/pages/Profile/modals/EditProfileModal.tsx](../../../../../src/pages/Profile/modals/EditProfileModal.tsx)
- [src/pages/Topic/components/TopicConfirmDeleteModal.tsx](../../../../../src/pages/Topic/components/TopicConfirmDeleteModal.tsx)

### Notable Evidence
- Repeated fixed/backdrop containers with blur and similar z-index layering across files.
- Similar close-button and container structure in CreateContentModal and QuizModal.

## Cluster B - Three-Dots Menu Duplication

### Core Repeated Surfaces
- [src/components/modules/ListItems/SubjectListItem.tsx](../../../../../src/components/modules/ListItems/SubjectListItem.tsx)
- [src/components/modules/ListItems/FolderListItem.tsx](../../../../../src/components/modules/ListItems/FolderListItem.tsx)
- [src/components/modules/SubjectCard/SubjectCardFront.tsx](../../../../../src/components/modules/SubjectCard/SubjectCardFront.tsx)
- [src/components/modules/FolderCard/FolderCardBody.tsx](../../../../../src/components/modules/FolderCard/FolderCardBody.tsx)

### Repeated Logic Blocks
- Menu position calculations with viewport and header-safe constraints.
- Full-screen click-catcher close layers.
- Portal rendering and menu shell classes.
- Permission-gated action button composition.

## Cluster C - Repeated Action/Button Styling (Broad)
Large number of repeated button class patterns across pages/features. This cluster is broader and should be handled after modal/menu centralization to avoid over-generalizing early.

## Priority Ranking
1. Cluster B (menu duplication) - high code repetition and clear extraction path.
2. Cluster A (modal wrappers) - high UX consistency leverage.
3. Cluster C (button primitives) - broad impact but higher standardization risk.

## Proposed First Implementation Block
- Extract shared menu positioning utility.
- Refactor two initial adopters:
  - SubjectListItem
  - FolderListItem
- Validate parity, then scale to SubjectCardFront and FolderCardBody.

## Open Questions to Resolve in Phase 02
- Should registry canonicalize around BaseModal + DashboardOverlayShell naming instead of conceptual BaseOverlay naming?
- Should menu extraction be utility-only first or utility + shared shell component in one step?

## Execution Update - First Centralization Block (2026-04-07)
- Chosen approach: utility-first extraction for lowest regression risk.
- Added [src/components/modules/shared/menuPositionUtils.ts](../../../../../src/components/modules/shared/menuPositionUtils.ts).
- Applied to list surfaces:
  - [src/components/modules/ListItems/SubjectListItem.tsx](../../../../../src/components/modules/ListItems/SubjectListItem.tsx)
  - [src/components/modules/ListItems/FolderListItem.tsx](../../../../../src/components/modules/ListItems/FolderListItem.tsx)
- Added deterministic tests: [tests/unit/utils/menuPositionUtils.test.js](../../../../../tests/unit/utils/menuPositionUtils.test.js).

## Execution Update - Second Centralization Block (2026-04-07)
- Added shared portal shell: [src/components/modules/shared/ContextActionMenuPortal.tsx](../../../../../src/components/modules/shared/ContextActionMenuPortal.tsx).
- Replaced direct portal shell duplication in:
  - [src/components/modules/ListItems/SubjectListItem.tsx](../../../../../src/components/modules/ListItems/SubjectListItem.tsx)
  - [src/components/modules/ListItems/FolderListItem.tsx](../../../../../src/components/modules/ListItems/FolderListItem.tsx)
  - [src/components/modules/SubjectCard/SubjectCardFront.tsx](../../../../../src/components/modules/SubjectCard/SubjectCardFront.tsx)
  - [src/components/modules/FolderCard/FolderCardBody.tsx](../../../../../src/components/modules/FolderCard/FolderCardBody.tsx)
- Added deterministic component tests: [tests/unit/components/ContextActionMenuPortal.test.jsx](../../../../../tests/unit/components/ContextActionMenuPortal.test.jsx).
