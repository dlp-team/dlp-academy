# Firestore Schema Cleanup TODO

- [ ] Audit all code for usage of `isShared` on subjects (queries, UI, rules).
- [ ] If not needed for efficient queries, remove `isShared` from all subject documents.
- [ ] If needed for performance, document why and where it is used.
- [ ] Update migration scripts and UI logic accordingly.

> Created: 2026-02-23
