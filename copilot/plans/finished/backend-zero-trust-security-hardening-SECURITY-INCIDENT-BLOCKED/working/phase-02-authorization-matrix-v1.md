<!-- copilot/plans/todo/backend-zero-trust-security-hardening/working/phase-02-authorization-matrix-v1.md -->
# Phase 02 Authorization Matrix v1

## Matrix (critical resources)
| Resource | Action | Student | Teacher | Institution Admin | Global Admin | Required Conditions |
|---|---|---|---|---|---|---|
| `users/{uid}` | read | scoped | scoped | institution-scoped | all | signed-in + tenant boundaries |
| `users/{uid}` | update self profile | self only | self only | self only | all | immutable `role`, immutable `institutionId` unless admin flow |
| `users/{uid}` | update role/institution | deny | deny | deny | allow | admin-only mutation |
| `institutions/{id}` | read | tenant | tenant | tenant | all | tenant match unless global admin |
| `institutions/{id}` | update policy/branding fields | deny | deny | own institution | all | strict tenant + allowlist fields |
| `institution_invites/{id}` | get by id | allow with code controls | allow with code controls | own tenant | all | public-get only if truly needed and no sensitive data |
| `institution_invites/{id}` | list | deny | deny | own institution | all | role + tenant check |
| `subjects/{id}` | read | own/shared/tenant permitted | own/shared/tenant permitted | tenant | all | share/owner checks + tenant checks |
| `subjects/{id}` | create/update/delete | restricted | owner/editor policy | tenant policy | all | immutable owner/institution fields where required |
| `folders/{id}` | read/write | deny folder management | owner/editor + tenant | tenant policy | all | folder ownership + tenant checks |
| `topics/documents/resumen/quizzes/exams` | CRUD | scoped by subject/topic access | scoped by subject/topic access | tenant policy | all | inherited tenant + ownership chain checks |
| `shortcuts/{id}` | create/read/update/delete | strict constraints | strict constraints | tenant oversight | all | owner target parity + anti-impersonation |
| `classes/{id}` | CRUD | read scoped | read/limited | own institution manage | all | institution-scoped controls |
| `courses/{id}` | CRUD | read scoped | read scoped | own institution manage | all | institution-scoped controls |
| `subject_class_requests/{id}` | CRUD | deny | create own pending/read own | institution moderation | all | teacher ownership + admin moderation |

## Immutable / Server-only fields
- `users.role`, `users.institutionId` (except admin-controlled flows)
- ownership fields: `ownerId`, `createdBy`
- tenant fields: `institutionId` (immutable after create except privileged migration flows)
- audit fields: `createdAt`, `updatedAt` by server conventions where enforced

## Denied transitions (must be tested)
- Non-admin role escalation.
- Cross-tenant reassignment of any resource.
- Teacher/student deletion of institutional policy objects.
- Shortcut creation for targets not owned/shared in same tenant.
