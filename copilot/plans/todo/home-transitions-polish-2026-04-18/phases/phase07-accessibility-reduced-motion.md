# Phase 7: Accessibility & Reduced Motion

## Status: `todo`
## Estimated Effort: Small
## Depends on: Phase 6

## Objectives
1. Respect `prefers-reduced-motion` system preference
2. Ensure all animations can be disabled
3. Verify with Chrome DevTools emulation

## Tasks

### 7.1 Global reduced motion hook
File: `src/utils/animationConfig.ts`

- Use framer-motion's built-in `useReducedMotion()` hook
- Create `getMotionProps()` helper that returns empty variants when reduced motion is active
- Export `reducedMotionVariants` that set `duration: 0` for all transitions

### 7.2 Apply to all animated components
- Each component using framer-motion checks `useReducedMotion()`
- Or: configure framer-motion's `MotionConfig` at app root with `reducedMotion="user"`
- Preferred approach: wrap `<MotionConfig reducedMotion="user">` in App.tsx — this automatically disables all animations when system preference is set

### 7.3 Validate
- Enable `prefers-reduced-motion: reduce` in Chrome DevTools
- Verify: all view transitions instant, no animation
- Verify: all collapsibles instant
- Verify: all modals instant
- Verify: all toolbars instant
- Verify: functional behavior unchanged (everything still works, just no motion)
- All tests pass

## Files to Touch
- `src/App.tsx` (add `MotionConfig` wrapper)
- `src/utils/animationConfig.ts` (reduced motion utilities)

## Completion Criteria
- [ ] `MotionConfig reducedMotion="user"` in App.tsx
- [ ] All animations disabled when `prefers-reduced-motion: reduce`
- [ ] Verified via Chrome DevTools emulation
- [ ] All tests pass
