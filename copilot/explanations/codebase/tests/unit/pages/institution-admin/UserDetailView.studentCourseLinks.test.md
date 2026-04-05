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
- Verifies profile-photo load failure falls back to initials rendering.
- Verifies archived classes render under a dedicated `Clases pasadas` section.
- Verifies teacher detail role badge uses iconized label text without emoji markers.

## Changelog
- 2026-04-05: Expanded suite to cover profile-photo fallback, archived-class section rendering, and emoji-free teacher role badge behavior.
- 2026-04-04: Added initial suite for add/remove manual student-course linking flows in `UserDetailView`.
