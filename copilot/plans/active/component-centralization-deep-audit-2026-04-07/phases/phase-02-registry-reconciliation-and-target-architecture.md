<!-- copilot/plans/active/component-centralization-deep-audit-2026-04-07/phases/phase-02-registry-reconciliation-and-target-architecture.md -->
# Phase 02 - Registry Reconciliation and Target Architecture

## Objective
Align the registry to real reusable components and define the target architecture for modal/menu/action centralization.

## Tasks
1. Compare registry entries with actual existing components.
2. Correct or split registry entries where conceptual names differ from code reality.
3. Define target abstractions and adoption order.
4. Mark deprecated patterns and migration paths.

## Deliverables
- Updated registry with accurate existing components and responsibilities.
- Architecture decision notes for modal/menu/action centralization.

## Exit Gate
- Registry and target architecture are aligned and implementation-ready.

## Status
COMPLETED

## Execution Notes (2026-04-07)
- Reconciled registry with real codebase components in [copilot/REFERENCE/COMPONENT_REGISTRY.md](../../../../REFERENCE/COMPONENT_REGISTRY.md).
- Marked non-implemented abstractions as planned to prevent invalid imports.
- Updated [.github/instructions/ui-component-centralization.instructions.md](../../../../../.github/instructions/ui-component-centralization.instructions.md) to require BaseModal/DashboardOverlayShell instead of non-existent BaseOverlay.

## Completion Notes
- Registry and implementation guidance now match real code surfaces, reducing invalid component assumptions.
