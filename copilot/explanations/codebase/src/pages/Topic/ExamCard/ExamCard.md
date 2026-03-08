# ExamCard.jsx

## Overview
- **Source file:** `src/pages/Topic/ExamCard/ExamCard.jsx`
- **Created:** 2026-03-08
- **Role:** Reusable UI component for rendering exam cards in Topic page materials section

## Responsibilities
- Render exam card with consistent platform styling
- Display exam metadata (title, question count, time estimate)
- Handle navigation to exam viewer on click
- Apply subject-based color theming
- Provide hover/interaction feedback

## Exports
- `default ExamCard` - Main component

## Props Interface

```javascript
{
  exam,         // Object: { id, examen_titulo, preguntas[] }
  subject,      // Object: { color, ... } for gradient theming
  navigate,     // Function: React Router navigate
  subjectId,    // String: Route param for subject
  topicId,      // String: Route param for topic
  permissions   // Object: Permission flags (optional, for future use)
}
```

## Main Dependencies
- `react` (useMemo)
- `lucide-react` (ClipboardList, Clock icons)

## Styling Pattern
- Gradient background from `subject.color` prop
- White text with opacity variants for hierarchy
- Hover effects: scale-[1.02], shadow-xl
- Backdrop blur on icon container
- Icon positioned bottom-right with rotation and low opacity

## Navigation
Routes to: `/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}`

## Notes
- Extracted from TopicContent.jsx inline rendering on 2026-03-08
- Follows FileCard/QuizCard component pattern
- Uses useMemo for performance optimization of color calculation
- All visible text maintains Spanish language compliance
- Contains file path comment at line 1

## Related Components
- `FileCard.jsx` - Similar pattern for file resources
- `QuizCard.jsx` - Similar pattern for quiz cards
- `TopicContent.jsx` - Parent component that renders ExamCard

---

## Changelog

### 2026-03-08 - Initial Creation

**Change**: Component created as part of exam card refactoring.

**Reason**: Extract inline exam rendering from TopicContent.jsx to improve code organization and follow established component patterns.

**Impact**: Enables reusability, reduces TopicContent.jsx complexity by 48%, maintains pixel-perfect visual parity with previous inline implementation.

**Related Documentation**:
- Lossless Report: `copilot/explanations/temporal/lossless-reports/2026-03-08/exam-card-refactor.md`
- Plan: `copilot/plans/todo/exam-card-refactor/`
