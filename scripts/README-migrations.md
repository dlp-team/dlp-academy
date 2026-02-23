
# Centralized Firestore Migrations

This system lets you run any Firestore migration (field renames, value backfills, field removals, etc.) using a single generic runner and a config file—no more writing new scripts for every change.

---

## Step-by-step Usage

### 1. Prepare your Firebase service account

- Download your service account JSON from the Firebase Console.
- Place it somewhere safe (e.g., `C:\Users\YourUser\Downloads\serviceAccountKey.json`).

### 2. Set up environment variables

You must provide authentication for the migration script. You can do this in two ways:

**A. Using a file path (recommended):**

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH = "C:\Users\YourUser\Downloads\serviceAccountKey.json"
```

**B. Using the JSON string directly:**

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_JSON = Get-Content "C:\Users\YourUser\Downloads\serviceAccountKey.json" -Raw
```

You can also add this to a `.env` file in your project root:

```
FIREBASE_SERVICE_ACCOUNT_PATH=C:\Users\YourUser\Downloads\serviceAccountKey.json
```

### 3. Choose or create a migration preset

- Presets live in `scripts/migrations/*.cjs`.
- Example: `scripts/migrations/topic-relations-camelcase.cjs` (see below for format).

### 4. Run a dry run (always recommended first)

```powershell
$env:DRY_RUN='true'
node scripts/run-migration.cjs --config scripts/migrations/topic-relations-camelcase.cjs
```

This will print a summary of what would be changed, but will NOT write anything to Firestore.

### 5. Apply the migration for real

**After reviewing the dry run output:**

```powershell
$env:DRY_RUN='false'
node scripts/run-migration.cjs --config scripts/migrations/topic-relations-camelcase.cjs
```

### 6. (Optional) Use the legacy wrapper

For backward compatibility, you can still run:

```powershell
node scripts/migrate-relations-to-camelcase.cjs
```

---

## How to Create a Migration Preset

Create a `.cjs` file in `scripts/migrations/` with this structure:

```js
module.exports = {
  name: 'my-migration-name',
  batchLimit: 400,
  collections: [
    {
      collection: 'topics',
      where: [
        { field: 'status', op: '==', value: 'legacy' }
      ],
      limit: 1000,
      operations: [
        { type: 'renameField', from: 'subject_id', to: 'subjectId', overwrite: false, removeSource: true },
        { type: 'copyField', from: 'uid', to: 'ownerId', overwrite: false },
        { type: 'coalesceToField', from: ['ownerId', 'uid'], to: 'ownerId', overwrite: false },
        { type: 'setField', field: 'institutionId', value: 'YOUR_ID', ifMissing: true },
        { type: 'removeFields', fields: ['legacyFieldA', 'legacyFieldB'] }
      ]
    }
  ]
};
```

**Supported operations:**

- `renameField`: move field value from `from` to `to` and optionally delete source.
- `copyField`: copy field value from `from` to `to`.
- `coalesceToField`: set `to` with the first non-null field from `from: []`.
- `setField`: assign a static value (`ifMissing` optional).
- `removeFields`: delete one or more fields.

---

## Troubleshooting & Tips

- Always run with `DRY_RUN='true'` first to preview changes.
- If you get an authentication error, double-check your service account path or JSON.
- You can limit the number of docs processed with the `limit` property in your preset.
- Use the `where` array to filter which docs are affected.
- If you want to run multiple migrations, add more objects to the `collections` array.
- The script prints a summary at the end showing how many docs were scanned, updated, or unchanged.

---

## Environment requirements

- `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH` (required)
- `DRY_RUN` defaults to `true` (recommended for safety)
- `BATCH_LIMIT` optional (defaults to config `batchLimit` or `400`)
