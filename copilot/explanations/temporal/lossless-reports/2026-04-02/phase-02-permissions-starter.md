<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-02-permissions-starter.md -->

# Lossless Review Report

- Timestamp: 2026-04-02 12:30 local
- Task: Phase 02 starter - permissions and upload reliability
- Request summary: Start the new mega-plan and begin implementation, prioritizing reported permission failures and deletion reliability symptoms.

## 1) Requested scope
- Fix teacher subject creation permission-denied flow tied to invite-code transaction path.
- Fix institution icon upload 403 unauthorized path without weakening multi-tenant boundaries.
- Start resolving silent subject deletion issues for institution admins.
- Create and start a full protocol-compliant plan package.

## 2) Out-of-scope preserved
- No broad redesign of Home, Institution Admin, or Admin dashboards in this slice.
- No schema migration for academic year/course lifecycle in this slice.
- No deployment commands executed.
- No changes to storage rule scope broadening (kept least-privilege model).

## 3) Touched files
- firestore.rules
- functions/index.js
- src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts
- src/hooks/useHomeHandlers.ts
- tests/rules/firestore.rules.test.js
- tests/unit/hooks/useHomeHandlers.shortcuts.test.js
- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/README.md
- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/strategy-roadmap.md
- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-01-discovery-dependency-graph-and-architecture-decisions.md
- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-02-access-control-reliability-recovery-firestore-storage.md
- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/working/execution-log-2026-04-02.md
- copilot/explanations/codebase/firestore.rules.md
- copilot/explanations/codebase/src/hooks/useHomeHandlers.md
- copilot/explanations/codebase/tests/rules/firestore.rules.test.md
- copilot/explanations/codebase/tests/unit/hooks/useHomeHandlers.shortcuts.test.md
- copilot/explanations/codebase/functions/index.md
- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useCustomization.md

## 4) Per-file verification (required)
### File: firestore.rules
- Why touched: teacher subject creation was failing at invite-code preflight and transaction create path.
- Reviewed items:
  - subjectInviteCodes allow create -> switched to existsAfter/getAfter for same-batch subject + invite reservation.
  - subjectInviteCodes allow get -> allowed missing-doc preflight only for non-student same-institution key patterns.
- Result: ⚠️ adjusted intentionally.

### File: functions/index.js
- Why touched: Storage rules depend on token claims, but claims sync path was missing.
- Reviewed items:
  - new callable syncCurrentUserClaims authentication gate.
  - claim normalization and preservation of unrelated existing claims.
- Result: ⚠️ adjusted intentionally.

### File: src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts
- Why touched: icon/logo upload was failing with storage unauthorized.
- Reviewed items:
  - pre-upload claim sync + token refresh path.
  - one retry for storage/unauthorized while preserving existing messaging flow.
- Result: ⚠️ adjusted intentionally.

### File: src/hooks/useHomeHandlers.ts
- Why touched: subject deletion for institution admin was effectively silent-blocked by owner-only gate.
- Reviewed items:
  - handleDelete subject permission gate now allows same-institution institution admin and global admin.
  - unauthorized branch now sets explicit error message in delete config.
- Result: ⚠️ adjusted intentionally.

### File: tests/rules/firestore.rules.test.js
- Why touched: add regression coverage for updated invite-code rule behavior.
- Reviewed items:
  - missing-doc preflight allow/deny tests by institution scope.
  - same-batch subject + invite reservation success test.
- Result: ⚠️ adjusted intentionally.

### File: tests/unit/hooks/useHomeHandlers.shortcuts.test.js
- Why touched: align assertions with new delete feedback flow and institution-admin delete permissions.
- Reviewed items:
  - non-owner feedback assertion switched from silent close to error updater expectation.
  - institution-admin same-institution allow and cross-institution deny tests added.
- Result: ⚠️ adjusted intentionally.

### File: copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/*
- Why touched: lifecycle synchronization and phase transition evidence.
- Reviewed items:
  - Phase 01 marked completed, Phase 02 marked in progress.
  - README current phase and roadmap immediate-next actions updated.
- Result: ⚠️ adjusted intentionally.

### File: copilot/explanations/codebase/* (updated/new)
- Why touched: mandatory docs sync after implementation changes.
- Reviewed items:
  - changelog entries appended to existing file mirrors.
  - new mirrors created for functions/index.js and useCustomization.ts where missing.
- Result: ⚠️ adjusted intentionally.

## 5) Risk checks
- Potential risk: invite-code preflight could leak cross-tenant key probing.
- Mitigation check: same-institution key pattern required for missing-doc get; cross-institution test added and denied.
- Outcome: accepted with bounded exposure and preserved tenant deny path.

- Potential risk: callable claims sync could permit privilege escalation.
- Mitigation check: callable only syncs from caller's own users/{uid} doc; role normalization constrained to known roles.
- Outcome: accepted with least-privilege profile-derived claims path.

- Potential risk: institution-admin delete path may bypass owner constraints too broadly.
- Mitigation check: allowed only when subject institution matches user institution; cross-institution unit deny test added.
- Outcome: accepted and bounded.

## 6) Validation summary
- Diagnostics: get_errors clean for all touched source/test/rules files.
- Runtime checks:
  - Passed: npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js
  - Failed to execute (environment): rules tests require emulator startup config; direct rules run fails with missing emulator host/port.
  - Emulator attempt failed with: No emulators to start (workspace not initialized for emulator startup).
  - Passed: npm run lint (0 errors, 4 pre-existing warnings out of scope).
  - Passed: npx tsc --noEmit.

## 7) Cleanup metadata
- Keep until: 2026-04-04 12:30 local
- Cleanup candidate after: 2026-04-04 12:31 local
- Note: cleanup requires explicit user confirmation.
