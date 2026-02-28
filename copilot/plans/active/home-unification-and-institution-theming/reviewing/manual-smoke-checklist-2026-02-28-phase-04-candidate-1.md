# Manual Smoke Checklist — 2026-02-28 — Phase 04 Candidate 1

## Preconditions
- Login user with and without `institutionId`.
- Have at least one folder/subject in Home.
- Optional: add institution token overrides in `institutions/{institutionId}` under one of:
  - `homeThemeTokens`
  - `homeTheme`
  - `settings.homeThemeTokens`
  - `settings.homeTheme`
  - `customization.homeThemeTokens`
  - `customization.homeTheme`
  - `customization.home.tokens`

## Test matrix

### 1) Fallback behavior (no overrides)
- [ ] Open Home in grid/list/shared states.
- [ ] Verify visuals match previous baseline.
- [ ] Open share/unshare/delete modals and validate styling parity.

### 2) Override behavior (with institution overrides)
- [ ] Set one token override (e.g., `mutedTextClass`) and reload.
- [ ] Verify affected surfaces use override while others stay unchanged.
- [ ] Remove override and verify fallback to default is restored.

### 3) Regression sanity
- [ ] No console/runtime errors during navigation and modal flows.
- [ ] No permission/action behavior changes observed.

## Sign-off
- Reviewer:
- Date/time:
- Outcome: PASS / FAIL
- Notes:
