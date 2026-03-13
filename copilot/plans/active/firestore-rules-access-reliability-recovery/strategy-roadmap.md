# Strategy Roadmap - Firestore Rules Access Reliability Recovery

## Phase Status Legend
- PLANNED
- IN_PROGRESS
- COMPLETED
- BLOCKED

## Ordered Phases

### Phase 01 - Failure Discovery and Reproduction Matrix
- Status: COMPLETED
- Goal: establish deterministic reproduction for each reported authorization failure.
- Outputs:
  - operation matrix (action x role x resource x expected/actual),
  - minimal reproducible steps,
  - trace links to rule sections.

### Phase 02 - Rule Intent Mapping and Gap Analysis
- Status: IN_PROGRESS
- Goal: map current rule predicates to intended domain permissions and find mismatches.
- Outputs:
  - permission intent table,
  - gap list (false deny / false allow risks),
  - prioritized remediation queue.

### Phase 03 - Surgical Rule Remediation
- Status: IN_PROGRESS
- Goal: apply minimal, test-first fixes in `firestore.rules`.
- Outputs:
  - patch set grouped by failure class,
  - inline rationale for each changed predicate,
  - preserved least-privilege constraints.

### Phase 04 - Validation Hardening (Rules + E2E)
- Status: PLANNED
- Goal: prove fixes with realistic workflows and anti-regression tests.
- Outputs:
  - updated/added rules tests,
  - updated/added e2e tests (drag/drop, delete, share cases),
  - pass report for targeted + broad suites.

### Phase 05 - Review Gate, Rollback Readiness, Closure
- Status: PLANNED
- Goal: ensure safe closure with rollback and monitoring guidance.
- Outputs:
  - verification checklist completion,
  - rollback playbook references,
  - final lossless closure notes.

## Immediate Next Actions
1. Expand e2e coverage to explicitly assert drag/drop and delete behavior by role in shared-folder workflows.
2. Complete Phase 02 intent matrix with operation-by-operation predicate mapping for subjects/folders/shortcuts.
3. Continue Phase 03 with any additional minimal predicate fixes revealed by new e2e evidence.

## Rollback Strategy (High Level)
- Keep all rule changes atomic and grouped by behavior.
- Validate each group locally before moving to next.
- Preserve previous rule snapshot for immediate reversion if regression appears.

## Security Guardrails
- Never widen access globally to pass tests.
- Prefer narrow conditions with role + ownership + institution checks.
- Add explicit negative tests for unauthorized access to prevent over-permissioning.