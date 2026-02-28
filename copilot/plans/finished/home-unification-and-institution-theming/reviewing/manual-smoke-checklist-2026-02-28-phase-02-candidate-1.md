# Manual Smoke Checklist — 2026-02-28 — Phase 02 Candidate 1

## Preconditions
- User has both owned and shared entities in Home.
- User has at least one shortcut entity visible in Home.

## Test matrix

### 1) Grid view, root level
- [ ] With `sharedScopeSelected = true`, note visible folder/subject totals.
- [ ] With `sharedScopeSelected = false`, verify shared entities are excluded exactly as before.
- [ ] Toggle back to `true` and verify totals return.

### 2) Grid view, inside folder
- [ ] Navigate into a folder and repeat shared scope toggle checks.
- [ ] Confirm no unexpected empty state when entities should remain visible.

### 3) Shared-related semantics
- [ ] Shortcut entries visible for non-owner path remain visible when expected.
- [ ] Items owned by current user are not treated as shared in exclusion flow.
- [ ] Subject with `isShared !== true` is not treated as shared.

### 4) Regression sanity
- [ ] Tag filtering still works in combination with shared scope toggle.
- [ ] No console errors during the above interactions.

## Sign-off
- Reviewer:
- Date/time:
- Outcome: PASS / FAIL
- Notes:
