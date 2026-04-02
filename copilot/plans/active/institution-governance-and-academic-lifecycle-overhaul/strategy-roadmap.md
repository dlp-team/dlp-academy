<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/strategy-roadmap.md -->

# Strategy Roadmap - Institution Governance and Academic Lifecycle Overhaul

## Phase Status Legend
- PLANNED
- IN_PROGRESS
- COMPLETED
- BLOCKED

## Ordered Phases

### Phase 01 - Discovery, Dependency Graph, and Architecture Decisions
- Status: COMPLETED
- Goal: create definitive dependency map and lock architecture decisions that affect downstream implementation.
- Outputs:
  - decision log for customization preview architecture,
  - decision log for academic year ownership and lifecycle,
  - decision log for dual-role operation model,
  - implementation order and risk register.

### Phase 02 - Access Control Reliability Recovery (Firestore + Storage)
- Status: IN_PROGRESS
- Goal: fix teacher subject creation/deletion authorization and institution icon upload authorization without over-permissioning.
- Outputs:
  - minimal rules patch for `firestore.rules`,
  - minimal rules patch for `storage.rules`,
  - targeted rule and unit tests,
  - explicit deny-path validation evidence.

### Phase 03 - Deletion Lifecycle and Bin-First Architecture
- Status: IN_PROGRESS
- Goal: enforce bin-first lifecycle where requested, including folder and course/class deletion semantics.
- Outputs:
  - folder delete mode implementation updates,
  - nested bin recovery/deletion behavior,
  - institution admin bin flow for course/class removals,
  - confirmation overlays with typed-name guards.

### Phase 04 - Institution Admin Dashboard Upgrades
- Status: PLANNED
- Goal: deliver reliable governance tooling for customization preview, policy enforcement, and large-list pagination.
- Outputs:
  - exact-app preview implementation,
  - paginated students/teachers lists,
  - hardened institution policy application behavior.

### Phase 05 - Academic Year Governance and Courses UX Overhaul
- Status: PLANNED
- Goal: establish mandatory academic-year model and role-aware lifecycle visibility across courses/manual tabs.
- Outputs:
  - mandatory format validation and auto-fill,
  - academic-year picker with range and paging,
  - courses tab year filters/collapsibles/persistence,
  - history tab and send-to-history removal,
  - ended-subject visual indicators per role.

### Phase 06 - Home/Admin UX Reliability and Selection Mode Enhancements
- Status: PLANNED
- Goal: improve selection mode and bin management UX, fix animation defect, and streamline admin institution navigation.
- Outputs:
  - improved selection mode controls,
  - bin ordering and bin-specific multi-select actions,
  - Escala/Filtrar animation fix,
  - clickable institution rows in admin dashboard.

### Phase 07 - Dual-Role Model Implementation
- Status: PLANNED
- Goal: support institution-admin plus teacher coexistence with deterministic role switching and no identity collisions.
- Outputs:
  - finalized role model,
  - role switch control and persisted view preference,
  - permission and route guard validation.

### Phase 08 - Stabilization, Documentation Sync, and Review Gate
- Status: PLANNED
- Goal: complete full validation suite, sync documentation, and prepare closure.
- Outputs:
  - passing targeted + impacted test runs,
  - updated explanation docs and lossless reports,
  - completed review checklist and closure summary.

## Immediate Next Actions
1. Validate and document 15-day retention semantics for folder/course/class bin lifecycle (including purge execution path).
2. Consolidate full Phase 03 behavior matrix evidence (folder options + nested drilldown + institution-admin lifecycle) and prepare phase close gate.
3. Re-run emulator-backed rules validation once emulator startup configuration is available, then close remaining Phase 02 validation gate.

## Rollback Strategy
- Keep all rule changes atomic and scoped by failure class.
- Preserve previous behavior with additive predicates instead of broad replacements.
- Validate each patch set before entering the next subsystem.
- Maintain per-phase rollback notes in phase files.

