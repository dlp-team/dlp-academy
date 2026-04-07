<!-- copilot/plans/inReview/component-centralization-deep-audit-2026-04-07/phases/phase-01-deep-inventory-and-duplication-map.md -->
# Phase 01 - Deep Inventory and Duplication Map

## Objective
Build a complete map of repeated component structures, modal wrappers, context-menu implementations, and duplicated action styling patterns.

## Inputs
- [src/components/modals](../../../../../src/components/modals)
- [src/components/modules](../../../../../src/components/modules)
- [src/pages](../../../../../src/pages)
- [copilot/REFERENCE/COMPONENT_REGISTRY.md](../../../../REFERENCE/COMPONENT_REGISTRY.md)

## Tasks
1. Inventory all modal/overlay implementations and classify by wrapper type.
2. Inventory all three-dots/context-menu implementations and detect repeated logic blocks.
3. Detect repeated action button/input patterns that qualify for primitives.
4. Rank clusters by impact, migration safety, and effort.
5. Record findings in [working/baseline-component-audit.md](../working/baseline-component-audit.md).

## Deliverables
- Baseline audit report with evidence links and candidate migrations.
- Prioritized wave list for phases 03-05.

## Exit Gate
- Duplicate clusters and migration priorities are documented and actionable.

## Status
COMPLETED

## Completion Notes (2026-04-07)
- Baseline audit produced at [working/baseline-component-audit.md](../working/baseline-component-audit.md).
- Duplicate clusters ranked and mapped to implementation phases.
