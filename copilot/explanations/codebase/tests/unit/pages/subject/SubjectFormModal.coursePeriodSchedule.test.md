<!-- copilot/explanations/codebase/tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.md -->
# SubjectFormModal.coursePeriodSchedule.test.jsx

## Overview
- Source file: [tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx](tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx)
- Last documented: 2026-04-04
- Role: Validates subject timeline builder receives selected course schedule overrides on save.

## Coverage
- Mocks course list load with `coursePeriodSchedule` in selected course.
- Submits editing flow in general tab.
- Asserts `buildSubjectPeriodTimeline(...)` receives `coursePeriodSchedule` in invocation payload.
