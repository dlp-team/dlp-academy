# Lossless Report: Auth Sign-In Risk Hardening

**Date**: 2026-04-16  
**Plan**: auth-signin-risk-hardening-2026-04-16  
**Phases Completed**: 01-08

---

## Requested Scope
Close authentication and sign-in security gaps across Firestore rules, cloud functions, registration, login, email verification, and step-up auth flows.

## Preserved Behaviors
- Existing student/teacher registration flows work unchanged
- Google login new-user bootstrap still sets `role: 'student'`
- App.tsx auth listener and user state management untouched (except `emailVerified`/`providerData` additions)
- OnboardingWizard and AdminPasswordWizard rendering logic preserved
- All 63 pre-existing Firestore rules tests continue to pass
- Direct email invites still work for teacher role
- Legacy institutional invite docs still work

## Touched Files

### Modified
| File | Change Summary |
|------|---------------|
| [firestore.rules](firestore.rules#L272) | Restricted users self-create to `role in ['student', 'teacher']` + `uid == auth.uid` |
| [functions/index.js](functions/index.js#L188) | Added server-side rate limiting to `validateInstitutionalAccessCode` (10 req/15min) |
| [functions/index.js](functions/index.js#L365) | Added escalation guard to `syncCurrentUserClaims` (blocks self-promotion to admin/institutionadmin) |
| [src/pages/Auth/hooks/useRegister.ts](src/pages/Auth/hooks/useRegister.ts#L133) | Use server-authoritative role from callable; cap create role to student/teacher; send verification email + redirect to verify-email |
| [src/pages/Auth/hooks/useLogin.ts](src/pages/Auth/hooks/useLogin.ts#L80) | Removed auto-link institutionId for existing users on login |
| [src/App.tsx](src/App.tsx#L10) | Import EmailVerificationPage; add emailVerified/providerData to user state; add email verification gate in ProtectedRoute; add /verify-email route |
| [src/components/modals/SudoModal.tsx](src/components/modals/SudoModal.tsx) | Added Google reauth support via `reauthenticateWithPopup` for social-provider users |

### Tests Modified
| File | Change Summary |
|------|---------------|
| [tests/rules/firestore.rules.test.js](tests/rules/firestore.rules.test.js) | Added 6 new security tests: deny admin/institutionadmin/unknown role self-create, deny uid spoof, allow student/teacher create |
| [tests/unit/hooks/useRegister.test.js](tests/unit/hooks/useRegister.test.js) | Updated navigate assertions to `/verify-email?registered=true`; added `sendEmailVerification` mock |
| [tests/unit/components/SudoModal.test.jsx](tests/unit/components/SudoModal.test.jsx) | Added `providerData` to mock user to match new provider detection logic |

### Plan Artifacts Created
| File | Purpose |
|------|---------|
| [copilot/plans/active/.../working/phase-01-findings-report.md](copilot/plans/active/auth-signin-risk-hardening-2026-04-16/working/phase-01-findings-report.md) | Severity-ranked threat model with file:line evidence |

## Validation Summary
- Firestore rules tests: **71/71 passed** (including 6 new security deny-path tests)
- useRegister tests: **6/6 passed** (updated for verification redirect)
- SudoModal tests: **2/2 passed** (updated for provider detection)
- TypeScript check: Only pre-existing errors in `useCustomization.ts` (unrelated)
- `get_errors`: Clean on all touched files

## Known Limitations / Follow-Up
1. Admin/institutionadmin invites now create profile as `teacher` max — privileged role promotion needs a server-side admin flow (future enhancement)
2. Domain auto-link still applies to NEW Google users on first login — consider gating behind explicit user confirmation
3. `_rateLimits` Firestore collection created by rate limiter has no auto-cleanup TTL — add scheduled cleanup or Firestore TTL policy
4. Pre-existing TS errors in `useCustomization.ts` are unrelated to this work
