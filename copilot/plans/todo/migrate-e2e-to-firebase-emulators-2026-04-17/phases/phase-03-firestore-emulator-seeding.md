# Phase 3: Firestore Emulator Data Seeding

## Objective
Seed the Firestore emulator with all required test data (subjects, folders, sharing relationships, institutions, etc.) so tests find the data they expect.

## Tasks

1. **Audit current test data dependencies**:
   - Map every test to the Firestore documents it reads/expects
   - Document required collections: `subjects`, `folders`, `institutionUsers`, `institutions`, `notifications`, `courses`, etc.
   - Identify documents created by Admin SDK in test `beforeAll`/`beforeEach` hooks

2. **Create `tests/e2e/seed/firestore-seed.ts`**:
   - Seed all required documents using Admin SDK against Firestore emulator
   - Organize by collection with clear ownership (which user owns what)
   - Include shared subjects/folders with proper `sharedWithUids` arrays
   - Include institution data for admin/institution-admin tests
   - Include courses data for subject creation tests

3. **Integrate seeding into global-setup**:
   - After Auth users created, seed Firestore documents
   - Use deterministic IDs for easy reference in tests
   - Ensure idempotent seeding (can re-run without conflicts)

4. **Handle per-test cleanup**:
   - Option A: Clear and re-seed between test files (cleanest)
   - Option B: Use unique prefixes per test run (faster, less clean)
   - Recommendation: Option A for reliability

## Validation Gate
- [ ] All seed data matches what tests expect to find
- [ ] Admin SDK successfully writes to Firestore emulator
- [ ] No orphaned references (all UIDs match seeded Auth users)
- [ ] Seed script is idempotent

## Estimated Effort: Medium (largest data mapping effort)
