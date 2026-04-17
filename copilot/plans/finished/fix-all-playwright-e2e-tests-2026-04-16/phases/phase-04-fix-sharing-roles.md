<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/phases/phase-04-fix-sharing-roles.md -->
# Phase 4: Fix Home Sharing Roles Tests

**Status:** `todo`
**Tests:** 6 tests in `home-sharing-roles.spec.js`
**Depends on:** Phase 1

---

## Tests in This Phase

| Test | Failure | Expected Fix |
|------|---------|-------------|
| owner can open shared tab and render shared surface | `.home-page` not found | Phase 1 auto-fix |
| editor can create content inside designated shared folder | `.home-page` not found | Phase 1 auto-fix |
| viewer cannot create content inside designated shared folder | `.home-page` not found | Phase 1 auto-fix |
| editor drag-drop nests folder and updates current view state | `.home-page` not found | Phase 1 auto-fix |
| viewer does not expose draggable cards in designated shared folder | `.home-page` not found | Phase 1 auto-fix |
| editor can create and delete a subject inside designated shared folder | `.home-page` not found | Phase 1 auto-fix |

## Dependencies

These tests require:
- `E2E_OWNER_EMAIL` / `E2E_OWNER_PASSWORD`
- `E2E_EDITOR_EMAIL` / `E2E_EDITOR_PASSWORD`
- `E2E_VIEWER_EMAIL` / `E2E_VIEWER_PASSWORD`
- `E2E_SHARED_FOLDER_ID` — Pre-existing shared folder in Firestore
- `FIREBASE_SERVICE_ACCOUNT_JSON` — For Admin SDK seeding

## Potential Issues After Phase 1

1. **Shared folder may not exist** — `E2E_SHARED_FOLDER_ID` must point to a valid folder
2. **Drag-and-drop tests** — May need specific element selectors
3. **Permission assertions** — Verify editor/viewer capabilities match test expectations

## Validation Checklist

- [ ] All 6 home-sharing-roles tests pass
- [ ] Shared tab renders for owner
- [ ] Editor can create content
- [ ] Viewer cannot create content
- [ ] Drag-drop works for editor
- [ ] Viewer cards are not draggable
