<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/studentCourseLinkUtils.md -->
# studentCourseLinkUtils.ts

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/classes-courses/studentCourseLinkUtils.ts`
- **Last documented:** 2026-04-03
- **Role:** Shared resolver for Phase 05 student-course eligibility in class assignment flows.

## Responsibilities
- Normalizes and de-duplicates course IDs gathered from student profile fields (`courseId`, `courseIds`, `enrolledCourseIds`).
- Resolves additional course links from existing class memberships (`class.studentIds` + `class.courseId`).
- Produces eligible student lists for a selected course.
- Applies a legacy compatibility fallback that preserves full student visibility when no course links exist yet.

## Exports
- `getStudentLinkedCourseIds`
- `resolveEligibleStudentsForCourse`

## Changelog
- 2026-04-03: Created utility for centralized course-eligibility resolution used by class create/edit student pickers.
