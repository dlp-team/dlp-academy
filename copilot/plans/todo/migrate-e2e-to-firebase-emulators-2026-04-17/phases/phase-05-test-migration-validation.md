# Phase 5: Test Migration & Validation

## Objective
Run all 75 E2E tests against the emulator and fix any emulator-specific issues.

## Tasks

1. **Run full suite against emulators** and categorize results:
   - Tests that pass immediately (expected: majority)
   - Tests that fail due to missing seed data (fix in seed script)
   - Tests that fail due to emulator behavior differences (investigate)

2. **Fix seed data gaps**:
   - Add missing documents/collections discovered during test runs
   - Ensure proper `institutionId` scoping in seed data
   - Verify sharing relationships are correctly seeded

3. **Handle emulator-specific differences**:
   - Auth emulator: no rate limiting, no email verification enforcement
   - Firestore emulator: security rules still enforced (load `firestore.rules`)
   - Storage emulator: simpler but functional

4. **Validate the 7 currently-skipped tests**:
   - Bin view tests (2): May work with emulator if env vars set
   - Branding test (1): Still role-dependent, likely still skipped
   - Shared folder test (1): Firestore query bug — still skipped
   - Others: Evaluate individually

5. **Run full suite 3 times** to confirm no flakiness

## Validation Gate
- [ ] >= 68 tests pass against emulators (match or exceed live count)
- [ ] 0 new failures introduced
- [ ] 3 consecutive clean runs
- [ ] All skipped tests documented with emulator-specific status

## Estimated Effort: Large (iterative debugging)
