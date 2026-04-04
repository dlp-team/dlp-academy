<!-- copilot/explanations/codebase/tests/unit/functions/transfer-promotion-snapshot-utils.test.md -->
# transfer-promotion-snapshot-utils.test.js

## Overview
- Source file: `tests/unit/functions/transfer-promotion-snapshot-utils.test.js`
- Last documented: 2026-04-04
- Role: Deterministic unit coverage for transfer snapshot persistence planning and chunk reassembly helpers.

## Coverage
- Verifies inline snapshot mode selection when entry count is below threshold.
- Verifies chunked snapshot planning when inline threshold is exceeded.
- Verifies chunk-based reassembly parity and checksum consistency.
- Verifies large-snapshot chunk metadata stability and checksum parity under high entry counts.
