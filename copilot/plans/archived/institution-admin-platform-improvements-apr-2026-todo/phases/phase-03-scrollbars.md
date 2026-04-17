# Phase 3 — Scrollbars Modernization

## Status: TODO

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
- [ ] All scrollable containers use the same scrollbar visual style as the global one
- [ ] No scrollbar overlaps the page header
- [ ] Scrollbar style is consistent across light/dark mode

## Validation
- [ ] `npm run lint` passes
- [ ] Visual check across major pages: Home, Settings, Admin Dashboard, Profile
- [ ] No regression on existing scrollable areas

## Commits Required (minimum)
1. `style(scrollbars): Apply global modern scrollbar style to all overflow containers`
   (may be split per component area if diff is large)
