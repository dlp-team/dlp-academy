<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/subplans/subplan-modal-architecture-unification.md -->
# Subplan - Modal Architecture Unification

## Parent Phase
- Phase 01

## Objective
Define, implement, and migrate to a shared modal foundation while preserving existing modal workflows.

## Workstreams
1. Inventory all configure/edit/create modal wrappers and variants.
2. Define BaseModal API for sizing, close behavior, and dirty-state interception.
3. Migrate highest-risk modals first (shared Home/Admin surfaces).
4. Verify required modal flows cannot close accidentally when completion is mandatory.

## Candidate Files
- src/components/modals/**
- src/pages/Home/**
- src/pages/InstitutionAdmin/**
- src/components/ui/**

## Validation
- Unit tests for close and dirty-state logic.
- Regression checks for existing modal submit/cancel flows.

## Rollback Trigger
- If migration causes workflow regressions, fallback to previous wrapper path for affected route while keeping BaseModal behind staged adoption.
