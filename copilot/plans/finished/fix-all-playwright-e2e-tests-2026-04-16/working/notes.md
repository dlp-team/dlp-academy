<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/working/notes.md -->
# Working Notes

## 2026-04-16 — Initial Analysis

### Test Results Summary
- 75 total tests
- 3 passed (register page renders, unauthenticated redirect, 1 more)
- 29 failed (all login-dependent)
- 43 skipped (env-gated)

### Root Cause Discovery
Primary issue: Email verification gate in `App.tsx` line ~190 redirects all password-provider users with `emailVerified === false` to `/verify-email`. All E2E test accounts have unverified emails.

### Error Patterns Found
1. `Expected pattern: /\/home/` — `Received: "http://localhost:5173/verify-email"` (most common)
2. `.home-page` locator not found (consequence of #1)
3. Timeout waiting for buttons (consequence of #1)
4. Some potential UI text mismatches (TBD after #1 is fixed)

---

## 2026-04-16 — Research: How Shared Folders Appear for Non-Owner Users

### Data Fetching Layer (`useFolders.ts`)

`useFolders` sets up **two simultaneous Firestore listeners**:

1. **Owned query**: `where("ownerId", "==", user.uid)` — user's own folders
2. **Shared query**: `where("isShared", "==", true)` — all folders marked as shared

The shared listener **client-side filters** results to folders where the current user is in `sharedWith` (by email or uid):

```ts
sharedFolders = snapshot.docs.filter(d => {
    const data = d.data();
    return data.sharedWith?.some(share => 
        share.email?.toLowerCase() === userEmail || share.uid === user.uid
    );
}).map(d => ({ id: d.id, ...d.data(), isOwner: false }));
```

Both arrays are merged: `[...ownedFolders, ...sharedFolders]`.

**Important**: Students are excluded — the hook returns `[]` if `isStudentRole === true`.

### State Separation (`useHomeState.ts`)

The combined folders array is re-split in `useHomeState.ts` (line 558):

```ts
const sharedFolders = source.filter(item => 
    !isOwnedByCurrentUser(item, user) && isSharedWithCurrentUser(item, user)
);
```

Same pattern for `sharedSubjects` (line 563).

### "Compartidas" Tab (Home Page)

- `useHomePageState.tsx` has `showSharedTab` (true for non-students)
- When `viewMode === 'shared'`, the Home page renders `SharedView`
- `SharedView.tsx` receives both `sharedFolders` and `sharedSubjects` as props

### SharedView Component (`SharedView.tsx`)

Renders **two collapsible sections**:
- **"Carpetas Compartidas"** — `FolderCard` for each shared folder
- **"Asignaturas Compartidas"** — `SubjectCard` for each shared subject

Empty state: "No hay elementos compartidos"

### Subjects Shared Query (for comparison)

`useSubjects.ts` uses a **different** approach for shared subjects:
- Query: `where("sharedWithUids", "array-contains", user.uid)` — targets user directly
- Unlike folders which query `isShared === true` then client-filter

### Key Difference: Folder vs Subject Shared Queries

| Item | Firestore Query | Client Filter |
|------|----------------|---------------|
| **Folders** | `where("isShared", "==", true)` (broad) | Filters by `sharedWith[].email` or `sharedWith[].uid` |
| **Subjects** | `where("sharedWithUids", "array-contains", user.uid)` (targeted) | Excludes own subjects, checks institution match |

The folder query is less efficient (fetches ALL shared folders globally, then client-filters) compared to the subject query (server-side targeted via `array-contains`).

### Conclusion

**Shared folders ARE fully supported** for non-owner users in the Home page UI, provided:
1. The folder has `isShared: true` and the user's email/uid is in `sharedWith` array
2. The user is not a student (students excluded from folder fetching)
3. The user navigates to the "Compartidas" view mode

---

## 2026-04-16 — Research: 43 Skipped Tests Analysis

### Skip Categories

| Category | Env Var(s) Needed | Tests Affected |
|----------|-------------------|----------------|
| **Mutation guard** | `E2E_RUN_MUTATIONS=true` | home-subject-crud (6), home-folder-crud (8), home-sharing-operations (9), home-bulk-operations (6), home-advanced-operations (7), study-flow (1) = **37 tests** |
| **Missing credentials** | `E2E_EMAIL/PASSWORD`, `E2E_OWNER_*`, `E2E_EDITOR_*`, `E2E_VIEWER_*` | auth, branding, notifications, sharing-operations, sharing-roles, subject-topic-content, user-journey |
| **Firebase Admin SDK** | Admin SDK connection | home-subject-crud, home-bulk-ops, home-advanced-ops, home-sharing-ops |
| **Feature flags** | `E2E_BIN_TESTS=true` | bin-view (2 tests) |
| **Transfer-promotion** | Multiple special flags | transfer-promotion (~4 tests) |

### Key Insight

All 43 skips are **intentional guard clauses** (`test.skip(condition, reason)`) — not broken tests. They protect against:
- Running mutations without explicit opt-in
- Failing due to missing test account credentials
- Executing against unavailable backend services

To run them, set the corresponding env vars before running the test suite.

### Complete E2E Environment Variables Reference

> **Legend**: ✅ = Already in `.env` | ❌ = Missing from `.env` (needs to be added)

#### Credential Variables (User Accounts)

| Env Var | In `.env`? | Purpose | Used By |
|---------|:----------:|---------|---------|
| `E2E_EMAIL` | ✅ | Default test user email | auth, auth-onboarding, branding, notifications, profile-settings, quiz-lifecycle, study-flow, subject-topic-content, user-journey, home-subject-crud |
| `E2E_PASSWORD` | ✅ | Default test user password | Same as above |
| `E2E_OWNER_EMAIL` | ✅ | Owner/creator account email | admin-guardrails, bin-view, home-subject-crud, home-folder-crud, home-sharing-operations, home-sharing-roles, home-bulk-operations, home-advanced-operations |
| `E2E_OWNER_PASSWORD` | ✅ | Owner account password | Same as above |
| `E2E_EDITOR_EMAIL` | ✅ | Editor role account email | admin-guardrails, home-sharing-operations, home-sharing-roles, home-advanced-operations, home-subject-crud |
| `E2E_EDITOR_PASSWORD` | ✅ | Editor role account password | Same as above |
| `E2E_VIEWER_EMAIL` | ✅ | Viewer role account email | admin-guardrails, home-sharing-operations, home-sharing-roles |
| `E2E_VIEWER_PASSWORD` | ✅ | Viewer role account password | Same as above |
| `E2E_ADMIN_EMAIL` | ✅ | Global admin account email | admin-guardrails |
| `E2E_ADMIN_PASSWORD` | ✅ | Global admin account password | admin-guardrails |
| `E2E_INSTITUTION_ADMIN_EMAIL` | ✅ | Institution admin email | admin-guardrails, transfer-promotion |
| `E2E_INSTITUTION_ADMIN_PASSWORD` | ✅ | Institution admin password | admin-guardrails, transfer-promotion |
| `E2E_TEACHER_EMAIL` | ✅ | Teacher account email | global-setup (email verification) |
| `E2E_TEACHER_PASSWORD` | ✅ | Teacher account password | (available but not referenced in specs) |
| `E2E_STUDENT_EMAIL` | ✅ | Student account email | global-setup (email verification) |
| `E2E_STUDENT_PASSWORD` | ✅ | Student account password | (available but not referenced in specs) |
| `E2E_ONBOARDING_EMAIL` | ✅ | Onboarding test account email | global-setup (email verification) |
| `E2E_ONBOARDING_PASSWORD` | ✅ | Onboarding test account password | (available but not referenced in specs) |

#### Feature & Behavior Flags

| Env Var | In `.env`? | Purpose | Used By |
|---------|:----------:|---------|---------|
| `E2E_RUN_MUTATIONS=true` | ❌ **MISSING** | Enable tests that write/modify Firestore data | home-subject-crud, home-folder-crud, home-sharing-operations, home-bulk-operations, home-advanced-operations, study-flow |
| `E2E_BIN_TESTS=true` | ❌ **MISSING** | Enable bin/trash view tests | bin-view |
| `E2E_TRANSFER_PROMOTION_TESTS=1` | ❌ **MISSING** | Enable transfer-promotion test suite | transfer-promotion |
| `E2E_TRANSFER_PROMOTION_EXECUTION=1` | ❌ **MISSING** | Enable transfer execution tests | transfer-promotion |
| `E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK=1` | ❌ **MISSING** | Enable rollback tests | transfer-promotion |
| `E2E_TRANSFER_PROMOTION_AUTO_SEED=1` | ❌ **MISSING** | Auto-seed transfer promotion data | transfer-promotion |
| `E2E_TRANSFER_PROMOTION_MOCK_CALLABLES=1` | ❌ **MISSING** | Mock cloud functions during test | transfer-promotion |

#### Data Seeding & Context Variables

| Env Var | In `.env`? | Purpose | Used By |
|---------|:----------:|---------|---------|
| `E2E_SUBJECT_ID` | ✅ | Pre-existing subject for navigation tests | subject-topic-content, quiz-lifecycle, study-flow, user-journey |
| `E2E_TOPIC_ID` | ✅ | Pre-existing topic for content tests | subject-topic-content, quiz-lifecycle |
| `E2E_QUIZ_ID` | ❌ **MISSING** | Pre-existing quiz for lifecycle tests | quiz-lifecycle |
| `E2E_INSTITUTION_ID` | ✅ | Target institution for scoped tests | subject-topic-content, quiz-lifecycle, e2e-data-factories |
| `E2E_SHARED_FOLDER_ID` | ✅ | Pre-shared folder for role tests | home-sharing-roles |
| `E2E_FOLDER_ID` | ✅ | Pre-existing folder (extra, not referenced by name in specs) | (available) |
| `E2E_BRANDING_PATH` | ❌ (optional) | Custom branding page path (default: `/institution-admin-dashboard`) | branding |
| `E2E_TRANSFER_PROMOTION_SOURCE_YEAR` | ❌ (optional) | Source academic year (default: `2025-2026`) | transfer-promotion |
| `E2E_TRANSFER_PROMOTION_TARGET_YEAR` | ❌ (optional) | Target academic year (default: `2026-2027`) | transfer-promotion |

#### Infrastructure Variables

| Env Var | In `.env`? | Purpose | Used By |
|---------|:----------:|---------|---------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ✅ | Firebase Admin SDK credentials (JSON string) | global-setup, home-sharing-roles, quiz-lifecycle, subject-topic-content, profile-settings, transfer-promotion, e2e-firebase-admin |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | ❌ (optional) | Alt: path to service account file | transfer-promotion |

### Summary: What's Missing

**Required to unblock the 37 mutation-gated tests:**
```bash
E2E_RUN_MUTATIONS=true
```

**Required to unblock bin-view tests (2 tests):**
```bash
E2E_BIN_TESTS=true
```

**Required to unblock quiz-lifecycle (if quiz seeding is needed):**
```bash
E2E_QUIZ_ID=<existing-quiz-document-id>
```

**Required for transfer-promotion tests (~4 tests, lower priority):**
```bash
E2E_TRANSFER_PROMOTION_TESTS=1
E2E_TRANSFER_PROMOTION_EXECUTION=1
E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK=1
```

**All credentials and infrastructure are already configured.** The missing items are exclusively feature flags and one data seed ID.

### Feature Flag Risk Assessment

The feature flags are **safety guards to prevent accidental data mutation**, not because the tests are inherently dangerous.

#### `E2E_RUN_MUTATIONS=true` (unblocks 37 tests)

- **Why it exists**: Tests create, modify, and delete real Firestore documents (subjects, folders, sharing). Without the flag, casual test runs (e.g., just checking auth) won't accidentally pollute Firestore with junk data or delete shared items.
- **Risk level**: **Low** — tests use cleanup registries (`beforeAll`/`afterAll`) to delete what they create.
- **Caveats**:
  - If a test crashes mid-execution, orphaned documents may remain in Firestore
  - Tests run against the **live Firebase project** (not emulator), so they touch real data
  - Concurrent runs by multiple developers could cause conflicts
- **Recommendation**: Safe to enable for development. Tests clean up after themselves.

#### `E2E_BIN_TESTS=true` (unblocks 2 tests)

- **Why it exists**: Bin/trash tests expect pre-existing trashed items. Flag prevents skips when the account doesn't have trashed items set up.
- **Risk level**: **Very Low** — tests primarily read and verify bin UI behavior.
- **Recommendation**: Safe to enable always.

#### `E2E_TRANSFER_PROMOTION_*` flags (unblocks ~4 tests)

- **Why they exist**: Transfer-promotion tests perform **bulk academic year operations** — moving students between years, rolling back promotions. These are the most destructive operations in the platform.
- **Risk level**: **High** — can modify multiple student records and academic year assignments in batch.
- **Recommendation**: Only enable intentionally with dedicated test data. Keep off by default.

#### Summary Table

| Flag | Risk | Tests Unblocked | Recommendation |
|------|------|:---------------:|----------------|
| `E2E_RUN_MUTATIONS=true` | Low (has cleanup) | 37 | Enable for dev |
| `E2E_BIN_TESTS=true` | Very Low | 2 | Enable always |
| `E2E_TRANSFER_PROMOTION_*` | High (bulk mutations) | ~4 | Only with dedicated test data |
