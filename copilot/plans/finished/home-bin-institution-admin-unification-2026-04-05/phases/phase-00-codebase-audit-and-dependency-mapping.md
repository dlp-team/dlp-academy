<!-- copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-00-codebase-audit-and-dependency-mapping.md -->
# Phase 00 - Codebase Audit and Dependency Mapping

## Status
- COMPLETED

## Objective
Build the implementation baseline before touching behavior: architecture map, coupling analysis, regression preservation list, and security-sensitive surfaces.

## Deliverables
- Route/module inventory for Home, Bin, and Institution Admin surfaces.
- File-level dependency map of:
  - modal components and wrappers,
  - selection-mode hooks/state,
  - Bin grid/list rendering branches,
  - institution settings + customization preview + users tab.
- Preservation checklist of all non-requested behaviors that must remain intact.
- Initial touched-file matrix and test-target map.

## Security and Multi-Tenant Guardrails
- Confirm institution-scoped read/write paths for settings and user management.
- Identify least-privilege enforcement points in frontend checks, functions, and rules.
- Document deny-path test needs before phase execution.

## Initial Findings (2026-04-05)
- Home selection orchestration and bulk state are centered in:
  - [src/pages/Home/Home.tsx](src/pages/Home/Home.tsx)
  - [src/pages/Home/components/HomeMainContent.tsx](src/pages/Home/components/HomeMainContent.tsx)
  - [src/pages/Home/components/HomeContent.tsx](src/pages/Home/components/HomeContent.tsx)
  - [src/pages/Home/hooks/useHomeBulkSelection.ts](src/pages/Home/hooks/useHomeBulkSelection.ts)
- Bin grid/list selection behavior and overlay panel coupling are concentrated in:
  - [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx)
  - [src/pages/Home/components/bin/BinSelectionOverlay.tsx](src/pages/Home/components/bin/BinSelectionOverlay.tsx)
  - [src/pages/Home/components/bin/BinGridItem.tsx](src/pages/Home/components/bin/BinGridItem.tsx)
  - [src/pages/Home/components/bin/BinSelectionPanel.tsx](src/pages/Home/components/bin/BinSelectionPanel.tsx)
- Overlay blur and selected-card ring behavior currently originate from [src/pages/Home/components/bin/BinSelectionOverlay.tsx](src/pages/Home/components/bin/BinSelectionOverlay.tsx), which directly matches the reported Bin grid issue.
- Scrollbar compensation appears globally enforced via:
  - [src/components/ui/CustomScrollbar.tsx](src/components/ui/CustomScrollbar.tsx)
  - [src/index.css](src/index.css) (`scrollbar-gutter: stable both-edges` on custom-scrollbar-active root classes)
- Institution settings periodization and calendar defaults are wired through:
  - [src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts](src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts)
  - [src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx](src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx)
  - [src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx)
  - [src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts](src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts)
- Customization preview pipeline currently runs through mock/exact-preview adapters:
  - [src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx](src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx)
  - [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx)
  - [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
- User-governance and profile/detail surfaces are currently centered in:
  - [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
  - [src/pages/InstitutionAdminDashboard/hooks/useUsers.ts](src/pages/InstitutionAdminDashboard/hooks/useUsers.ts)
  - [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx)
- User-detail role badge currently includes emoji labels in [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx), which must be replaced by icon-based labeling during Phase 05.

## Completion Notes (2026-04-05)
- Completed touched-file inventory and preservation checklist in:
  - [working/implementation-order-and-dependency-map.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/implementation-order-and-dependency-map.md)
  - [working/risk-and-assumption-register.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/risk-and-assumption-register.md)
- Completed dependency mapping for all requested domains:
  - Home/Bin selection and interaction surfaces,
  - modal architecture surfaces,
  - scrollbar compensation path,
  - Institution settings/customization/users surfaces.
- Transition decision: proceed to Phase 01 (Global Modal and Scrollbar Foundation).

## Validation Gate
- Dependency map committed in [working/implementation-order-and-dependency-map.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/implementation-order-and-dependency-map.md).
- Assumptions/risks documented in [working/risk-and-assumption-register.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/risk-and-assumption-register.md).
- Roadmap and README synchronized with findings.

## Exit Criteria
- Ready to begin Phase 01 with clear file targets, protected behaviors, and validation sequence.


