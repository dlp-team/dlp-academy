// scripts/migrate-relations-to-camelcase.cjs
// Backward-compatible wrapper around centralized migration runner.
// Usage: node scripts/migrate-relations-to-camelcase.cjs

const { spawnSync } = require('child_process');
const path = require('path');

const runnerPath = path.join(__dirname, 'run-migration.cjs');
const configPath = path.join(__dirname, 'migrations', 'topic-relations-camelcase.cjs');

const result = spawnSync(process.execPath, [runnerPath, '--config', configPath], {
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}
