<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/working/course-lifecycle-summary.md -->
# Course Lifecycle Summary

## Goal
Define a scalable and safe lifecycle model for courses, classes, and subjects across academic years while preserving institution control and role-based visibility.

## High-Level Proposal

### 1) Institution Calendar as Source of Truth
- Add institution-level settings for:
  - academic year start
  - ordinary end
  - extraordinary end
  - period mode (`trimester`, `cuatrimester`, `custom`)
  - post-course subject policy

### 2) Strong Course-Class Academic Year Coupling
- Every class derives and persists academic year from its parent course.
- Class-level academic year editing is removed from all mutation paths.
- Subject assignment selectors show only classes that match subject academic year.

### 3) Student-to-Course Link Layer
- Introduce explicit student-course links as first-class data.
- Two assignment paths:
  - batch CSV upload
  - manual assignment for exceptions

### 4) Controlled End-of-Period Behavior
- Subject lifecycle state should evolve based on configured calendar and period.
- Visibility depends on role and pass/fail status:
  - passed students move to finished state after ordinary period
  - failed students stay active until extraordinary period closes
  - teachers retain instructional visibility until extraordinary period close

### 5) Course Transfer and Promotion
- Course hierarchy config enables automatic next-year duplication and promotion.
- New generated courses start hidden by default until institution enables visibility or auto-start date is reached.

## Operational Defaults
- Default post-course policy: keep subject history and access for enrolled students, no new joins.
- CSV import supports preview mode and conflict resolution before applying writes.
- Transfer flow runs in dry-run mode first, then executes idempotent write plan.

## Why This Approach
- Minimizes manual admin overhead in repeated yearly operations.
- Keeps behavior explicit, auditable, and reversible.
- Preserves multi-tenant and least-privilege boundaries.
