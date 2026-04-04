<!-- copilot/explanations/codebase/tests/unit/functions/transfer-promotion-rollback-handler.test.md -->
# transfer-promotion-rollback-handler.test.js

## Changelog
### 2026-04-04: Chunked snapshot rollback coverage
- Added deterministic test coverage for rollback execution when snapshot metadata is stored in chunked mode.
- Added checksum-driven chunk reassembly validation path to mirror production rollback handler behavior.

## Overview
- Source file: `tests/unit/functions/transfer-promotion-rollback-handler.test.js`
- Last documented: 2026-04-04
- Role: Deterministic unit coverage for transfer/promotion rollback callable execution and idempotent behavior.

## Coverage
- Verifies rollback restores snapshot-backed student/course and class-membership states.
- Verifies rollback deletes created transfer artifacts (classes/courses) and updates run/rollback statuses.
- Verifies `alreadyRolledBack` short-circuit response when rollback status was already finalized.
- Verifies rollback can rebuild execution snapshots from chunk docs and execute successfully.
