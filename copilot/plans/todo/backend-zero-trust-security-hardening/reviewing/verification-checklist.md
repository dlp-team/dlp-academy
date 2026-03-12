<!-- copilot/plans/todo/backend-zero-trust-security-hardening/reviewing/verification-checklist.md -->
# Verification Checklist

- [ ] All Firestore collections covered by explicit allow+deny tests.
- [ ] All Storage path patterns covered by explicit allow+deny tests.
- [ ] Tenant-escape attempts denied for all roles.
- [ ] Ownership bypass attempts denied.
- [ ] Role escalation writes denied from non-admin actors.
- [ ] Server-controlled fields cannot be overwritten from clients.
- [ ] Functions enforce auth, role, and tenant checks.
- [ ] Audit logs emitted for sensitive operations.
- [ ] Rollback drill executed and documented.
- [ ] Security tests integrated in CI as required checks.
