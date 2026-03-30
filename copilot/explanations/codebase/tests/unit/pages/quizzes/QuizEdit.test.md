<!-- copilot/explanations/codebase/tests/unit/pages/quizzes/QuizEdit.test.md -->
# QuizEdit.test.jsx

## Overview
- **Source file:** `tests/unit/pages/quizzes/QuizEdit.test.jsx`
- **Last documented:** 2026-03-30
- **Role:** Unit coverage for QuizEdit not-found and destructive-confirmation behavior.

## Coverage
- Topic-not-found path renders inline recovery feedback instead of browser alert dialogs.
- Not-found state keeps the back navigation action available to the user.
- Regression guard confirms no `alert(...)` invocation for this flow.
- Question deletion opens in-page confirmation before mutating quiz state.
- Question deletion confirm path removes the target question only after explicit user confirmation.
- Question deletion cancel path preserves question list and still avoids browser `window.confirm(...)`.

## Changelog
### 2026-03-30
- Added initial page-level test coverage for QuizEdit topic-not-found feedback migration.
- Added question delete confirmation-first tests validating confirm/cancel behavior without browser dialogs.
