<!-- copilot/explanations/codebase/tests/unit/hooks/useHomeState.academicYearFilter.test.md -->

## Overview
This suite validates courses-tab academic-year filtering behavior in `useHomeState`:
- available academic years are derived and sorted from visible subjects,
- multi-year grouped output appends academic-year labels,
- single-year range filtering returns only matching course buckets.

## Changelog
### 2026-04-03: Added extraordinary-window role matrix assertions
- Added deterministic usage-mode tests for `showOnlyCurrentSubjects` when period bounds exist:
  - passed students are hidden after ordinary cutoff,
  - failed students remain visible through extraordinary cutoff,
  - teachers remain visible through extraordinary cutoff.

### 2026-04-03: Added subject period filter coverage
- Added deterministic hook coverage that asserts:
  - `availableSubjectPeriods` derivation from subject metadata,
  - `subjectPeriodFilter` in `courses` mode filters grouped output to matching subjects only.

### 2026-04-02: Added active/current lifecycle filtering assertions
- Added deterministic coverage for `showOnlyCurrentSubjects` in:
  - `courses` mode (current-year + legacy subjects remain, ended-year subjects excluded),
  - `usage` mode (ended subjects removed from recent list).

### 2026-04-02: Initial coverage for courses academic-year range filtering
- Added deterministic hook tests for:
  - available-year derivation ordering,
  - multi-year label rendering in grouped content,
  - single-year range filtering behavior.

## Validation
- `npm run test:unit -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
