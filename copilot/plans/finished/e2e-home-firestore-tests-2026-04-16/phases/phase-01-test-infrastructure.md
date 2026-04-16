<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/phases/phase-01-test-infrastructure.md -->
# Phase 1: Test Infrastructure & Shared Helpers

**Status:** `todo`  
**Depends on:** None  
**Estimated test files:** 4 helper modules  
**Commits target:** 3-5

---

## Objectives

Build reusable E2E test infrastructure that all subsequent test phases will import. This phase creates zero spec files — only shared helpers.

## Deliverables

### 1. Firebase Admin Helper (`tests/e2e/helpers/e2e-firebase-admin.js`)

- Parse `FIREBASE_SERVICE_ACCOUNT_JSON` env var
- Initialize Firebase Admin SDK (singleton)
- Export `getAdminFirestore()`, `getAdminAuth()`, `getAdminStorage()`
- Export helper functions:
  - `adminDeleteDoc(collection, docId)` — delete a single doc
  - `adminDeleteCollection(collectionPath, query)` — batch delete by query
  - `adminGetDoc(collection, docId)` — read a doc for verification
  - `adminQueryDocs(collection, fieldPath, op, value)` — query docs
  - `adminSetDoc(collection, docId, data)` — write a doc for seeding

### 2. Auth Helpers (`tests/e2e/helpers/e2e-auth-helpers.js`)

- `login(page, email, password)` — fill email/password, click sign-in, wait for `/home`
- `logout(page)` — click profile menu → logout, wait for `/login`
- `loginAsOwner(page)` — login with `E2E_OWNER_EMAIL`/`E2E_OWNER_PASSWORD`
- `loginAsEditor(page)` — login with `E2E_EDITOR_EMAIL`/`E2E_EDITOR_PASSWORD`
- `loginAsViewer(page)` — login with `E2E_VIEWER_EMAIL`/`E2E_VIEWER_PASSWORD`
- `getLoggedInUserId(page)` — extract current user UID from app state

### 3. Data Factories (`tests/e2e/helpers/e2e-data-factories.js`)

- `buildSubjectData(overrides)` — return valid subject document shape with defaults:
  - `name: "[E2E-PREFIX] Test Subject <timestamp>"`
  - `status: "active"`
  - `e2eSeed: true`
  - `institutionId` from env
- `buildFolderData(overrides)` — return valid folder document shape
- `buildTopicData(overrides)` — return valid topic document shape
- `buildNotificationData(overrides)` — return valid notification document shape
- All factories include `e2eSeed: true` and unique naming with prefix + timestamp

### 4. Cleanup Registry (`tests/e2e/helpers/e2e-cleanup.js`)

- `CleanupRegistry` class:
  - `register(collection, docId)` — add to cleanup list
  - `registerBatch(collection, docIds)` — add multiple
  - `registerStoragePath(path)` — add storage file for cleanup
  - `executeAll()` — delete all registered entities (Firestore docs + Storage files)
  - `reset()` — clear registry for next test
- Export singleton `cleanup` instance
- Fallback: `sweepE2eSeedData()` — query all collections for `e2eSeed: true` and delete

## Validation Gate

- [ ] All 4 helper modules created and importable
- [ ] Firebase Admin SDK connects to project (test with a simple read)
- [ ] Login helper successfully logs in and navigates to `/home`
- [ ] Cleanup registry correctly deletes a test-created doc
- [ ] `npm run lint` passes for all new files
- [ ] Commit and push completed

## Files Created

- `tests/e2e/helpers/e2e-firebase-admin.js`
- `tests/e2e/helpers/e2e-auth-helpers.js`
- `tests/e2e/helpers/e2e-data-factories.js`
- `tests/e2e/helpers/e2e-cleanup.js`
