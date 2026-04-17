<!-- copilot/plans/active/migrate-remaining-tests-to-typescript-2026-04-18/working/remaining-test-file-inventory.md -->
# Remaining Test File Inventory

Snapshot taken on 2026-04-18.

## Totals

- 169 test-related files still use JavaScript extensions under `tests/`
- 92 files are `.js`
- 77 files are `.jsx`

## Largest Clusters

- `tests/unit/hooks`: 29 files
- `tests/unit/utils`: 24 files
- `tests/unit/pages/institution-admin`: 22 files
- `tests/unit/pages/admin`: 22 files
- `tests/unit/components`: 19 files
- `tests/unit/functions`: 10 files
- `tests/unit/pages/home`: 9 files
- `tests/unit/pages/subject`: 8 files
- `tests/unit/pages/topic`: 6 files

## Special-Handling Files

- `tests/setup.js`
- `tests/mocks/firebase-functions-v2-https.js`
- `tests/rules/firestore.rules.test.js`
- `tests/rules/storage.rules.test.js`

## Planning Notes

- Non-JSX tests can largely move `.js` -> `.ts` in early phases.
- JSX tests should be treated as `.jsx` -> `.tsx` and validated by domain.
- Type-check foundation must land early because current root `tsconfig.json` excludes `tests/`.
