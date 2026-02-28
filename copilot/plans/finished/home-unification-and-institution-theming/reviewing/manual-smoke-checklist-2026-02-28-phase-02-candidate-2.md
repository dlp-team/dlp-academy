# Manual Smoke Checklist — 2026-02-28 — Phase 02 Candidate 2

## Preconditions
- Home has a mix of originals and shortcuts for folders and subjects.
- At least one nested folder context is available.

## Test matrix

### 1) Root-level merge parity
- [ ] Open Home root and compare visible folder/subject counts vs expected baseline.
- [ ] Verify no duplicate cards/list rows appear when originals + shortcuts exist.

### 2) Current-folder context
- [ ] Enter a folder and confirm displayed items still match expected context.
- [ ] Navigate up/down and confirm merged tree references are stable.

### 3) Shared filter interaction
- [ ] Toggle shared scope and verify filtering behavior is unchanged.
- [ ] Verify merged dataset still honors shared exclusion path.

### 4) Regression sanity
- [ ] Tag filtering still combines correctly with merged datasets.
- [ ] No console errors during navigation/filter toggles.

## Sign-off
- Reviewer:
- Date/time:
- Outcome: PASS / FAIL
- Notes:
