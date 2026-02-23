// scripts/run-migration.cjs
// Generic, parameter-driven Firestore migration runner.
// Usage:
//   node scripts/run-migration.cjs --config scripts/migrations/topic-relations-camelcase.cjs
// Optional env:
//   DRY_RUN=true (default)
//   BATCH_LIMIT=400
//   FIREBASE_SERVICE_ACCOUNT_JSON / FIREBASE_SERVICE_ACCOUNT_PATH

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

function loadServiceAccount() {
  if (serviceAccountJson) {
    return JSON.parse(serviceAccountJson);
  }
  if (serviceAccountPath) {
    return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }
  throw new Error('Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH');
}

function parseArgs(argv) {
  const result = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[index + 1] : true;
    result[key] = value;
    if (value !== true) index += 1;
  }
  return result;
}

function toBoolean(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

function isDefined(value) {
  return value !== undefined && value !== null;
}

function applyOperation({ operation, sourceData, updates }) {
  const opType = operation.type;

  if (opType === 'renameField') {
    const from = operation.from;
    const to = operation.to;
    const overwrite = toBoolean(operation.overwrite, false);
    const removeSource = toBoolean(operation.removeSource, true);

    const hasFrom = isDefined(sourceData[from]);
    const hasTo = isDefined(sourceData[to]) || isDefined(updates[to]);

    if (hasFrom && (overwrite || !hasTo)) {
      updates[to] = sourceData[from];
    }

    if (removeSource && (sourceData[from] !== undefined || updates[from] !== undefined)) {
      updates[from] = admin.firestore.FieldValue.delete();
    }
    return;
  }

  if (opType === 'copyField') {
    const from = operation.from;
    const to = operation.to;
    const overwrite = toBoolean(operation.overwrite, false);
    const hasFrom = isDefined(sourceData[from]);
    const hasTo = isDefined(sourceData[to]) || isDefined(updates[to]);

    if (hasFrom && (overwrite || !hasTo)) {
      updates[to] = sourceData[from];
    }
    return;
  }

  if (opType === 'coalesceToField') {
    const to = operation.to;
    const from = Array.isArray(operation.from) ? operation.from : [];
    const overwrite = toBoolean(operation.overwrite, false);
    const hasTo = isDefined(sourceData[to]) || isDefined(updates[to]);

    if (!overwrite && hasTo) {
      return;
    }

    const candidate = from.find((fieldName) => isDefined(sourceData[fieldName]));
    if (candidate) {
      updates[to] = sourceData[candidate];
    }
    return;
  }

  if (opType === 'setField') {
    const field = operation.field;
    const ifMissing = toBoolean(operation.ifMissing, false);
    const currentValue = isDefined(updates[field]) ? updates[field] : sourceData[field];

    if (ifMissing && isDefined(currentValue)) {
      return;
    }

    const value = typeof operation.value === 'function'
      ? operation.value({ sourceData, updates })
      : operation.value;

    updates[field] = value;
    return;
  }

  if (opType === 'removeFields') {
    const fields = Array.isArray(operation.fields) ? operation.fields : [];
    fields.forEach((fieldName) => {
      if (sourceData[fieldName] !== undefined || updates[fieldName] !== undefined) {
        updates[fieldName] = admin.firestore.FieldValue.delete();
      }
    });
    return;
  }

  throw new Error(`Unsupported operation type: ${opType}`);
}

function buildQuery(db, collectionConfig) {
  let ref = db.collection(collectionConfig.collection);
  const whereList = Array.isArray(collectionConfig.where) ? collectionConfig.where : [];

  whereList.forEach((whereClause) => {
    ref = ref.where(whereClause.field, whereClause.op || '==', whereClause.value);
  });

  if (Number.isInteger(collectionConfig.limit) && collectionConfig.limit > 0) {
    ref = ref.limit(collectionConfig.limit);
  }

  return ref;
}

async function runMigration() {
  const args = parseArgs(process.argv);
  const configPath = args.config || process.env.MIGRATION_CONFIG;

  if (!configPath) {
    throw new Error('Missing config. Use --config <path> or MIGRATION_CONFIG env var.');
  }

  const absoluteConfigPath = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath);

  const loadedConfig = require(absoluteConfigPath);
  const migrationConfig = loadedConfig.default || loadedConfig;

  if (!migrationConfig || !Array.isArray(migrationConfig.collections)) {
    throw new Error('Invalid migration config. Expected { collections: [...] }.');
  }

  const dryRun = toBoolean(args.dryRun, toBoolean(process.env.DRY_RUN, true));
  const batchLimit = Number(args.batchLimit || process.env.BATCH_LIMIT || migrationConfig.batchLimit || 400);

  admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount()),
  });

  const db = admin.firestore();

  const stats = {
    name: migrationConfig.name || path.basename(configPath),
    dryRun,
    batchLimit,
    batchCommits: 0,
    collections: {},
  };

  let pendingWrites = [];

  async function flushWrites() {
    if (pendingWrites.length === 0) return;

    if (!dryRun) {
      const batch = db.batch();
      pendingWrites.forEach((entry) => batch.set(entry.ref, entry.data, { merge: true }));
      await batch.commit();
      stats.batchCommits += 1;
    }

    pendingWrites = [];
  }

  async function queueWrite(ref, data) {
    pendingWrites.push({ ref, data });
    if (pendingWrites.length >= batchLimit) {
      await flushWrites();
    }
  }

  for (const collectionConfig of migrationConfig.collections) {
    const collectionName = collectionConfig.collection;
    const operations = Array.isArray(collectionConfig.operations) ? collectionConfig.operations : [];

    if (operations.length === 0) {
      throw new Error(`Collection ${collectionName} has no operations.`);
    }

    const snapshot = await buildQuery(db, collectionConfig).get();
    const collectionStats = {
      scanned: 0,
      updated: 0,
      unchanged: 0,
    };

    for (const docSnap of snapshot.docs) {
      collectionStats.scanned += 1;
      const sourceData = docSnap.data();
      const updates = {};

      operations.forEach((operation) => {
        applyOperation({ operation, sourceData, updates });
      });

      const updateKeys = Object.keys(updates);
      if (updateKeys.length > 0) {
        await queueWrite(docSnap.ref, updates);
        collectionStats.updated += 1;
      } else {
        collectionStats.unchanged += 1;
      }
    }

    stats.collections[collectionName] = collectionStats;
  }

  await flushWrites();

  console.log('Migration summary:', stats);
}

runMigration().catch((error) => {
  console.error(error);
  process.exit(1);
});
