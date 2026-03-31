<!-- copilot/explanations/codebase/fix-app.js.md -->
# fix-app.js

## Overview
- **Source file:** `fix-app.js`
- **Last documented:** 2026-04-01
- **Role:** Local utility script used to patch `src/App.tsx` typing patterns in bulk.

## Changelog
### 2026-04-01
- Added `/* global require */` declaration so the script passes flat-config ESLint `no-undef` checks.
- Preserved script behavior (read/replace/write for `src/App.tsx`) without altering replacement logic.
