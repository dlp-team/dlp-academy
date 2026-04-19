<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/centralization-audit.md -->
# Centralization Audit — Multi-Feature Enhancement Architecture

**Purpose**: Identify duplicated logic, shared patterns, and extraction opportunities to reduce code, improve control, and maximize reuse.

---

## 1. Overlay / Modal Close-Guard Pattern (HIGH PRIORITY)

### Current State
Multiple overlays independently implement "unsaved changes" detection:
- `SubjectFormModal.jsx` — custom `showDiscardPendingConfirm` state + inline confirmation JSX
- `EditSubjectModal.jsx` — similar pattern with slight variations
- `TopicFormModal.jsx` — another copy of the pattern
- `EditTopicModal.jsx` — yet another copy
- `FolderManager.jsx` — folder editing with close guard

### Duplication Count: ~5 independent implementations

### Extraction Target
| Artifact | Path | Purpose |
|----------|------|---------|
| `useUnsavedChangesGuard` | `src/hooks/useUnsavedChangesGuard.ts` | Track dirty state, expose `isDirty`, `confirmClose()`, `resetDirty()` |
| `UnsavedChangesConfirmModal` | `src/components/ui/UnsavedChangesConfirmModal.tsx` | Standard confirmation UI |
| `GuardedOverlay` | `src/components/ui/GuardedOverlay.tsx` | Wrapper that integrates guard with any overlay |

### Estimated Reduction: ~200 lines of duplicated code across 5+ files

---

## 2. Badge Computation Logic (HIGH PRIORITY)

### Current State
- `BadgesSection.jsx` contains inline `BADGE_CATALOG` constant with badge definitions
- Badge earning logic is inline within the component
- No shared utility for badge computation

### Extraction Target
| Artifact | Path | Purpose |
|----------|------|---------|
| `badgeUtils.ts` | `src/utils/badgeUtils.ts` | Badge template definitions, grade-based computation, style interpolation |
| `useBadges.ts` | `src/hooks/useBadges.ts` | Data fetching, CRUD operations, multi-tenant scoping |
| `BadgeTypes.ts` | `src/types/badges.ts` | TypeScript interfaces for all badge variants |

### Estimated Reduction: Badge logic shared across Profile, TeacherDashboard, SubjectPage

---

## 3. Confirmation Modal Pattern (MEDIUM PRIORITY)

### Current State
Multiple files implement inline confirmation modals with similar structure:
- Delete confirmations (red accent, AlertTriangle icon)
- Discard confirmations (yellow/amber accent)
- Share confirmations (blue accent)
- Each reimplements: backdrop, centered card, title, description, cancel/confirm buttons

### Key Files
- `HomeDeleteConfirmModal.jsx`
- `HomeShareConfirmModals.jsx`
- `FolderDeleteModal.jsx`
- `DeleteModal.jsx`
- Inline confirmations in `SubjectFormModal.jsx`, `TopicFormModal.jsx`

### Extraction Target
| Artifact | Path | Purpose |
|----------|------|---------|
| `ConfirmationModal` | `src/components/ui/ConfirmationModal.tsx` | Generic confirmation with configurable accent, icon, title, description, actions |

### Estimated Reduction: ~150 lines across 6+ files; single source of truth for confirmation UI

---

## 4. Cursor Pointer Enforcement (LOW PRIORITY)

### Current State
- `cursor-pointer` is manually added to individual elements
- No global enforcement rule
- Some clickable elements may be missing the class

### Extraction Target
| Artifact | Path | Purpose |
|----------|------|---------|
| Global CSS rule | `src/index.css` | `button, [role="button"], [onclick] { cursor: pointer; }` |
| Copilot instruction | `.github/instructions/` | Enforcement rule for all future development |

### Estimated Impact: Eliminates need to remember `cursor-pointer` on every button/link; catches future misses automatically

---

## 5. Theme Transition Management (LOW PRIORITY)

### Current State
- `useDarkMode.js` handles theme state
- `themeMode.js` has `applyThemeToDom()` with animation support
- `index.css` has `theme-switching` class
- Transition duration scattered: some in CSS vars, some in JS timeouts

### Extraction Target
| Artifact | Path | Purpose |
|----------|------|---------|
| Centralized transition config | `src/utils/themeMode.js` (existing) | Consolidate all transition timing to single source |
| CSS variable | `src/index.css` | `--theme-transition-duration: 260ms` as single source for all theme transition references |

### Estimated Impact: Single place to tune transition timing; eliminates magic numbers

---

## 6. Subject Validation Logic (MEDIUM PRIORITY)

### Current State
- Subject form validation is inline within modal components
- No shared validation utility for subject uniqueness or field constraints
- Cascading update logic will be new (no existing centralization needed, but should be extracted from start)

### Extraction Target
| Artifact | Path | Purpose |
|----------|------|---------|
| `subjectValidation.ts` | `src/utils/subjectValidation.ts` | Uniqueness check, field validation, cascading dependency map |

### Estimated Impact: Clean separation of validation logic from UI; testable in isolation

---

## Summary

| # | Opportunity | Priority | Est. Lines Saved | Phase |
|---|------------|----------|-----------------|-------|
| 1 | Overlay close-guard extraction | HIGH | ~200 | Phase 03 |
| 2 | Badge computation centralization | HIGH | ~150 | Phase 07 |
| 3 | Confirmation modal unification | MEDIUM | ~150 | Phase 03 |
| 4 | Cursor pointer global rule | LOW | ~50 | Phase 01 |
| 5 | Theme transition config | LOW | ~20 | Phase 02 |
| 6 | Subject validation extraction | MEDIUM | ~80 | Phase 04 |

**Total estimated deduplication: ~650 lines**
