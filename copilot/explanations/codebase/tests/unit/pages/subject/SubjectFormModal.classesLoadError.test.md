<!-- copilot/explanations/codebase/tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.md -->
# SubjectFormModal.classesLoadError.test.jsx

## Overview
- **Source file:** `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
- **Last documented:** 2026-03-31
- **Role:** Focused regression coverage for classes-tab load feedback determinism in `SubjectFormModal`.

## Coverage
- Verifies classes-tab renders class rows when classes query succeeds.
- Verifies classes-query permission failures render explicit inline feedback.
- Verifies classes empty-state remains deterministic after classes-load failure.
- Verifies courses-query permission failures render explicit inline feedback in the general tab.
- Verifies sharing-tab institution users query permission failures render explicit preload feedback.
- Verifies owner-email lookup permission failures render explicit sharing-tab feedback.
- Verifies institution-policy read permission failures render explicit classes-tab preload feedback.
- Verifies class-request mutation permission failures render explicit classes-tab feedback.
- Verifies shortcut self-unshare permission failures render explicit sharing feedback.
- Verifies transfer-ownership permission failures render explicit sharing feedback.
- Verifies apply-all share-add permission failures render explicit per-user feedback.
- Verifies apply-all permission-update failures render explicit per-user feedback.
- Verifies apply-all unshare permission failures render explicit per-user feedback.

## Changelog
### 2026-03-31
- Expanded suite with denied `courses` query regression coverage for general-tab load feedback.

### 2026-03-31
- Expanded suite with denied institution `users` query regression coverage for sharing suggestions preload feedback.

### 2026-03-31
- Expanded suite with denied owner-email lookup regression coverage for sharing metadata feedback.

### 2026-03-31
- Expanded suite with denied institution policy read regression coverage for classes-tab preload feedback.

### 2026-03-31
- Expanded suite with denied class-request mutation regression coverage for classes-tab request feedback.

### 2026-03-31
- Expanded suite with denied shortcut self-unshare regression coverage for sharing feedback.

### 2026-03-31
- Expanded suite with denied transfer-ownership regression coverage for sharing feedback.

### 2026-03-31
- Expanded suite with denied apply-all share-add regression coverage for per-user feedback.

### 2026-03-31
- Expanded suite with denied apply-all permission-update regression coverage for per-user feedback.

### 2026-03-31
- Expanded suite with denied apply-all unshare regression coverage for per-user feedback.

### 2026-03-31
- Added initial regression suite for `SubjectFormModal` classes-load success/error reliability behavior.
