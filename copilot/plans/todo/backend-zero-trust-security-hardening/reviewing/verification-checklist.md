<!-- copilot/plans/todo/backend-zero-trust-security-hardening/reviewing/verification-checklist.md -->
# Verification Checklist

- [ ] Baseline evidence captured before hardening started.
- [ ] Authorization matrix completed and mapped to all collections/paths.
- [ ] All Firestore collections covered by explicit allow+deny tests.
- [ ] All Storage path patterns covered by explicit allow+deny tests.
- [ ] Tenant-escape attempts denied for all roles.
- [ ] Ownership bypass attempts denied.
- [ ] Role escalation writes denied from non-admin actors.
- [ ] Server-controlled fields cannot be overwritten from clients.
- [ ] Functions enforce auth, role, and tenant checks.
- [ ] Audit logs emitted for sensitive operations.
- [ ] New tests were created for every changed rule/path.
- [ ] All newly created tests were executed and passed.
- [ ] Full regression suite executed and passed (no breakage introduced).
- [ ] Authorized CRUD flows validated after hardening for all critical roles.
- [ ] `npm run lint` and `npx tsc --noEmit` executed and reviewed.
- [ ] Test evidence recorded in `reviewing/test-execution-matrix.md`.
- [ ] Release gate checklist completed before rollout.
- [ ] Rollback drill executed and documented.
- [ ] Security tests integrated in CI as required checks.
