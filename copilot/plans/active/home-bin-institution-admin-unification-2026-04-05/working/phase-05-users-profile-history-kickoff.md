<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-05-users-profile-history-kickoff.md -->
# Phase 05 Working Note - Users, Profile Media, and Past Classes

## Status
- IN_PROGRESS

## Block Tracking
- Block A (2026-04-05): COMPLETED
- Block B (next): PLANNED

## Block A Scope (Completed)
- Harden user-detail profile media reliability with safe fallback rendering.
- Remove emoji-based role badge labels and switch to icon-based rendering.
- Introduce dedicated `Clases pasadas` section sourced from archived class rows.
- Add deterministic regression coverage for new behavior.

## Block A Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Upcoming Block B Scope
- Add safe delete-user capability in Users tab with explicit guardrails.
- Enforce tenant-safe behavior for destructive user operations.
- Add deterministic tests for authorized/blocked deletion flows.
