# Phase 03 - Code-Driven Role Assignment (No Self-Selection)

## Objective
Make backend validation the sole authority for role assignment in onboarding/register code flows.

## Tasks
- Remove client-authoritative role selection from access-code decision path.
- Use backend response role for persisted user role.
- Ensure onboarding/register writes role from server validation, not UI state.
- Add tests for mismatch attempts and role spoofing.

## Exit Criteria
- User-entered role cannot override backend role resolution.
- Register and onboarding both persist role from trusted backend output.
