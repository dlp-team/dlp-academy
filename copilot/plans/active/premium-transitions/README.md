# Plan: Premium Transitions & Motion Design

## Status: `TODO`

## Problem Statement

The DLP Academy app currently has no page transition animations between routes — pages swap instantly with no visual continuity. Loading states use basic spinners instead of skeleton screens, and micro-interactions (hover, focus, press) are minimal. While Framer Motion 12.38 is installed and a solid animation config exists ([src/utils/animationConfig.ts](src/utils/animationConfig.ts)), the app feels "functional" rather than "premium."

The goal is to elevate the user experience to a world-class level — smooth, elegant, understated motion that feels like a product from Apple or Linear. Every transition should feel intentional, every interaction responsive, and every loading state informative.

## Design Philosophy

> "Animation should be invisible. When done right, users don't notice it — they just feel the app is fast and delightful."

### Core Principles
1. **Purposeful** — Every animation communicates spatial relationships, state changes, or progress
2. **Subtle** — No bouncing, no overshooting, no flashy entrances. Understated elegance
3. **Fast** — 150–300ms for most transitions. Never block the user
4. **Consistent** — Same easing curves, same timing language across the entire app
5. **Accessible** — Respects `prefers-reduced-motion` system-wide (already enforced via `MotionConfig`)

## Scope

### In Scope
- Page-level route transitions (fade crossfade between routes)
- Dashboard panel/tab switching animations
- Skeleton loading screens replacing spinners
- Micro-interactions (card hovers, button presses, focus rings)
- Content entrance stagger refinements
- Navigation state transitions (active route indicators)
- Layout wrapper component for consistent page structure

### Out of Scope
- Auth page animations (login/register) — separate concern
- 3D transforms or WebGL effects — unnecessary complexity
- Sound design — not applicable
- Mobile gesture-based animations — web only
- Theme switching animations — already implemented

## Affected Areas

| Area | Files/Directories |
|------|------------------|
| **Routing** | [src/App.tsx](src/App.tsx) |
| **Animation Config** | [src/utils/animationConfig.ts](src/utils/animationConfig.ts) |
| **Home Page** | [src/pages/Home/](src/pages/Home/) |
| **Admin Dashboard** | [src/pages/AdminDashboard/](src/pages/AdminDashboard/) |
| **Institution Dashboard** | [src/pages/InstitutionAdminDashboard/](src/pages/InstitutionAdminDashboard/) |
| **Teacher Dashboard** | [src/pages/TeacherDashboard/](src/pages/TeacherDashboard/) |
| **Student Dashboard** | [src/pages/StudentDashboard/](src/pages/StudentDashboard/) |
| **Layout Components** | [src/components/layout/](src/components/layout/) |
| **UI Components** | [src/components/ui/](src/components/ui/) |
| **Content Pages** | [src/pages/Subject/](src/pages/Subject/), [src/pages/Topic/](src/pages/Topic/) |
| **Loaders** | [src/pages/Home/components/HomeLoader.tsx](src/pages/Home/components/HomeLoader.tsx) |

## Technical Foundation (Already Available)
- Framer Motion 12.38.0 — installed, tested, mocked
- `MotionConfig reducedMotion="user"` — already at App root
- Animation config with durations (0.15/0.25/0.4s), easings, and variant library
- AnimatePresence pattern already used in BaseModal and HomeSelectionToolbar
- Stagger animations already working on Home page content

## Dependencies
- No new npm packages required
- Framer Motion covers 100% of requirements
- Tailwind CSS `transition-*` utilities for CSS-level micro-interactions

## Risk Assessment
- **Low risk**: All changes are additive — existing functionality remains intact
- **Performance**: Framer Motion uses `transform` and `opacity` only (GPU-composited, no layout thrashing)
- **Accessibility**: Already enforced by `MotionConfig reducedMotion="user"`
- **Testing**: Motion components already mocked in test setup

## Success Criteria
1. Route changes have smooth crossfade transitions
2. Dashboard tab/panel switches animate seamlessly
3. Content loads with skeleton placeholders instead of spinners
4. Cards, buttons, and interactive elements have responsive micro-interactions
5. All animations respect `prefers-reduced-motion`
6. No measurable performance regression (Lighthouse score maintained)
7. No regressions in existing functionality
