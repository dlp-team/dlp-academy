# Reviewing — Deep Risk Analysis

> Completed: 2026-04-28 — All phases 1-7 finalized on `feature/new-features-2026-04-12`

## Optimization Checklist
- [x] Repeated logic centralized/unified — No new duplicated logic was introduced across phases 1-6. All changes were surgical.
- [x] Oversized files split — No files grew beyond ~500 lines due to our changes. `BinView.tsx` was pre-existing at ~1052 lines (logged as out-of-scope).
- [x] Readability improved where needed — Phase 5 fix renamed internal helper with `maxNodes` param for clarity.
- [x] `npm run lint` passes with 0 errors — Verified 2026-04-28.
- [x] Tests re-validated after optimization — Phase 1 regression in `ClassesCoursesSection.deleteConfirm.test.jsx` fixed in this phase.

## Risk Analysis

### Security & Permissions

| Phase | Change | Risk Level | Notes |
|-------|--------|------------|-------|
| Phase 1 | Institution admin UI fixes (filters, tabs) | Low | Display-only fixes. No new data queries. No permission changes. |
| Phase 2 | BinView toolbar repositioned | Low | Pure UI restructure. No Firestore writes added. |
| Phase 2 | Settings header slider default -> false | Low | Client-side default only. No auth or data change. |
| Phase 2 | Profile admin stats panel | Medium | Reads institution stats. `useAdminProfileStats` scopes by `institutionId`; Admin/InstitutionAdmin only. |
| Phase 3 | Scrollbar class additions (9 files) | Low | CSS-only. Zero security impact. |
| Phase 4 | Email verification (pre-existing) | Medium | Not modified by this plan. Pre-existing guard in `App.tsx` blocks unverified users. |
| Phase 5 | Ghost drag max-nodes fix | Low | UI-only. No Firestore writes. No auth changes. |
| Phase 6 | Copilot docs (markdown only) | Low | No code. Documentation only. |

Overall security risk: Low. No new Firestore writes, no new queries, no auth changes.

### Data Integrity

- No Firestore write operations were added or modified in phases 1-6.
- Phase 5 changes how companion nodes are staged locally before drag preview, but do not alter persisted data writes.
- Phase 2 profile stats panel is read-only.
- Verdict: no data integrity risk introduced.

### Auth (Phase 4 — Email Verification)

- Phase 4 was pre-existing and was only verified, not implemented, in this plan.
- `sendEmailVerification` on register: present.
- `result.user.emailVerified` check on login: present.
- Route guard in `App.tsx` redirecting unverified users: present.
- Risk: users registered before enforcement may require verification before normal access. This is expected policy behavior.
- Verdict: no regression introduced by this plan.

### Runtime Failure Modes

| Scenario | Impact | Mitigation |
|----------|--------|------------|
| Firebase email service degraded | New registrations may not receive verification emails quickly | Existing flow allows resend and verification route guidance |
| Ghost drag companion staging fails | Multi-item visual ghost may degrade to partial preview | Core drag still functions; failure is local UI-only |
| Profile stats query fails | Admin stats panel may show empty/error state | Existing hook-level error handling patterns apply |
| BinView empty with filters active | Users may see no rows | Empty state messaging remains rendered |

### Cross-Role Regression

- Institution-admin changes are scoped to `InstitutionAdminDashboard` views.
- BinView structure changes are role-agnostic and UI-only.
- Settings default change is global UI state only.
- Profile stats panel only renders for admin/institutionadmin roles.
- Scrollbar changes are CSS-only and role-neutral.
- Ghost drag fix is role-neutral and does not alter authorization logic.
- Verdict: no cross-role regression identified.

## Out-of-Scope Risks Logged

- [copilot/plans/out-of-scope-risk-log.md](copilot/plans/out-of-scope-risk-log.md) — pre-existing oversized `BinView.tsx` refactor risk.
