# Phase 6 — Polish & Optimization (Final Phase)

## Status: `TODO`

## Objective
Final sweep to ensure animation consistency, performance, accessibility, and code quality across all changes made in Phases 1–5. This phase is mandatory per create-plan skill requirements.

## Deliverables

### 6.1 Animation Consistency Audit
```
- Verify every page uses AnimatedPage wrapper
- Verify every stagger uses consistent timing
- Verify every tab switch uses AnimatedTabs pattern
- Verify every card uses interactive-card utility
- Verify every button uses interactive-button utility
- Document any intentional exceptions
```

### 6.2 Performance Audit
```
- Lighthouse performance score comparison (before vs after)
- Check for unnecessary re-renders caused by animation state
- Verify GPU-composited properties only (transform, opacity)
- No layout-triggering animations (width, height, top, left)
- Profile with React DevTools Profiler
- Profile with Chrome Performance tab
- Target: 0 jank frames on 60fps timeline
```

### 6.3 Accessibility QA
```
- Verify prefers-reduced-motion reduces/disables all animations
- Test with screen reader (NVDA/VoiceOver) — animations don't interfere
- Keyboard navigation focus order unaffected by animation wrappers
- Focus trapping in modals still works with AnimatePresence
- ARIA attributes not disrupted by motion.div wrappers
```

### 6.4 Code Centralization & Cleanup
```
- Centralize any duplicated animation patterns into animationConfig.ts
- Split oversized files if any grew beyond 500 lines
- Remove any debug console.log statements
- Ensure file path comments at top of all new/modified files
- Verify all new components registered in COMPONENT_REGISTRY.md
- Verify UI_PATTERNS_INDEX.md updated with new patterns
```

### 6.5 Cross-Browser Testing
```
- Chrome (primary)
- Firefox
- Safari (if available)
- Edge
- Verify transitions work or gracefully degrade
```

### 6.6 Final Lint & Test
```
- npm run lint — 0 errors on touched files
- npm run test — all tests pass
- npx tsc --noEmit — no type errors
- get_errors — clean on all touched files
```

## Validation Checklist
- [ ] Animation consistency verified across all pages
- [ ] Lighthouse performance score maintained or improved
- [ ] Reduced motion completely disables animations
- [ ] No accessibility regressions
- [ ] Code centralized — no duplicated animation logic
- [ ] All files < 500 lines
- [ ] COMPONENT_REGISTRY.md updated
- [ ] UI_PATTERNS_INDEX.md updated
- [ ] `npm run lint` clean
- [ ] `npm run test` clean
- [ ] `npx tsc --noEmit` clean
- [ ] No console.log left behind
- [ ] All new files have path comments
- [ ] All visible text in Spanish

## Files Touched
- `src/utils/animationConfig.ts` (final cleanup)
- Various files across all phases (cleanup only)
- `copilot/REFERENCE/COMPONENT_REGISTRY.md` (update)
- `copilot/REFERENCE/UI_PATTERNS_INDEX.md` (update)

## Estimated Commits: 2–3
1. Consistency + accessibility fixes
2. Performance optimizations + code cleanup
3. Final validation pass
