# Exam Card Refactor Plan

## Problem Statement

The Topic.jsx component currently renders exam cards with inline JSX in TopicContent.jsx (lines 167-202). This creates several issues:

1. **Code Organization**: Exam rendering logic is mixed with other content rendering, making TopicContent.jsx harder to maintain
2. **Reusability**: Cannot reuse exam card design elsewhere in the application
3. **Consistency**: FileCard and QuizCard are separate components, but exams are inline
4. **Maintainability**: UI changes to exam cards require editing a large component file

## Scope

### In Scope
- Create new `ExamCard.jsx` component in `src/pages/Topic/ExamCard/`
- Extract exam card rendering logic from TopicContent.jsx
- Implement consistent styling matching platform design system
- Handle empty states ("No hay exámenes disponibles")
- Integrate permissions system (view-only vs edit access)
- Preserve all existing functionality (navigation, exam data display)
- Update documentation in `copilot/explanations/`

### Out of Scope
- Changes to Exam.jsx viewer component
- Modifications to exam data structure in Firestore
- Addition of new exam features (editing, deletion, etc.)
- Changes to quiz or file card components

## Current Status

**Status**: FINISHED ✅  
**Phase**: All Phases Complete  
**Created**: 2026-03-08  
**Completed**: 2026-03-08  
**Duration**: Single session (~20 minutes)

## Key Decisions

1. **Component Location**: `src/pages/Topic/ExamCard/ExamCard.jsx` (follows existing pattern for FileCard)
2. **Styling Approach**: Reuse gradient system from subject colors, match "Guía Completa" card aesthetic
3. **Props Interface**: Pass `exam`, `subject`, `navigate`, `subjectId`, `topicId`, `permissions`
4. **Empty State**: Render directly in TopicContent.jsx when `topic.exams?.length === 0`

## Assumptions

1. Exam data structure includes: `id`, `examen_titulo`, `preguntas` array
2. Navigation pattern `/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}` remains unchanged
3. Permissions follow existing pattern (same as FileCard/QuizCard)
4. Current exam display logic is fully functional and should be preserved exactly

## Risk Assessment

- **Regression Risk**: LOW (pure refactoring, no logic changes)
- **Breaking Changes**: NONE (lossless extraction only)
- **Migration Needed**: NO
