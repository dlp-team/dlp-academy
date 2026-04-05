<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/userDeletionGuard.test.md -->
# userDeletionGuard.test.js

## Overview
- Source file: `tests/unit/pages/institution-admin/userDeletionGuard.test.js`
- Last documented: 2026-04-05
- Role: Deterministic unit coverage for delete-user guard-code outcomes.

## Coverage
- Validates allowed deletion path when tenant/role/self checks pass.
- Validates denial for cross-tenant mismatch.
- Validates denial for expected-role mismatch.
- Validates denial for protected roles (`admin`, `institutionAdmin`).
- Validates denial for self-delete attempts.
- Validates active-class denial codes for teacher and student roles.

## Changelog
- 2026-04-05: Added initial guard utility test suite for users-tab delete-user safety contract.
