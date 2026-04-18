# Strategy Roadmap: Home Page Premium Transitions

## Overview
Transform the DLP Academy Home page from instant-toggle interactions to smooth, premium-grade transitions that match top-tier SaaS products.

## Phased Approach

### Phase 1: Foundation — Install framer-motion + Create Animation Config
**Status:** `todo`
**Estimated effort:** Small
**Files:** `package.json`, `src/utils/animationConfig.ts`, `tests/setup.ts`

Install framer-motion, create centralized animation constants (durations, easings, variants), mock framer-motion in test setup to prevent test flakiness.

**Gate:** Package installed, config file created, all existing tests still pass.

---

### Phase 2: View Mode Transitions — Crossfade Between Views
**Status:** `todo`
**Estimated effort:** Medium
**Files:** `HomeMainContent.tsx`, `Home.tsx`

Wrap view mode rendering in `AnimatePresence` with crossfade/slide transitions. When user switches between grid, list, shared, bin, and courses views, the outgoing view fades out while the incoming view fades in.

**Gate:** Smooth crossfade on all 5 view mode switches, no layout shift, no flash of empty content.

---

### Phase 3: Collapsible Groups — Animated Height Expand/Collapse
**Status:** `todo`
**Estimated effort:** Medium
**Files:** `HomeContent.tsx`, new `src/components/ui/AnimatedCollapse.tsx`

Create a reusable `AnimatedCollapse` component using framer-motion's height animation pattern. Apply to subject group toggles in HomeContent (collapsedGroups state).

**Gate:** Groups expand/collapse with smooth height + opacity animation. Reusable component registered in COMPONENT_REGISTRY.

---

### Phase 4: Toolbar & Overlay Transitions
**Status:** `todo`
**Estimated effort:** Medium
**Files:** `HomeSelectionToolbar.tsx`, `HomeControls.tsx`, `BinView.tsx`, `BinSelectionToolbar.tsx`

- Selection toolbar: slide-up from bottom when `selectMode` activates, slide-down on deactivate
- Filter overlay: slide-in from right/left when opened
- Scale slider overlay: slide-in when opened
- Bin selection toolbar: match Home selection toolbar animation

**Gate:** All 4 overlay/toolbar elements animate in/out smoothly. No z-index issues, no layout jump.

---

### Phase 5: Modal Animation Standardization
**Status:** `todo`
**Estimated effort:** Medium
**Files:** `BaseModal.tsx`, `HomeModals.tsx`, `HomeDeleteConfirmModal.tsx`, `HomeShareConfirmModals.tsx`, `FolderManager.tsx`

Standardize all modal enter/exit with consistent framer-motion animation: backdrop fade-in, content scale-up + fade-in on enter; reverse on exit. Replace inconsistent Tailwind `animate-in` usage.

**Gate:** All Home modals have identical, smooth enter/exit. Exit animation plays before unmount (AnimatePresence).

---

### Phase 6: Card & List Stagger Animations
**Status:** `todo`
**Estimated effort:** Medium
**Files:** `HomeContent.tsx`, `SharedView.tsx`, `BinView.tsx`

Add stagger-in animation when cards/items appear (view load, filter change, search results). Each card fades in with slight delay creating a cascade effect. Card scale changes (`cardScale`) morph smoothly instead of snapping.

**Gate:** Cards cascade in on view changes. Scale slider produces smooth morph. No jank on large lists (100+ items).

---

### Phase 7: Accessibility & Reduced Motion
**Status:** `todo`
**Estimated effort:** Small
**Files:** `src/utils/animationConfig.ts`, all animation-consuming components

Create a `useReducedMotion` hook (or use framer-motion's built-in). When `prefers-reduced-motion` is active, all animations either instant or disabled. Verify with Chrome DevTools emulation.

**Gate:** `prefers-reduced-motion: reduce` disables all animations. No functional breakage.

---

### Phase 8: Optimization, Polish & Final Review
**Status:** `todo`
**Estimated effort:** Medium
**Files:** All touched files

- Centralize any repeated animation patterns
- Verify 60fps across all transitions (Chrome Performance tab)
- Audit bundle size impact
- Run full test suite + lint + tsc
- Create lossless report
- Deep risk analysis (security, data integrity, performance)

**Gate:** All tests pass, lint clean, tsc clean, performance verified, lossless report filed, risk log updated.

---

## Dependency Graph
```
Phase 1 (foundation) → Phase 2 (view transitions)
                      → Phase 3 (collapsibles)
                      → Phase 4 (toolbars/overlays)
                      → Phase 5 (modals)
Phase 2-5 → Phase 6 (card stagger)
Phase 6 → Phase 7 (a11y)
Phase 7 → Phase 8 (optimization/review)
```

Phases 2-5 can be worked **in parallel** after Phase 1. Phase 6 depends on content rendering changes from 2-5. Phases 7-8 are sequential finalization.

## Rollback Strategy
Each phase is independently revertible:
- Phase 1: `npm uninstall framer-motion`, remove config file
- Phases 2-7: Remove `motion.*` wrappers and `AnimatePresence`, revert to original conditional rendering
- All changes are purely presentational — no data/state logic changes
