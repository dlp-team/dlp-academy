<!-- copilot/explanations/temporal/lossless-reports/2026-04-07/phase-04-menu-portal-centralization.md -->
# Lossless Report - Phase 04 Menu Portal Centralization

## Requested Scope
- Continue plan execution with higher-value centralization work.
- Keep shipping substantial progress and commit/push checkpoints.

## Preserved Behaviors
- Existing permission-based menu actions remained unchanged.
- Existing menu open/close state ownership stayed in parent components.
- List-item close-layer behavior remained enabled only where it already existed.
- Card-item behavior remained without forced close-layer overlay.

## Touched Files
### Code
- [src/components/modules/shared/menuPositionUtils.ts](../../../../../../src/components/modules/shared/menuPositionUtils.ts)
- [src/components/modules/shared/ContextActionMenuPortal.tsx](../../../../../../src/components/modules/shared/ContextActionMenuPortal.tsx)
- [src/components/modules/ListItems/SubjectListItem.tsx](../../../../../../src/components/modules/ListItems/SubjectListItem.tsx)
- [src/components/modules/ListItems/FolderListItem.tsx](../../../../../../src/components/modules/ListItems/FolderListItem.tsx)
- [src/components/modules/SubjectCard/SubjectCardFront.tsx](../../../../../../src/components/modules/SubjectCard/SubjectCardFront.tsx)
- [src/components/modules/FolderCard/FolderCardBody.tsx](../../../../../../src/components/modules/FolderCard/FolderCardBody.tsx)

### Tests
- [tests/unit/utils/menuPositionUtils.test.js](../../../../../../tests/unit/utils/menuPositionUtils.test.js)
- [tests/unit/components/ContextActionMenuPortal.test.jsx](../../../../../../tests/unit/components/ContextActionMenuPortal.test.jsx)

### Plan and Docs
- [copilot/plans/active/component-centralization-deep-audit-2026-04-07/README.md](../../../../plans/active/component-centralization-deep-audit-2026-04-07/README.md)
- [copilot/plans/active/component-centralization-deep-audit-2026-04-07/strategy-roadmap.md](../../../../plans/active/component-centralization-deep-audit-2026-04-07/strategy-roadmap.md)
- [copilot/plans/active/component-centralization-deep-audit-2026-04-07/phases/phase-02-registry-reconciliation-and-target-architecture.md](../../../../plans/active/component-centralization-deep-audit-2026-04-07/phases/phase-02-registry-reconciliation-and-target-architecture.md)
- [copilot/plans/active/component-centralization-deep-audit-2026-04-07/phases/phase-04-three-dots-menu-centralization-wave.md](../../../../plans/active/component-centralization-deep-audit-2026-04-07/phases/phase-04-three-dots-menu-centralization-wave.md)
- [copilot/plans/active/component-centralization-deep-audit-2026-04-07/working/baseline-component-audit.md](../../../../plans/active/component-centralization-deep-audit-2026-04-07/working/baseline-component-audit.md)
- [copilot/REFERENCE/COMPONENT_REGISTRY.md](../../../../REFERENCE/COMPONENT_REGISTRY.md)
- [.github/instructions/ui-component-centralization.instructions.md](../../../../../.github/instructions/ui-component-centralization.instructions.md)

## Verification
- get_errors: clean on touched source and test files.
- Tests:
  - [tests/unit/utils/menuPositionUtils.test.js](../../../../../../tests/unit/utils/menuPositionUtils.test.js): pass
  - [tests/unit/components/ContextActionMenuPortal.test.jsx](../../../../../../tests/unit/components/ContextActionMenuPortal.test.jsx): pass
- Lint: `npm run lint` passed.

## Outcome
- Duplicated menu positioning and portal shell logic was centralized.
- Four high-impact menu implementations now reuse shared abstractions.
- Plan phase 04 exit criteria reached with validation evidence.
