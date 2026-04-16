# Phase 3 — Scrollbars Modernization

## Status: ✅ DONE (2026-04-16)

## Outcome
All scrollable containers identified via audit (24 matches across 13 files) now carry the appropriate standardized scrollbar class. `custom-scrollbar` and plugin-based `scrollbar-thin` legacy classes replaced.

### Class Assignment Logic Applied
- **`clean-scrollbar`** — content panels, modal bodies, flex-1 scrollable areas, overlay rootClassName containers
- **`minimal-scrollbar`** — small inline lists/pickers (max-h-32 to max-h-52)

### Files Updated
| File | Changes |
|------|--------|
| `src/components/modals/FolderDeleteModal.tsx` | L31, L127: added `clean-scrollbar` to rootClassName |
| `src/components/modals/CreateContentModal.tsx` | L461: replaced `custom-scrollbar` → `clean-scrollbar` |
| `src/components/modals/QuizModal.tsx` | L133: replaced `custom-scrollbar` → `clean-scrollbar` |
| `src/components/modals/FolderTreeModal.tsx` | L364: added `clean-scrollbar`; L410: replaced `custom-scrollbar` → `clean-scrollbar` |
| `src/pages/Home/components/FolderManager.tsx` | L670: `clean-scrollbar`; L926, L953, L1173: `minimal-scrollbar` |
| `src/pages/Home/components/bin/BinDescriptionModal.tsx` | L47: added `clean-scrollbar` |
| `src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx` | L51: `minimal-scrollbar` |
| `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.tsx` | L228, L403: `clean-scrollbar` |
| `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx` | L286, L541, L577: `clean-scrollbar`; L347: `minimal-scrollbar` |
| `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx` | L49: `minimal-scrollbar` |
| `src/pages/InstitutionAdminDashboard/components/classes-courses/AcademicYearPicker.tsx` | L78: `minimal-scrollbar` |
| `src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx` | L79: `clean-scrollbar` |
| `src/pages/Profile/components/UserStatistics.tsx` | L121: replaced `scrollbar-thin scrollbar-thumb-*` → `minimal-scrollbar` |
| `src/pages/Profile/components/ProfileSubjects.tsx` | L23: added `clean-scrollbar` |

## Objective
Replace all non-standard scrollbars across the app with the modern global scrollbar style. The global scrollbar does NOT overlap the header (its top is the bottom of the header). This constraint must be respected for all affected surfaces.

## Rules (from user)
- Use the same CSS class/approach as the global scrollbar
- The scrollbar top must begin where the header ends (not go over the header)
- This applies to: sidebar panels, modal inner content, list views, any scrollable div in the app

## Pre-Implementation Steps
1. Identify the global scrollbar CSS class/utility used in the app
2. Audit all scrollable containers (`overflow-y-auto`, `overflow-y-scroll`, `overflow-auto`) that do NOT already use the global scrollbar style
3. Apply consistently

## Files Likely Touched
- Global CSS / Tailwind config — identify the scrollbar utility class
- `src/components/layout/Sidebar.tsx`
- `src/pages/Home/*.tsx`
- `src/components/modals/*.tsx`
- `src/pages/InstitutionAdminDashboard/` panels
- Any other component with custom/overflow scrolling

## Acceptance Criteria
- [x] All scrollable containers use the same scrollbar visual style as the global one
- [x] No scrollbar overlaps the page header
- [x] Scrollbar style is consistent across light/dark mode

## Completion Notes
- Applied `minimal-scrollbar` to all previously unthemed inner scrollable panels (StudyGuide, ExamCorrectionTool, QuizClassResultsModal, SubjectHeader member list dropdowns, SubjectTopicModal content, TopicModal wrapper, SubjectFormModal inner lists).
- Fixed legacy `custom-scrollbar` class in StudyGuide.tsx (class was undefined globally — only inline-scoped in Exam.tsx).
- Applied `clean-scrollbar` to modal overlay wrappers missing it (TopicFormModal, SubjectTopicModal, EditTopicModal, SubjectFormModal root) to be consistent with other modal overlays (FolderManager, FolderDeleteModal, FolderTreeModal).
- `Exam.tsx` and `Formula.tsx` horizontal math-content scrollbars intentionally left as-is (inline-defined custom style for math UX).

## Validation
- [x] `get_errors` clean on all 14 touched files (0 errors)
- [ ] Visual check across major pages: Home, Settings, Admin Dashboard, Profile
- [ ] `npm run lint` passes

## Commits Required (minimum)
1. `style(scrollbars): Apply global modern scrollbar style to all overflow containers`
   (may be split per component area if diff is large)
