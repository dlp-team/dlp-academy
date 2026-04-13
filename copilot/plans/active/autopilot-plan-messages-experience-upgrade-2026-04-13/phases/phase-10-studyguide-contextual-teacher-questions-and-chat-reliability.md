<!-- copilot/plans/active/autopilot-plan-messages-experience-upgrade-2026-04-13/phases/phase-10-studyguide-contextual-teacher-questions-and-chat-reliability.md -->
# Phase 10 - StudyGuide Contextual Teacher Questions and Chat Reliability

## Objective
Implement a student-first StudyGuide workflow where selected text can be sent to a subject teacher through direct messages, while resolving the runtime chat blockers reported during thread entry (index noise and reference-permission failures).

## Scope
- Add a contextual right-click action in StudyGuide for students:
  - "Preguntar al profesor" over selected guide text.
  - Recipient selection from teacher-like members bound to subject ownership/editor metadata.
  - Send selected snippet + student-written question + study-guide route reference through `directMessages`.
- Harden direct-message loading:
  - Keep index fallback behavior without noisy expected-error logs.
  - Improve subject-reference resource loading with partial-permission tolerance and legacy subcollection fallback.
- Restore missing Firestore rules helper used by `resumen` read paths.
- Prepare index metadata updates required by Firestore composite-query hints.

## Implementation Steps
1. Utility extraction:
   - Add `src/utils/studyGuideQuestionUtils.ts` for:
     - teacher-role detection,
     - teacher-candidate UID extraction from subject data,
     - constrained question-message composition (700 chars),
      - constrained question-message composition (700 chars),
     - study-guide subject-reference payload generation.
2. StudyGuide integration:
   - Add selection-aware context menu for students.
   - Add ask-teacher composer panel (teacher select + custom message + selected-fragment preview).
   - Resolve teacher recipients from subject owner/editor metadata and same-institution user docs.
   - Send via `sendDirectMessage` including `subjectReference` route to current guide.
3. Messages reliability:
   - Avoid expected `failed-precondition` console noise when index fallback activates.
   - Load resources via `Promise.allSettled`, merging root + subcollection paths and surviving partial denials.
4. Rules/index alignment:
   - Add missing `topicReadableByRef(topicId)` helper.
   - Extend `directMessages` composite indexes with explicit `__name__` descending tie-break field.

## Validation
- `get_errors` on touched files (clean).
- Unit suites:
  - `tests/unit/utils/studyGuideQuestionUtils.test.js`
  - `tests/unit/services/directMessageService.test.js`
  - `tests/unit/utils/directMessageUtils.test.js`
- `npm run lint`.
- Rules emulator suite attempted; blocked by missing local Firebase CLI (`firebase` command unavailable).

## Risk and Rollback
- Risk: right-click menu could interfere with normal context-menu behavior for non-student flows.
  - Mitigation: feature gated by active role = student and only activates with valid selected text inside guide content.
- Risk: reference-resource loading changes could hide permission issues.
  - Mitigation: preserve explicit feedback when all resource lookups fail by permission.
- Rollback:
  - Revert phase-specific files (`StudyGuide.tsx`, `Messages.tsx`, rules/index helper updates, new utility/tests) as one block.

## Status
- Completed on 2026-04-13.

## Follow-Up Refinement (2026-04-13)
- Extended contextual selection handling to capture formulas as first-class snippets (`selectionType: formula`) in addition to plain text.
- Propagated exact selection metadata into `subjectReference` payload (`selectionSnippet`, `selectionType`) for downstream thread rendering.
- Upgraded chat reference picker to hierarchical flow (`Asignatura -> Tema -> Recurso`) with explicit topic-level option (`Tema seleccionado`).
- Added in-thread snippet preview rendering so recipients can see the exact selected fragment/formula without opening the destination route.
- Added StudyGuide discoverability fallback with visible quick action button (`Preguntar al profesor`) and broadened availability to authenticated StudyGuide viewers.
