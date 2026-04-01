<!-- copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionValidationUtils.md -->

# adminInstitutionValidationUtils.ts

## Overview
- **Source file:** `src/pages/AdminDashboard/utils/adminInstitutionValidationUtils.ts`
- **Last documented:** 2026-04-01
- **Role:** Centralizes institutions submit validation rules and user-facing error messages.

## Responsibilities
- Validates required fields (name, domain, admins, institution type).
- Validates administrator email format.
- Returns existing Spanish validation messages without changing wording semantics.

## Exports
- `const getInstitutionSubmitValidationError`

## Main Dependencies
- `src/pages/AdminDashboard/utils/adminInstitutionPayloadUtils`
