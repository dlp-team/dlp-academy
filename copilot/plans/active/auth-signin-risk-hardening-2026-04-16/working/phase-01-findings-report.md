# Phase 01 - Baseline Threat Model: Severity-Ranked Findings Report

**Date**: 2026-04-16  
**Status**: Complete  
**Analyst**: Copilot (code-grounded audit)

---

## Critical Findings (Stop-Ship)

### CRIT-01: User Self-Create Has Zero Field Restrictions
- **File**: [firestore.rules](firestore.rules#L272)
- **Rule**: `allow create: if isSignedIn() && request.auth.uid == userId`
- **Attack**: Any authenticated user can write `role: 'admin'` or `role: 'institutionadmin'` plus any `institutionId` on self-create.
- **Impact**: Full privilege escalation to global admin on first profile write.
- **Status**: ACTIVE — no field restriction on create path.
- **Preconditions**: User signs up (email or Google), profile doc doesn't exist yet.
- **Remediation**: Restrict `create` to only allow `role: 'student'` and `institutionId: null` unless server-validated.

### CRIT-02: syncCurrentUserClaims Propagates Poisoned Profile
- **File**: [functions/index.js](functions/index.js#L325)
- **Attack**: If CRIT-01 is exploited, user calls `syncCurrentUserClaims` to get `admin` custom claims from their self-written profile doc.
- **Impact**: Backend custom claims match the poisoned Firestore role — escalation persists across token refreshes.
- **Status**: ACTIVE — callable reads role directly from user doc without validation.
- **Preconditions**: CRIT-01 exploited first.
- **Remediation**: Either gate claim sync behind admin-only or validate role against invite/code evidence before syncing.

---

## High Findings

### HIGH-01: Client-Selected userType Drives Role in Code Validation
- **File**: [src/pages/Auth/hooks/useRegister.ts](src/pages/Auth/hooks/useRegister.ts#L127) and [functions/index.js](functions/index.js#L193)
- **Attack**: During registration with callable validation, `resolvedRole = formData.userType` — client controls role.
- **Impact**: User selecting `teacher` gets teacher role even if code was meant for students.
- **Status**: ACTIVE — backend callable returns `valid: true` plus `institutionId`, client picks role.
- **Note**: The callable itself computes `role = userType === 'student' ? 'student' : 'teacher'` but result is not enforced on client.
- **Remediation**: Callable must return the authoritative role; client must use it.

### HIGH-02: Domain Auto-Link Bypasses Invite/Code Requirement
- **File**: [src/pages/Auth/hooks/useLogin.ts](src/pages/Auth/hooks/useLogin.ts#L54-L62)
- **Attack**: Google login user with matching email domain gets auto-linked to institution without invite or code.
- **Impact**: Any Gmail/domain user can join an institution by having a matching email domain.
- **Status**: ACTIVE — `resolveInstitutionId` queries institutions by domain array-contains match.
- **Preconditions**: Institution has configured a `domains` array that includes the user's email domain.
- **Remediation**: Domain match should require additional code/invite validation, or be policy-gated.

### HIGH-03: Email Verification Not Enforced in App Router
- **File**: [src/pages/Auth/EmailVerificationPage.tsx](src/pages/Auth/EmailVerificationPage.tsx) (exists but dead)
- **Evidence**: `EmailVerificationPage` is NOT imported or routed in [src/App.tsx](src/App.tsx).
- **Attack**: Users with unverified email get full app access.
- **Impact**: Allows throwaway-email registration with no email ownership proof.
- **Status**: ACTIVE — component exists but zero route wiring.
- **Remediation**: Wire into App.tsx, redirect unverified users before protected routes.

### HIGH-04: SudoModal Only Supports Password Reauth
- **File**: [src/components/modals/SudoModal.tsx](src/components/modals/SudoModal.tsx)
- **Attack**: Google-only auth users cannot complete step-up authentication for critical actions.
- **Impact**: Security-critical operations (role changes, deletions) may be accessible without reauth for social-provider users, or they are permanently locked out of sudo-gated actions.
- **Status**: ACTIVE — uses `EmailAuthProvider.credential` exclusively.
- **Remediation**: Add `GoogleAuthProvider` reauth path alongside password path.

---

## Medium Findings

### MED-01: Callable Access-Code Validation is Public with No Server Throttling
- **File**: [functions/index.js](functions/index.js#L182) — `invoker: 'public'`
- **Attack**: Brute-force access codes by calling the callable repeatedly.
- **Impact**: Potential code guessing for institutional access.
- **Status**: PARTIALLY MITIGATED — client has lockout (OnboardingWizard), but no server-side rate limiting.
- **Remediation**: Add server-side rate limiting per IP/UID.

### MED-02: Invite Deletion After Registration is Non-Transactional
- **File**: [src/pages/Auth/hooks/useRegister.ts](src/pages/Auth/hooks/useRegister.ts#L162-L170)
- **Attack**: If invite deletion fails after user creation, the same invite can be replayed.
- **Impact**: One-time invite codes can be reused for additional registrations.
- **Status**: ACTIVE — deletion is in separate try-catch after user creation.
- **Remediation**: Use batch write or transactional approach.

### MED-03: Login Auto-Updates institutionId for Existing Users
- **File**: [src/pages/Auth/hooks/useLogin.ts](src/pages/Auth/hooks/useLogin.ts#L82-L84)
- **Attack**: If user originally had no institution, domain match on subsequent login silently attaches them.
- **Impact**: Unintended institution membership changes.
- **Status**: ACTIVE — merge update adds `institutionId` if missing.
- **Remediation**: Gate auto-link behind user confirmation or policy.

---

## Low Findings

### LOW-01: AdminPasswordWizard May Trigger requires-recent-login
- **File**: [src/pages/Auth/components/AdminPasswordWizard.tsx](src/pages/Auth/components/AdminPasswordWizard.tsx)
- **Risk**: Google-auth institutionadmins forced to create Firebase password may hit `auth/requires-recent-login`.
- **Impact**: UX friction, not a security bypass.
- **Status**: KNOWN — error handling exists but UX is suboptimal.

### LOW-02: Legacy Institutional Invite Docs Trust Client userType
- **File**: [src/pages/Auth/hooks/useRegister.ts](src/pages/Auth/hooks/useRegister.ts#L113)
- **Code**: `resolvedRole = formData.userType === 'student' ? 'student' : 'teacher'`
- **Risk**: Client can choose teacher vs student on legacy institutional doc path.
- **Impact**: Limited — only teacher/student distinction, not admin escalation.
- **Status**: ACTIVE for legacy docs only.

---

## Evidence Map Summary

| Finding | Severity | File:Line | Status | Phase |
|---------|----------|-----------|--------|-------|
| CRIT-01 | Critical | firestore.rules:272 | ACTIVE | P02 |
| CRIT-02 | Critical | functions/index.js:325 | ACTIVE | P02 |
| HIGH-01 | High | useRegister.ts:127, functions/index.js:193 | ACTIVE | P03 |
| HIGH-02 | High | useLogin.ts:54-62 | ACTIVE | P03 |
| HIGH-03 | High | EmailVerificationPage.tsx (dead code) | ACTIVE | P04 |
| HIGH-04 | High | SudoModal.tsx | ACTIVE | P05 |
| MED-01 | Medium | functions/index.js:182 | PARTIAL | P06 |
| MED-02 | Medium | useRegister.ts:162-170 | ACTIVE | P06 |
| MED-03 | Medium | useLogin.ts:82-84 | ACTIVE | P03 |
| LOW-01 | Low | AdminPasswordWizard.tsx | KNOWN | P05 |
| LOW-02 | Low | useRegister.ts:113 | ACTIVE | P03 |

---

## Critical Stop-Ship Items for Phase 02
1. **CRIT-01**: Lock down `users` create rule to restrict `role` and `institutionId` fields.
2. **CRIT-02**: Prevent `syncCurrentUserClaims` from blindly propagating poisoned roles.
