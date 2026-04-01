<!-- copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionFormUtils.md -->

# adminInstitutionFormUtils.ts

## Overview
- **Source file:** `src/pages/AdminDashboard/utils/adminInstitutionFormUtils.ts`
- **Last documented:** 2026-04-01
- **Role:** Centralizes institutions form-state defaults and edit-mode mapping logic for AdminDashboard.

## Responsibilities
- Builds a normalized default form state for institution create flow.
- Maps institution payload data to edit-mode form state.
- Preserves admin-email fallback and timezone defaults.

## Exports
- `type AdminInstitutionFormState`
- `const createAdminInstitutionFormState`
- `const mapInstitutionToFormState`

## Main Dependencies
- None
