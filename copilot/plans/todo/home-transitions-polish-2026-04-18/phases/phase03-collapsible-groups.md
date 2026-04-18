# Phase 3: Collapsible Groups — Animated Height Expand/Collapse

## Status: `todo`
## Estimated Effort: Medium
## Depends on: Phase 1

## Objectives
1. Create reusable `AnimatedCollapse` component using framer-motion
2. Apply to subject group expand/collapse in HomeContent
3. Register component in COMPONENT_REGISTRY

## Tasks

### 3.1 Create AnimatedCollapse component
File: `src/components/ui/AnimatedCollapse.tsx`

Props:
- `isOpen: boolean` — controls expand/collapse
- `children: React.ReactNode`
- `duration?: number` — override default (250ms)
- `className?: string` — optional wrapper styles

Implementation:
- Use framer-motion `motion.div` with `animate={{ height: isOpen ? 'auto' : 0 }}`
- Combine with `opacity` for fade effect
- Use `overflow: hidden` during animation
- Apply `animateConfig.normal` duration

### 3.2 Apply to HomeContent group toggles
File: `src/pages/Home/components/HomeContent.tsx`

- Wrap each collapsible group content in `<AnimatedCollapse isOpen={!collapsedGroups[key]}>`
- Replace current conditional rendering (`{!collapsed && <content>}`)
- Keep content mounted but visually collapsed for smooth animation

### 3.3 Register in Component Registry
File: `copilot/REFERENCE/COMPONENT_REGISTRY.md`
- Add `AnimatedCollapse` entry with props, usage example

### 3.4 Validate
- Toggle groups — smooth height animation
- Multiple rapid toggles — no visual glitch
- Large groups (many items) — no performance issue
- All tests pass

## Files to Touch
- New: `src/components/ui/AnimatedCollapse.tsx`
- `src/pages/Home/components/HomeContent.tsx`
- `copilot/REFERENCE/COMPONENT_REGISTRY.md`

## Completion Criteria
- [ ] AnimatedCollapse component created and documented
- [ ] Group collapse/expand has smooth height + opacity animation
- [ ] Rapid toggling works without glitches
- [ ] Registered in COMPONENT_REGISTRY
- [ ] All tests pass
