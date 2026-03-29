# Phase 00 Gap Inventory (Draft)

## Backend-Critical Surface Areas

- Migration runner + migration presets (`scripts/run-migration.cjs`, `scripts/migrations/*.cjs`)
- Firestore rules and indexes (`firestore.rules`, `firestore.indexes.json`)
- Environment/auth handling for service account execution (`FIREBASE_SERVICE_ACCOUNT_PATH/JSON`)
- Operational docs and runbooks (`scripts/README-migrations.md`, copilot plans/protocols)

## Verified Gaps

- No standardized migration verification checklist artifact generated/stored per run (risk: medium)
- Rollback playbook is not yet formalized by migration category (risk: high)
- No single release gate document that ties rules changes + migration validation + smoke checks (risk: high)
- Current runner summary is concise, but does not persist machine-readable run results for audit trails (risk: medium)

## Priority Proposal

1. Add rollback playbook for migration runs (high)
2. Add release gate checklist linking migrations + rules + smoke checks (high)
3. Add reusable migration verification checklist templates (medium)
4. Add optional run report artifact output from migration runner (medium)

## Proposed Phase 01 Scope

- Deliver a `migration-rollback-playbook.md` in `scripts/` with scenario-based rollback steps.
- Deliver a `migration-release-gate-checklist.md` in `scripts/` for operational sign-off.
- Deliver review checklist templates under active plan `reviewing/` for repeatable validation.
