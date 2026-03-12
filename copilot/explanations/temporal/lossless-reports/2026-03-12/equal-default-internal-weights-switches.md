# Lossless Review Report

- Timestamp: 2026-03-12 00:00 local
- Task: Equal-by-default internal quiz weights with switches
- Request summary: "haz que por defecto todos los test vagan lo mismo a no ser que el profesor de a un swich en la seccion que haga que se puedan modificar y todo lo que se cambie se queda louedo en ese porcentaje y se ajusta eso y lo nuevo"

## 1) Requested scope
- Make internal quiz weights equal by default.
- Add a teacher-controlled switch so internal quiz weights are only editable when enabled.
- Preserve configured custom percentages and adjust newly created quizzes accordingly.

## 2) Out-of-scope preserved
- Block-level grading model (tests/tareas/extras) and strict 100% block validation remained unchanged.
- Extras management, grade entry, assignment review overrides, and student summary behavior remained unchanged.

## 3) Touched files
- src/pages/Subject/components/SubjectGradesPanel.jsx
- copilot/explanations/codebase/src/pages/Subject/components/SubjectGradesPanel.md
- copilot/explanations/temporal/lossless-reports/2026-03-12/equal-default-internal-weights-switches.md

## 4) Per-file verification (required)
### File: src/pages/Subject/components/SubjectGradesPanel.jsx
- Why touched: Implement equal default internal weights and custom-mode toggles for mandatory tests and assignment tasks.
- Reviewed items:
  - `mandatoryCustomWeightsEnabled` and `assignmentCustomWeightsEnabled` -> verified both read from `subject.gradingConfig` and drive read-only/editable states.
  - `getMandatoryWeightForQuiz` / `getAssignmentWeightForQuiz` -> verified equal split is used when custom mode is off.
  - `autoAssignMissingQuizWeights` -> verified only quizzes without stored weight are updated; existing custom values are preserved.
  - `updateQuizInternalWeight` -> verified editing is blocked when custom mode is off and strict 100% enforcement remains for custom mode saves.
- Result: ✅ adjusted intentionally

### File: copilot/explanations/codebase/src/pages/Subject/components/SubjectGradesPanel.md
- Why touched: Keep mirrored explanation synchronized with latest behavior.
- Reviewed items:
  - Changelog entry appended (no overwrite).
  - Existing documentation content preserved.
- Result: ✅ preserved

### File: copilot/explanations/temporal/lossless-reports/2026-03-12/equal-default-internal-weights-switches.md
- Why touched: Required temporal lossless report for this code change.
- Reviewed items:
  - Scope, preserved behavior, risks, and validation recorded.
  - File paths and diagnostics included.
- Result: ✅ preserved

## 5) Risk checks
- Potential risk: Auto-assignment for new quizzes in custom mode could overwrite explicit custom values.
- Mitigation check: Auto-assignment only targets quizzes with undefined/null weight fields.
- Outcome: Existing configured percentages are preserved.

## 6) Validation summary
- Diagnostics: `get_errors` on `src/pages/Subject/components/SubjectGradesPanel.jsx` returned no errors.
- Runtime checks: Not executed in this session (no live UI walkthrough run here).

## 7) Cleanup metadata
- Keep until: 2026-03-14 00:00 local
- Cleanup candidate after: 2026-03-14 00:00 local
- Note: cleanup requires explicit user confirmation.
