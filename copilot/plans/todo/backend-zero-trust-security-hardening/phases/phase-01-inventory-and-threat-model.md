<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-01-inventory-and-threat-model.md -->
# Phase 01 — Inventory and Threat Model

## Tasks
- Enumerate all Firestore collections/doc types and current access paths.
- Enumerate all Storage paths and upload/download entry points.
- Map all privileged operations (Functions, admin SDK use).
- Build threat model by actor: anonymous, student, teacher, institutionadmin, admin.
- Identify trust boundaries: client, rules engine, callable functions, admin SDK.
- Classify data by sensitivity (public, tenant-internal, privileged, security-critical).
- Record attack vectors per boundary (tenant escape, privilege escalation, mass read/write abuse).

## Outputs
- Resource inventory matrix.
- Entry-point map (client/server).
- Top abuse scenarios list (privilege escalation, tenant escape, unauthorized overwrite/deletion).

## Mandatory tests
- Add initial deny-tests for obvious forbidden cross-tenant and role-escalation actions.
- Execute targeted rules tests for high-risk collections discovered in this phase.

## Exit criteria
- Inventory covers all active collections/paths.
- Threat scenarios mapped per role and boundary.
- Initial deny-tests created and passing.
## Status
 - Completed (2026-03-12)
## Completed artifacts
 - `working/phase-01-resource-inventory.md`
 - `working/phase-01-threat-model.md`
