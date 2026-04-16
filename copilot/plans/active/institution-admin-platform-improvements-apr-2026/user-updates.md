# User Updates — Institution Admin & Platform Improvements

## How to Use
Add any clarifications, corrections, or additional requirements in the **Pending User Updates** section below. Copilot reads this before starting each implementation block and syncs the changes into the relevant phase files.

## Pending User Updates
_None at this time._

## Processed Updates

### 2026-04-16 — Phase 3 DONE
**Phase 3 — Scrollbars Modernization — DONE**
- Audited 24 overflow containers across 13 files in `modals/`, `Home/`, `InstitutionAdminDashboard/`, `Profile/`.
- Applied `clean-scrollbar` to content panels, modal bodies, overlay containers (15 elements).
- Applied `minimal-scrollbar` to small inline list/pickers (9 elements).
- Replaced legacy `custom-scrollbar` (3 instances) and `scrollbar-thin scrollbar-thumb-*` (1 instance).
- All 14 files clean (`get_errors` = 0). Commit pending.

### 2026-04-12 — Phase 1 completed; Phase 2 in progress

**Phase 1 — DONE (all 4 items)**
- `fix(admin): Remove duplicate Institution ID in panel header` — `f1542d3`
- `feat(academic-config): Add period start/end date fields with course defaulting` — `f1542d3`
- `feat(classes): Add academic year, course, and teacher filter controls` — `f1542d3`
- `feat(courses): Default to current-only view on first load` — `f1542d3`
- Filter UX fix (Desde/Hasta sync, removed clear button) — `b3ad912`

**Phase 2 — IN PROGRESS**
- **2A (DONE)** `fix(settings): Default theme-selector toggle to disabled for new users` — `f5d0e8b`
- **2B (DONE)** Bin selection toolbar: CSS fix in `f5d0e8b`; full structural fix (card-below-header, matches `HomeSelectionToolbar` pattern) applied in follow-up commit.
- **2C (DONE)** `feat(profile): Show AdminStatsPanel for admin/institutionadmin roles` — `f5d0e8b`

### 2026-04-12 — User feedback on Phase 2B
**Feedback:** "the selection mode on the bin should be on the same position and have the same style as the one on the other tabs like the manual."
**Action taken:** Restructured `BinView.tsx` selection toolbar from inline-in-header to standalone card section below the main toolbar row, matching `HomeSelectionToolbar`'s `mt-4 mb-6 rounded-xl border p-3 flex flex-col gap-3` container pattern with `containerTone` color logic. "Vaciar papelera" moved to always-visible position in top sort row.

### 2026-04-28 — Phases 4, 5, 6 completed; Phase 7 moved to inReview

**Phase 4 — DONE (pre-existing implementation verified)**
- Email verification flow already implemented in register, login, and app route guards.
- Plan phase documented and marked DONE.
- Commit: `c36c2bb`

**Phase 5 — DONE**
- Fixed multi-drag ghost behavior for 7+ selected items in `useGhostDrag.ts`.
- Staging now uses uncapped companion selection while ghost preview remains capped at 6.
- Commit: `1490ceb`

**Phase 6 — DONE**
- Created full Copilot UI patterns documentation system under `copilot/REFERENCE/ui-patterns/`.
- Added `copilot/REFERENCE/UI_PATTERNS_INDEX.md` and updated instruction gates in `.github/copilot-instructions.md` and `AGENTS.md`.
- Commit: `1a78a73`

**Phase 7 — IN_REVIEW**
- Completed optimization and deep risk analysis docs.
- Logged out-of-scope risk for pre-existing oversized `BinView.tsx`.
- Fixed Phase 1 regression in `ClassesCoursesSection.deleteConfirm.test.jsx` fixtures.
- Current test baseline: 164/165 files and 760/762 tests passing.
- Remaining failures are pre-existing in `InstitutionCustomizationMockView.test.jsx`.
- Commit(s): `9dd8b41` + follow-up pending for recovered risk/test/doc sync
