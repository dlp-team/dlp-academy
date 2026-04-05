<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.md -->
# UsersTabContent.deleteUserGuard.test.jsx

## Overview
- Source file: `tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx`
- Last documented: 2026-04-05
- Role: Regression coverage for users-tab delete-user confirmation and guarded-error feedback.

## Coverage
- Ensures deleting a teacher requires explicit modal confirmation before mutation.
- Verifies delete action button does not trigger row-navigation click handlers.
- Verifies successful teacher deletion shows inline success feedback.
- Verifies blocked student deletion (active classes) surfaces guard-specific inline error feedback.

## Changelog
- 2026-04-05: Added initial users-tab delete-user guardrail suite for explicit confirm + blocked-path messaging.
