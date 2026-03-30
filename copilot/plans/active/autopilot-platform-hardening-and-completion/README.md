<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/README.md -->
# Autopilot Platform Hardening and Completion Plan

## Problem Statement
The platform received a broad autopilot mandate that spans security, authentication/session UX, teacher/student profile behavior, dashboard actions, institution customization previews, learning-workflow completion, mobile responsiveness, and architecture quality improvements.

A high-value subset is already implemented and validated, but the remaining scope is still cross-cutting and high-risk. This plan organizes the remaining work into executable phases with strict verification and rollback gates.

## Scope
- Consolidate and preserve already-shipped reliability/security/auth/profile/dashboard/customization improvements.
- Complete pending learning workflow gaps for subjects, topics, exams, and assignment/task flows.
- Improve mobile/tablet behavior across high-traffic surfaces.
- Execute a staged architecture quality pass (TypeScript migration tranches, lint debt reduction, logic centralization).
- Close with risk reporting and protocol-compliant verification artifacts.

## Non-Goals
- Firestore or hosting deployments from the agent environment.
- Broad visual redesign outside requested UX improvements and responsive corrections.
- Rewriting stable modules without a proven defect, risk, or duplication driver.

## Current Status
- Lifecycle: `active`
- Current phase: **Phase 05 - Subject, Topic, and Exam Workflow Completion (IN_PROGRESS)**
- Last updated: **2026-03-30**

## Completed Baseline (Already Delivered)
1. Home reliability hardening and resilient bulk operations.
2. Remember-me persistence and settings security actions (password update + logout).
3. Teacher aggregate profile stats plus recognition/badge flows.
4. Teacher dashboard expansion (subjects summary + behavior/badge actions).
5. Firestore constrained teacher recognition updates and rule test coverage.
6. Institution customization deterministic teacher/student mock preview.

## Plan Artifacts
- `strategy-roadmap.md` - Source of truth for phase sequencing/status.
- `phases/` - One file per phase with objective, changes, risks, and completion criteria.
- `subplans/` - Deep-dive execution tracks for remaining cross-domain work.
- `working/` - Assumptions, dependencies, and operational notes.
- `reviewing/` - Verification checklist for inReview transition.

## Key Decisions and Assumptions
- Preserve all existing behavior not explicitly marked for change (lossless protocol).
- Prefer surgical additions over broad rewrites.
- Perform validation at each phase boundary before continuing.
- Keep security posture least-privilege and test-backed.
- Prioritize user-visible reliability and mobile usability before heavy refactors.

## Testing Strategy
- Mandatory for implementation phases:
  - `npm run lint`
  - `npm run test`
  - Targeted rules tests when security or role-gated behavior changes.
  - Targeted unit tests for all new helpers/components.
- Add net-new tests for each new utility/hook/component introduced by pending phases.

## Rollout and Rollback Strategy
- Rollout:
  1. Merge phase outputs incrementally after passing phase validation gates.
  2. Keep each phase change set logically isolated for traceability.
  3. Update temporal lossless reports after each validated phase.
- Rollback:
  1. Revert the isolated phase patch set if regression is detected.
  2. Restore previous behavior with focused hotfix commit.
  3. Re-run affected test matrices before resuming forward work.

## Exit Criteria
- Remaining phases (05-08) are completed and validated.
- No new lint/test failures introduced.
- Required lossless and explanation artifacts are updated.
- Review checklist in `reviewing/verification-checklist-2026-03-30.md` is fully checked.
- Plan is ready to move from `active/` to `inReview/`.
