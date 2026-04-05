<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.md -->
# useInstitutionSettings.automation.test.jsx

## Overview
- Source file: `tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx`
- Last documented: 2026-04-05
- Role: Deterministic hook-level coverage for institution automation settings in `useInstitutionSettings`.

## Coverage
- Verifies institution automation settings are loaded from Firestore with backward-compatible defaults when fields are missing.
- Verifies save flow persists `automationSettings.transferPromotionEnabled` and `automationSettings.subjectLifecycleAutomationEnabled` in `updateDoc` payload.
- Keeps test setup deterministic by mocking Firestore document reads/writes and `serverTimestamp`.

## Changelog
- 2026-04-05: Added new test suite for automation settings read/write behavior introduced in Phase 03 Block A.
