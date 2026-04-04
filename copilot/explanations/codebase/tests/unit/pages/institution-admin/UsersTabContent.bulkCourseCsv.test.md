<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.md -->
# UsersTabContent.bulkCourseCsv.test.jsx

## Overview
- Source file: `tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx`
- Last documented: 2026-04-04
- Role: Regression coverage for student CSV import workflow entrypoint behavior in institution-admin users tab.

## Coverage
- Opens the `Vincular alumnos por CSV` workflow from student users view.
- Verifies manual-import callback delegation from the shared workflow modal.
- Verifies n8n-import callback delegation from the shared workflow modal.

## Changelog
- 2026-04-04: Updated suite to cover renamed student CSV action and callback delegation for manual + n8n execution branches.
- 2026-04-04: Added initial CSV modal interaction suite for Phase 05 bulk-link rollout.
