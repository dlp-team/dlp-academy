<!-- copilot/explanations/codebase/tests/unit/utils/courseLabelUtils.test.md -->
# courseLabelUtils.test.js

## Overview
- Source file: `tests/unit/utils/courseLabelUtils.test.js`
- Last documented: 2026-04-03
- Role: Deterministic unit coverage for course label formatting utilities.

## Responsibilities
- Verifies fallback label behavior when input is empty.
- Verifies `Nombre (AAAA-AAAA)` formatting for valid academic years.
- Verifies invalid year handling falls back to name-only labels.
- Verifies object-based helper behavior for `{ name, academicYear }` input.

## Main Dependencies
- `vitest`
- `src/utils/courseLabelUtils.ts`

## Changelog
- 2026-04-03: Added initial test coverage for course label disambiguation utility.
