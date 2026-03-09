# accessCodeService.js

## Overview
- **Source file:** `src/services/accessCodeService.js`
- **Last documented:** 2026-03-07
- **Role:** Frontend service layer for secure institutional access code callables.

## Exports
- `validateInstitutionalAccessCode({ verificationCode, email, userType })`
- `getInstitutionalAccessCodePreview({ institutionId, userType, intervalHours })`

## Behavior
- Calls Cloud Functions via `httpsCallable`.
- Keeps access code validation and generation logic server-side.
- Returns normalized fallback objects when callable responses are missing fields.

## Notes
- This service is used by registration (teacher code validation) and institution admin dashboard (live rotating code preview).
