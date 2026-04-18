# Phase 5: Modal Animation Standardization

## Status: `todo`
## Estimated Effort: Medium
## Depends on: Phase 1

## Objectives
1. Standardize all modal enter/exit animations with framer-motion
2. Replace inconsistent Tailwind `animate-in` usage
3. Implement backdrop fade + content scale-up pattern
4. Ensure exit animation plays before unmount

## Tasks

### 5.1 Enhance BaseModal with framer-motion
File: `src/components/ui/BaseModal.tsx`

- Add `AnimatePresence` wrapper at portal level
- Backdrop: `motion.div` with opacity fade (0 → 0.5 → 0)
- Content: `motion.div` with scale (0.95 → 1) + opacity (0 → 1)
- Exit: reverse animation before DOM removal
- Duration: 200ms (matches existing `duration-200` in some modals)
- Keep current class-based approach as fallback for modals not using BaseModal

### 5.2 Verify Home modals use BaseModal
Files: `HomeDeleteConfirmModal.tsx`, `HomeShareConfirmModals.tsx`, `FolderManager.tsx`

- Ensure all Home modals inherit animation from BaseModal
- Remove any component-specific `animate-in` classes that conflict
- Test each modal's open/close cycle

### 5.3 Modal content transitions
File: `src/pages/Home/components/FolderManager.tsx`

- Tab switching within modals: add subtle crossfade between tab panels
- Share suggestion dropdown: add slide-down reveal

### 5.4 Validate
- Open/close every Home modal — consistent animation
- Rapid open/close — no stuck overlays
- Nested modals (if any) — correct stacking
- Escape key still closes with exit animation
- All tests pass

## Files to Touch
- `src/components/ui/BaseModal.tsx`
- `src/pages/Home/components/HomeDeleteConfirmModal.tsx`
- `src/pages/Home/components/HomeShareConfirmModals.tsx`
- `src/pages/Home/components/FolderManager.tsx`
- `src/pages/Home/components/HomeModals.tsx`

## Completion Criteria
- [ ] All Home modals have consistent enter/exit animation
- [ ] Exit animation plays before unmount
- [ ] No stuck overlays on rapid interaction
- [ ] Tab switches within modals animate
- [ ] All tests pass
