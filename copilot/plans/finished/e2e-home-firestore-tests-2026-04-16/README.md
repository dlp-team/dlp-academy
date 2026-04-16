<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/README.md -->
# Plan: Comprehensive Playwright E2E Tests — Home Page Firestore Operations

**Status:** `active`  
**Created:** 2026-04-16  
**Owner:** hector  
**Branch:** `feature/hector/e2e-home-firestore-tests-2026-04-16`  
**Source:** Created from user-provided `AUTOPILOT_PLAN.md`  
**Plan ID:** `e2e-home-firestore-tests-2026-04-16`

---

## Problem Statement

The Home page of DLP Academy contains extensive Firestore write, modify, and delete operations across multiple features (subjects, folders, sharing, bulk operations, deep copy, invite codes, notifications). There are currently no dedicated E2E tests verifying these mutating operations against a live Firestore backend. Existing E2E tests cover authentication, role-based sharing rendering, and some mutating flows in `study-flow.spec.js`, but they do not comprehensively validate the full CRUD lifecycle for every Home page feature.

## Objective

Create a comprehensive Playwright E2E test suite that:
1. **Tests every Firestore write/modify/delete operation** triggered from the Home page
2. **Verifies data integrity** after each operation (UI state + optional backend checks via Firebase Admin SDK)
3. **Ensures full cleanup** — every test-created entity (subject, folder, topic, notification, shortcut) is deleted at the end of the test so Firestore and Storage remain clean
4. **Supports multi-account testing** using environment variables for owner/editor/viewer/admin accounts
5. **Follows existing E2E patterns** (env-gated mutations, Firebase Admin seeding, graceful skip on missing credentials)

## Scope

### In-Scope
- Subject CRUD: create, update, soft-delete, restore, hard-delete
- Folder CRUD: create, update, move, nest, soft-delete, restore, hard-delete
- Sharing operations: share/unshare subjects and folders with role assignments (editor, viewer)
- Ownership transfer: subject and folder ownership transfer
- Bulk operations: bulk move, bulk delete, create folder from selection
- Invite code enrollment: join subject by invite code
- Drag-and-drop: move items via DnD (if testable with Playwright)
- Deep copy: keyboard shortcut cloning of subjects
- Notification creation on share/assign events
- Cleanup verification: confirm no orphaned test data in Firestore after suite completion

### Out-of-Scope
- Quiz lifecycle tests (already covered in `quiz-lifecycle.spec.js`)
- Authentication flow tests (covered in `auth.spec.js` and `auth-onboarding.spec.js`)
- Branding/theming tests (covered in `branding.spec.js`)
- Admin guardrails (covered in `admin-guardrails.spec.js`)
- Transfer/promotion academic year workflows (covered in `transfer-promotion.spec.js`)
- Profile settings tests (covered in `profile-settings.spec.js`)

## Key Technical Decisions

1. **Firebase Admin SDK** for seeding and cleanup (pattern from existing tests)
2. **Environment-gated execution** — tests skip gracefully if `E2E_RUN_MUTATIONS` is not set
3. **Isolated test data** — all created entities tagged with `e2eSeed: true` and unique test identifiers
4. **Cleanup-first architecture** — `afterAll` hooks guaranteed to run even if tests fail
5. **Parallel-safe** — each test file uses unique entity names/IDs to avoid cross-file interference

## Phases

| Phase | File | Description | Status |
|-------|------|-------------|--------|
| 1 | [phases/phase-01-test-infrastructure.md](phases/phase-01-test-infrastructure.md) | Shared test helpers, Firebase Admin utilities, cleanup framework | `todo` |
| 2 | [phases/phase-02-subject-crud.md](phases/phase-02-subject-crud.md) | Subject create, update, soft-delete, restore, hard-delete tests | `todo` |
| 3 | [phases/phase-03-folder-crud.md](phases/phase-03-folder-crud.md) | Folder create, update, move, nest, delete, restore tests | `todo` |
| 4 | [phases/phase-04-sharing-permissions.md](phases/phase-04-sharing-permissions.md) | Share/unshare subjects and folders, role enforcement, ownership transfer | `todo` |
| 5 | [phases/phase-05-bulk-operations.md](phases/phase-05-bulk-operations.md) | Bulk move, bulk delete, create folder from selection | `todo` |
| 6 | [phases/phase-06-advanced-operations.md](phases/phase-06-advanced-operations.md) | Invite codes, deep copy, drag-and-drop, notification creation | `todo` |
| 7 | [phases/phase-07-optimization-final.md](phases/phase-07-optimization-final.md) | Test centralization, DRY refactor, performance, final lint/validation | `todo` |
| 8 | [phases/phase-08-continue-autopilot.md](phases/phase-08-continue-autopilot.md) | Continue remaining AUTOPILOT_EXECUTION_CHECKLIST steps (Step 7+) | `todo` |

## Rollback Strategy

- All new files are in `tests/e2e/` — rollback by removing new test files and shared helpers
- No production code is modified by this plan
- If cleanup logic has a bug, manual cleanup via Firebase Admin console using `e2eSeed: true` marker

## Validation Commands

```bash
npx playwright test tests/e2e/home-*.spec.js --reporter=html
npx playwright test tests/e2e/home-*.spec.js --grep "cleanup" # verify cleanup only
npm run lint
```

## Residual Risks

1. **Flaky tests** — Firestore real-time listeners may have propagation delays; mitigate with retry/waitFor patterns
2. **Race conditions** — Bulk operations might conflict if Playwright parallelism is too aggressive; mitigate by isolating data per test file
3. **Firebase quotas** — Heavy E2E suites can hit Firestore read/write quotas in free tier; mitigate by batching cleanup operations
4. **Env var dependency** — Tests require 6+ env vars to be set; graceful skip prevents CI failures but reduces coverage if not configured

## Required Environment Variables

See [user-updates.md](user-updates.md) for any new variables the user needs to create.

## Source Traceability

- Original user spec: [sources/source-autopilot-user-spec-e2e-home-firestore-tests.md](sources/source-autopilot-user-spec-e2e-home-firestore-tests.md)
