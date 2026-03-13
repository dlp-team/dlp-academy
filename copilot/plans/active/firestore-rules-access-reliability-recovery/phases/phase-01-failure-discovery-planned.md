# Phase 01 - Failure Discovery and Reproduction Matrix (PLANNED)

## Objective
Produce a deterministic, evidence-backed list of access failures currently affecting users.

## Inputs
- User-reported symptoms (drag/drop denied, delete denied, other denied actions).
- Existing e2e specs in `tests/e2e`.
- Current `firestore.rules` snapshot.

## Tasks
1. Run and inspect relevant e2e flows to capture failing operations.
2. Add temporary instrumentation where needed (client-side operation context only; no sensitive logging).
3. Record denied operations in a matrix with:
   - role,
   - action,
   - target path,
   - expected permission,
   - observed failure message.
4. Map each failure to candidate rule sections.

## Completion Criteria
- Every reported issue is reproducible or explicitly explained as non-repro.
- Failure matrix is complete and stored in `working/failure-matrix.md`.

## Risks
- False negatives if tests do not mirror production role/data combinations.

## Mitigation
- Use representative role fixtures and data states aligned with user reports.