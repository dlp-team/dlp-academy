# [2026-03-07] Server-Side Live Access Code Preview

## Context
- Institutional rotating access codes should not be generated client-side with exposed logic/salt.

## Change
- `InstitutionAdminDashboard` now requests live access code previews from backend callable `getInstitutionalAccessCodePreview`.
- Added refresh cycle every 30 seconds and safe UI fallback/error state for code preview.

# InstitutionAdminDashboard.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`
- **Last documented:** 2026-04-04
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `default InstitutionAdminDashboard`

## Main Dependencies
- `react`
- `react-router-dom`
- `../../firebase/config`
- `../../components/layout/Header`

## Changelog
- 2026-04-05: Wired `institutionSettings.automationSettings` into `ClassesCoursesSection` so organization-tab transfer tooling can be gated by institution-level configuration.
- 2026-04-04: Wired immediate access-code regeneration props (`handleRotateLiveCode`, `isRotatingLiveCode`, `codeRotationMessage`) into `UsersTabContent`.
- 2026-04-04: Rewired CSV import props to support split workflows: `UsersTabContent` now receives student-import handlers and `ClassesCoursesSection` receives course-link import handlers (upload + manual + n8n).
- 2026-04-04: Wired student CSV bulk-link props (`institutionCourses`, `onBulkLinkStudentsCsv`) from `useUsers` into `UsersTabContent` for Phase 05 linking rollout.
- 2026-04-03: Added new `Configuración` tab in Institution Admin dashboard and wired dedicated settings flow via `useInstitutionSettings` + `SettingsTabContent`.
- 2026-04-02: Updated effective institution-id derivation to use `getActiveRole(user)` so admin-only institution override via query param applies only when the active context is global admin.
- 2026-04-02: Updated `useUsers` integration to pass `loadAllUsers: activeTab === 'organization'` so full teachers/students fetches are deferred outside organization workflows.

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
