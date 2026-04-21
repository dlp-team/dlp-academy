# Architecture 01 — Authentication & Sign-In Flows

> **Protocol:** ILHP v1.0.0 | **Domain:** Auth  
> **Last Reviewed:** 2026-04-21 | **Status:** ✅ Current  
> **Depends On:** None (foundational — all other architectures depend on this)  
> **Blocks:** All other architectures

---

## 1. Scope

This architecture covers every path a user can take to authenticate with DLP Academy:
- Email/password sign-up with invitation code validation
- Email/password sign-in
- Google OAuth sign-in
- Email verification post-registration
- Password reset
- Session persistence (Remember Me)
- Auth state listener and protected route enforcement

---

## 2. Files Involved

| File | Purpose |
|------|---------|
| `src/pages/Auth/Register.tsx` | Registration UI component |
| `src/pages/Auth/hooks/useRegister.ts` | Registration business logic |
| `src/pages/Auth/Login.tsx` | Login UI component |
| `src/pages/Auth/hooks/useLogin.ts` | Login business logic |
| `src/pages/Auth/EmailVerificationPage.tsx` | Post-signup email verification gate |
| `src/firebase/config.ts` | Firebase app initialization, emulator setup |
| `src/services/accessCodeService.ts` | Cloud Function invocation for institutional access code validation |
| `src/App.tsx` | `onAuthStateChanged` listener, route protection setup |
| `tests/unit/App.authListener.test.tsx` | Auth state listener unit tests |
| `tests/unit/services/accessCodeService.test.ts` | Access code service unit tests |
| `tests/e2e/auth.spec.ts` | Login/signup Playwright e2e tests |
| `tests/e2e/auth-onboarding.spec.ts` | New user onboarding e2e tests |

---

## 3. Firebase Configuration

**File:** `src/firebase/config.ts`

```typescript
// Firebase services initialized:
initializeApp(firebaseConfig)  → app
getFirestore(app)              → db
getAuth(app)                   → auth
getStorage(app)                → storage
getFunctions(app, 'europe-west1') → functions
getAnalytics(app)              → analytics

// Emulator activation:
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099')
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectStorageEmulator(storage, '127.0.0.1', 9199)
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
}
```

**Critical Risk:** If `VITE_USE_EMULATORS` is not set correctly, the app may operate against the wrong Firebase project (production vs. emulator). All LIA runs must verify this value in the environment snapshot before starting.

---

## 4. Registration Flow — Critical Path

### 4.1 User Type Selection
The form requires selecting one of: `student`, `teacher`, `admin`

- `admin` and `institutionadmin` are treated specially — require an invite
- `student` and `teacher` also require a verification code (invite or institutional code)

**Failure Mode:** User selects wrong type → wrong role assigned → cannot access correct dashboard. This is irreversible without a Firestore/Auth manual correction.

### 4.2 Invite Code Validation (Dual Path)

**Path A — Direct Email Invite:**
```typescript
// In useRegister.ts
const inviteRef = doc(db, 'institution_invites', inviteId)
const inviteSnap = await getDoc(inviteRef)

// Fallback for legacy uppercase IDs:
const altRef = doc(db, 'institution_invites', inviteId.toUpperCase())

// If invite.type !== 'institutional':
// → validate that invite.email === user's entered email (exact match)
// → assign invite.role and invite.institutionId to the user
```

**Path B — Institutional Access Code:**
```typescript
// Cloud Function call via accessCodeService.ts
const validateInstitutionalAccessCode = httpsCallable(
  functions, 
  'validateInstitutionalAccessCode'
)
const result = await validateInstitutionalAccessCode({ code: verificationCode })
// Returns: { institutionId: string, role: string } or throws error
```

**Critical Failure Modes:**
1. Cloud Function cold start → timeout → user sees generic error, retry required
2. Invite email mismatch → correct error shown, but user might try with wrong email
3. Code not found → no fallback → user stuck if they have a legacy code format
4. Institutional code has no `type: 'institutional'` field → falls to direct invite path → may fail email validation

### 4.3 Firebase Auth User Creation

```typescript
const userCredential = await createUserWithEmailAndPassword(auth, email, password)
await updateProfile(userCredential.user, { displayName })
```

**Failure Modes:**
- `auth/email-already-in-use` → correct error shown
- `auth/weak-password` → password strength validation should catch before this
- Network error mid-flow → Firebase Auth user may be created but Firestore doc is not → **orphaned auth account**

### 4.4 Firestore User Document Creation

```typescript
await setDoc(doc(db, 'users', user.uid), {
  uid: user.uid,
  firstName,
  lastName,
  displayName,
  email: email.toLowerCase(),
  role,            // ← 'student' | 'teacher' | 'institutionadmin' (resolved from invite)
  institutionId,   // ← from invite or institutional code result
  createdAt: serverTimestamp(),
  settings: { theme: 'system', language: 'es', viewMode: 'grid' }
})
```

**Critical Risk — Role Elevation via Client:**
Firestore rules prevent setting `role: 'admin'` or `role: 'institutionadmin'` directly from the client for new user creates (the rule checks for this). However, if the invite resolution returns `institutionadmin`, this role IS allowed. Verify the exact rule logic.

**Firestore Rule to Verify:**
```firestore
// users/{uid} create rule must enforce:
// 1. request.auth.uid == uid (only self-create)
// 2. request.resource.data.role in ['student', 'teacher', 'institutionadmin']
//    (admin role must not be settable client-side at creation)
// 3. institutionId must match what the invite code resolved to (or null)
```

### 4.5 Email Verification

```typescript
await sendEmailVerification(userCredential.user)
// Redirect to: /verify-email?registered=true
```

**Audit Check:** Is email verification actually enforced before dashboard access? Some implementations send the email but do not gate access behind it. Verify by attempting to access a protected route immediately after registration before verifying email.

### 4.6 Invite Document Cleanup

```typescript
// Non-blocking: attempt to delete the direct invite doc
await deleteDoc(doc(db, 'institution_invites', inviteId))
// If this fails silently, the invite remains reusable → SECURITY RISK
```

**Critical Security Check:** If the cleanup silently fails, an invite code could be reused. Firestore rules should prevent a second user from signing up with the same email invite. Verify the rule includes a check that the email is not already registered.

---

## 5. Login Flow — Critical Path

### 5.1 Persistence Setting

```typescript
const persistenceType = formData.rememberMe 
  ? browserLocalPersistence 
  : browserSessionPersistence
await setPersistence(auth, persistenceType)
```

**Audit Check:** Does the persistence type actually change? Test: login with `rememberMe: false`, close and reopen browser tab — user should be logged out.

### 5.2 Email/Password Sign-In

```typescript
const userCredential = await signInWithEmailAndPassword(auth, email, password)
```

**Failure Modes:**
- `auth/user-not-found` → correct error
- `auth/wrong-password` → correct error  
- `auth/too-many-requests` → rate limiting triggered → correct error
- `auth/user-disabled` → account suspended → must show clear message

### 5.3 Google OAuth Login

```typescript
const provider = new GoogleAuthProvider()
const result = await signInWithPopup(auth, provider)
// Then: saveUserToFirestore(result.user, rememberMe)
```

**Institution Resolution for Google Users:**
```typescript
async function resolveInstitutionId(email: string): Promise<string | null> {
  // 1. Check institution_invites by email
  // 2. Check institutions.domains (array contains check)
  // 3. Check institutions.domain (string equality)
  // 4. Return null if not found
}
```

**Critical Failure Mode:** Google OAuth user's email domain matches an institution's `domains` array → they are auto-assigned to that institution. If the domain is incorrectly configured in Firestore (wrong entry, typo, etc.), the user will be permanently assigned to the wrong institution.

### 5.4 saveUserToFirestore (Login)

Updates `lastLogin` and `rememberMe` on existing users. Creates document if first-time Google sign-in.

**Failure Mode:** If update fails silently, `lastLogin` is stale — not critical but worth noting.

---

## 6. Auth State Listener

**File:** `src/App.tsx`

```typescript
onAuthStateChanged(auth, (user) => {
  // Resolves user role from Firestore
  // Determines correct redirect destination
  // Sets up route guards
})
```

**Audit Check:** When `onAuthStateChanged` fires with `null` (logged out), all protected routes must immediately redirect to `/login`. Test: manual `auth.signOut()` while on a protected route.

---

## 7. Password Reset Flow

```typescript
// In useLogin.ts
await sendPasswordResetEmail(auth, email)
```

**Audit Checks:**
1. Does the UI show a success message even if the email is not registered (security — should not enumerate valid emails)?
2. Is the reset link functional?
3. After reset, can the user log in with the new password?

---

## 8. Known Failure Modes Summary

| ID | Failure | Severity | Trigger | Detection |
|----|---------|----------|---------|-----------|
| A-01 | Orphaned Firebase Auth account (no Firestore doc) | CRITICAL | Network error between `createUserWithEmailAndPassword` and `setDoc` | User can "log in" but has no Firestore profile → app crashes |
| A-02 | Invite not deleted after use | HIGH | Silent cleanup failure | Invite reusable → second user can register with same invite |
| A-03 | Cloud Function cold start timeout | HIGH | First invocation after idle | User sees timeout error, no retry UI |
| A-04 | Google OAuth assigns wrong institution | HIGH | Domain typo in Firestore | User stuck in wrong institution context |
| A-05 | Email verification not enforced | MEDIUM | Backend gate missing | Users bypass verification, access dashboard |
| A-06 | Incorrect persistence type on Remember Me | MEDIUM | `setPersistence` silently fails | Session survives browser close unexpectedly |
| A-07 | `auth/email-already-in-use` with no user feedback | HIGH | Duplicate registration | Confusing UX, user retries indefinitely |

---

## 9. Manual Check Sequence (LIA Execution Steps)

Refer to **Phase 0** (pre-flight), **Phase 2** (admin onboarding), **Phase 3** (teacher), and **Phase 4** (student) in [MASTER_CHECKLIST.md](../MASTER_CHECKLIST.md).

---

## 10. Automated Test Coverage

| Test File | Coverage |
|-----------|---------|
| `tests/e2e/auth.spec.ts` | Email/password login, signup, error states |
| `tests/e2e/auth-onboarding.spec.ts` | New user post-signup onboarding |
| `tests/unit/App.authListener.test.tsx` | `onAuthStateChanged` state management |
| `tests/unit/services/accessCodeService.test.ts` | Cloud Function invocation + error handling |

**Coverage Gaps:**
- No test for Google OAuth (requires real OAuth flow or mock)
- No test for orphaned auth account recovery path
- No test for simultaneous registration with same invite code (race condition)
- No test for `browserSessionPersistence` vs `browserLocalPersistence` behavior

---

## 11. Validation Criteria (How to Know It Passed)

| Criterion | Method |
|-----------|--------|
| Firebase Auth account created | Firebase Auth console or emulator UI shows user |
| Firestore `users/{uid}` created with correct fields | Firestore console query |
| Role assigned correctly from invite | `users/{uid}.role` matches invite's `role` |
| `institutionId` assigned correctly | `users/{uid}.institutionId` matches invite's `institutionId` |
| Email verification email sent | Check emulator email log or real inbox |
| Invite document deleted after use | `institution_invites/{id}` no longer exists |
| Redirect after registration to `/verify-email` | Browser URL |
| Successful login → correct dashboard | Browser URL matches role-expected dashboard |

---

## 12. Security Boundary Analysis

| Boundary | Risk | Mitigation |
|---------|------|-----------|
| Role assignment on signup | User could attempt to set `role: 'admin'` via client | Firestore rule denies non-invite roles at creation |
| Invite code reuse | Used invite code stays in Firestore → reusable | Cleanup on use + Firestore rule guards |
| Email enumeration on password reset | Attacker learns if email exists | Firebase default hides this — do not override |
| Google OAuth domain matching | Auto-assigns institution by email domain | Must validate domain config carefully |
| Auth account without Firestore doc | App accesses non-existent profile | App must handle gracefully (not crash) |

---

## 13. Rollback / Recovery

If authentication is broken:
1. Check Firebase Auth console for user creation logs
2. Check Firestore `users/` for orphaned or incorrectly-fielded documents
3. If orphaned account: delete from Firebase Auth console and retry registration
4. If invite not consumed: manually delete invite doc in Firestore and re-attempt
5. If wrong role assigned: update `users/{uid}.role` via Firestore console (admin action)
