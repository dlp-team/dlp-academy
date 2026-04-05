<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-1-tests.md -->
# Lossless Report - Phase 04 Preview Parity Block C Slice 1 Tests

## 1. Requested Scope
- Continue Phase 04 Block C by hardening deterministic parity coverage for the newly added preview header shell.
- Add focused assertions for role-aware preview header composition without changing runtime behavior.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No changes to preview component runtime logic in this slice.
- No changes to fullscreen behavior introduced in Blocks A and B.
- No changes to topic/resource/bin mock data behavior in this slice.

## 3. Touched Files
- [tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx](tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx)

## 4. Per-File Verification
- Added teacher-context assertion path with fallback institution identity and header action visibility.
- Added student-context assertion path to verify role subtitle and avatar marker changes.
- Kept assertions deterministic by targeting stable text/labels instead of timing-dependent behavior.

## 5. Risks and Checks
- Risk: brittle assertions coupled to icon implementation details.
  - Check: tests assert semantic text/labels and avatar marker content only.
- Risk: missing integration confidence after adding focused unit coverage.
  - Check: reran existing integration-like preview suite in addition to new test file.

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` for new test file -> No errors found.
