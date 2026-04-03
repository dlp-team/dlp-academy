<!-- copilot/explanations/codebase/functions/security/subjectLifecycleAutomation.md -->
# subjectLifecycleAutomation.js

## Changelog
### 2026-04-03
- Added `resolveSubjectLifecyclePhase(...)` to classify subject lifecycle windows:
  - `active`,
  - `extraordinary`,
  - `post_extraordinary`.
- Added `buildSubjectLifecycleAutomationUpdate(...)` to derive minimal update payloads for lifecycle automation runs.
- Added normalized post-course visibility derivation:
  - `hidden` for `delete`,
  - `teacher_only` for `retain_teacher_only`,
  - `all_no_join` for `retain_all_no_join`.
- Added explicit unknown pass-state policy marker: `treat_as_pending_until_extraordinary_end`.
- Added lifecycle hardening outputs for automation:
  - `lifecyclePhase`,
  - `lifecyclePostCourseVisibility`,
  - `lifecycleUnknownPassStatePolicy`,
  - `lifecycleAutomationVersion`,
  - post-extraordinary invite-code disable flags.
- Added `evaluateSubjectLifecycleAutomationRun(...)` for deterministic dry-run/preview execution:
  - scan/update/skip counters,
  - bounded `previewSubjectIds`,
  - derived update payload list for write pipelines.

## Overview
- Source file: `functions/security/subjectLifecycleAutomation.js`
- Role: Shared lifecycle decision engine for scheduled and manually triggered backend automation.

## Validation
- `npm run test:unit -- tests/unit/functions/subjectLifecycleAutomation.test.js`
