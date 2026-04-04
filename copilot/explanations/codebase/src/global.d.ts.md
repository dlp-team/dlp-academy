<!-- copilot/explanations/codebase/src/global.d.ts.md -->
# global.d.ts

## Overview
- **Source file:** `src/global.d.ts`
- **Last documented:** 2026-04-04
- **Role:** Project-wide ambient typings for Vite environment variables and CSS module imports.

## Responsibilities
- Declares `ImportMetaEnv` keys used by frontend services/hooks.
- Declares `ImportMeta` typing contract for `import.meta.env` access.
- Enables TypeScript import support for `*.css` modules.

## Changelog
### 2026-04-04
- Added optional env typings:
  - `VITE_N8N_CSV_IMPORT_WEBHOOK`
  - `VITE_E2E_TRANSFER_PROMOTION_MOCK`
- This resolves Phase 09 type-gate failures caused by already-used env keys in runtime code.
