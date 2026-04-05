<!-- copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/implementation-order-and-dependency-map.md -->
# Implementation Order and Dependency Map

## Execution Order
1. Phase 00 baseline audit and touched-file inventory.
2. Phase 01 modal foundation and scrollbar correction.
3. Phase 02 selection-mode and Bin behavior parity.
4. Phase 03 Institution Admin settings and automation controls.
5. Phase 04 customization preview parity.
6. Phase 05 users tab governance and profile/history fixes.
7. Phase 06 optimization and consolidation.
8. Phase 07 validation and lifecycle transition.

## Dependency Notes
- Modal foundation from Phase 01 is reused in admin/settings overlays touched later.
- Selection-state unification in Phase 02 should stabilize preview Bin parity work in Phase 04.
- Course-order settings in Phase 03 may affect user history labeling in Phase 05.
- Preview parity in Phase 04 depends on accurate real-component rendering from Home/Bin surfaces.

## Phase 00 Initial Touched-File Inventory (2026-04-05)

### Home selection and Bin behavior surfaces
- [src/pages/Home/Home.tsx](src/pages/Home/Home.tsx)
- [src/pages/Home/components/HomeMainContent.tsx](src/pages/Home/components/HomeMainContent.tsx)
- [src/pages/Home/components/HomeContent.tsx](src/pages/Home/components/HomeContent.tsx)
- [src/pages/Home/components/HomeSelectionToolbar.tsx](src/pages/Home/components/HomeSelectionToolbar.tsx)
- [src/pages/Home/hooks/useHomeBulkSelection.ts](src/pages/Home/hooks/useHomeBulkSelection.ts)
- [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx)
- [src/pages/Home/components/bin/BinSelectionOverlay.tsx](src/pages/Home/components/bin/BinSelectionOverlay.tsx)
- [src/pages/Home/components/bin/BinGridItem.tsx](src/pages/Home/components/bin/BinGridItem.tsx)
- [src/pages/Home/components/bin/BinSelectionPanel.tsx](src/pages/Home/components/bin/BinSelectionPanel.tsx)
- [src/pages/Home/utils/binViewUtils.ts](src/pages/Home/utils/binViewUtils.ts)

### Modal standardization surfaces
- [src/components/modals/CreateContentModal.tsx](src/components/modals/CreateContentModal.tsx)
- [src/components/modals/QuizModal.tsx](src/components/modals/QuizModal.tsx)
- [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx)
- [src/components/modals/FolderDeleteModal.tsx](src/components/modals/FolderDeleteModal.tsx)
- [src/components/modals/FolderTreeModal.tsx](src/components/modals/FolderTreeModal.tsx)
- [src/components/modals/SudoModal.tsx](src/components/modals/SudoModal.tsx)
- [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx)
- [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx)
- [src/pages/Home/components/HomeShareConfirmModals.tsx](src/pages/Home/components/HomeShareConfirmModals.tsx)
- [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx)
- [src/pages/Home/components/FolderManager.tsx](src/pages/Home/components/FolderManager.tsx)

### Scrollbar and layout-shift compensation surfaces
- [src/components/ui/CustomScrollbar.tsx](src/components/ui/CustomScrollbar.tsx)
- [src/index.css](src/index.css)

### Institution settings, organization, and preview surfaces
- [src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx](src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx)
- [src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx](src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx)
- [src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts](src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts)
- [src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts](src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts)
- [src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx)
- [src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx](src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx)
- [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx)
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
- [src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils.ts](src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils.ts)

### Institution users and profile-detail surfaces
- [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
- [src/pages/InstitutionAdminDashboard/hooks/useUsers.ts](src/pages/InstitutionAdminDashboard/hooks/useUsers.ts)
- [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx)

## Preservation Checklist Draft (Phase 00)
- Keep Home selection keyboard/bulk behavior unchanged while adding visual dimming parity.
- Preserve Bin action semantics and restore/delete paths while changing presentation flow.
- Preserve institution-scoped settings persistence contract in institutions documents.
- Preserve preview save semantics (color edits are previewed live, persisted only on save).
- Preserve existing access-control checks for users tab and detail views when adding delete capabilities.
- Preserve mobile and desktop overlay usability when unifying modal wrappers.

## Phase 01 Kickoff Reference
- [working/phase-01-modal-and-scrollbar-kickoff.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-01-modal-and-scrollbar-kickoff.md)

## Commit Cadence Gate
- For each major phase block:
  - implement,
  - validate,
  - commit,
  - push,
  - then continue.

## Targeted Validation Matrix
- Modal close/dirty-state tests: after Phase 01.
- Selection + Bin transition tests: after Phase 02.
- Institution settings persistence tests: after Phase 03.
- Preview parity checks: after Phase 04.
- User deletion/media/history checks: after Phase 05.
- Full touched-scope regression after Phase 06 and Phase 07.


