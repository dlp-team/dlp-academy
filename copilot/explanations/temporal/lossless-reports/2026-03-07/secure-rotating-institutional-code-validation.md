# Lossless Change Report - Secure Rotating Institutional Code Validation

## Requested Scope
- Fix teacher registration using rotating institutional code.
- Validate code algorithmically by institution/time/frequency.
- Hide generation/validation logic from end users.
- Add tests to verify the flow.

## Core Resolution
- Migrated institutional rotating code validation to backend Cloud Functions.
- Registration now validates teacher rotating codes through callable `validateInstitutionalAccessCode`.
- Institution admin dashboard now retrieves live code from callable `getInstitutionalAccessCodePreview`.
- Direct email invites remain Firestore-based and continue working.

## Files Touched
- `functions/index.js`
- `functions/package.json`
- `firebase.json`
- `src/firebase/config.js`
- `src/services/accessCodeService.js`
- `src/pages/Auth/hooks/useRegister.js`
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx`
- `src/pages/InstitutionAdminDashboard/components/UsersTabContent.jsx`
- `tests/unit/hooks/useRegister.test.js`
- `tests/unit/services/accessCodeService.test.js`
- `copilot/explanations/codebase/src/pages/Auth/hooks/useRegister.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.md`
- `copilot/explanations/codebase/src/services/accessCodeService.md`

## Key Compatibility Safeguards
- Preserved direct invite code behavior:
  - lookup uses exact case-sensitive doc ID first,
  - delete uses the exact resolved direct invite ID.
- Added uppercase compatibility fallback for older institutional doc IDs.
- Added server validation path when invite doc does not exist.

## Validation Evidence
- Static diagnostics: `get_errors` found no issues in touched files.
- Focused tests:
  - `npm run test -- tests/unit/hooks/useRegister.test.js tests/unit/services/accessCodeService.test.js tests/unit/utils/securityUtils.test.js`
  - Result: `3/3` files passed, `10/10` tests passed.

## Deployment Requirement
- Set Firebase Functions secret `INSTITUTION_CODE_SALT` before deploy.
- Deploy functions so frontend callable endpoints are available.
