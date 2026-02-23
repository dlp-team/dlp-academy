# ToDivide.md

This file lists large or complex files that should be divided for better maintainability and organization. For each file, the recommended extractions are grouped by type: hooks, components, modals, and utilities.

---

## Home.jsx (src/pages/Home/Home.jsx)
**Hooks to extract:**
- useHomeHandlers.js: All handler functions (e.g., handleSaveFolderWrapper, handleUpwardDrop, handleBreadcrumbDrop, handleOpenTopics, handleDropOnFolderWrapper, handleNestFolder, handlePromoteSubjectWrapper, handlePromoteFolderWrapper, handleShowFolderContents, handleNavigateFromTree, handleNavigateSubjectFromTree, handleTreeMoveSubject, handleTreeReorderSubject)
- useHomeState.js: All useState/useMemo logic for UI state (e.g., modal configs, tag filters, shared state)

**Components to extract:**
- HomeLoader: Loader screen for loading state
- HomeConfirmationOverlay: Overlay for share/unshare confirmation
- HomeMainContent: Main content rendering logic (currently inlined)

**Modals to extract:**
- HomeModals: Already extracted, but consider splitting further if it grows

---

## UserDetailView.jsx (src/pages/SchoolAdminDashboard/components/UserDetailView.jsx)
**Hooks to extract:**
- useUserDetailData.js: Data fetching and state logic for viewedUser and loading

**Components to extract:**
- UserProfileHeader: Avatar, name, email, status, and role badge
- UserStatisticsGrid: Statistics cards (Asignaturas, Alumnos/Progreso, Actividad)
- UserDetailedInfo: Placeholder for detailed stats

---

## Profile.jsx (src/pages/Profile/Profile.jsx)
**Hooks to extract:**
- useProfileState.js: Modal and editing state

**Components to extract:**
- ProfileLoader: Loader screen for loading state
- ProfileMainContent: Main content rendering logic

---

## ViewResource.jsx (src/pages/ViewResource/ViewResource.jsx)
**Components to extract:**
- ResourceNotFound: Shown when file is missing
- ResourceHeader: Navigation and file info
- ResourceViewer: Iframe/pdf viewer

---

Add more as you identify large or complex files. Prioritize splitting files that mix logic, UI, and side effects for better readability and testability.
