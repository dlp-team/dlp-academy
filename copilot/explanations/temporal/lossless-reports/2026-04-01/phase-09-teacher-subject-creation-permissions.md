<!-- copilot/explanations/temporal/lossless-reports/2026-04-01/phase-09-teacher-subject-creation-permissions.md -->

# Lossless Report: Phase 09 Teacher Subject Creation Permissions

## Requested Scope
Implement phase 09 from the active audit-remediation plan:
- make teacher subject creation configurable per institution,
- enforce policy in app logic and Firestore rules,
- add/update tests,
- keep non-requested behavior intact.

## Preserved Behaviors
- Students still cannot create subjects.
- Institution admins and global admins retain subject creation ability.
- Existing teacher policy flags (`canAssignClassesAndStudents`, `canDeleteSubjectsWithStudents`) remain intact.
- Existing invite governance and subject access behavior remain unchanged.
- Existing modal-first invite removal confirmation behavior remains unchanged.

## Touched Files
- `src/utils/institutionPolicyUtils.ts`
- `src/utils/permissionUtils.ts`
- `src/hooks/useSubjects.ts`
- `src/pages/Home/hooks/useHomeLogic.ts`
- `src/pages/Home/hooks/useHomeCreationGuards.ts`
- `src/pages/Home/Home.tsx`
- `src/hooks/useHomeHandlers.ts`
- `src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx`
- `firestore.rules`
- `tests/unit/utils/permissionUtils.test.js`
- `tests/unit/hooks/useHomeCreationGuards.test.js`
- `tests/unit/hooks/useSubjects.test.js`
- `tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx`
- `tests/rules/firestore.rules.test.js`
- `copilot/plans/active/audit-remediation-and-completion/README.md`
- `copilot/plans/active/audit-remediation-and-completion/strategy-roadmap.md`
- `copilot/plans/active/audit-remediation-and-completion/phases/phase-09-teacher-subject-creation-permissions.md`

## Per-File Verification Notes
- Policy defaults + helper added without removing existing teacher policy fields.
- Permission utility updated with backward-compatible second argument and teacher-only policy gate.
- Subject creation now blocks teacher path when institution policy disables autonomous creation.
- Home coordinator now receives and applies policy-aware creation state.
- Home save flow now exposes policy-specific denial message while preserving generic fallback for other errors.
- Institution admin panel now includes policy toggle and uses existing policy save path.
- Firestore rules now enforce teacher-create policy using institution document checks.
- Rules and unit tests expanded for allow/deny policy scenarios.

## Validation Summary
- `get_errors` on all touched files: no errors.
- Focused unit suite: passed (`45/45`).
- Rules suite: passed (`49/49`).

## Residual Risks
- Policy preload in hook state is asynchronous; create button visibility may briefly reflect default until policy resolves.
- Behavior remains rule-enforced even if client policy preload is delayed.
