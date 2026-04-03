<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/phases/phase-06-institution-admin-layout-and-preview-audit-planned.md -->
# Phase 06 - Institution Admin Layout and Preview Audit

## Status
COMPLETED

## Objective
Implement requested layout fixes in Institution Admin and complete architecture audit for a 1:1 interactive preview approach.

## Work Items
- Move Users-tab search bar below Security Access section.
- Remove scrollbar from Institution Admin tab-navigation strip.
- Audit architecture options for exact preview replica:
  - Reusing real Home/page components with mock state adapter.
  - Dedicated mock accounts per institution streamed into preview.
- Produce explicit decision with rationale (accuracy, performance, maintenance, security).

## Preserved Behaviors
- Existing customization controls stay available.
- Existing role visibility constraints remain unchanged.

## Risks
- Tab-strip style change may impact responsive overflow.
- Preview architecture choice could increase complexity if not isolated.

## Validation
- Institution Admin UI regression checks.
- Audit document approved in working artifacts.

## Exit Criteria
- Search bar position and tab strip behavior fixed.
- Preview architecture decision finalized and documented.

## Progress Notes
- Moved users-tab search bar below the Security Access section in Institution Admin users tab.
- Removed tab-strip horizontal scrollbar behavior by enabling wrapped tab layout.
- Finalized architecture decision in favor of real Home-component reuse with a strict mock-state adapter.
- Confirmed this path keeps near-1:1 parity without introducing per-institution mock account security overhead.

## Completion Notes
- Architecture audit closed with explicit Option A selection in `working/institution-preview-architecture-audit.md`.
- Decision validated by implemented Preview 2.0 shell that keeps writes isolated and uses deterministic local mock data.
