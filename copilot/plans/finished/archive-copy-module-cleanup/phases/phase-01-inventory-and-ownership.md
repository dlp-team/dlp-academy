# Phase 01 - Inventory and Ownership Mapping

## Objective
Identify all duplicate, archived, and simulation files across the workspace.

## Identified Targets (Initial List)
- `src/archive/BinView0.jsx`
- `src/archive/Topic copy.jsx`
- `src/archive/Topiccopy.jsx`
- `src/archive/topicsimulation.jsx`
- `src/components/modals/QuizModal copy.tsx`
- `src/components/ui/MailboxIcon copy.tsx`
- `src/pages/Content/StudyGuideEditorcopy.tsx`
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard copy.tsx`

## Action Items
- [ ] Run comprehensive `Find-ChildItem` search for `*copy*.tsx`, `archive`, `*simulation*`.
- [ ] Review each file's dependency tree (ensure no active imports).
- [ ] Categorize into `[Delete]` or `[Archive]`.

## Success Criteria
- Exhaustive list of all technical debt files is compiled.
- No files on the list are currently imported by the active application graph.
