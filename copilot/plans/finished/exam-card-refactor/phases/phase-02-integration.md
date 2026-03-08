# Phase 2: Integration & Refactoring

## Objective

Replace inline exam card rendering in TopicContent.jsx with the new ExamCard component.

## Context

With ExamCard.jsx now created, we need to refactor TopicContent.jsx to use it, reducing the file's complexity and improving maintainability.

## Tasks

### 1. Import ExamCard
Add import statement at the top of TopicContent.jsx:
```javascript
import ExamCard from '../ExamCard/ExamCard';
```

### 2. Identify Replacement Zone

**Current Code (lines 161-202):**
```javascript
{/* Exámenes de Prueba */}
{topic.exams?.length > 0 && (
    <div>
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-4">
            Exámenes de Prueba
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topic.exams.map(exam => (
                <button /* ... inline JSX ... */>
            ))}
        </div>
    </div>
)}
```

### 3. Refactor to Use Component

**New Code:**
```javascript
{/* Exámenes de Prueba */}
{topic.exams?.length > 0 && (
    <div>
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-4">
            Exámenes de Prueba
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topic.exams.map(exam => (
                <ExamCard
                    key={exam.id}
                    exam={exam}
                    subject={subject}
                    navigate={navigate}
                    subjectId={subjectId}
                    topicId={topicId}
                    permissions={permissions}
                />
            ))}
        </div>
    </div>
)}
```

### 4. Verify Props Availability

Ensure all required props are available in TopicContent scope:
- [x] `exam` - from topic.exams.map()
- [x] `subject` - passed as prop to TopicContent
- [x] `navigate` - passed as prop to TopicContent
- [x] `subjectId` - passed as prop to TopicContent
- [x] `topicId` - passed as prop to TopicContent
- [x] `permissions` - passed as prop to TopicContent

### 5. Preserve Adjacent Code

**Must NOT change:**
- "Guía Completa" section (lines 115-160)
- Section header "Exámenes de Prueba"
- Grid layout structure
- Empty state conditional (handled by `topic.exams?.length > 0 &&`)

## Lossless Requirements

- **Preserve**: All styling classes exactly
- **Preserve**: Section header and grid layout
- **Preserve**: Conditional rendering logic
- **Preserve**: Empty state behavior (when no exams)
- **Change ONLY**: Replace inline button JSX with `<ExamCard />` component

## Expected Outcome

1. TopicContent.jsx imports ExamCard
2. Inline exam rendering replaced with component
3. Less than 10 lines of code instead of ~35 lines
4. Identical visual output
5. Identical functionality

## Validation

- [ ] File compiles without errors
- [ ] Exams display in grid layout
- [ ] Empty state works (no exams = no section)
- [ ] Section header renders
- [ ] Clicking exam navigates correctly
- [ ] Styling matches previous implementation

## Notes

- Keep `key={exam.id}` on ExamCard component (moved from button)
- Ensure subject color propagates correctly through props
