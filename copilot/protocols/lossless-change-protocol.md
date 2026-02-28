# Lossless Change Protocol

**This protocol must be followed for all changes unless the user explicitly states otherwise. No exceptions are allowed without clear, written instruction.**

## Purpose
Ensure every adjustment is **lossless**: only the requested behavior changes, and no existing feature/property/regression is introduced.

## Non-Negotiable Rules
1. **No scope drift**: change only files and logic required for the request.
2. **Preserve behavior by default**: if a behavior is not explicitly requested, keep it unchanged.
3. **No hidden removals**: never remove props, branches, handlers, filters, permissions, or visual states unless explicitly requested.
4. **Smallest viable diff**: prefer surgical edits over refactors.
5. **Backward compatibility first**: preserve existing keys/contracts unless migration is explicitly requested.

## Mandatory Workflow
### 1) Define exact change surface
- List the specific requested outcomes.
- List explicit out-of-scope behaviors that must stay intact.

### 2) Baseline before editing
- Locate all impacted call sites, handlers, and shared utilities.
- Capture current behavior of adjacent flows (same component family/mode/tab).

### 3) Implement with containment
- Touch only necessary files.
- Keep existing props/state shape unless required.
- Avoid renames and broad reorganizations during feature adjustments.

### 4) Regression self-check (required)
After edits, verify:
- Requested behavior works.
- Adjacent behaviors still work in all relevant modes (grid/list/tree/shared/etc.).
- Permission and visibility rules remain unchanged unless requested.
- Empty/loading/error states still render correctly.

### 5) Validate with tools
- Run diagnostics (`get_errors`) for all touched files.
- If any doubt exists that something may be broken, perform targeted runtime checks immediately.

### 6) Mandatory review artifacts (required)
For every change set, create a **lossless review report** in temporal:
- Path: `copilot/explanations/temporal/lossless-reports/YYYY-MM-DD/<short-task-name>.md`
- Must include:
	1. Requested scope (exactly what was asked)
	2. Out-of-scope behavior explicitly preserved
	3. Touched files list (full relative paths)
	4. **Per-file verification list** (exact checks done for each file)
	5. Risks found + how they were checked
	6. Validation summary (`get_errors` + runtime checks if applicable)

### 7) File-by-file review depth (required)
When using `lossless-change-review-checklist.md`, do not keep it generic.
- For each touched file, explicitly state what was reviewed in that file.
- Use concrete symbols/flows/props/branches (not broad statements).
- Include path + reason + verification result for each file.

## If You Suspect Breakage
If there is any signal (uncertainty, side effects, conflicting logic, duplicated paths) that something may have broken:
1. Stop adding features.
2. Re-check impacted flows and sibling modes.
3. Add/adjust only minimal fixes to restore previous behavior.
4. Re-validate before finalizing.

## Final Delivery Standard
Each change handoff must include:
- What changed (requested only).
- What was explicitly preserved.
- What was verified (including potential break-risk areas).
- Link/reference to the temporal lossless report path created for this change.

## Temporal Cleanup Policy (strict)
Temporal reports are ephemeral but must be preserved long enough for audit.

1. **Never clean without confirmation** from the user.
2. **Never clean before 48 hours (2 days)** from report creation time.
3. Trigger cleanup proposal when either condition is true:
	- Temporal folder is large (recommended threshold: `> 50 files` or `> 5 MB`), or
	- Old reports are older than 2 days.
4. Before asking for cleanup, provide:
	- Current timestamp
	- Candidate files/folders with paths
	- Age of each candidate
	- Why they are safe candidates for cleanup
5. Only delete after explicit user confirmation.

## Review Companion
Use: `copilot/explanations/codebase/src/lossless-change-review-checklist.md`
for concrete codebase checks before finalizing any feature adjustment.
