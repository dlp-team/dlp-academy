<!-- copilot/explanations/codebase/tests/unit/functions/transfer-promotion-rollback-handler.test.md -->
# transfer-promotion-rollback-handler.test.js

## Overview
- Source file: `tests/unit/functions/transfer-promotion-rollback-handler.test.js`
- Last documented: 2026-04-04
- Role: Deterministic unit coverage for transfer/promotion rollback callable execution and idempotent behavior.

## Coverage
- Verifies rollback restores snapshot-backed student/course and class-membership states.
- Verifies rollback deletes created transfer artifacts (classes/courses) and updates run/rollback statuses.
- Verifies `alreadyRolledBack` short-circuit response when rollback status was already finalized.
