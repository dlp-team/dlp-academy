// scripts/security/high-confidence-diff-scan.cjs

const { execSync } = require('node:child_process');

const argv = process.argv.slice(2);

function getArgValue(flag) {
  const index = argv.indexOf(flag);
  if (index === -1 || index + 1 >= argv.length) {
    return null;
  }
  return argv[index + 1];
}

const modeStaged = argv.includes('--staged');
const range = getArgValue('--range');

if ((modeStaged && range) || (!modeStaged && !range)) {
  console.error('Usage: node scripts/security/high-confidence-diff-scan.cjs --staged');
  console.error('   or: node scripts/security/high-confidence-diff-scan.cjs --range <git-range>');
  process.exit(2);
}

const diffArgs = modeStaged
  ? 'diff --cached --no-color --unified=0'
  : `diff ${range} --no-color --unified=0`;

let diffText = '';
try {
  diffText = execSync(`git ${diffArgs}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 50 * 1024 * 1024,
  });
} catch (error) {
  const output = (error && (error.stdout || error.stderr)) || '';
  console.error('Unable to read git diff for credential scan.');
  if (output) {
    console.error(String(output).trim());
  }
  process.exit(2);
}

if (!diffText.trim()) {
  console.log('Credential scan passed: no diff content to scan.');
  process.exit(0);
}

const detectors = [
  {
    id: 'firebase_api_key',
    pattern: /AIza[0-9A-Za-z\-_]{35}/g,
  },
  {
    id: 'private_key_block',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    id: 'service_account_private_key_field',
    pattern: /"private_key"\s*:\s*"[^"\n]{20,}/g,
  },
  {
    id: 'generic_secret_assignment',
    pattern: /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password)\b\s*[:=]\s*["'][A-Za-z0-9_\-\/=+]{24,}["']/gi,
  },
];

function maskSample(value) {
  if (!value) {
    return '***';
  }
  if (value.length <= 10) {
    return `${value.slice(0, 2)}***`;
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

const lines = diffText.split(/\r?\n/);
const findings = [];

let currentFile = 'unknown';
let currentLine = 0;

for (const line of lines) {
  if (line.startsWith('+++ b/')) {
    currentFile = line.slice(6).trim();
    continue;
  }

  if (line.startsWith('@@')) {
    const match = line.match(/\+(\d+)/);
    currentLine = match ? Number(match[1]) : currentLine;
    continue;
  }

  if (line.startsWith('+') && !line.startsWith('+++')) {
    const addedLine = line.slice(1);

    for (const detector of detectors) {
      detector.pattern.lastIndex = 0;
      const detectorMatches = Array.from(addedLine.matchAll(detector.pattern));
      for (const match of detectorMatches) {
        findings.push({
          detector: detector.id,
          file: currentFile,
          line: currentLine,
          sample: maskSample(match[0]),
        });
      }
    }

    currentLine += 1;
    continue;
  }

  if (line.startsWith(' ')) {
    currentLine += 1;
  }
}

if (findings.length === 0) {
  console.log('Credential scan passed: no high-confidence credential signatures found.');
  process.exit(0);
}

console.error(`Credential scan failed: ${findings.length} potential credential signature(s) found.`);
for (const finding of findings) {
  console.error(`- ${finding.detector} at ${finding.file}:${finding.line} (${finding.sample})`);
}

process.exit(1);
