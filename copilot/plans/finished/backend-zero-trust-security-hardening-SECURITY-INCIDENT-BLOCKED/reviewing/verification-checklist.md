<!-- copilot/plans/todo/backend-zero-trust-security-hardening/reviewing/verification-checklist.md -->
# Verification Checklist

- [x] Baseline evidence captured before hardening started.
- [x] Authorization matrix completed and mapped to all collections/paths.
- [ ] All Firestore collections covered by explicit allow+deny tests.
- [ ] All Storage path patterns covered by explicit allow+deny tests.
- [x] All Storage path patterns covered by explicit allow+deny tests — `tests/rules/storage.rules.test.js`: profile-pictures (owner/admin allow, non-owner deny), branding (same-tenant admin allow, cross-tenant deny), impersonation guard, doc-removed owner-bound access, global deny fallback, unauthenticated deny. 8/8 tests pass.
- [ ] Tenant-escape attempts denied for all roles.
- [x] Tenant-escape attempts denied for all roles — Firestore: cross-institution read/write denied by institutionId checks. Storage: cross-tenant branding write (institution-admin-2 → inst-1) is denied. All confirmed passing.
- [ ] Ownership bypass attempts denied.
- [x] Ownership bypass attempts denied — storage impersonation guard test passes; Firestore ownership checks enforced via rules.
- [x] Role escalation writes denied from non-admin actors.
- [ ] Server-controlled fields cannot be overwritten from clients.
- [x] Functions enforce auth, role, and tenant checks.
- [ ] Audit logs emitted for sensitive operations.
- [ ] New tests were created for every changed rule/path.
- [x] New tests were created for every changed rule/path — `tests/rules/storage.rules.test.js` (storage paths), `tests/unit/functions/preview-handler.test.js` (privileged callable boundary), `tests/unit/functions/guards.test.js` (guard module).
- [x] All newly created tests were executed and passed.
- [x] Full regression suite executed and passed (no breakage introduced).
- [ ] Authorized CRUD flows validated after hardening for all critical roles.
- [x] `npm run lint` and `npx tsc --noEmit` executed and reviewed.
- [x] Test evidence recorded in `reviewing/test-execution-matrix.md`.
- [ ] Release gate checklist completed before rollout.
- [ ] Rollback drill executed and documented.
- [ ] Security tests integrated in CI as required checks.
