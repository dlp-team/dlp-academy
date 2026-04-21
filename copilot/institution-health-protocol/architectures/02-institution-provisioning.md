# Architecture 02 — Institution Provisioning

> **Protocol:** ILHP v1.0.0 | **Domain:** Institution Setup  
> **Last Reviewed:** 2026-04-21 | **Status:** ✅ Current  
> **Depends On:** 01 (Auth)  
> **Blocks:** 03, 04, 05, 06, 07

---

## 1. Scope

This architecture covers the complete lifecycle of provisioning a new institution in DLP Academy:
- Global admin authentication and access to admin dashboard
- Institution document creation in Firestore
- Institutional invite system (direct admin invites + institutional access codes)
- Institution admin dashboard initial access
- Institution settings configuration
- Institution branding / customization setup
- Multi-tenant scoping enforcement

---

## 2. Files Involved

| File | Purpose |
|------|---------|
| `src/pages/AdminDashboard/AdminDashboard.tsx` | Global admin dashboard UI |
| `src/pages/AdminDashboard/utils/adminInstitutionBatchQueueUtils.ts` | Firestore batch operations for institution create/edit |
| `src/pages/AdminDashboard/utils/adminInstitutionFormUtils.ts` | Institution form state management |
| `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx` | Institution admin main dashboard |
| `src/pages/InstitutionAdminDashboard/hooks/useUsers.ts` | Institution user management (invite, list, delete) |
| `src/hooks/useInstitutionBranding.ts` | Loads institution branding/customization per session |
| `src/utils/institutionPolicyUtils.ts` | Institution-level policy enforcement |
| `src/utils/themeTokens.ts` | Theme token resolution from institution customization |
| `tests/e2e/branding.spec.ts` | Branding e2e tests |

---

## 3. Institution Document Structure (Firestore: `institutions` collection)

```typescript
{
  id: string,                    // Auto-generated Firestore document ID
  name: string,                  // "Academia de Prueba DLP"
  domain: string | null,         // Primary email domain string
  domains?: string[],            // Multiple domains (modern field)
  type: 'school' | 'university' | 'academy',
  city: string,
  country: string,
  timezone: string,              // e.g., 'Europe/Madrid'
  enabled: boolean,              // true = active, false = suspended
  createdAt: Timestamp,
  updatedAt?: Timestamp,

  institutionAdministrators: string[],  // Email addresses of admin users
  adminEmail?: string,           // Legacy single-admin field

  accessPolicies?: {
    teachers?: {
      allowTeacherAutonomousSubjectCreation: boolean,
      canDeleteSubjectsWithStudents: boolean
    }
  },

  customization?: {
    primaryColor?: string,
    secondaryColor?: string,
    institutionDisplayName?: string,
    // Additional theme tokens
  },

  iconUrl?: string,
  logoUrl?: string,

  badgeConfig?: {
    gradeThreshold: number,
    enableAutoBadges: boolean,
    enableManualBadges: boolean
  }
}
```

---

## 4. Institution Creation Flow — Critical Path

### 4.1 Batch Operation Sequence

**File:** `adminInstitutionBatchQueueUtils.ts` — `queueInstitutionCreateBatchOps()`

```typescript
// Step 1: Create institution document
batch.set(institutionRef, {
  name, domain, type, city, country, timezone,
  enabled: true,
  createdAt: serverTimestamp(),
  institutionAdministrators: [adminEmail]
})

// Step 2: For each admin email → create direct invite
batch.set(inviteRef, {
  email: adminEmail,
  role: 'institutionadmin',
  institutionId: institutionRef.id,
  invitedAt: serverTimestamp()
})

// Step 3: If institutionalCode provided → create institutional access code
batch.set(doc(db, 'institution_invites', institutionalCode), {
  type: 'institutional',
  institutionId: institutionRef.id,
  createdAt: serverTimestamp()
})

await batch.commit()
```

**Critical Observation:** All three writes are in a single batch → atomic. Either all succeed or all fail. This is correct behavior.

**Failure Mode — Batch Commit Failure:** If network drops mid-commit, none of the documents are created. The UI must catch and surface this error clearly.

**Failure Mode — Duplicate Institutional Code:** If the institutional code already exists in `institution_invites`, the batch will fail because Firestore does not enforce uniqueness at the write level with `set()`. A pre-existence check should be performed before creating. **Verify this check exists in the code.**

### 4.2 Institution List Pagination

```typescript
// AdminDashboard.tsx
const fetchInstitutions = async (append = false) => {
  // Loads 25 per page
  // Uses Firestore cursor pagination (startAfter)
}
```

**Audit Check:** After creating a new institution, does it appear in the list without requiring a manual refresh?

---

## 5. Invite System

### 5.1 Direct Admin Invite Document

**Firestore Collection:** `institution_invites`

```typescript
{
  id: string,          // Auto-generated
  email: string,       // Admin's email
  role: 'institutionadmin',
  institutionId: string,
  invitedAt: Timestamp
  // NOTE: No 'type' field → useRegister.ts distinguishes from institutional codes via type check
}
```

### 5.2 Institutional Access Code Document

```typescript
{
  id: string,          // The code itself (e.g., 'LIA-TEST-2026')
  type: 'institutional',
  institutionId: string,
  createdAt: Timestamp
}
```

**Critical Distinction:** The `type` field on `institutional` codes is what differentiates them from direct invites in `useRegister.ts`. If this field is missing from a code document, the registration flow will treat it as a direct invite and attempt email matching → will fail for any student using the code.

**Firestore Rules for `institution_invites`:**
- Only admins can create invite documents
- Only the invited user (email match) or an admin can read a direct invite
- Institutional codes can be read by any authenticated user of the same institution
- Once consumed (direct invite), the document should be deleted (see Architecture 01)

---

## 6. Institution Admin Dashboard

**File:** `InstitutionAdminDashboard.tsx`

### 6.1 Access Guard

```typescript
// Route guard checks:
// 1. User is authenticated
// 2. user.role === 'institutionadmin' OR user.role === 'admin'
// 3. For institutionadmin: user.institutionId must match dashboard institutionId param
```

**Critical Failure Mode:** If `user.institutionId` is `null` (improperly set user), the institution admin will see no data and may crash the dashboard.

### 6.2 Dashboard Tabs

| Tab | Component | Hook |
|-----|-----------|------|
| Users | `UsersTabContent` | `useUsers.ts` |
| Organization | `ClassesCoursesSection` | Internal |
| Settings | `SettingsTabContent` | Internal |
| Customization | `CustomizationTab` | Internal |

### 6.3 Settings Configuration

`accessPolicies.teachers.allowTeacherAutonomousSubjectCreation` controls whether teachers can create subjects without institution admin approval.

**Code Path:**
```typescript
// institutionPolicyUtils.ts
export function canTeacherCreateSubject(institution: Institution): boolean {
  return institution.accessPolicies?.teachers?.allowTeacherAutonomousSubjectCreation ?? false
}
```

**Firestore Rule to Verify:**
```firestore
// institutions/{id} update rule:
// Only institutionadmin of same institution OR global admin can update
// Ensure this includes the accessPolicies field write
```

**Audit Check:** Save the policy. Reload. Verify the toggle/setting reflects the saved value (not a stale local state).

---

## 7. Branding & Customization

**Files:** `src/hooks/useInstitutionBranding.ts`, `src/utils/themeTokens.ts`

### 7.1 Branding Data Load

```typescript
// useInstitutionBranding.ts
// Queries institutions/{institutionId} for customization fields
// Applies themeTokens.ts token resolution
// Returns CSS custom properties or Tailwind overrides
```

### 7.2 Customization Fields Written to Firestore

```typescript
// institutions/{id}.customization
{
  primaryColor: '#1e40af',
  secondaryColor: '#10b981',
  institutionDisplayName: 'Academia LIA Test'
}
```

**Audit Check:** After saving customization:
1. Reload the institution admin dashboard
2. Verify display name appears in the header/sidebar
3. Verify primary color is applied to buttons/headers
4. Verify the change persists after logout and login

**Failure Mode:** `useInstitutionBranding` fetches the institution on mount. If it caches the old value from the auth context and does not re-fetch after a save, the UI shows stale branding. **Test: save → do NOT reload → verify immediate UI update.**

---

## 8. Multi-Tenant Scoping

Every piece of institution-scoped data uses `institutionId` as the foreign key. The Firestore rules enforce `sameInstitution()` across all institution-scoped collections.

```firestore
function sameInstitution(data) {
  return currentUserInstitutionId() != null 
    && data.institutionId == currentUserInstitutionId()
}

function currentUserInstitutionId() {
  return get(/databases/{database}/documents/users/{request.auth.uid}).data.institutionId
}
```

**Critical Risk:** This function performs a Firestore read on every rule evaluation (get() call). This counts toward Firestore billing and may cause rule evaluation performance issues at scale. For LIA purposes, ensure it resolves correctly in all test scenarios.

**Critical Risk:** If `users/{uid}.institutionId` is `null`, all `sameInstitution()` checks return `false`. This means a user with `null` institutionId cannot access any institution-scoped data, even if the data has `institutionId: null`. Verify behavior for institution-independent users (global admin).

---

## 9. Known Failure Modes Summary

| ID | Failure | Severity | Trigger | Detection |
|----|---------|----------|---------|-----------|
| IP-01 | Batch commit failure (institution not created) | CRITICAL | Network drop during batch | UI must show error; no partial data |
| IP-02 | Institutional code already exists (duplicate) | HIGH | Reusing a code across institutions | Second institution's code silently overwrites first |
| IP-03 | `type: 'institutional'` missing from access code | HIGH | Code created without type field | Students fail to use code (email mismatch error) |
| IP-04 | `institutionId: null` on institution admin user | CRITICAL | Invite resolution failure | Dashboard empty / crashes |
| IP-05 | Stale branding cache after customization save | MEDIUM | No re-fetch after save | Old colors/name shown until hard reload |
| IP-06 | `sameInstitution()` read fails due to user doc missing | CRITICAL | Orphaned auth user | All Firestore operations denied silently |
| IP-07 | Duplicate institutional code across runs | HIGH | LIA re-run without cleanup | Previous run's code blocks new run setup |

---

## 10. Automated Test Coverage

| Test File | Coverage |
|-----------|---------|
| `tests/e2e/branding.spec.ts` | Institution branding application |
| `tests/e2e/admin-guardrails.spec.ts` | Admin access restrictions |

**Coverage Gaps:**
- No test for institution batch creation atomic failure
- No test for duplicate institutional access code handling
- No test for stale branding cache after in-session customization save
- No test for `institutionId: null` behavior in institution admin dashboard

---

## 11. Validation Criteria

| Criterion | Method |
|-----------|--------|
| Institution document created | Firestore `institutions/{id}` query |
| All required fields present | Verify each field against spec |
| Invite documents created | `institution_invites` query |
| Institutional code document has `type: 'institutional'` | Direct Firestore doc check |
| Institution appears in admin list immediately | UI check |
| Institution admin dashboard loads after login | Browser URL + no errors |
| Branding colors applied in UI | Visual inspection |
| Settings saved and persist across sessions | Logout → login → verify |

---

## 12. Security Boundary Analysis

| Boundary | Risk | Mitigation |
|---------|------|-----------|
| Institution creation | Only global admin should create | Firestore rule + route guard |
| Institutional code reuse | Code used by unlimited users | Institutional codes are by design multi-use; only direct invites are single-use |
| Admin escalation via Firestore write | InstitutionAdmin writes `role: 'admin'` on themselves | Firestore rule: institutionadmin cannot set role to `admin` |
| Cross-institution data access | InstitutionAdmin queries another institution's users | `sameInstitution()` check in all collection rules |
| Customization field injection | Malformed color string injected as CSS | UI must sanitize color inputs before applying to DOM |

---

## 13. Rollback / Recovery

If institution provisioning fails:
1. Check Firestore `institutions/` for partial document — delete if incomplete
2. Check `institution_invites/` for orphaned invite docs — delete
3. Re-run creation flow from AdminDashboard
4. If institutional code collision: change code string and retry
5. If institution admin user has `null` institutionId: manually update `users/{uid}.institutionId` in Firestore console
