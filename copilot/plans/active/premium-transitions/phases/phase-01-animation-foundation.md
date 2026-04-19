# Phase 1 — Animation Foundation & Page Transitions

## Status: `TODO`

## Objective
Establish the motion infrastructure for the entire app: a page transition wrapper, extended animation variants, and a consistent layout wrapper that all pages will use.

## Deliverables

### 1.1 Extend Animation Config
**File:** [src/utils/animationConfig.ts](src/utils/animationConfig.ts)

Add new variants:
- `pageTransitionVariants` — crossfade with subtle y-shift (opacity 0→1, y: 8→0)
- `tabIndicatorVariants` — for sliding tab underlines (layoutId-based)
- `skeletonPulseVariants` — for Phase 2 skeleton system (opacity pulsing)
- `hoverLiftVariants` — for Phase 4 micro-interactions (scale 1→1.02, shadow increase)
- New transition preset: `transitionPage` — 200ms, custom easing for page feel

### 1.2 Create PageTransition Wrapper
**New file:** `src/components/layout/PageTransition.tsx`

Implementation:
```
- Wraps page content in a motion.div with pageTransitionVariants
- Uses AnimatePresence with mode="wait" for clean crossfade
- Accepts useLocation().pathname as key for route-aware re-rendering
- Minimal footprint — thin wrapper, no layout side effects
- Respects MotionConfig reducedMotion already set at App root
```

### 1.3 Create AnimatedPage Layout Wrapper
**New file:** `src/components/layout/AnimatedPage.tsx`

Purpose: Standard layout wrapper that all pages use for consistent structure.

Implementation:
```
- Wraps children in PageTransition
- Provides consistent padding, max-width, and spacing
- Accepts optional className for page-specific overrides
- Does NOT include Header (Header remains page-managed for flexibility)
```

### 1.4 Integrate into App.tsx
**File:** [src/App.tsx](src/App.tsx)

Changes:
```
- Wrap <Routes> content area with AnimatePresence mode="wait"
- Each route's element wrapped with PageTransition using location.key
- Maintain existing ProtectedRoute logic untouched
- No changes to auth flow or role-based routing
```

### 1.5 Apply to Home Page
**File:** [src/pages/Home/Home.tsx](src/pages/Home/Home.tsx)

Changes:
```
- Wrap Home content with AnimatedPage
- Verify existing stagger animations still work correctly
- Verify HomeLoader, HomeModals, and toolbar remain functional
```

## Validation Checklist
- [ ] Page transitions animate smoothly on route changes
- [ ] Back/forward browser navigation triggers transitions correctly
- [ ] No flash of unstyled content (FOUC) during transitions
- [ ] Existing modal animations (BaseModal) unaffected
- [ ] Existing stagger animations on Home page preserved
- [ ] `get_errors` clean on all touched files
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] Reduced motion preference disables animations gracefully

## Files Touched
- `src/utils/animationConfig.ts` (modify)
- `src/components/layout/PageTransition.tsx` (create)
- `src/components/layout/AnimatedPage.tsx` (create)
- `src/App.tsx` (modify)
- `src/pages/Home/Home.tsx` (modify)

## Estimated Commits: 3–4
1. Animation config extensions
2. PageTransition + AnimatedPage components
3. App.tsx integration
4. Home page integration + validation
