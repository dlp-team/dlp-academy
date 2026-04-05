<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-03-settings-and-automation-block-a.md -->
# Lossless Report - Phase 03 Settings and Automation Block A

## 1. Requested Scope
- Start Phase 03 with a low-risk institution settings slice.
- Add institution-level automation toggles for transfer/promotion and subject lifecycle automation.
- Gate transfer/promotion tooling in Institution Admin organization UI.
- Enforce transfer toggle deny-path in callable dry-run/apply handlers.
- Add deterministic tests for settings persistence and toggle enforcement.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No changes to transfer rollback callable behavior, preserving recovery path even when transfer automation is disabled.
- No changes to non-transfer Institution Admin workflows (users/customization tabs, bin actions, CSV import pipeline).
- No schema-breaking rewrites; missing automation settings default to enabled for backward compatibility.

## 3. Touched Files
- [functions/security/institutionAutomationSettings.js](functions/security/institutionAutomationSettings.js)
- [functions/security/transferPromotionDryRunHandler.js](functions/security/transferPromotionDryRunHandler.js)
- [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js)
- [src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts](src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts)
- [src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx](src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx)
- [src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx](src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx)
- [src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx](src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx)
- [tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx](tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx)
- [tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx](tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx)
- [tests/unit/functions/transfer-promotion-dry-run-handler.test.js](tests/unit/functions/transfer-promotion-dry-run-handler.test.js)
- [tests/unit/functions/transfer-promotion-apply-handler.test.js](tests/unit/functions/transfer-promotion-apply-handler.test.js)
- [tests/unit/functions/transfer-promotion-roundtrip.test.js](tests/unit/functions/transfer-promotion-roundtrip.test.js)

## 4. Per-File Verification
- Settings hook now normalizes and persists automation toggles under `institutions/{institutionId}.automationSettings` without destructive payload rewrites.
- Settings tab now exposes two Spanish-language toggle controls aligned with existing institutional configuration UI.
- Organization tab transfer trigger now respects institution toggle state and prevents modal entry when disabled.
- Transfer dry-run/apply handlers now enforce institution-level toggle before processing mappings/writes.
- Test suites cover both enabled and disabled toggle paths at UI and callable layers.

## 5. Risks and Checks
- Risk: institution admins lose recovery capability if apply/rollback share strict toggle enforcement.
  - Check: toggle enforcement applied to dry-run and apply only; rollback path intentionally untouched for operational recovery.
- Risk: legacy institutions missing new fields fail closed unexpectedly.
  - Check: normalization defaults missing automation flags to `true` in both frontend and backend.

## 6. Validation Summary
- Targeted suite:
  - `npm run test -- tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/functions/transfer-promotion-roundtrip.test.js` -> PASS (5 files, 13 tests).
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` across all touched source/test files -> No errors found.
