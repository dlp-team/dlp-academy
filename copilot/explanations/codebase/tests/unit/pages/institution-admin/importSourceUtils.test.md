<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/importSourceUtils.test.md -->
# importSourceUtils.test.js

## Overview
- Source file: `tests/unit/pages/institution-admin/importSourceUtils.test.js`
- Last documented: 2026-04-04
- Role: Unit coverage for Google Sheets import-source normalization helpers used by CSV workflows.

## Coverage
- Detects Google Sheets edit URLs.
- Converts Google Sheets share/edit URLs to CSV export URLs.
- Preserves non-Google URLs unchanged.
- Normalizes existing export URLs to include required CSV parameters.

## Changelog
- 2026-04-04: Added initial test suite for import source URL normalization.
