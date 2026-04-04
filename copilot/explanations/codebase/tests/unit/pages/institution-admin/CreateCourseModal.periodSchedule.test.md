<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.md -->
# CreateCourseModal.periodSchedule.test.jsx

## Overview
- Source file: [tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx](tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx)
- Last documented: 2026-04-04
- Role: Regression test for create-course payload wiring when period overrides are enabled.

## Coverage
- Enables course period override mode in modal.
- Verifies submit payload includes normalized `coursePeriodSchedule`.
- Verifies generated payload includes expected number of period entries and extraordinary boundary.
