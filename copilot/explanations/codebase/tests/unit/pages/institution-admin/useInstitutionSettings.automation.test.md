<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.md -->
# useInstitutionSettings.automation.test.jsx

## Overview
- Source file: `tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx`
- Last documented: 2026-04-05
- Role: Deterministic hook-level coverage for institution automation settings in `useInstitutionSettings`.

## Coverage
- Verifies institution automation settings are loaded from Firestore with backward-compatible defaults when fields are missing.
- Verifies save flow persists `automationSettings.transferPromotionEnabled` and `automationSettings.subjectLifecycleAutomationEnabled` in `updateDoc` payload.
- Verifies course hierarchy order is de-duplicated, merged with active course names, and persisted under `courseLifecycle.coursePromotionOrder`.
- Keeps test setup deterministic by mocking Firestore document reads/writes and `serverTimestamp`.

## Changelog
- 2026-04-05: Expanded suite with course-promotion-order merge and persistence coverage for Phase 03 course hierarchy controls.
