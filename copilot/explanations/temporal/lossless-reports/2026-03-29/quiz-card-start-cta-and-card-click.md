// copilot/explanations/temporal/lossless-reports/2026-03-29/quiz-card-start-cta-and-card-click.md

# Lossless Report - Quiz Card Start UX

## Requested Scope
- Make the `Comenzar test` button larger.
- If a test has not been completed, allow starting it by tapping/clicking the full flashcard.

## Changes Applied
1. `src/pages/Topic/components/TopicContent.jsx`
- Added `canOpenFromCard` guard to enable card click/keyboard activation only when:
  - user is not in edit-primary mode,
  - quiz is not completed,
  - assignment window allows starting.
- Added card-level `onClick` and `onKeyDown` handlers that open quiz play route while ignoring clicks on inner controls (`button`, `a`, inputs).
- Refactored play navigation to `openQuizSession()` to reuse between card click and primary button.
- Increased pending-state primary CTA visual weight (`py-3.5`, `text-sm`, stronger shadow), preserving existing styles for edit/retry/locked states.
- Increased completed-state actions size for `Reintentar test` and `Ver revision` (`py-3.5`, `text-sm`, stronger icon/button prominence).

## Preserved Behaviors
- Teachers keep edit-first behavior (`Editar test`).
- Completed quizzes keep retry/review actions.
- Locked assignments (`Aun no disponible` / `Plazo cerrado`) remain non-startable.
- Menu and inner action buttons do not trigger card-start by propagation-safe filtering.

## Validation
- `get_errors` clean for touched UI file:
  - `src/pages/Topic/components/TopicContent.jsx`
- Test suite passed:
  - `Test Files 46 passed (46)`
  - `Tests 289 passed (289)`
