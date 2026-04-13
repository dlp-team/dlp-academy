<!-- copilot/explanations/temporal/lossless-reports/2026-04-13/studyguide-contextual-teacher-questions-and-chat-reliability.md -->
# Lossless Change Report - StudyGuide Contextual Teacher Questions and Chat Reliability

## Date
- 2026-04-13

## Requested Scope
- Fix chat-entry runtime issues reported by user:
  - missing direct-message query index error,
  - subject reference permission failures,
  - analytics dynamic-config warning noise.
- Add a new student workflow in StudyGuide:
  - select text,
  - right-click,
  - choose "Preguntar al profesor",
  - select teacher and send question including the selected fragment and guide reference.

## Implemented Changes
- StudyGuide contextual question workflow:
  - Added student-only right-click interception inside StudyGuide content when text selection exists.
  - Added contextual action menu with "Preguntar al profesor".
  - Added ask-teacher composer panel with:
    - teacher selector,
    - custom question input,
    - selected-fragment preview,
    - inline success/error feedback.
  - Added direct-message submission flow using `sendDirectMessage` with:
    - composed question content constrained to message length,
    - `subjectId` / `subjectName`,
    - `subjectReference` route to exact StudyGuide (`/home/subject/:subjectId/topic/:topicId/resumen/:guideId`).
  - Added recipient loading from subject owner/editor metadata and teacher-like roles in same institution.
- Utility extraction and tests:
  - Added `src/utils/studyGuideQuestionUtils.ts` for role filtering, teacher UID derivation, message composition, and reference payload building.
  - Added deterministic unit tests in `tests/unit/utils/studyGuideQuestionUtils.test.js`.
- Messages reliability hardening:
  - Suppressed expected `failed-precondition` console noise when index fallback is intentionally activated.
  - Reworked subject-reference resource loading to:
    - tolerate partial permission failures via `Promise.allSettled`,
    - merge root (`documents`/`resumen`) and nested subject-topic paths,
    - keep feedback only when no accessible resources remain.
- Firestore safety alignment:
  - Added missing `topicReadableByRef(topicId)` helper in rules to support `resumen` read path checks.
  - Updated direct-message composite indexes with explicit `__name__` descending tie-break field.
- Analytics warning mitigation:
  - Changed Firebase analytics initialization to production-only browser context, reducing local/dev dynamic-config warning noise.

## Preserved Behaviors
- Existing direct-message security boundaries and institution scoping are preserved.
- Existing read-marking semantics (recipient marks on explicit conversation open) are preserved.
- Existing StudyGuide navigation and rendering behavior remains intact for all roles.
- Non-student roles keep normal right-click behavior (new context menu flow is student-gated).

## Validation
- `get_errors` clean on touched files.
- `npm run test -- tests/unit/utils/studyGuideQuestionUtils.test.js tests/unit/services/directMessageService.test.js tests/unit/utils/directMessageUtils.test.js` -> pass (17/17).
- `npm run lint` -> pass.
- Rules test command attempted:
  - `npm run test:rules:unit -- tests/rules/firestore.rules.test.js` -> blocked (Firestore emulator not running in standalone invocation).
  - `npm run test:rules` -> blocked (`firebase` CLI not installed in current environment).

## Manual Follow-Up Required
- Deploy updated Firestore rules and indexes so production uses the new helper and index definitions:
  - `firestore.rules`
  - `firestore.indexes.json`
- If analytics dynamic-config warning persists in production, verify Firebase Web App registration and matching `measurementId` in environment values.

## Touched Files
- `src/pages/Content/StudyGuide.tsx`
- `src/utils/studyGuideQuestionUtils.ts`
- `tests/unit/utils/studyGuideQuestionUtils.test.js`
- `src/pages/Messages/Messages.tsx`
- `firestore.rules`
- `firestore.indexes.json`
- `src/firebase/config.ts`
- `copilot/plans/active/autopilot-plan-messages-experience-upgrade-2026-04-13/**`
