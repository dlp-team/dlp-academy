# Phase 2: View Mode Transitions — Crossfade Between Views

## Status: `todo`
## Estimated Effort: Medium
## Depends on: Phase 1

## Objectives
1. Wrap view rendering in `AnimatePresence` for mount/unmount transitions
2. Implement smooth crossfade when switching between grid, list, shared, bin, and courses views
3. Prevent layout shift during transition
4. Handle rapid view switches gracefully (cancel outgoing animation)

## Tasks

### 2.1 Wrap view content in AnimatePresence
File: `src/pages/Home/components/HomeMainContent.tsx`

- Import `AnimatePresence` and `motion` from framer-motion
- Use `mode="wait"` (outgoing finishes before incoming starts) or `mode="popLayout"` for smoother feel
- Key each view by `viewMode` to trigger transitions
- Apply `fadeIn` variant from animationConfig.ts

### 2.2 Define view transition variants
Use crossfade with slight slide direction:
- Grid → List: fade + slight slide left
- Any → Bin: fade + slight slide down
- Any → Shared: fade + slight slide right
- Default: simple crossfade (opacity 0→1, 1→0)

### 2.3 Handle rapid switching
- `AnimatePresence` with `mode="wait"` naturally queues
- Add `key={viewMode}` to ensure clean transitions
- Consider `initial={false}` on first mount to avoid initial animation on page load

### 2.4 Validate
- Switch between all 5 views manually — smooth transitions
- Rapid switching (click multiple modes fast) — no layout break
- `prefers-reduced-motion` — instant switch, no animation
- All tests pass

## Files to Touch
- `src/pages/Home/components/HomeMainContent.tsx` (main changes)
- `src/utils/animationConfig.ts` (add view transition variants if needed)

## Completion Criteria
- [ ] All 5 view modes transition smoothly
- [ ] No layout shift or flash during transition
- [ ] Rapid switching doesn't break
- [ ] First page load has no animation (instant render)
- [ ] All tests pass
