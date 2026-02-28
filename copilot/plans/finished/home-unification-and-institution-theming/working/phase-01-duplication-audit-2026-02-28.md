# Phase 01 Duplication Audit — 2026-02-28

## Scope of this audit
This audit covers repeated logic and repeated style primitives in Home-level modules, with a focus on low-risk unification opportunities.

Reviewed areas:
- `src/pages/Home/Home.jsx`
- `src/pages/Home/components/HomeContent.jsx`
- `src/pages/Home/hooks/useHomeState.js`
- `src/pages/Home/hooks/useHomePageHandlers.js`
- `src/pages/Home/components/HomeShareConfirmModals.jsx`
- `src/pages/Home/components/HomeDeleteConfirmModal.jsx`
- `src/utils/layoutConstants.js`
- `src/utils/permissionUtils.js`

## Findings summary
1. **Shared-visibility checks are duplicated** across `Home.jsx`, `HomeContent.jsx`, and `useHomeState.js` with similar but not fully centralized logic.
2. **Shortcut merge + dedup patterns are duplicated** for folders and subjects in both `Home.jsx` and `HomeContent.jsx`, and conceptually repeated in `useHomeState.js`.
3. **Owner/shared relationship predicates are reimplemented** in multiple hooks/components instead of using one canonical helper API.
4. **Modal shell classes and overlay patterns are repeated** in Home confirmation modals, with identical container/card styling strings.
5. **Design primitives centralization is partial**: `OVERLAY_TOP_OFFSET_STYLE` exists, but most color/spacing/card shell classes are still distributed inline.
6. **Legacy duplicate file present**: `src/pages/Home/hooks/useHomeLogic copy.js` appears to contain old duplicated behavior and should be verified for active usage.

## Duplication map (concrete)

### A) Shared visibility / ownership logic
- `Home.jsx`: `isSharedForCurrentUser`
- `HomeContent.jsx`: `isSharedForCurrentUser`, `matchesSharedFilter`
- `useHomeState.js`: `isOwnedByCurrentUser`, `isSharedWithCurrentUser` (for folders and subjects)

Observation:
- These functions all inspect `ownerId`/`uid`/`isOwner`, `sharedWithUids`, `sharedWith` (email/uid), and shortcut semantics.
- Semantics are very similar but currently copied in several places.

### B) Merge source + shortcuts with dedup
- `Home.jsx`: `treeFolders`, `treeSubjects` (source + shortcut merge with Set)
- `HomeContent.jsx`: `allFoldersForTree`, `allSubjectsForTree` (same pattern)
- `useHomeState.js`: `foldersWithShortcuts`, `subjectsWithShortcuts` (similar dedup/prefers shortcuts)

Observation:
- There is repeated merge-key logic (`source:${id}`, `shortcut:${shortcutId || id}` / target-based keys).
- Candidate for generic merge utility with strategy options.

### C) User relation predicates
- `useHomeState.js`: repeated blocks for folder/subject relation checks.
- `Home.jsx` + `HomeContent.jsx`: repeated checks for owner/shared/shortcut.

Observation:
- A utility layer in `src/utils/permissionUtils.js` can be extended to host these predicates and avoid component-level redefinitions.

### D) Modal visual shell duplication
- `HomeShareConfirmModals.jsx` and `HomeDeleteConfirmModal.jsx` share repeated backdrop + card shell classes:
  - backdrop: `bg-black/50 dark:bg-black/70`
  - card shell: `bg-white dark:bg-slate-900 rounded-2xl ... shadow-xl ...`
  - text tone: `text-gray-500 dark:text-gray-400`

Observation:
- Strong candidate for reusable modal-shell constants/component to prepare institution theming.

## Existing centralization assets
- `src/utils/layoutConstants.js` already centralizes top offset (`OVERLAY_TOP_OFFSET_STYLE`).
- `src/utils/permissionUtils.js` already centralizes permission checks (`isOwner`, `canEdit`, `canView`, `getPermissionLevel`, `isShortcutItem`) but does not yet expose a canonical `isSharedForCurrentUser` predicate used by Home.

## Extraction candidates and risk ranking

### Candidate 1 — Shared item relation helpers (HIGH VALUE / LOW-MEDIUM RISK)
Create utility helpers in `permissionUtils` (or new `sharingUtils`) for:
- `isOwnedByCurrentUser(item, user)`
- `isSharedWithCurrentUser(item, user)`
- `isSharedForCurrentUser(item, user, options)`

Expected impact:
- Remove duplicated ownership/shared checks from Home components/hooks.

Risk:
- Must preserve subtle shortcut behavior differences.

### Candidate 2 — Generic source+shortcut merge utility (HIGH VALUE / MEDIUM RISK)
Create utility:
- `mergeEntitiesWithShortcuts({ sourceItems, shortcutItems, sourceKey, shortcutKey, visibilityFilter })`

Expected impact:
- Replace repeated merge+dedup blocks in `Home.jsx` and `HomeContent.jsx`.

Risk:
- Merge-key strategy must preserve current ordering and identity assumptions.

### Candidate 3 — Shared modal shell tokens/component (MEDIUM VALUE / LOW RISK)
Create shared constants/component for common modal shell classes and backdrop classes.

Expected impact:
- Fewer class string duplicates; easier institution theming entry point.

Risk:
- Mostly visual; keep exact classes initially to ensure no visual drift.

### Candidate 4 — Theme token registry (FOUNDATION / MEDIUM RISK)
Create theme token source (colors, spacing, radius, shadows, interaction states), with default values matching current look.

Expected impact:
- Enables institution-level customization from AdminInstitutionDashboard.

Risk:
- Broad impact if introduced too aggressively; should be incremental and guarded.

## Institution theming direction (for upcoming phases)
Recommended token categories:
1. **Brand**: primary, secondary, accent
2. **Surfaces**: page, card, modal, overlay
3. **Text**: primary, secondary, muted
4. **Border/interactive**: border, hover, focus, active
5. **Spacing/radius/shadow**: spacing scale, border radius, elevation
6. **Layout constants**: top offsets, container max widths

Compatibility rule:
- Keep user-facing web copy in Spanish.
- Keep implementation/reporting/code comments in English.

## Proposed implementation order (next step)
1. Add canonical sharing relation helpers (no UI change).
2. Replace duplicated `isSharedForCurrentUser` call sites in `Home.jsx` and `HomeContent.jsx`.
3. Extract merge+dedup utility and apply first to tree lists.
4. Introduce modal shell constants preserving exact current classes.
5. Introduce token registry with defaults, then wire institution override path.

## Notes
- `src/pages/Home/hooks/useHomeLogic copy.js` should be validated for dead-code status; if unused, move to archive/delete in a separate lossless change.
