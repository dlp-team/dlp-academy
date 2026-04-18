# Phase 4: Toolbar & Overlay Transitions

## Status: `todo`
## Estimated Effort: Medium
## Depends on: Phase 1

## Objectives
1. Animate selection toolbar slide-up/down
2. Animate filter overlay slide-in/out
3. Animate card scale slider overlay slide-in/out
4. Animate bin selection toolbar to match

## Tasks

### 4.1 Selection toolbar slide animation
File: `src/pages/Home/components/HomeSelectionToolbar.tsx`

- Wrap in `AnimatePresence` + `motion.div`
- Slide up from bottom on `visible=true`, slide down on `visible=false`
- Use `slideUp` variant from animationConfig
- Ensure fixed positioning maintained during animation

### 4.2 Filter overlay slide-in
File: `src/pages/Home/components/HomeControls.tsx`

- Wrap filter panel in `AnimatePresence` + `motion.div`
- Slide in from right (or left, matching design direction)
- Backdrop fade-in if applicable
- Escape key still works for close

### 4.3 Scale slider overlay slide-in
File: `src/pages/Home/components/HomeControls.tsx`

- Same pattern as filter overlay
- Slide in from the same direction for consistency

### 4.4 Bin selection toolbar
File: `src/pages/Home/components/bin/BinSelectionToolbar.tsx`

- Match animation from 4.1 (selection toolbar)
- Consistent slide-up/down behavior

### 4.5 Validate
- Toggle each overlay/toolbar — smooth animation
- Rapid open/close — AnimatePresence handles gracefully
- All tests pass

## Files to Touch
- `src/pages/Home/components/HomeSelectionToolbar.tsx`
- `src/pages/Home/components/HomeControls.tsx`
- `src/pages/Home/components/bin/BinSelectionToolbar.tsx`
- `src/utils/animationConfig.ts` (add overlay-specific variants if needed)

## Completion Criteria
- [ ] Selection toolbar slides up/down smoothly
- [ ] Filter overlay slides in/out
- [ ] Scale slider overlay slides in/out
- [ ] Bin selection toolbar matches home toolbar animation
- [ ] No z-index issues during animation
- [ ] All tests pass
