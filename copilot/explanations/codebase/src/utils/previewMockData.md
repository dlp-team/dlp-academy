<!-- copilot/explanations/codebase/src/utils/previewMockData.md -->
# previewMockData.ts

## Overview
- **Source file:** `src/utils/previewMockData.ts`
- **Last documented:** 2026-04-15
- **Role:** Centralized preview-only dataset and selectors for theme-preview mode.

## Responsibilities
- Provides mock folders, subjects, topics, and topic detail payloads for preview sessions.
- Exposes deterministic helper selectors for preview hydration in hooks/pages.
- Supplies mock quiz analytics and assignment feeds used by topic preview tabs.

## Exports
- `PREVIEW_MOCK_INSTITUTION_ID`
- `PREVIEW_MOCK_FOLDERS`
- `PREVIEW_MOCK_SUBJECTS`
- `PREVIEW_MOCK_TOPICS_BY_SUBJECT`
- `PREVIEW_MOCK_TOPIC_DETAILS_BY_ID`
- `getPreviewMockSubjectById`
- `getPreviewMockTopicsBySubjectId`
- `getPreviewMockTopicById`
- `getPreviewMockTopicDetail`
- `getPreviewMockAssignmentsByTopicId`
- `getPreviewMockQuizResultsByTopicId`
- `getPreviewMockQuizScoreReviewsByTopicId`

## Main Dependencies
- None (pure data/selector utility)

## Changelog
### 2026-04-15
- Added richer preview mock payloads for:
  - study-guide content sections,
  - exam question sets with detailed answers,
  - multi-level quizzes,
  - topic assignments,
  - quiz results and review overrides.
- Added topic-detail override layer (`PREVIEW_MOCK_TOPIC_DETAIL_OVERRIDES_BY_ID`) to keep baseline fixtures and rich preview fixtures composable.
- Added preview helper selectors for assignments and quiz analytics streams consumed by `Topic.tsx`.
