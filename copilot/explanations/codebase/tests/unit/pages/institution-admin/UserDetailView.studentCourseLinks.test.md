<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.md -->
# UserDetailView.studentCourseLinks.test.jsx

## Overview
- Source file: `tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx`
- Last documented: 2026-04-04
- Role: Deterministic regression coverage for manual student-course linking actions in institution-admin student detail view.

## Coverage
- Adds a student course link from the detail panel and persists `courseId`, `courseIds`, and `enrolledCourseIds` through Firestore updates.
- Removes a linked course from the detail panel and keeps profile link fields synchronized.
- Verifies in-page success feedback appears after successful updates.

## Changelog
- 2026-04-04: Added initial suite for add/remove manual student-course linking flows in `UserDetailView`.
