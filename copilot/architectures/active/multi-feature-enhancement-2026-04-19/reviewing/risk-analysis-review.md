<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/reviewing/risk-analysis-review.md -->
# Review Gate 2: Deep Risk Analysis

**Date**: 2026-04-19
**Reviewer**: Copilot (automated)

---

## Security Boundary Verification

| Threat | Mitigation | Status |
|--------|-----------|--------|
| T-DATA-01 (data integrity) | Subject uniqueness uses case-insensitive Firestore queries scoped by institutionId | ✅ |
| T-DATA-05 (badge data) | All badge operations scoped by institutionId; Firestore merge writes | ✅ |
| T-UX-03 (unsaved changes) | FolderManager guards both sharing and general form changes | ✅ |
| T-SEC-04 (unauthorized badge ops) | badgePermissions.ts enforces role-based checks | ✅ |
| T-PERM-01 (permission bypass) | canManageSubjectBadges checks ownerId/editorUids; canManageGeneralBadges checks admin roles | ✅ |

## Permission Enforcement Validation
- `canRevokeBadge` prevents revoking system auto-badges
- `canAwardBadge` routes through scope-specific checks
- All Firestore writes include `institutionId` for multi-tenant isolation

## Data Integrity Verification
- Subject uniqueness check uses (name, course, academicYear, classIds) tuple
- Badge upsert uses `upsertCourseBadge` which prevents duplicate keys
- Auto-badge revocation removes badge entry cleanly (no orphaned data)

## Runtime Failure Modes
- `computeGradeMean` returns NaN for empty/invalid arrays (handled in consumers)
- `useBadgeAggregation` has cancellation token to prevent stale state updates
- `useBadgeAutoComputation` returns safe defaults on missing institutionId

## Multi-Tenant Isolation
- All Firestore queries include `where('institutionId', '==', ...)` clause
- Badge templates scoped by institutionId + subjectId
- Student badges scoped by institutionId + studentId
- Cross-subject aggregation reads only within institution boundary

## Edge Condition Behavior
- Conduct default changed from 5→10 (only affects new renders, not persisted data)
- Subject uniqueness: returns true (safe) if required fields are missing
- Badge threshold boundary: exactly at threshold = eligible (>=, not >)
