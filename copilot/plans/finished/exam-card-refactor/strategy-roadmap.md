# Strategy Roadmap - Exam Card Refactor

## Overview

Refactor inline exam card rendering into a dedicated, reusable ExamCard component following established patterns in the codebase (FileCard, QuizCard).

---

## Phase 1: Component Creation
**Status**: COMPLETED ✅  
**Objective**: Create ExamCard.jsx with extracted rendering logic

### Tasks
1. Create `src/pages/Topic/ExamCard/ExamCard.jsx`
2. Extract JSX from TopicContent.jsx lines 167-202
3. Define props interface matching existing card components
4. Preserve all styling (gradient, shadow, icon positioning)
5. Implement navigation onClick handler
6. Add permission-based conditional rendering (if needed in future)

### Acceptance Criteria
- [x] ExamCard.jsx exists and exports default component
- [x] Component receives all necessary props
- [x] Styling matches current inline implementation exactly
- [x] Navigation works identically to before
- [x] No console errors or warnings

---

## Phase 2: Integration & Refactoring
**Status**: COMPLETED ✅  
**Objective**: Replace inline exam cards in TopicContent.jsx with ExamCard component

### Tasks
1. Import ExamCard in TopicContent.jsx
2. Replace inline exam rendering (lines 167-202) with ExamCard component
3. Pass required props (`exam`, `subject`, `navigate`, `subjectId`, `topicId`, `permissions`)
4. Preserve empty state logic and section header
5. Maintain grid layout structure

### Acceptance Criteria
- [x] TopicContent.jsx uses ExamCard component
- [x] All exams display correctly
- [x] Empty state renders when no exams exist
- [x] Section header "Exámenes de Prueba" displays correctly
- [x] Grid layout responsive (1 col mobile, 2 cols desktop)

---

## Phase 3: Validation & Documentation
**Status**: COMPLETED ✅  
**Objective**: Verify no regressions and update documentation

### Tasks
1. Run `get_errors` on all modified files
2. Test exam card clicks navigate correctly
3. Verify styling matches previous implementation
4. Create lossless report in `copilot/explanations/temporal/lossless-reports/`
5. Update `copilot/explanations/codebase/src/pages/Topic/Topic.md`
6. Create temporal explanation documenting the refactor

### Acceptance Criteria
- [x] Zero errors in modified files
- [x] Exam navigation functional
- [x] Visual parity confirmed
- [x] Lossless report completed
- [x] Documentation updated

---

## Immediate Next Actions

1. Create ExamCard.jsx component file
2. Extract and adapt inline JSX from TopicContent.jsx
3. Test component in isolation
4. Integrate into TopicContent.jsx
5. Validate complete functionality
6. Document changes

---

## Timeline

**Total Estimated Time**: 15-20 minutes  
**Phase 1**: 5-7 minutes  
**Phase 2**: 3-5 minutes  
**Phase 3**: 7-8 minutes
