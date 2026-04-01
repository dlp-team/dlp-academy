# FIRESTORE_SCHEMA

## Purpose
This document summarizes the primary Firestore collections, ownership model, and query constraints used by DLP Academy.

## Core Collections

### users
- Document ID: `uid`.
- Key fields: `role`, `institutionId`, `email`, `displayName`.
- Notes:
  - Self-profile create/update allowed with guardrails.
  - Role or institution changes are restricted by rules.

### institutions
- Document ID: auto/manual institution ID.
- Key fields: `name`, `domain`, `type`, `enabled`, `institutionAdministrators`.
- Notes:
  - Managed by global admins and institution admins (same tenant scope).

### institution_invites
- Document ID: invite ID.
- Key fields: `email`, `institutionId`, `role`, `type`, timestamps.
- Notes:
  - Public direct `get` by ID allowed for invite acceptance.
  - Listing and mutation are role-restricted.

### subjects
- Document ID: subject ID.
- Key fields: `ownerId`, `institutionId`, `name`, `course`, `inviteCode`, `inviteCodeEnabled`, `inviteCodeRotationIntervalHours`, `inviteCodeLastRotatedAt`, `enrolledStudentUids`, sharing fields.
- Notes:
  - Creation requires `course`.
  - Invite governance fields are type/range validated by rules.

### subjectInviteCodes
- Document ID: `<institutionId>_<inviteCode>`.
- Key fields: `inviteCode`, `institutionId`, `subjectId`, `createdBy`, `createdAt`.
- Notes:
  - Enumeration is denied by rules.
  - Direct document fetch by ID is allowed for invite resolution.

### folders
- Document ID: folder ID.
- Key fields: `ownerId`, `institutionId`, hierarchy metadata, sharing fields.

### topics
- Document ID: topic ID.
- Key fields: `ownerId`, `institutionId`, `subjectId`, `name`, ordering metadata.

### documents
- Document ID: document ID.
- Key fields: `ownerId`, `institutionId`, `topicId`, resource metadata.

### quizzes
- Document ID: quiz ID.
- Key fields: `ownerId`, `institutionId`, `topicId`, quiz metadata.

### shortcuts
- Document ID: shortcut ID.
- Key fields: `ownerId`, `parentId`, `targetId`, `targetType`, `institutionId`, `createdAt`.
- Notes:
  - Rules validate canonical shortcut payload shape.

## Cross-Collection Invariants
1. Tenant Scope
- Domain resources should include `institutionId`.
- Writes with missing/mismatched tenant IDs are denied for non-admin users.

2. Ownership
- `ownerId` is the canonical owner field for content resources.
- Legacy compatibility fields (`uid`, snake_case refs) are still handled in selected paths.

3. Subject/Topic Reference Integrity
- Topic/document/quiz access checks can resolve related subject/topic records to enforce tenant compatibility.

## Index and Query Notes
- Pagination paths use `limit` + `startAfter` contracts.
- Subject read paths include owner, shared, class, and enrolled vectors for students.
- Keep query constraints aligned with active indexes in `firestore.indexes.json`.

## Changelog
- 2026-04-01: Created initial schema reference for Phase 08 documentation scope.
