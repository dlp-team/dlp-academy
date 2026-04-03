<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/working/institution-preview-architecture-audit.md -->
# Institution Preview Architecture Audit

## Decision Scope
Choose the best architecture for an exact, deeply interactive institution customization preview with mock data and live branding changes.

## Option A - Reuse Real App Components with Mock State Adapter
### Pros
- Highest UI fidelity and behavior parity (single rendering logic).
- Lower long-term drift risk between real app and preview.
- Better reuse of existing navigation and view composition.

### Cons
- Requires robust mock adapter and boundary controls.
- Potential performance overhead if full app shell is mounted.

## Option B - Dedicated Mock Accounts per Institution
### Pros
- Real backend-like behavior and realistic data contracts.

### Cons
- Operational overhead (mock identity lifecycle, data management, permissions).
- Security and tenancy complexity.
- Higher maintenance and environment coupling.

## Final Decision
Selected: **Option A - Reuse Real App Components with Mock State Adapter**.

### Decision Rationale
- Maximizes structural and visual parity by reusing existing Home-view components instead of rebuilding a parallel UI.
- Eliminates operational/security burden of maintaining per-institution mock accounts.
- Keeps preview deterministic and safe by enforcing mock-only, no-write behavior.
- Reduces long-term maintenance drift because preview updates naturally follow Home component evolution.

### Implemented Evidence (2026-04-03)
- `InstitutionCustomizationMockView` now provides fullscreen preview + collapsible controls panel while preserving explicit save-only persistence.
- `CustomizationHomeExactPreview` now reuses Home surfaces across Manual/Uso/Cursos/Compartido/Papelera with deterministic mock datasets.
- Deep drilldown is implemented in preview flow: subject -> topics -> content type cards (exámenes, tests, quizzes, material, fórmulas, guías).

## Implementation Constraints
- Preview must not mutate production/user data.
- Mock navigation should include deep drill-down for folders/subjects/topics/content types.
- Controls panel remains visible and collapsible; fullscreen mode must retain editability.

## Final Decision Status
FINALIZED
