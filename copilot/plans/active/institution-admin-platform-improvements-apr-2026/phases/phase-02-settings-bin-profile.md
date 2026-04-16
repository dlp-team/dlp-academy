# Phase 2 — App-Wide UX: Settings, Bin, Profile

## Status: IN PROGRESS

## Objectives

### 2A — Settings: theme selector disabled by default
The "Mostrar selector de tema en el encabezado" setting must default to **disabled** for new users. Existing users are unaffected. Only the initial value changes.

### 2B — Bin section: selection-mode UI consistency
The bin page's selection mode UI (buttons, toggle, counter position/style) must visually match the selection mode UI of all other home sections. Do not change which options are available — only the aesthetic/position/style.

### 2C — Profile: admin/institution admin statistics view
For users with role `admin` or `institutionadmin`, the Profile page should show general statistics (usage metrics, summaries) instead of (or in addition to) the badges and study notes stats shown to teachers/students.

## Files Likely Touched
- `src/pages/Settings/Settings.tsx` (or relevant settings hook) — theme selector default
- `src/pages/Home/components/BinSection.tsx` (or bin-related components) — selection mode UI
- `src/pages/Profile/Profile.tsx` (or sub-components) — admin statistics view
- `src/hooks/useUserSettings.ts` or similar — default value

## Acceptance Criteria
- [x] New users see "Mostrar selector de tema" defaulting to OFF — **DONE** (`f5d0e8b`)
- [x] Existing users' theme selector preference is unchanged — **DONE** (`f5d0e8b`)
- [x] Bin selection-mode toggle/counter/buttons visually match other sections of Home — **DONE** (structural card-below-header fix applied after `f5d0e8b`)
- [x] Admin/institution admin Profile shows statistics instead of badge/notes stats — **DONE** (`f5d0e8b`)
- [x] Teacher/student Profile is unchanged — **DONE** (`f5d0e8b`)

### 2B Detail
The first commit (`f5d0e8b`) fixed CSS/styles only. A structural fix was applied afterward to move the selection toolbar out of the top header row and into a standalone card-style `div` below the main toolbar — matching `HomeSelectionToolbar`'s exact position and container pattern. "Vaciar papelera" now always visible in the top header row.

## Validation
- [ ] `npm run test` passes
- [ ] `npm run lint` passes
- [ ] Visual check: new user flow defaults theme selector off
- [ ] Visual check: bin selection mode UI matches grid/list sections
- [ ] Visual check: admin profile shows stats panel

## Commits Required (minimum)
1. `fix(settings): Default theme-selector toggle to disabled for new users`
2. `fix(bin): Match selection-mode UI style with other home sections`
3. `feat(profile): Show statistics view for admin and institution admin roles`
