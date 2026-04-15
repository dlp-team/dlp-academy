# Lossless Report - Theme Preview Black Screen + Branding CORS

Date: 2026-04-15

## Requested scope
- Fix preview black screen and runtime error shown in ERROR.md.
- Resolve CORS noise caused by branding palette extraction against Firebase Storage URLs.
- Move the browser tab title input out of the preview left sidebar and place it above the preview block.
- Preserve existing customization and preview behavior.

## Root cause
1. Nested router crash:
- [src/pages/ThemePreview/ThemePreview.tsx](src/pages/ThemePreview/ThemePreview.tsx#L185) rendered a MemoryRouter inside the app BrowserRouter.
- React Router throws and preview goes black.

2. Branding palette CORS failure:
- [src/pages/InstitutionAdminDashboard/components/customization/BrandingSection.tsx](src/pages/InstitutionAdminDashboard/components/customization/BrandingSection.tsx#L183) attempted color extraction for Firebase Storage image URLs.
- The extraction image request path triggered CORS errors in browser console.

## Changes applied (surgical)
1. Removed nested router usage in preview:
- [src/pages/ThemePreview/ThemePreview.tsx](src/pages/ThemePreview/ThemePreview.tsx#L185)

2. Allowed preview route to host internal preview paths:
- [src/App.tsx](src/App.tsx#L450) changed route to /theme-preview/*

3. Kept Home navigation inside preview context:
- [src/pages/Home/hooks/useHomeLogic.ts](src/pages/Home/hooks/useHomeLogic.ts#L16)
- Home navigations starting with /home are rewritten to /theme-preview/home... when preview lock is active.

4. Prevented palette extraction on Firebase Storage URLs:
- [src/pages/InstitutionAdminDashboard/components/customization/BrandingSection.tsx](src/pages/InstitutionAdminDashboard/components/customization/BrandingSection.tsx#L96)
- [src/pages/InstitutionAdminDashboard/components/customization/BrandingSection.tsx](src/pages/InstitutionAdminDashboard/components/customization/BrandingSection.tsx#L185)

5. Moved browser tab title input outside the preview left sidebar:
- [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx#L252)

6. Repaired malformed import header created during UI move:
- [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx#L1)

7. Closed remaining preview escape paths from Home components using direct navigate:
- [src/pages/Home/components/SharedView.tsx](src/pages/Home/components/SharedView.tsx#L45)
- [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx#L50)

8. Added internal preview route map (Home, Subject, Topic, Profile, Settings, Notifications, Teacher/Student dashboard):
- [src/pages/ThemePreview/ThemePreview.tsx](src/pages/ThemePreview/ThemePreview.tsx#L197)

9. Added global iframe preview escape guard and header preview-safe navigation:
- [src/App.tsx](src/App.tsx#L130)
- [src/components/layout/Header.tsx](src/components/layout/Header.tsx#L186)

10. Expanded Home logic preview-safe rewrite to all absolute app routes:
- [src/pages/Home/hooks/useHomeLogic.ts](src/pages/Home/hooks/useHomeLogic.ts#L18)

11. Patched Subject and Topic page navigation sources to be preview-safe at origin (removes fallback flicker):
- [src/pages/Subject/Subject.tsx](src/pages/Subject/Subject.tsx#L26)
- [src/pages/Subject/components/SubjectHeader.tsx](src/pages/Subject/components/SubjectHeader.tsx#L160)
- [src/pages/Subject/hooks/useSubjectManager.ts](src/pages/Subject/hooks/useSubjectManager.ts#L20)
- [src/pages/Topic/hooks/useTopicLogic.ts](src/pages/Topic/hooks/useTopicLogic.ts#L30)

12. Fixed preview route fallback recursion and added missing topic-content preview routes:
- [src/pages/ThemePreview/ThemePreview.tsx](src/pages/ThemePreview/ThemePreview.tsx#L217)

13. Re-aligned preview architecture to keep real Home/Subject/Topic pages and mock only data sources:
- Added centralized preview mock dataset and helpers:
  - [src/utils/previewMockData.ts](src/utils/previewMockData.ts#L1)
- Home data hooks now switch to preview mocks when `__previewMockData` is active:
  - [src/hooks/useSubjects.ts](src/hooks/useSubjects.ts#L1)
  - [src/hooks/useFolders.ts](src/hooks/useFolders.ts#L1)
  - [src/hooks/useShortcuts.tsx](src/hooks/useShortcuts.tsx#L1)
- Subject/Topic hooks now hydrate preview mock subject/topic payloads in preview mode:
  - [src/pages/Subject/hooks/useSubjectManager.ts](src/pages/Subject/hooks/useSubjectManager.ts#L1)
  - [src/pages/Topic/hooks/useTopicLogic.ts](src/pages/Topic/hooks/useTopicLogic.ts#L1)
- Theme preview user now carries `__previewMockData`; deep topic-content routes use stable mock preview screens:
  - [src/pages/ThemePreview/ThemePreview.tsx](src/pages/ThemePreview/ThemePreview.tsx#L1)

## Preserved behavior
- Standard app routing for non-preview users remains unchanged.
- Preview user lock behavior remains active.
- URL input remains hidden/empty for uploaded Firebase Storage assets.
- Existing upload/save flows are preserved.

## Validation
- Diagnostics checked with get_errors on touched files:
  - [src/pages/ThemePreview/ThemePreview.tsx](src/pages/ThemePreview/ThemePreview.tsx)
  - [src/App.tsx](src/App.tsx)
  - [src/pages/Home/hooks/useHomeLogic.ts](src/pages/Home/hooks/useHomeLogic.ts)
  - [src/pages/InstitutionAdminDashboard/components/customization/BrandingSection.tsx](src/pages/InstitutionAdminDashboard/components/customization/BrandingSection.tsx)
  - [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx)
  - [src/pages/Home/components/SharedView.tsx](src/pages/Home/components/SharedView.tsx)
  - [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx)
  - [src/components/layout/Header.tsx](src/components/layout/Header.tsx)
  - [src/pages/Subject/Subject.tsx](src/pages/Subject/Subject.tsx)
  - [src/pages/Subject/components/SubjectHeader.tsx](src/pages/Subject/components/SubjectHeader.tsx)
  - [src/pages/Subject/hooks/useSubjectManager.ts](src/pages/Subject/hooks/useSubjectManager.ts)
  - [src/pages/Topic/hooks/useTopicLogic.ts](src/pages/Topic/hooks/useTopicLogic.ts)
  - [src/pages/ThemePreview/ThemePreview.tsx](src/pages/ThemePreview/ThemePreview.tsx)
  - [src/hooks/useSubjects.ts](src/hooks/useSubjects.ts)
  - [src/hooks/useFolders.ts](src/hooks/useFolders.ts)
  - [src/hooks/useShortcuts.tsx](src/hooks/useShortcuts.tsx)
  - [src/utils/previewMockData.ts](src/utils/previewMockData.ts)
- Result: No errors found.

## Residual risk
- If future preview requirements need full subject/topic in-preview navigation, dedicated preview route rendering for those pages may be needed instead of Home-only rendering.
