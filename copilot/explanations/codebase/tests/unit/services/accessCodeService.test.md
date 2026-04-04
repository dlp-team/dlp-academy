<!-- copilot/explanations/codebase/tests/unit/services/accessCodeService.test.md -->
# accessCodeService.test.js

## Overview
- Source file: `tests/unit/services/accessCodeService.test.js`
- Last documented: 2026-04-04
- Role: Unit coverage for callable wiring in frontend access-code service.

## Coverage
- Verifies registration validation callable payload (`validateInstitutionalAccessCode`).
- Verifies live preview callable payload now includes `codeVersion`.
- Verifies immediate-rotation callable wiring (`rotateInstitutionalAccessCodeNow`).

## Changelog
- 2026-04-04: Added preview `codeVersion` payload assertion and immediate-rotation callable coverage.
