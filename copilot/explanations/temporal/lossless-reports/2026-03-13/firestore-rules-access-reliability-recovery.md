// copilot/explanations/temporal/lossless-reports/2026-03-13/firestore-rules-access-reliability-recovery.md

## Lossless Change Report: Firestore Rules Access Reliability Recovery

### Date: March 13, 2026

#### Requested Scope
- Reproduce editor-role post-login flows after .env password fix
- Validate Home selection mode, Firestore rules, and permission flows
- Ensure no regressions in UI or backend

#### Preserved Behaviors
- All Home selection mode UI logic (selection, border, spacing, auto-exit)
- Firestore rules for drag/drop, delete, sharing, and access control
- Owner/viewer/editor role flows

#### Touched Files
- .env (password value quoted)
- src/pages/Home/Home.jsx
- src/pages/Home/components/HomeSelectionToolbar.jsx
- firestore.rules

#### Per-File Verification
- Home.jsx: No errors, selection mode works, auto-exit confirmed
- HomeSelectionToolbar.jsx: No errors, border and spacing correct
- firestore.rules: No errors, delete predicate hardened, all tests pass
- firestore.rules.test.js: Added regression coverage for invite delete when `email` is missing; suite green
- home-sharing-roles.spec.js: Added strict shared-role checks (viewer deny, editor drag-drop state change, editor create/delete flow)
- firestore.rules (follow-up): Fixed legacy-subject update guard so folder moves no longer fail when creation-era fields are absent.
- firestore.rules.test.js (follow-up): Added regression test for legacy subject move/update permissions.
- .env: Password value quoted, editor login now works

#### Validation Summary
- Focused E2E: `tests/e2e/home-sharing-roles.spec.js` → 6/6 passed
- Broader E2E checkpoint: selected permission-sensitive specs → 19/21 passed, 2 skipped
- Full E2E checkpoint: 31 passed, 4 skipped (documented in review log)
- Emulator rules suite: 41/41 passed
- No compile errors in critical files
- Playwright HTML report available at http://localhost:9323
- Compile warnings (non-blocking): setState in effect (SubjectCardFront.jsx, Header.jsx), unused variable (SubjectListItem.jsx)

#### Next Steps
- Plan lifecycle completed in `copilot/plans/finished/firestore-rules-access-reliability-recovery`
- Keep optional follow-up for unrelated skipped e2e suites outside this plan scope

---
