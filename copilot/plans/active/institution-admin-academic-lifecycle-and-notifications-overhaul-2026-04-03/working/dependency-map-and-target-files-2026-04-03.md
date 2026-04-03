<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/working/dependency-map-and-target-files-2026-04-03.md -->
# Dependency Map and Target Files (2026-04-03)

## Objective
Capture real workspace touchpoints before implementation to avoid speculative file edits.

## Confirmed Existing Targets

### Institution Admin Courses and Classes
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/CourseList.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/CourseDetail.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/AcademicYearPicker.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/academicYearUtils.ts`
- `src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts`
- `src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx`
- `src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx`

### Subject Assignment and Lifecycle
- `src/pages/Subject/modals/SubjectFormModal.tsx`
- `src/utils/academicYearLifecycleUtils.ts`
- `src/hooks/useHomeState.ts`
- `src/components/ui/AcademicYearRangeFilter.tsx`

### Notifications
- `src/components/layout/Header.tsx`
- `src/components/ui/NotificationsPanel.tsx`
- `src/hooks/useNotifications.tsx`
- `src/pages/Settings/components/NotificationSection.tsx`

### Customization Preview
- `src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx`

### Home and Bin Selection Mode
- `src/pages/Home/Home.tsx`
- `src/pages/Home/components/HomeSelectionToolbar.tsx`
- `src/pages/Home/components/BinView.tsx`
- `src/pages/Home/components/bin/BinGridItem.tsx`
- `src/pages/Home/components/bin/BinSelectionPanel.tsx`
- `src/pages/Home/utils/binViewUtils.ts`

## Expected Additional Files to Locate During Implementation
- Route registry and notifications page wiring.
- Shared selection style utilities/hooks used by manual and bin modes.
- Existing settings data persistence helper for institution-level configuration.
- Any backend/function or scheduled-job artifacts used for lifecycle automation.

## Constraints
- Preserve institution scoping (`institutionId`) in all data reads/writes.
- Avoid permission broadening while introducing lifecycle automation.
- Keep UI text in Spanish for new visible interface strings.
