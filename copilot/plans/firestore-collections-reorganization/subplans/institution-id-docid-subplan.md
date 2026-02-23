# Subplan: Institution ID = Firestore Document ID

## Goal
Use the Firestore document ID as the canonical institution identifier. Remove custom institutionId fields on institution documents, and align all reads/writes, UI, and security rules.

## Strategy
- Treat user.profile.institutionId as the institution document ID (no change to user docs).
- Remove institutionId fields from institution documents and UI form inputs.
- Replace any reads of institution.institutionId with the document ID (doc.id).
- Align Firestore rules to use the path parameter (institutionId) rather than resource data.


## Phases

### Phase 1 — Inventory & Analysis
- Catalog all places where `institutionId` is used or missing:
	- Institutions, users, subjects, folders, topics, classes, courses, shortcuts, etc.
- Identify all code paths for creation, sharing, and filtering by institution.
- List all legacy data (subjects, folders, topics, etc.) missing `institutionId`.

### Phase 2 — Implementation: New Data Writes
- Ensure all new documents (subjects, folders, topics, classes, courses, shortcuts, etc.) are created with `institutionId` set to the user's institution (doc ID).
- Update all creation flows (UI, backend, batch scripts) to require and propagate `institutionId`.
- On user registration, always assign the correct `institutionId` (doc ID) to the user profile.
- Update sharing logic to enforce institution boundaries (cannot share across institutions).

### Phase 3 — Implementation: Reads, Filters, and Security
- Update all queries and filters to use `institutionId` for tenant isolation.
- Refactor all UI and backend code to expect `institutionId` on all relevant documents.
- Update Firestore security rules to enforce institution boundaries using the document ID.

### Phase 4 — Legacy Data Migration
- Write and run a migration script to backfill `institutionId` on all legacy documents (subjects, folders, topics, classes, courses, etc.) that are missing it.
	- Infer `institutionId` from owner, parent, or related user where possible.
	- For orphaned or ambiguous records, flag for manual review or assign a default/null.
- Validate that all documents now have a valid `institutionId`.

### Phase 5 — Verification, Documentation, and Cleanup
- Test all create, update, share, and filter flows for correct institution isolation.
- Confirm dashboards and analytics work with the new institutionId logic.
- Update all documentation (README, dev docs, onboarding) to clarify that `institutionId` is always the Firestore doc ID.
- Remove any legacy code or fields related to the old institutionId approach.

## Working notes
- Keep institutionId in user documents; it now represents the institution document ID.
- If any legacy institutionId fields exist in institutions, they can remain but should be ignored and eventually removed.
- Avoid hard deletes of user institutionId until all flows are verified.

## Phase 1 findings (inventory snapshot)
- Core hooks already use institutionId filters and stamping: useSubjects, useFolders, useShortcuts.
- Institution admin flows use institutionId for classes, courses, allowed_teachers, and users.
- Legacy usage still present in teacher dashboard (schoolId) and in docs (ReadmePannels).
- User registration/login paths need verification to ensure institutionId is always set.
- Topic/material/quiz subcollections do not carry institutionId; rely on parent subject's institutionId.

## Status
- Phase 1: completed
- Phase 2: in progress
- Phase 3: in progress
- Phase 4: not started
