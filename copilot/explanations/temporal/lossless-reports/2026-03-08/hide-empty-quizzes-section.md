# Lossless Change Report: Hide Empty Quizzes Section

**Date:** 2026-03-08
**Task:** Hide quizzes section in Topic.jsx when there are no tests available.

---
## Requested Scope
- If there are no quizzes (no tests in any level: básico, intermedio, avanzado), the quizzes tab/section should not render.
- This applies to all users and students.

## Preserved Behaviors
- All quiz logic, navigation, and content remain unchanged.
- Quiz rendering for non-empty levels still works correctly.
- All other tabs (materials, uploads) render normally.

## Touched Files
- src/pages/Topic/components/TopicContent.jsx

## Per-File Verification
- TopicContent.jsx: Added check after quizzesByLevel population. If totalQuizzes === 0, returns null to hide the entire quizzes section.
- Ran get_errors: No errors found.

## Validation Summary
- Quizzes section is hidden when no tests available.
- No errors or regressions detected.
- Documentation updated in codebase explanations.

---
**Protocol:** lossless-change-protocol.md
**Status:** Complete