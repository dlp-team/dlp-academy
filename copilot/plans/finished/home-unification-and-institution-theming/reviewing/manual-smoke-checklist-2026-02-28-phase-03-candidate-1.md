# Manual Smoke Checklist — 2026-02-28 — Phase 03 Candidate 1

## Preconditions
- Home has at least one flow that opens each of these modals:
  - Share confirm modal
  - Unshare confirm modal
  - Delete confirm modal

## Test matrix

### 1) Share confirm modal
- [ ] Trigger share mismatch modal.
- [ ] Verify backdrop/card/muted text styling matches baseline.
- [ ] Click outside card to close.
- [ ] Re-open and test cancel/confirm buttons.

### 2) Unshare confirm modal
- [ ] Trigger unshare confirm modal.
- [ ] Verify backdrop/card/muted text styling matches baseline.
- [ ] Click outside card to close.
- [ ] Re-open and test cancel/confirm buttons.

### 3) Delete confirm modal
- [ ] Trigger delete modal (subject/folder and shortcut variant if available).
- [ ] Verify backdrop/card/muted text styling matches baseline.
- [ ] Click outside card to close.
- [ ] Re-open and test cancel/confirm buttons.

### 4) Regression sanity
- [ ] No visual regressions observed in these modals.
- [ ] No console/runtime errors during modal interactions.

## Sign-off
- Reviewer:
- Date/time:
- Outcome: PASS / FAIL
- Notes:
