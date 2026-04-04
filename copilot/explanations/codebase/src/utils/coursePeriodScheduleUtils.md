<!-- copilot/explanations/codebase/src/utils/coursePeriodScheduleUtils.md -->
# coursePeriodScheduleUtils.ts

## Overview
- Source file: [src/utils/coursePeriodScheduleUtils.ts](src/utils/coursePeriodScheduleUtils.ts)
- Last documented: 2026-04-04
- Role: Shared normalization/defaulting helpers for per-course period schedule overrides.

## Responsibilities
- Normalizes supported period modes (`trimester`, `cuatrimester`, `custom`).
- Builds deterministic period definitions/labels from institution periodization.
- Normalizes course period schedule payloads before persistence, including chronological validation.
- Builds default course schedule rows from academic-year + institution calendar settings.

## Exports
- `DEFAULT_COURSE_PERIOD_MODE`
- `normalizeCoursePeriodMode(...)`
- `buildCoursePeriodDefinitions(...)`
- `normalizeCoursePeriodSchedule(...)`
- `buildDefaultCoursePeriodSchedule(...)`
