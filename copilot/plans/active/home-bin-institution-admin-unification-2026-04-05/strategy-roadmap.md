<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md -->
# Strategy Roadmap - Home, Bin, and Institution Admin Unification

## Phase Status Legend
- PLANNED
- IN_PROGRESS
- COMPLETED
- BLOCKED

## Ordered Phases

### Phase 00 - Codebase Audit and Dependency Mapping
- Status: COMPLETED
- Goal: establish architecture map, affected files, coupling matrix, and preservation checklist.
- Outputs:
  - dependency map for Home/Bin/Admin surfaces,
  - lossless-preservation checklist,
  - risk register and phase sequencing confirmation.

### Phase 01 - Global Modal and Scrollbar Foundation
- Status: IN_PROGRESS
- Goal: standardize modal wrapper behavior and remove left-side scrollbar compensation artifact.
- Outputs:
  - reusable modal base component API,
  - dirty-state close interception behavior,
  - corrected scrollbar compensation strategy.
- Progress (2026-04-05, Block A):
  - base modal API shipped,
  - first two low-risk delete-confirm modal migrations completed,
  - scrollbar left-gap compensation fix shipped,
  - targeted tests passing.
- Progress (2026-04-05, Block B):
  - close-guard hooks added to base modal for dirty-state interception wiring,
  - FolderDeleteModal migrated to shared base modal shell,
  - regression coverage added for folder modal screen-flow semantics,
  - targeted tests + typecheck passing.

### Phase 02 - Selection Mode and Bin Unification
- Status: PLANNED
- Goal: unify selection UX logic and align Bin grid/list interactions with requested behavior.
- Outputs:
  - shared selection behavior between Home and Bin,
  - dimming of unselected Home items when selection exists,
  - Bin grid scale-focus transition,
  - Bin list inline action panel with consistent styling.

### Phase 03 - Institution Admin Settings and Automation Controls
- Status: PLANNED
- Goal: expand settings for academic periods, course order, and automatic feature toggles.
- Outputs:
  - ordinary/extraordinary period defaults,
  - drag-and-drop non-duplicated course ordering,
  - institution-level tool toggles,
  - secure tenant-scoped writes and reads.

### Phase 04 - Customization Preview Parity
- Status: PLANNED
- Goal: enforce true fullscreen and exact functional parity in the customization preview.
- Outputs:
  - fullscreen preview without header overlap,
  - preview powered by real app components for subjects/topics/resources/bin,
  - exact header presence in preview,
  - live color reflection and active-zone highlighting.

### Phase 05 - User Management, Profile Media, and Past Classes
- Status: PLANNED
- Goal: improve user governance and user-view fidelity for institution admins.
- Outputs:
  - delete-user capability from users tab,
  - Firebase Storage profile image reliability,
  - icon-only visual language (no emojis in UI),
  - past-classes sections for teachers and students.

### Phase 06 - Cross-Cutting Optimization and Consolidation (Mandatory)
- Status: PLANNED
- Goal: centralize repeated logic, split oversized files, and optimize readability/maintainability.
- Outputs:
  - extracted shared hooks/utils/components where justified,
  - reduced duplication,
  - lint + impacted tests revalidated after optimization.

### Phase 07 - Validation, Deep Risk Review, and Lifecycle Transition
- Status: PLANNED
- Goal: complete final validation evidence and prepare transition to inReview/finished lifecycle states.
- Outputs:
  - validation command evidence,
  - lossless report and explanation sync,
  - two-step inReview gate documentation,
  - out-of-scope risks logged when applicable.

## InReview Two-Step Gate (Mandatory)
1. Optimization and Consolidation Review.
2. Deep Risk Analysis Review (security, data integrity, failure modes, edge behavior).

## Commit and Push Cadence Gate
- No second major work block starts before the previous validated block is committed and pushed.
- Expected commit granularity: phase-scoped or subphase-scoped validated increments.

## Rollback Strategy
- Maintain reversible, scoped commits aligned with phase boundaries.
- Keep feature flags/guards where needed for risky UI transitions.
- Revert latest phase commit if validation gates fail.

## Immediate Next Actions
1. Adopt dirty-state close interception in the first form modal candidate (likely Home or Institution Admin form flow).
2. Expand BaseModal adoption to admin-facing modals (for example Sudo/admin confirm surfaces) with lossless close behavior.
3. Run wider Phase 01 validation sweep (typecheck/lint + targeted modal regression suite) and prepare closure checklist.
