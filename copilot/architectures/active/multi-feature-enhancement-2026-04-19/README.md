<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/README.md -->
# Architecture: Multi-Feature Enhancement 2026-04-19

## Status: `active` (Phase 0 — Package Creation)

---

## Problem Statement

Six interconnected features require implementation with precision, cross-module safety, and zero regressions. The scope spans Firestore schema changes, new UI components, shared infrastructure (centralized unsaved-changes guard), badge system redesign with automatic + manual granting, subject management enhancements, theme transition smoothness, and a codebase-wide cursor audit. The interdependencies between these features (badges depend on teacher dashboard + subjects + institution admin; subject changes chain into overlay guards) demand architecture-level planning.

---

## Scope

### In-Scope (6 Features)

| # | Feature | Complexity | Key Files |
|---|---------|-----------|-----------|
| 1 | **Badges System Redesign** | HIGH | `BadgesSection.jsx`, `StatsSidebar.jsx`, new hooks/utils, Firestore schema |
| 2 | **Teacher Dashboard — Conduct Default** | LOW | `TeacherDashboard.tsx`, student data hooks |
| 3 | **Subject Enhancements** (uniqueness + cascading updates) | MEDIUM | `SubjectFormModal.jsx`, `EditSubjectModal.jsx`, Firestore queries |
| 4 | **Centralized Unsaved-Changes Confirmation** | MEDIUM | New shared component, all overlay/modal consumers |
| 5 | **Theme Toggle Smoothness** | LOW | `Header.jsx`, `useDarkMode.js`, CSS transitions |
| 6 | **Cursor Pointer Audit** | LOW | Multiple components, copilot reference docs |

### Out-of-Scope
- New pages or routes
- Institution admin dashboard creation (only badge threshold setting)
- Firestore security rules changes (unless required for badge schema)
- Backend Cloud Functions (unless badge auto-computation requires serverless triggers)
- E2E test infrastructure changes
- Mobile-specific responsive overhauls

---

## Constraints

1. **Lossless**: All existing functionality must be preserved. Zero regressions.
2. **Spanish UI**: All visible text in proper Spanish.
3. **Icons only**: No emojis in UI — use lucide-react icons.
4. **TypeScript-first**: New modules must be `.ts`/`.tsx` where feasible.
5. **File path comments**: Every new file starts with a path comment.
6. **Centralization**: Reuse existing hooks/utils/components. Extract shared logic.
7. **Multi-tenant safe**: All Firestore queries scoped by `institutionId`.
8. **No hardcoded credentials**: Environment variables only.
9. **Cursor pointer**: Every clickable element must have `cursor-pointer`.

---

## Architecture Package

| File | Purpose |
|------|---------|
| [README.md](README.md) | This file — problem, scope, constraints |
| [strategy-roadmap.md](strategy-roadmap.md) | Master phase sequencing, dependencies, status tracker |
| [threat-analysis.md](threat-analysis.md) | Security, data integrity, permission, runtime threats |
| [centralization-audit.md](centralization-audit.md) | Deduplication opportunities, shared logic extraction |
| [test-strategy.md](test-strategy.md) | Complete test plan per phase (vitest + Playwright) |
| [branch-strategy.md](branch-strategy.md) | Branch tree, sub-branch lifecycle |
| [rollback-playbook.md](rollback-playbook.md) | Per-phase rollback procedures |
| [phases/](phases/) | One file per phase with objectives, acceptance criteria, tests |
| [working/](working/) | Scratch notes and research during execution |
| [reviewing/](reviewing/) | Deep verification artifacts |
| [subplans/](subplans/) | Optional sub-plans for complex phases |
| [sources/](sources/) | Original user specification |
| [user-updates.md](user-updates.md) | User-editable intake for mid-execution changes |
| [branch-log.md](branch-log.md) | Architecture branch tracking |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-19 | Architecture over Plan | 6 interconnected features across 10+ modules; badge system alone touches Firestore schema, 3 dashboards, auto-computation logic |
| 2026-04-19 | Phase 1 = Infrastructure first | Centralized unsaved-changes guard + cursor audit are foundations for later phases |
| 2026-04-19 | Badge system = 3 phases | Complexity warrants separate phases for data model, auto-badges, and manual+subject badges |
| 2026-04-19 | Sub-branches per phase group | Isolate risk: infrastructure, subjects, badges, polish |

---

## Source Specification

Original user spec: [sources/source-autopilot-user-spec-multi-feature-enhancement.md](sources/source-autopilot-user-spec-multi-feature-enhancement.md)
