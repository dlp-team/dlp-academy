# Phase 6 — Copilot Documentation System

## Status: TODO

## Objective
Create a structured documentation directory for Copilot that codifies the app's reusable UI patterns, style decisions, and placement rules. This ensures Copilot always follows established conventions when creating new UI elements.

## What Needs Documenting (from user)

### 6A — Overlay placement rule
Overlays (modals, drawers, popovers, dropdowns) must always render:
- **Below** the page header (never overlapping it)
- **Above** the page content
- Use the existing `DashboardOverlayShell` (or equivalent) component — verify all overlays in Home comply
- Document how to correctly position overlays

### 6B — Scrollbar style rule
Any new scrollable container must use the same scrollbar style as the global scrollbar:
- Document the CSS utility class(es) to use
- Remind that scrollbar top = bottom of header (no header overlap)

### 6C — Deep analysis of widely-used UI patterns
Identify the most repeated UI elements and their established styles:
- Cards (subject cards, folder cards, resource cards)
- Buttons (primary, secondary, danger, ghost)
- Badges/tags
- Filter controls
- Empty states
- Loading states
- Form inputs
- Headers/section titles inside panels
- Tab navigation
Document each in the new directory with visual description and component reference.

### 6D — Component Index (`copilot/REFERENCE/UI_PATTERNS_INDEX.md`)
Create an index that Copilot can scan quickly to check if a UI element it's about to create has an established pattern. Index format:
```
| Element | Pattern Name | File | Key Rules |
```

### 6E — Update copilot-instructions.md and AGENTS.md
Add references to the new documentation so Copilot always checks it before creating:
- New overlays
- New scrollable areas
- New recurring UI elements

## Files to Create
- `copilot/REFERENCE/ui-patterns/overlays.md`
- `copilot/REFERENCE/ui-patterns/scrollbars.md`
- `copilot/REFERENCE/ui-patterns/cards.md`
- `copilot/REFERENCE/ui-patterns/buttons.md`
- `copilot/REFERENCE/ui-patterns/forms.md`
- `copilot/REFERENCE/ui-patterns/states.md` (empty, loading, error)
- `copilot/REFERENCE/ui-patterns/navigation.md` (tabs, breadcrumbs)
- `copilot/REFERENCE/UI_PATTERNS_INDEX.md`

## Files to Modify
- `.github/copilot-instructions.md` — add reference to UI_PATTERNS_INDEX
- `AGENTS.md` — add reference to UI_PATTERNS_INDEX

## Acceptance Criteria
- [ ] UI patterns directory exists with documented patterns for all major elements
- [ ] `UI_PATTERNS_INDEX.md` is a quick-reference table covering all documented patterns
- [ ] `copilot-instructions.md` includes mandatory check: before creating overlays/scrollbars/common UI elements, read the relevant pattern doc
- [ ] `AGENTS.md` updated the same way
- [ ] All Home page overlays verified to use DashboardOverlayShell (or documented correctly)

## Commits Required (minimum)
1. `docs(copilot): Add UI patterns documentation for overlays and scrollbars`
2. `docs(copilot): Add UI patterns for cards, buttons, forms, states, navigation`
3. `docs(copilot): Add UI_PATTERNS_INDEX quick-reference`
4. `docs(copilot): Update instructions and AGENTS to reference UI patterns index`
