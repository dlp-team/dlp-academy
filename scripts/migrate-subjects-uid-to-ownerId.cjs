// scripts/migrate-subjects-uid-to-ownerId.cjs
// Backward-compatible wrapper around centralized migration runner.
// Usage: node scripts/migrate-subjects-uid-to-ownerId.cjs

const { spawnSync } = require('child_process');
const path = require('path');

const runnerPath = path.join(__dirname, 'run-migration.cjs');
const configPath = path.join(__dirname, 'migrations', 'subjects-ownerid-only.cjs');

const result = spawnSync(process.execPath, [runnerPath, '--config', configPath], {
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}
