# Phase 6: Card & List Stagger Animations

## Status: `todo`
## Estimated Effort: Medium
## Depends on: Phases 2-5

## Objectives
1. Add stagger-in animation when cards appear on view changes
2. Smooth card scale morph when slider changes
3. Animate filtered results (search, tag filter)
4. Ensure performance with large card counts (100+)

## Tasks

### 6.1 Card stagger-in animation
Files: `HomeContent.tsx`, `SharedView.tsx`, `BinView.tsx`

- Wrap card container in `motion.div` with `staggerContainer` variant
- Each card wrapped in `motion.div` with `staggerItem` variant
- Stagger delay: 30-50ms between items
- Animation: fade-in + slight translateY (20px → 0)
- Cap stagger to first 20 items to prevent long delays on large lists

### 6.2 Card scale morph
File: `HomeContent.tsx`

- When `cardScale` changes via slider, cards morph size smoothly
- Use `motion.div` with `layout` prop for automatic size transitions
- Or use CSS `transition: transform 200ms ease` on card wrapper

### 6.3 Search/filter result animation
File: `HomeContent.tsx`

- When search text changes and results filter, animate:
  - Matching cards remain with layout shift animation
  - Non-matching cards fade out
- Use `AnimatePresence` with `layout` on each card

### 6.4 Performance guard
- Use `layoutScroll` or `layoutRoot` to prevent full-page layout recalc
- Cap stagger animations beyond 20 items
- Use `will-change: transform` on animating cards
- Profile with Chrome DevTools Performance tab

### 6.5 Validate
- Load view with 50+ items — stagger animation smooth
- Change card scale — smooth morph
- Filter/search — cards animate in/out
- Performance: maintain 60fps
- All tests pass

## Files to Touch
- `src/pages/Home/components/HomeContent.tsx`
- `src/pages/Home/components/SharedView.tsx`
- `src/pages/Home/components/BinView.tsx`
- `src/utils/animationConfig.ts` (stagger variants)

## Completion Criteria
- [ ] Cards stagger-in on view load
- [ ] Card scale changes morph smoothly
- [ ] Search/filter results animate
- [ ] 60fps maintained with 100+ cards
- [ ] Stagger capped at ~20 items
- [ ] All tests pass
