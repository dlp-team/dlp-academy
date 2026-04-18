# Plan: Home Page Premium Transitions & Animations

## Status: `todo`

## Problem Statement
The Home page currently has **instant show/hide** behavior for most interactive elements — view mode switching, collapsible groups, selection toolbar, filter overlays, and card scale changes all snap without animation. This creates a jarring, low-polish user experience inconsistent with premium SaaS standards.

## Objective
Add smooth, performant transitions to all major interactive elements on the Home page, achieving a "billion-dollar company" polish level using **framer-motion** for complex mount/unmount animations and **Tailwind CSS** for simpler hover/state transitions.

## Scope

### In Scope
- View mode crossfade/slide transitions (grid ↔ list ↔ shared ↔ bin ↔ courses)
- Collapsible group height animations (subject groups by period/year)
- Selection toolbar slide-up/down animation
- Filter & scale slider overlay slide-in/out animations
- Modal enter/exit standardization across all Home modals
- Card stagger-in animations on view load and filtering
- Card scale morph transitions
- Hover state consistency across all interactive elements
- `prefers-reduced-motion` media query respect (a11y)

### Out of Scope
- Page-level route transitions (App-level concern)
- Non-Home pages (Subject, Profile, Admin dashboards)
- Sidebar collapse/expand animations (layout-level concern)
- Backend/data layer changes
- New UI features (no functional changes)

## Key Decision: Animation Library
**Selected: framer-motion** (industry standard for React animations)

Rationale:
- `AnimatePresence` handles mount/unmount transitions (critical for view switching)
- `layout` prop enables card repositioning morph animations
- `staggerChildren` for premium list reveal effects
- Used by Vercel, Linear, Stripe, Notion — the "billion company" standard
- ~32KB gzipped, tree-shakeable

Alternative considered: Pure Tailwind CSS — insufficient for mount/unmount and layout animations.

## Files Affected (Estimated)
| File | Change Type |
|------|-------------|
| `package.json` | Add `framer-motion` dependency |
| `src/pages/Home/components/HomeMainContent.tsx` | View mode transition wrapper |
| `src/pages/Home/components/HomeContent.tsx` | Group collapse, card stagger |
| `src/pages/Home/components/HomeControls.tsx` | Filter/scale overlay slide |
| `src/pages/Home/components/HomeSelectionToolbar.tsx` | Slide-up/down |
| `src/pages/Home/components/BinView.tsx` | Selection mode transitions |
| `src/pages/Home/components/HomeModals.tsx` | Modal enter/exit |
| `src/components/ui/BaseModal.tsx` | Standardized modal animation |
| `src/index.css` | Custom keyframes (if needed) |
| New: `src/components/ui/AnimatedCollapse.tsx` | Reusable collapse wrapper |
| New: `src/components/ui/AnimatedPresence.tsx` | Reusable presence wrapper (optional) |
| New: `src/utils/animationConfig.ts` | Centralized durations, easings, variants |

## Success Criteria
- [ ] All 5 view mode transitions animate smoothly
- [ ] Group collapse/expand has height animation with easing
- [ ] Selection toolbar slides up/down
- [ ] Filter/scale overlays slide in/out
- [ ] Modals have consistent enter/exit animations
- [ ] Cards stagger-in on view changes
- [ ] `prefers-reduced-motion` disables animations
- [ ] Zero regressions (all 762 tests pass)
- [ ] No perceptible performance impact (60fps maintained)
- [ ] Lighthouse performance score unchanged

## Dependencies
- `framer-motion` package installation
- No backend changes required

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Performance degradation | Low | Medium | Use `will-change`, GPU-accelerated props only (transform, opacity) |
| Bundle size increase | Low | Low | framer-motion is tree-shakeable (~32KB) |
| Test flakiness from animations | Medium | Low | Mock framer-motion in test setup |
| Reduced motion a11y | Low | High | Check `prefers-reduced-motion` globally |

## References
- [framer-motion docs](https://www.framer.com/motion/)
- Existing transition patterns in `src/styles/Topic.module.css`
- Theme transition baseline: 260ms ease-in-out (src/index.css)
