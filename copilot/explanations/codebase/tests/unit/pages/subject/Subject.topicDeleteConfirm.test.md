<!-- copilot/explanations/codebase/tests/unit/pages/subject/Subject.topicDeleteConfirm.test.md -->
# Subject.topicDeleteConfirm.test.jsx

## Overview
- **Source file:** `tests/unit/pages/subject/Subject.topicDeleteConfirm.test.jsx`
- **Last documented:** 2026-03-30
- **Role:** Focused unit coverage for Subject topic deletion confirmation behavior.

## Coverage
- Topic delete action opens an in-page confirmation modal.
- Delete operation is not executed before explicit confirmation.
- Cancel action closes the confirmation modal and preserves topic state.
- Read-only bin mode suppresses mutating topic actions while preserving topic navigation with read-only query propagation.

## Changelog
### 2026-04-08
- Added `useLocation`-driven read-only mode test for Subject page.
- Verified delete callback absence and topic-route propagation to `?mode=readonly&source=bin`.

### 2026-03-30
- Added first page-level regression tests for Subject topic in-page delete confirmation workflow.
