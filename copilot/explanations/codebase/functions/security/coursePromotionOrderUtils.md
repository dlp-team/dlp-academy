<!-- copilot/explanations/codebase/functions/security/coursePromotionOrderUtils.md -->
# coursePromotionOrderUtils.js

## Overview
- Source file: `functions/security/coursePromotionOrderUtils.js`
- Last documented: 2026-04-05
- Role: Backend utility layer for course-hierarchy normalization and promotion target resolution during transfer dry-runs.

## Responsibilities
- Normalizes and de-duplicates persisted promotion-order labels.
- Builds deterministic default order when persisted hierarchy is missing or incomplete.
- Merges persisted order with available active course labels.
- Resolves next promotion destination course name for a source course label.

## Exports
- `normalizeCoursePromotionOrder`
- `buildDefaultCoursePromotionOrder`
- `mergeCoursePromotionOrderWithCourseNames`
- `resolvePromotedCourseName`

## Changelog
- 2026-04-05: Added backend helper to align dry-run promotion mapping with institution-configured course hierarchy order.
