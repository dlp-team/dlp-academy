# Lossless Change Review Checklist

Use this checklist whenever a feature is adjusted to avoid accidental regressions.

## Report requirements (mandatory)
- [ ] Create a temporal report for this change in: `copilot/explanations/temporal/lossless-reports/YYYY-MM-DD/<short-task-name>.md`
- [ ] Include report timestamp (date + time).
- [ ] Include touched file paths and exact review points per file.

## 1) Requested scope only
- [ ] Confirm the exact requested behavior change is implemented.
- [ ] Confirm no unrelated UX/features were added/removed.

## 2) High-risk regression areas
- [ ] Props passed through wrappers still include all prior keys.
- [ ] Shared utility contracts (payload keys, parser outputs, ids) are unchanged unless requested.
- [ ] Permission logic (owner/editor/viewer/shortcut/shared-folder rules) still matches previous behavior.
- [ ] Filters/search/sorting still work across all relevant views and layers.
- [ ] Overlay/menu positioning changes did not break click/close/focus behavior.
- [ ] Empty-state changes did not remove create actions where permitted.

## 3) Mode parity
Validate each affected component in every relevant mode:
- [ ] Grid
- [ ] List
- [ ] Shared
- [ ] Nested/tree path (if applicable)

## 4) Action safety
- [ ] Edit flows preserve existing fields not targeted by the change.
- [ ] Delete/unshare/hide actions still trigger the same intended branch.
- [ ] Drag/drop and shortcut behavior still preserve position/identity unless explicitly changed.

## 5) Data integrity
- [ ] Saved payload includes all expected fields.
- [ ] No field was unintentionally reset/omitted.
- [ ] Existing records still render with old and new shapes.

## 6) Verification before handoff
- [ ] `get_errors` run on all touched files.
- [ ] Manual smoke checks done for impacted user flow(s).
- [ ] Any suspected breakage was re-tested and fixed before finalization.

## 7) Per-file verification log (required)
Use this format in the temporal report for every touched file:

```markdown
### File: <relative/path/to/file>
- Why touched: <requested reason>
- Reviewed items:
	- <symbol/branch/prop/handler> -> <what was verified>
	- <symbol/branch/prop/handler> -> <what was verified>
- Result: ✅ preserved / ⚠️ adjusted intentionally
```

Minimum expected reviewed items per file:
- Entry points (handlers/callbacks)
- Conditional branches (permissions, mode, filter)
- Data contracts (payload keys, props, return shape)
- UI states (empty/loading/error/action visibility)

## What to review first if something feels broken
1. Recently touched shared hooks/utilities.
2. Conditional branches for mode/permission checks.
3. Parent-to-child prop pass-through.
4. Fallback paths (empty, loading, error, no permission).

## Expected handoff note format
- **Changed:** exact requested items.
- **Preserved:** critical adjacent behaviors confirmed unchanged.
- **Verified:** files/modes/flows checked.
- **Temporal report:** include exact path to the report file.

## Temporal retention + cleanup
- Keep temporal reports for at least **48 hours**.
- If temporal is too large or older reports exceed retention, ask before cleanup.
- Cleanup request must include: current time, candidate paths, age, and reason.
