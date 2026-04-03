<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.md -->
# UsersTabContent.bulkCourseCsv.test.jsx

## Overview
- Source file: `tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx`
- Last documented: 2026-04-04
- Role: Regression coverage for student CSV bulk-link modal behavior in institution-admin users tab.

## Coverage
- Opens CSV modal from student users view and submits CSV payload through `onBulkLinkStudentsCsv`.
- Verifies summary metrics render after successful CSV processing.
- Verifies inline error feedback when bulk-link handler fails.

## Changelog
- 2026-04-04: Added initial CSV modal interaction suite for Phase 05 bulk-link rollout.
