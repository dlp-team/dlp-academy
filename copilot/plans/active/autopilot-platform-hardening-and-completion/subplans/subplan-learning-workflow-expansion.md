<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/subplans/subplan-learning-workflow-expansion.md -->
# Subplan - Learning Workflow Expansion

## Related Main Phase
- Phase 05 - Subject, Topic, and Exam Workflow Completion

## Objective
Complete functional parity and reliability across subject/topic/exam/task workflows for teacher and student roles.

## Scope
- Subject and topic creation/edit navigation.
- Exam creation/assignment/submission/result visibility paths.
- Task/assignment linkage consistency where integrated with topic/exam surfaces.
- User feedback for loading/error/empty states in high-frequency workflow actions.

## Out of Scope
- New role model changes.
- Firestore schema migrations not required by workflow correctness.

## Execution Slices
1. Build role-based journey matrix (teacher and student) for existing routes.
2. Implement missing transitions and state handling for blocked or inconsistent paths.
3. Extract duplicated workflow logic into reusable hooks/utils when duplication is proven.
4. Add targeted unit/integration tests for fixed branches.

## Validation and Test Strategy
- Required commands:
  - `npm run lint`
  - `npm run test`
- Additional checks:
  - targeted tests for modified workflow hooks/components,
  - manual journey walkthrough with expected role boundaries.

## Rollback Strategy
- Revert only the workflow slice that introduced regression.
- Keep each slice in isolated commit boundaries to enable selective rollback.
- Re-run targeted tests immediately after rollback.

## Completion Criteria
- Core teacher/student learning workflows are deterministic and role-safe.
- No stuck loading states or silent failures remain in targeted journeys.
- Tests cover newly fixed high-risk branches.
