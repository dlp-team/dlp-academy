<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/non-modal-overlay-audit-2026-04-05.md -->
# Non-Modal Overlay Audit - 2026-04-05

## Scope
- Requested by user update: analyze non-modal overlays (dashboard-style create/edit/import overlays), not only classic confirm modals.
- Goal: define an ordered migration queue toward a consistent overlay shell constrained between header and screen bottom.

## Audit Inventory (Prioritized)
1. Institution Admin create/import/transfer overlays (highest priority)
   - [src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx](src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx)
   - [src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx](src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx)
   - [src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx](src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx)
2. Home Bin selection overlay (complex positioned overlay)
   - [src/pages/Home/components/bin/BinSelectionOverlay.tsx](src/pages/Home/components/bin/BinSelectionOverlay.tsx)
3. Topic overlays with mixed shell conventions
   - [src/pages/Topic/components/TopicModals.tsx](src/pages/Topic/components/TopicModals.tsx)
   - [src/pages/Topic/components/TopicConfirmDeleteModal.tsx](src/pages/Topic/components/TopicConfirmDeleteModal.tsx)
   - [src/pages/Topic/components/QuizEngine/QuizClassResultsModal.tsx](src/pages/Topic/components/QuizEngine/QuizClassResultsModal.tsx)
4. Notifications dropdown overlay (absolute positioned panel)
   - [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx)

## Migration Readiness Notes
- Institution Admin overlays had the most duplicated shell pattern (`fixed inset-0 z-50`, manual backdrop, manual card shell), making them the safest first extraction target.
- Bin/Topic overlays require separate treatment due to dynamic positioning, animation contracts, or mixed z-index conventions.

## Executed Slice 1 (Completed)
- Added shared overlay shell:
  - [src/components/ui/DashboardOverlayShell.tsx](src/components/ui/DashboardOverlayShell.tsx)
- Migrated low-risk Institution Admin overlays:
  - [src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx](src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx)
  - [src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx](src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx)
  - [src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx](src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx)
- Added focused regression coverage:
  - [tests/unit/components/DashboardOverlayShell.test.jsx](tests/unit/components/DashboardOverlayShell.test.jsx)

## Next Queue
1. Extend shell adoption in Institution Admin remaining custom overlay wrappers (e.g., delete-confirm wrapper in [src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx](src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx)).
2. Audit Topic overlay z-index and backdrop variants, then migrate lowest-risk topic overlay to shared shell.
3. Evaluate BinSelectionOverlay separately as a positioned-overlay family (likely needs dedicated shell, not direct reuse of centered-shell component).
