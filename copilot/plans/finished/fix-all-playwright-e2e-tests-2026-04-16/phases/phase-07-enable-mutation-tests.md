<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/phases/phase-07-enable-mutation-tests.md -->
# Phase 7: Enable & Fix Mutation-Gated Tests

**Status:** `todo`
**Tests:** 37 tests across 6 files
**Depends on:** Phases 1-6

---

## Overview

These tests are gated by `E2E_RUN_MUTATIONS=true` because they create, modify, and delete Firestore data. They are currently skipped by design. To run them:

```powershell
$env:E2E_RUN_MUTATIONS="true"
npx playwright test <file> --reporter=list
```

## Test Files

### home-subject-crud.spec.ts (6 tests)
| Test | Description |
|------|-------------|
| create a new subject via the UI | Creates subject via modal |
| update subject name via edit modal | Renames a subject |
| soft-delete a subject (move to trash) | Moves subject to trash |
| restore a trashed subject from the bin view | Restores from bin |
| mark a subject as completed | Changes subject status |
| join a subject via invite code | Joins via invite code |

**Requirements:**
- `E2E_OWNER_EMAIL`/`E2E_OWNER_PASSWORD` — for subject CRUD
- `FIREBASE_SERVICE_ACCOUNT_JSON` — for Admin SDK seeding and cleanup
- Cleanup registry in `e2e-cleanup.ts` ensures test data is removed

### home-folder-crud.spec.ts (8 tests)
| Test | Description |
|------|-------------|
| create a new folder via the UI | Creates folder via modal |
| create a nested subfolder | Creates subfolder inside folder |
| rename a folder via the edit modal | Renames folder |
| soft-delete a folder (move to trash) | Moves folder to trash |
| restore a trashed folder from the bin view | Restores from bin |
| deleting a folder moves child subjects to root | Verifies child promotion |
| seed subject inside a folder and verify containment | Validates folder containment |
| navigate into nested folders and back | Tests breadcrumb navigation |

### home-sharing-operations.spec.ts (9 tests)
| Test | Description |
|------|-------------|
| editor can see a subject shared with them | Sharing visibility |
| viewer can see a subject shared with them | Sharing visibility |
| owner shares a subject via edit modal | Share flow |
| owner removes a shared user via Firestore | Unshare flow |
| editor can see a folder shared with them | Folder sharing |
| unsharing a folder removes it from shared view | Unshare folder |
| transfer subject ownership via Firestore | Ownership transfer |
| editor cannot delete a subject they do not own | Permission check |
| viewer sees shared subject but cannot edit | Permission check |

### home-bulk-operations.spec.ts (6 tests)
| Test | Description |
|------|-------------|
| enter and exit selection mode | Selection UI |
| select multiple subjects in selection mode | Multi-select |
| bulk delete moves selected subjects to trash | Bulk trash |
| bulk move selected subjects into a folder | Bulk move |
| create a new folder from selected subjects | Bulk create folder |
| bulk move subjects from folder back to root | Bulk root move |

### home-advanced-operations.spec.ts (7 tests)
| Test | Description |
|------|-------------|
| sharing creates a notification for recipient | Notification on share |
| notification is marked as read after viewing | Read status update |
| subject with invite code is joinable | Invite code flow |
| keyboard Ctrl+C/V creates a copy | Deep copy |
| shortcut for a shared subject appears in Home | Shortcut creation |
| deleting a shortcut removes subject from shared Home | Shortcut deletion |
| permanent delete removes a subject from Firestore | Hard delete |

### study-flow.spec.js (1 test)
| Test | Description |
|------|-------------|
| create flow surfaces are available | Verifies create UI elements |

## Implementation Steps

1. Set `E2E_RUN_MUTATIONS=true`
2. Run each file individually:
   ```
   npx playwright test tests/e2e/home-subject-crud.spec.ts --reporter=list
   ```
3. For each failure:
   - Check if it's a login/email issue (should be fixed by Phase 1)
   - Check if UI selectors match current elements
   - Check if Firestore seeding works correctly
   - Check if cleanup runs properly
4. Fix selector mismatches and timing issues
5. Run all mutation tests together to verify no conflicts

## Validation Checklist

- [ ] home-subject-crud.spec.ts — 6/6 pass
- [ ] home-folder-crud.spec.ts — 8/8 pass
- [ ] home-sharing-operations.spec.ts — 9/9 pass
- [ ] home-bulk-operations.spec.ts — 6/6 pass
- [ ] home-advanced-operations.spec.ts — 7/7 pass
- [ ] study-flow.spec.js — 1/1 pass
- [ ] All cleanup registries execute properly (no orphaned data)
