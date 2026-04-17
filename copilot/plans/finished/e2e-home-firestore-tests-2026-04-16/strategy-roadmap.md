<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/strategy-roadmap.md -->
# Strategy Roadmap — E2E Home Firestore Tests

**Source of Truth** for phased execution. Updated after each phase completion.

---

## Execution Strategy

### Approach: Bottom-Up Infrastructure First

1. Build reusable test infrastructure (helpers, factories, cleanup) → Phase 1
2. Test individual CRUD operations in isolation → Phases 2-3
3. Layer on multi-user interactions (sharing, permissions) → Phase 4
4. Test composite operations (bulk, advanced) → Phases 5-6
5. Optimize, centralize, validate → Phase 7
6. Continue autopilot checklist finalization → Phase 8

### Test File Architecture

```
tests/e2e/
├── helpers/
│   ├── e2e-firebase-admin.js       # Firebase Admin SDK init + helpers
│   ├── e2e-auth-helpers.js         # Login/logout utilities
│   ├── e2e-data-factories.js       # Test data builders (subjects, folders, etc.)
│   └── e2e-cleanup.js              # Cleanup registry + teardown functions
├── home-subject-crud.spec.js       # Phase 2: Subject CRUD
├── home-folder-crud.spec.js        # Phase 3: Folder CRUD
├── home-sharing-operations.spec.js # Phase 4: Sharing & permissions
├── home-bulk-operations.spec.js    # Phase 5: Bulk operations
└── home-advanced-operations.spec.js # Phase 6: Invite codes, deep copy, DnD, notifications
```

### Data Isolation Strategy

Each test file uses a **unique prefix** for all created entities:
- `[E2E-SUBJ-CRUD]` prefix for subject CRUD tests
- `[E2E-FOLD-CRUD]` prefix for folder CRUD tests
- `[E2E-SHARE]` prefix for sharing tests
- `[E2E-BULK]` prefix for bulk operation tests
- `[E2E-ADV]` prefix for advanced operation tests

All entities also tagged with `e2eSeed: true` field for emergency manual cleanup.

### Cleanup Architecture

```
1. beforeAll: Seed fixtures via Firebase Admin SDK
2. Each test: Create test-specific data with unique IDs
3. afterEach: Register created IDs in cleanup registry
4. afterAll: Execute cleanup registry (delete all created entities)
5. Fallback: If afterAll fails, e2eSeed: true enables manual query-based cleanup
```

---

## Phase Completion Tracker

| Phase | Name | Status | Gate | Notes |
|-------|------|--------|------|-------|
| 1 | Test Infrastructure | `todo` | Helpers importable, Firebase Admin connected | — |
| 2 | Subject CRUD | `todo` | All subject CRUD tests green, cleanup verified | Depends on Phase 1 |
| 3 | Folder CRUD | `todo` | All folder CRUD tests green, cleanup verified | Depends on Phase 1 |
| 4 | Sharing & Permissions | `todo` | Multi-account sharing tests green | Depends on Phases 1-2 |
| 5 | Bulk Operations | `todo` | Bulk select/move/delete tests green | Depends on Phases 1-3 |
| 6 | Advanced Operations | `todo` | Invite, deep copy, DnD, notification tests green | Depends on Phases 1-3 |
| 7 | Optimization & Final | `todo` | Lint clean, all tests green, no duplication | Depends on Phases 1-6 |
| 8 | Autopilot Continuation | `todo` | Checklist Step 16+ complete | Depends on Phase 7 |

---

## Dependencies

### Technical
- Firebase Admin SDK (`firebase-admin` in devDependencies)
- Playwright test runner
- `.env` with all E2E test account variables

### Environment Variables Required (Existing)
- `E2E_EMAIL` / `E2E_PASSWORD` — primary test account
- `E2E_OWNER_EMAIL` / `E2E_OWNER_PASSWORD` — content owner account
- `E2E_EDITOR_EMAIL` / `E2E_EDITOR_PASSWORD` — editor role account
- `E2E_VIEWER_EMAIL` / `E2E_VIEWER_PASSWORD` — viewer role account
- `E2E_RUN_MUTATIONS` — gates mutating test execution
- `E2E_INSTITUTION_ID` — institution context for multi-tenant scoping
- `FIREBASE_SERVICE_ACCOUNT_JSON` — admin SDK credentials

### Environment Variables Required (Potentially New)
- User may need to create dedicated test accounts if existing ones conflict
- See [user-updates.md](user-updates.md) for any new variables needed

---

## Risk Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firestore propagation delay | Tests see stale data | Use `page.waitForSelector()` + retry patterns; add small `waitForTimeout` where needed |
| Cleanup failure leaves orphans | Firestore data pollution | Double cleanup: afterAll + e2eSeed marker for manual sweep |
| Parallel test interference | Shared data corruption | Unique prefixes per test file; no shared mutable state |
| Missing env vars | Tests fail or skip | Graceful `test.skip()` with clear message; document all vars |
| Firebase quota limits | Rate limiting during suite | Batch cleanup operations; limit parallel test workers for mutation tests |
