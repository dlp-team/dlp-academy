<!-- copilot/plans/finished/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-03-institution-admin-dashboard-upgrades.md -->

# Subplan 03 - Institution Admin Dashboard Upgrades

## Scope
- Exact-app customization preview architecture.
- Pagination for student and teacher large lists.
- Institution policy toggles behavior enforcement.

## Decision Candidate
- Preferred: reuse Home rendering surface with mock-data provider in isolated preview mode to preserve exact UI parity and avoid auth-account complexity.

## Acceptance Criteria
- Preview parity for core layout and theme effects.
- Pagination reduces loaded docs per request and preserves filters.
- Policy toggles produce deterministic behavior in affected workflows.

## Status
- COMPLETED
- Completed in current cycle:
	- cursor-based pagination for teachers/students lists,
	- load-more controls in users tab,
	- deferred full-list fetch outside organization workflows,
	- exact preview architecture implemented with Home component reuse + isolated mock-data provider,
	- policy-toggle verification matrix executed (dynamic code + teacher creation/assignment/deletion controls) with deterministic pass evidence.

