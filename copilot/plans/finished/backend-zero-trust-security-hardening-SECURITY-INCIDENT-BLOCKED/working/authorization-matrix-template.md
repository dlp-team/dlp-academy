<!-- copilot/plans/todo/backend-zero-trust-security-hardening/working/authorization-matrix-template.md -->
# Authorization Matrix Template

## Columns
- Resource
- Action (read/create/update/delete)
- Actor role (anonymous/student/teacher/institutionadmin/admin)
- Required tenant condition
- Required ownership/share condition
- Allowed fields to mutate
- Denied transitions
- Rule helper reference
- Test case IDs (allow + deny)

## Row Template
| Resource | Action | Role | Tenant Condition | Ownership/Share | Mutable Fields | Denied Transitions | Rule Helper | Tests |
|---|---|---|---|---|---|---|---|---|
| `subjects` | `update` | `teacher` | `request.auth.institutionId == resource.data.institutionId` | `ownerId == request.auth.uid OR editor share` | `name, tags, color` | cannot change `ownerId`, `institutionId` | `isOwnerOrEditorInTenant()` | `SUBJ-UPD-ALLOW-01`, `SUBJ-UPD-DENY-07` |