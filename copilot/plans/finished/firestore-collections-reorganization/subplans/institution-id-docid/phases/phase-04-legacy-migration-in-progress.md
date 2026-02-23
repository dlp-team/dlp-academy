# Phase 04 - Legacy Data Migration (Completed)

## Objective
Backfill `institutionId` on legacy documents that were created before institution scoping was enforced.

## Scope
- subjects
- folders
- shortcuts
- classes
- courses
- allowed_teachers
- user documents missing institutionId

## Migration Strategy
- Primary source of truth: `users/{uid}.institutionId`.
- For subjects/folders/shortcuts:
  - If `ownerId` exists, copy owner user's institutionId.
  - If no ownerId, infer from parent or shared user where possible.
- For classes/courses:
  - Infer from `createdBy` user or associated teacher.
- For allowed_teachers:
  - Infer from matching institution by email domain if missing.
- For users without institutionId:
  - Resolve by allowed_teachers, then institution domain, else leave null for manual review.

## Validation
- No document remains without institutionId where required for tenant isolation.
- Record any orphaned or ambiguous docs for manual review.

## Completion Notes
- Migration script created: scripts/backfill-institution-id.js
- Script supports dry-run mode and email/domain-based resolution.
- Execution is pending operator run.

## Risks
- Orphaned docs without owner or related user.
- Users with personal email domains that do not match any institution.
