<!-- copilot/plans/active/autopilot-plan-messages-experience-upgrade-2026-04-13/reviewing/verification-checklist-2026-04-13.md -->
# Verification Checklist (2026-04-13)

## Functional Validation
- [x] Conversation search and filters behave deterministically.
- [x] Conversation controls (pin/mute) work and preserve existing selection behavior.
- [x] Mobile flow supports switching between list and thread views without regressions.
- [x] Thread view shows improved readability markers (date grouping and state cues).
- [x] Composer supports practical send flow improvements without breaking validation rules.
- [x] Conversation list renders participant avatars on the leading side as requested.
- [x] Thread/new-chat headers render participant avatars next to names.
- [x] Composer allows file attachments and reference insertion before send.
- [x] Message bubbles render attachments and subject/resource reference cards with navigation.
- [x] Common-subject chips navigate directly to subject routes.
- [x] In-panel message notifications were removed from `/messages` in favor of header-only signaling.
- [x] StudyGuide for students now exposes right-click "Preguntar al profesor" on selected text and opens composer flow.
- [x] StudyGuide question composer sends selected snippet + user message + guide reference to chosen teacher recipient.
- [x] StudyGuide contextual question flow captures both selected text and selected formulas with explicit snippet-type metadata.
- [x] Messages resource-reference loading tolerates partial permission denials and still returns accessible references.
- [x] Chat composer reference insertion now follows `Asignatura -> Tema -> Recurso` hierarchy (including topic-level reference mode).
- [x] Thread reference cards display exact selected snippet context when available.

## Regression Validation
- [x] Existing read-marking behavior remains intact and only triggers when a conversation is explicitly opened.
- [x] Existing direct-message notification channel remains active for header counters.
- [x] Existing institution scoping assumptions remain unchanged.

## Technical Validation
- [x] get_errors is clean for touched files.
- [x] Targeted unit tests pass (`17/17` on touched messaging + StudyGuide question suites).
- [x] Follow-up targeted unit test rerun passes (`6/6` on `studyGuideQuestionUtils`).
- [x] Related existing unit tests pass.
- [x] Lint rerun passes after follow-up refinements.
- [ ] Firestore rules emulator suite run locally (blocked in this environment because Firebase CLI is unavailable).

## Documentation Validation
- [x] Lossless report created/updated.
- [x] Codebase explanation docs updated for touched files.
- [x] Plan roadmap/phase status synchronized.
