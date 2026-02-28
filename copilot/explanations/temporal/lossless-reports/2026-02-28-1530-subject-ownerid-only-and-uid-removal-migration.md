# Lossless Change Report — Subject ownerId-only standardization + uid removal migration

## Summary
Standardized subject ownership to `ownerId` only and prepared a migration run to remove legacy `uid` from all subject docs.

## What changed

### 1) Subject code path now uses ownerId only
- `src/hooks/useSubjects.js`
  - Removed subject ownership fallbacks to `uid`.
  - Shared query ownership exclusion now checks only `ownerId`.
  - Transfer ownership current-owner resolution now uses `ownerId` only.
- `src/pages/Home/hooks/useHomeHandlers.js`
  - Subject creation no longer writes `uid`; it now writes `ownerId`.
- `src/pages/Subject/hooks/useClassMembers.js`
  - Owner resolution uses `subject.ownerId` only.
- `src/pages/Home/hooks/useHomeState.js`
  - Subject ownership checks no longer use subject `uid` fallback.
- `src/pages/Home/Home.jsx`
  - Shared ownership helper updated so subject ownership does not use `uid` fallback.
- `src/pages/Home/components/HomeContent.jsx`
  - Shared ownership helper updated so subject ownership does not use `uid` fallback.
- `src/utils/permissionUtils.js`
  - `isOwner` now checks `ownerId` only.

### 2) Migration run created to remove `uid` in subjects
- Added migration preset:
  - `scripts/migrations/subjects-ownerid-only.cjs`
  - Operations:
    - `coalesceToField`: `ownerId <- first(ownerId, uid)`
    - `removeFields`: `uid`
- Updated wrapper script:
  - `scripts/migrate-subjects-uid-to-ownerId.cjs`
  - Now delegates to centralized `run-migration.cjs` with the new preset.
- Updated docs:
  - `scripts/README-migrations.md`
  - Added dry-run/apply commands for `subjects-ownerid-only` migration.

## Validation
- Diagnostics run on all touched files: no errors found.

## Run commands
Dry run:
```powershell
$env:DRY_RUN='true'
node scripts/run-migration.cjs --config scripts/migrations/subjects-ownerid-only.cjs
```

Apply:
```powershell
$env:DRY_RUN='false'
node scripts/run-migration.cjs --config scripts/migrations/subjects-ownerid-only.cjs
```

Backward-compatible wrapper:
```powershell
node scripts/migrate-subjects-uid-to-ownerId.cjs
```
