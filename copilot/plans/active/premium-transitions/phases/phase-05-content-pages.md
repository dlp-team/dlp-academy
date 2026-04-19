# Phase 5 — Content Pages & Stagger Refinement

## Status: `TODO`

## Objective
Apply the transition system to content-level pages (Subject, Topic, Quiz, Study Guide, etc.) and refine stagger animations across the app for a consistently polished feel.

## Deliverables

### 5.1 Subject Page Transitions
**File:** [src/pages/Subject/](src/pages/Subject/)

Changes:
```
- Wrap in AnimatedPage
- Topic list uses stagger entrance
- Breadcrumb area fades in
- Subject header card entrance animation
```

### 5.2 Topic Page Transitions
**File:** [src/pages/Topic/](src/pages/Topic/)

Changes:
```
- Wrap in AnimatedPage
- Resource list stagger entrance
- Content sections fade in sequentially
- Quiz/exam cards stagger
```

### 5.3 Quiz Pages Motion
**Files:** [src/pages/Quizzes/](src/pages/Quizzes/)

Changes:
```
- Quiz list page: card stagger entrance
- Quiz edit page: form sections fade in
- Quiz review page: answer cards stagger with correct/incorrect state
- Quiz repaso: progressive reveal of questions
```

### 5.4 Study Guide & Content Pages
**Files:** [src/pages/Content/](src/pages/Content/)

Changes:
```
- StudyGuide: content sections fade in
- Formula page: formula cards stagger
- Exam page: exam details entrance animation
```

### 5.5 Profile & Settings Pages
**Files:** [src/pages/Profile/](src/pages/Profile/), [src/pages/Settings/](src/pages/Settings/)

Changes:
```
- Wrap in AnimatedPage
- Settings sections stagger entrance
- Profile card entrance animation
```

### 5.6 Stagger Refinement Pass
**Global refinement across all stagger usage**

Improvements:
```
- Ensure stagger cap is consistent (20 items max)
- Stagger delay tuning: 40ms for small items, 60ms for cards
- Exit animations: items should fade out faster than fade in
- Re-entering same page: skip entrance animation (use sessionStorage flag)
- Scroll-triggered stagger: items below fold animate when scrolled into view
  (optional — only if IntersectionObserver integration is clean)
```

## Validation Checklist
- [ ] All content pages wrapped in AnimatedPage
- [ ] Stagger animations consistent across pages
- [ ] No excessive animation when navigating quickly between pages
- [ ] Quiz flow (start → questions → review) transitions smoothly
- [ ] Breadcrumb navigation doesn't cause animation conflicts
- [ ] All existing page functionality preserved
- [ ] `get_errors` clean
- [ ] `npm run test` passes

## Files Touched
- Subject, Topic, Quiz, Content, Profile, Settings pages (modify)
- `src/utils/animationConfig.ts` (possible stagger tuning)

## Estimated Commits: 4–5
1. Subject + Topic page transitions
2. Quiz pages motion
3. Content + Profile + Settings pages
4. Stagger refinement pass
5. Cross-page validation
