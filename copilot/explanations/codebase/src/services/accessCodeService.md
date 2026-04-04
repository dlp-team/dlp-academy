# accessCodeService.js

## Overview
- **Source file:** `src/services/accessCodeService.js`
- **Last documented:** 2026-03-07
- **Role:** Frontend service layer for secure institutional access code callables.

## Exports
- `validateInstitutionalAccessCode({ verificationCode, email, userType })`
- `getInstitutionalAccessCodePreview({ institutionId, userType, intervalHours, codeVersion })`
- `rotateInstitutionalAccessCodeNow({ institutionId, userType })`

## Behavior
- Calls Cloud Functions via `httpsCallable`.
- Keeps access code validation and generation logic server-side.
- Returns normalized fallback objects when callable responses are missing fields.

## Notes
- This service is used by registration (teacher code validation) and institution admin dashboard (live rotating code preview).

## Changelog
- 2026-04-04: Added immediate-rotation callable wrapper (`rotateInstitutionalAccessCodeNow`) and extended preview payload to include role `codeVersion` so regenerated codes become effective immediately.
