// scripts/migrate-exams-topicid.cjs
// Wrapper for exams topicId normalization migration.
// Usage: 
//   DRY_RUN=true node scripts/migrate-exams-topicid.cjs (preview changes)
//   DRY_RUN=false node scripts/migrate-exams-topicid.cjs (apply changes)
//
// Requires: FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH

const { spawnSync } = require('child_process');
const path = require('path');

const runnerPath = path.join(__dirname, 'run-migration.cjs');
const configPath = path.join(__dirname, 'migrations', 'exams-topicid-normalization.cjs');

console.log('=================================================');
console.log('Exams topicId Normalization Migration');
console.log('=================================================');
console.log('Config:', configPath);
console.log('Dry run:', process.env.DRY_RUN !== 'false' ? 'YES (no changes will be made)' : 'NO (changes will be applied)');
console.log('=================================================\n');

const result = spawnSync(process.execPath, [runnerPath, '--config', configPath], {
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  console.error('\nMigration failed with status:', result.status);
  process.exit(result.status || 1);
}

console.log('\nMigration completed successfully.');
