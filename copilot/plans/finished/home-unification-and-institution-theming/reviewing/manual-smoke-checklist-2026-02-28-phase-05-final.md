# Manual Smoke Checklist — 2026-02-28 — Phase 05 Final

## Scope
Validate no-regression behavior across Home manual/shared flows and institution-theme fallback paths.

## Scenario matrix

### A) Baseline mode (no institution overrides)
- [ ] Open Home in grid mode and list mode.
- [ ] Confirm create cards and empty states look unchanged.
- [ ] Confirm shared view empty/message styling looks unchanged.

### B) Modal flows
- [ ] Trigger share confirmation modal and verify close/cancel/confirm actions.
- [ ] Trigger unshare confirmation modal and verify close/cancel/confirm actions.
- [ ] Trigger delete confirmation modal and verify close/cancel/confirm actions.

### C) Institution overrides active
- [ ] Add one valid token override in institution document.
- [ ] Reload Home and confirm only targeted tokenized surfaces are affected.
- [ ] Remove override and confirm fallback to default classes.

### D) Safety checks
- [ ] Confirm no runtime console errors during interactions.
- [ ] Confirm permission-based actions remain unchanged.

## Sign-off
- Reviewer:
- Date/time:
- Outcome: PASS / FAIL
- Notes:
