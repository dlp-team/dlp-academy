# Strategy Roadmap — Premium Transitions & Motion Design

## Source of Truth
This document is the **single source of truth** for phase sequencing and status.

## Phase Overview

| # | Phase | Objective | Status |
|---|-------|-----------|--------|
| 1 | Animation Foundation & Page Transitions | Route-level crossfade, layout wrapper, extended animation config | `TODO` |
| 2 | Skeleton Loading System | Replace spinners with content-aware skeleton placeholders | `TODO` |
| 3 | Dashboard Motion | Tab/panel animations, stat card entrances, dashboard-specific transitions | `TODO` |
| 4 | Micro-Interactions | Card hovers, button presses, focus states, navigation indicators | `TODO` |
| 5 | Content Pages & Stagger Refinement | Subject/Topic/Quiz page transitions, stagger tuning, shared element hints | `TODO` |
| 6 | Polish & Optimization | Performance audit, animation consistency sweep, reduced-motion QA, final lint/test | `TODO` |

## Execution Strategy

### Layered Approach
Each phase builds on the previous one. The foundation (Phase 1) must be solid before adding surface-level polish.

```
Phase 1: Foundation    → Route transitions + animation config extensions
Phase 2: Loading       → Skeleton system replaces spinners
Phase 3: Dashboards    → Tab/panel motion + stat card reveals
Phase 4: Micro         → Hover/press/focus feedback on interactive elements
Phase 5: Content       → Page-specific transitions + stagger tuning
Phase 6: Polish        → Consistency sweep + perf audit + accessibility QA
```

### Motion Language Reference

| Pattern | Duration | Easing | Use Case |
|---------|----------|--------|----------|
| **Crossfade** | 200ms | easeInOut | Page transitions |
| **Slide + Fade** | 250ms | easeOut | Panel switches, overlays |
| **Scale + Fade** | 200ms | easeOut | Modals, popovers (already done) |
| **Stagger** | 40ms/item + 50ms delay | easeOut | List/grid content entrance |
| **Hover lift** | 150ms | easeOut | Card hover states |
| **Press scale** | 100ms | easeIn | Button active states |
| **Skeleton pulse** | 1.5s loop | easeInOut | Loading placeholders |
| **Tab indicator** | 200ms | easeInOut | Active tab underline slide |

### Key Decisions
1. **Crossfade over slide for page transitions** — Simpler, more elegant, avoids spatial confusion
2. **Skeleton over spinner** — Communicates content structure, reduces perceived load time
3. **CSS transitions for simple hover/focus** — No need for Framer Motion overhead on mouse events
4. **Framer Motion for orchestrated animations** — Page transitions, stagger sequences, AnimatePresence

### Commit Cadence
- 3–5 commits per phase (per create-plan skill requirements)
- Each commit covers a validated, working increment
- Push after every commit to feature branch
