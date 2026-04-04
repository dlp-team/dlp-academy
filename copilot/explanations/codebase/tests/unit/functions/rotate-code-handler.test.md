<!-- copilot/explanations/codebase/tests/unit/functions/rotate-code-handler.test.md -->
# rotate-code-handler.test.js

## Overview
- Source file: `tests/unit/functions/rotate-code-handler.test.js`
- Last documented: 2026-04-04
- Role: Unit coverage for immediate institutional code rotation handler authorization and version increment behavior.

## Coverage
- Rejects unauthenticated requests.
- Rejects rotation when role policy has `requireCode` disabled.
- Verifies successful rotation increments `codeVersion`, writes expected policy paths, and returns deterministic preview payload.

## Changelog
- 2026-04-04: Added initial handler tests for new immediate rotation backend flow.
