# [2026-03-07] Server-Side Live Access Code Preview

## Context
- Institutional rotating access codes should not be generated client-side with exposed logic/salt.

## Change
- `InstitutionAdminDashboard` now requests live access code previews from backend callable `getInstitutionalAccessCodePreview`.
- Added refresh cycle every 30 seconds and safe UI fallback/error state for code preview.

# InstitutionAdminDashboard.jsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx`
- **Last documented:** 2026-02-24
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

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
