# Phase 2 — Skeleton Loading System

## Status: `TODO`

## Objective
Replace spinner-based loading states with content-aware skeleton placeholders that communicate the shape of incoming content, reducing perceived load time and creating a premium feel.

## Design Principles
- Skeletons should mirror the actual content layout (cards → card-shaped skeletons, lists → row skeletons)
- Use a soft, pulsing opacity animation (not shimmer/gradient sweep — too flashy)
- Match the current theme colors (light/dark mode aware)
- Disappear with a gentle fade when real content arrives

## Deliverables

### 2.1 Create Skeleton Primitives
**New file:** `src/components/ui/Skeleton.tsx`

Primitives:
```
- SkeletonBox — rectangular placeholder (configurable width, height, rounded)
- SkeletonText — text-line placeholder (configurable lines, widths)
- SkeletonCircle — avatar/icon placeholder
- SkeletonCard — card-shaped placeholder combining box + text lines
- All use theme-aware background colors (gray-200/gray-700)
- Pulse animation via CSS (prefers-reduced-motion: no animation)
```

### 2.2 Create Page-Specific Skeleton Layouts
**New files:**
- `src/pages/Home/components/HomeContentSkeleton.tsx` — Grid/list of card skeletons matching HomeContent
- `src/pages/AdminDashboard/components/AdminDashboardSkeleton.tsx` — Stat cards + table rows
- `src/pages/StudentDashboard/components/StudentDashboardSkeleton.tsx` — Study progress cards
- `src/pages/TeacherDashboard/components/TeacherDashboardSkeleton.tsx` — Class/student cards

### 2.3 Replace HomeLoader
**File:** [src/pages/Home/components/HomeLoader.tsx](src/pages/Home/components/HomeLoader.tsx)

Changes:
```
- Replace Loader2 spinner with HomeContentSkeleton
- Maintain loading state logic
- Skeleton should match current view mode (grid/list) if possible
```

### 2.4 Replace App-Level Auth Loading Spinner
**File:** [src/App.tsx](src/App.tsx)

Changes:
```
- Replace the h-12 w-12 border spinner with a centered app logo + subtle pulse
- Add a smooth fade-out when auth state resolves
```

### 2.5 Add Skeleton to Dashboard Pages
Apply page-specific skeletons to each dashboard's loading state.

## Validation Checklist
- [ ] Skeletons render correctly in light and dark mode
- [ ] Skeleton layout matches actual content layout closely
- [ ] Smooth transition from skeleton → real content (fade)
- [ ] No layout shift when content replaces skeleton
- [ ] Reduced motion: skeleton shows static gray (no pulse)
- [ ] All existing loading behavior preserved
- [ ] `get_errors` clean
- [ ] `npm run test` passes

## Files Touched
- `src/components/ui/Skeleton.tsx` (create)
- `src/pages/Home/components/HomeContentSkeleton.tsx` (create)
- `src/pages/AdminDashboard/components/AdminDashboardSkeleton.tsx` (create)
- `src/pages/StudentDashboard/components/StudentDashboardSkeleton.tsx` (create)
- `src/pages/TeacherDashboard/components/TeacherDashboardSkeleton.tsx` (create)
- `src/pages/Home/components/HomeLoader.tsx` (modify)
- `src/App.tsx` (modify)

## Estimated Commits: 3–5
1. Skeleton primitives
2. Home skeleton + HomeLoader replacement
3. Dashboard skeletons
4. App-level loading replacement
5. Validation + cleanup
