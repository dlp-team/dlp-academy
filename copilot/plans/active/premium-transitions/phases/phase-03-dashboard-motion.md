# Phase 3 — Dashboard Motion

## Status: `TODO`

## Objective
Add smooth, purposeful animations to all dashboard pages — tab switching, stat card reveals, panel transitions, and data table entrances. Dashboards should feel responsive and alive.

## Deliverables

### 3.1 Animated Tab Indicator
**New file or extension:** `src/components/ui/AnimatedTabs.tsx`

Implementation:
```
- Wraps tab navigation with a sliding underline indicator
- Uses Framer Motion layoutId for the active indicator
- Indicator slides smoothly between tabs
- Tab content crossfades on switch using AnimatePresence
- Reusable across all dashboards
```

### 3.2 Stat Card Entrance Animation
**Pattern to apply across dashboards**

Implementation:
```
- Dashboard stat/summary cards use stagger entrance on mount
- Stagger delay: 60ms per card (4-6 cards = 240-360ms total)
- Each card: fadeIn + slideUp (y: 12 → 0, opacity: 0 → 1)
- Numbers can optionally count-up animate (simple interpolation)
```

### 3.3 Admin Dashboard Motion
**File:** [src/pages/AdminDashboard/AdminDashboard](src/pages/AdminDashboard/)

Changes:
```
- Wrap dashboard content in AnimatedPage
- Apply stagger entrance to stat cards
- Animate tab content transitions (if tabbed)
- Table rows stagger entrance on data load
```

### 3.4 Institution Admin Dashboard Motion
**File:** [src/pages/InstitutionAdminDashboard/](src/pages/InstitutionAdminDashboard/)

Changes:
```
- Wrap in AnimatedPage
- Apply stagger entrance to management panels
- User detail views (Teacher/Student) slide in from right
- Panel switches animate with crossfade
```

### 3.5 Teacher Dashboard Motion
**File:** [src/pages/TeacherDashboard/](src/pages/TeacherDashboard/)

Changes:
```
- Wrap in AnimatedPage
- Class cards stagger entrance
- Student list items stagger
- Detail view transitions
```

### 3.6 Student Dashboard Motion
**File:** [src/pages/StudentDashboard/](src/pages/StudentDashboard/)

Changes:
```
- Wrap in AnimatedPage
- Study progress cards stagger entrance
- Quiz/assignment cards animate in
- Progress indicators animate on mount
```

## Motion Patterns (Dashboard-Specific)

| Element | Animation | Duration | Delay |
|---------|-----------|----------|-------|
| Dashboard container | fadeIn | 200ms | 0ms |
| Stat cards | stagger slideUp + fadeIn | 250ms | 60ms/card |
| Tab indicator | layoutId slide | 200ms | 0ms |
| Tab content | crossfade | 200ms | 0ms |
| Table rows | stagger fadeIn | 150ms | 30ms/row (cap 15) |
| Detail panels | slideRight + fadeIn | 250ms | 0ms |

## Validation Checklist
- [ ] All 4 dashboards have smooth entrance animations
- [ ] Tab switching animates indicator and content
- [ ] Stat cards stagger entrance looks natural
- [ ] Table/list data staggers correctly
- [ ] Detail views animate in/out
- [ ] No animation jank or frame drops
- [ ] All dashboard functionality preserved (CRUD, filters, etc.)
- [ ] Dark mode animations look correct
- [ ] `get_errors` clean
- [ ] `npm run test` passes

## Files Touched
- `src/components/ui/AnimatedTabs.tsx` (create)
- All 4 dashboard pages (modify)
- Dashboard sub-components as needed (modify)

## Estimated Commits: 4–5
1. AnimatedTabs component
2. Admin dashboard motion
3. Institution admin + teacher dashboard motion
4. Student dashboard motion
5. Cross-dashboard validation
