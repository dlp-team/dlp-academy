# studyGuideQuestionUtils.ts

## Overview
- Source file: `src/utils/studyGuideQuestionUtils.ts`
- Last documented: 2026-04-13
- Role: Pure utility helpers for StudyGuide contextual teacher-question messaging.

## Responsibilities
- Detects teacher-like roles for recipient eligibility checks.
- Derives teacher candidate UIDs from subject ownership/editor metadata.
- Builds direct-message content from selected snippet + student question with max-length safety and text/formula label awareness.
- Builds route-aware StudyGuide reference payload used by direct messages, including optional snippet/type metadata.

## Main Exports
- `isTeacherLikeRole(roleValue)`
- `buildTeacherCandidateUidsFromSubject(subjectData)`
- `composeStudyGuideQuestionMessage({ guideTitle, selectedText, selectionType, question, maxLength })`
- `buildStudyGuideQuestionReference({ subjectId, topicId, guideId, guideTitle, selectionSnippet, selectionType })`

## Validation
- Covered by `tests/unit/utils/studyGuideQuestionUtils.test.js`.

## Changelog
- 2026-04-13: Updated reference snippet normalization to preserve full formula LaTeX content (no ellipsis truncation for `selectionType: formula`).
- 2026-04-13: Added formula-aware message labeling (`Formula seleccionada`) and reference metadata fields (`selectionSnippet`, `selectionType`) for exact-context chat rendering.
- 2026-04-13: Added initial utility set for the student StudyGuide right-click "Preguntar al profesor" workflow.
