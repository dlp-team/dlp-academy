# Phase 05 — Quiz Engine and Results Coverage (IN_PROGRESS)

## Objective

Protect quiz runtime behavior from start to submission and results rendering.

## Planned Changes / Actions

- Add Playwright journeys for:
  - Starting a quiz from topic context.
  - Submitting answers and validating completion flow.
  - Viewing Quiz Results and key metrics.
- Add Vitest coverage for `src/pages/Quizzes/hooks/useQuizzesLogic.js`.
- Add assertions for grading, attempt state, and retry paths where applicable.

## Risks

- Async grading/result writes may create timing-sensitive tests.
- Edge-case scoring and partial submissions can be under-tested.

## Completion Criteria

- End-to-end quiz path passes in stable environment.
- Unit tests validate scoring/state logic and error handling.
- Results rendering regressions are detectable via automated checks.

## Execution Notes

- Added new Phase 05 E2E suite: `tests/e2e/quiz-lifecycle.spec.js`.
- Implemented deterministic seed resolver for quiz lifecycle runs:
  - Supports `E2E_SUBJECT_ID`, `E2E_TOPIC_ID`, `E2E_QUIZ_ID`, and `E2E_INSTITUTION_ID` overrides.
  - Resolves owner via Firebase Auth UID.
  - Auto-creates subject/topic/quiz seed records when missing.
  - Validates that env-provided IDs match the resolved context before reuse.
- New quiz journeys implemented:
  - Start quiz from topic tab, complete all questions, and return to topic.
  - Verify quiz completion persists a `quiz_results` document for the active user.

- Added focused unit suite:
  - `tests/unit/hooks/useQuizzesLogic.test.js`
    - Data load path (`subject`, `topic`, `quiz`).
    - Correct-answer scoring/streak path.
    - End-of-quiz result save path (`setDoc` merge write).
    - Back-navigation handler path.

## Validation Evidence

- `npm run test:unit -- tests/unit/hooks/useQuizzesLogic.test.js` → ✅ `1 file`, `4 tests` passed.
- `npm run test:e2e -- tests/e2e/quiz-lifecycle.spec.js --reporter=list` → ✅ `2 passed`.
- `npm run test:e2e -- tests/e2e/auth.spec.js tests/e2e/user-journey.spec.js tests/e2e/home-sharing-roles.spec.js tests/e2e/subject-topic-content.spec.js tests/e2e/quiz-lifecycle.spec.js --reporter=list` → ✅ `9 passed`.
