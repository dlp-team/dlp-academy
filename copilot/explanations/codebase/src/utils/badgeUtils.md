# badgeUtils.js

## Overview
- **Source file:** `src/utils/badgeUtils.js`
- **Last documented:** 2026-03-30
- **Role:** Shared pure utility module for course-scoped badge normalization and upsert behavior.

## Responsibilities
- Normalizes course keys and badge maps by course.
- Resolves active-course badges for profile/dashboard rendering.
- Computes academic-excellence levels and badge payloads.
- Performs idempotent badge upsert with upgrade-only behavior for academic badges.

## Exports
- `ACADEMIC_EXCELLENCE_BADGE_KEY`
- `MANUAL_BADGE_KEYS`
- `normalizeCourseKey`
- `normalizeBadgesByCourse`
- `getActiveCourseBadges`
- `getAcademicExcellenceLevel`
- `buildAcademicExcellenceBadge`
- `buildManualBadge`
- `upsertCourseBadge`

## Main Dependencies
- None (pure utility module)

## Changelog
### 2026-03-30
- Added course-scoped badge data helpers to support per-course reset/history behavior.
- Added manual and automatic badge payload builders.
- Added upgrade-safe academic badge upsert logic (preserves highest level/average).
