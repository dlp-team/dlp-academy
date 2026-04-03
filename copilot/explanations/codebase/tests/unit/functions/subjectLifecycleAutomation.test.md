<!-- copilot/explanations/codebase/tests/unit/functions/subjectLifecycleAutomation.test.md -->
# subjectLifecycleAutomation.test.js

## Changelog
### 2026-04-03
- Added deterministic unit coverage for backend lifecycle automation decisions:
  - no-op behavior for legacy subjects without period boundaries,
  - lifecycle phase transitions (`active`, `extraordinary`, `post_extraordinary`),
  - post-extraordinary policy mapping (`delete`, `retain_teacher_only`, `retain_all_no_join`),
  - invite-code disabling after extraordinary cutoff,
  - no-op detection when subject lifecycle fields are already aligned.

## Overview
- Source file: `tests/unit/functions/subjectLifecycleAutomation.test.js`
- Role: Verifies lifecycle automation snapshot derivation used by Functions scheduler/callable trigger.

## Validation
- `npm run test:unit -- tests/unit/functions/subjectLifecycleAutomation.test.js`
