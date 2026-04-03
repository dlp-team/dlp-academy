<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/working/dependency-map.md -->
# Dependency Map (Initial)

## Cross-Cutting Dependencies
- Selection Mode + Element Deletion: shared Home/Bin state and item action handlers.
- Settings Auth + Remember Me: auth provider logic and session persistence mode.
- Dashboard Pagination: list rendering + data-fetch utilities across multiple dashboards.
- Institution Preview 2.0: dashboard customization controls + mock state + home/navigation modules.
- Scrollbar integration: global styles and root layout containers.
- E2E coverage: stable selectors and env-backed entities.

## Risk Hotspots
- Ownership and permission checks during deletion flows.
- Toast/message dispatch pipeline for modal vs background contexts.
- Institution preview architecture complexity and rendering cost.

## Notes
- This file will be expanded with concrete symbol/file mappings during implementation.
