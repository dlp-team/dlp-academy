<!-- copilot/explanations/codebase/tests/e2e/notifications.spec.md -->
# notifications.spec.js

## Overview
- Source file: `tests/e2e/notifications.spec.js`
- Last documented: 2026-04-04
- Role: Browser-level coverage for notifications panel handoff to dedicated notifications route.

## Execution Gates
- `E2E_EMAIL` and `E2E_PASSWORD` are required to run this suite.

## Coverage
- Logs in using standard E2E credentials.
- Opens bell panel from header mailbox trigger.
- Validates `Ver todas` action navigates to `/notifications`.
- Validates dedicated notifications page heading is rendered.
