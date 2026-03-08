# Phase 1: Component Creation

## Objective

Create a standalone ExamCard component that encapsulates exam card rendering logic currently inline in TopicContent.jsx.

## Context

Currently, exam cards are rendered inline within TopicContent.jsx (lines 167-202). This code needs to be extracted into a reusable component following the pattern established by FileCard and QuizCard.

## Tasks

### 1. Create Component File Structure
- Create directory: `src/pages/Topic/ExamCard/`
- Create file: `src/pages/Topic/ExamCard/ExamCard.jsx`
- Add file path comment at the top

### 2. Define Component Interface

**Props:**
```javascript
{
  exam,           // Exam object with id, examen_titulo, preguntas
  subject,        // Subject object (for color theming)
  navigate,       // React Router navigate function
  subjectId,      // Route param for subject
  topicId,        // Route param for topic
  permissions     // Optional: Permission flags (for future use)
}
```

### 3. Extract & Adapt JSX

**Source (TopicContent.jsx lines 169-201):**
```javascript
<button
    key={exam.id}
    onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}`)}
    className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02] text-left"
>
    {/* ... gradient, icon, content ... */}
</button>
```

**Adaptations Needed:**
- Remove `key={exam.id}` (handled by parent .map())
- Extract `subjectColor` logic from parent scope
- Preserve all Tailwind classes
- Keep all text, icons, and layout identical

### 4. Styling Preservation Checklist
- [ ] Gradient background from subject color
- [ ] White backdrop blur overlay on icon container
- [ ] ClipboardList icon with opacity and rotation
- [ ] Exam title (`examen_titulo`) with truncation
- [ ] Question count display
- [ ] Clock icon with time estimate
- [ ] "Empezar →" call-to-action text
- [ ] Hover effects (scale, shadow, text color)

## Expected Outcome

A fully functional ExamCard component that:
1. Renders identically to the current inline implementation
2. Can be imported and used with a simple props interface
3. Follows the code organization pattern of FileCard/QuizCard
4. Contains proper file path comment
5. Uses Spanish for all visible text (already compliant)

## Validation

- Component renders without errors when passed valid props
- Clicking card navigates to correct exam route
- Styling matches pixel-perfect to current implementation
- No console warnings about missing props

## Notes

- ClipboardList and Clock icons are already imported in TopicContent.jsx
- Need to import these in ExamCard.jsx
- Route pattern: `/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}`
