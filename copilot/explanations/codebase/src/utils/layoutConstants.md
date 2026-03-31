<!-- copilot/explanations/codebase/src/utils/layoutConstants.md -->
# layoutConstants.ts

## Overview
- **Source file:** `src/utils/layoutConstants.ts`
- **Last documented:** 2026-04-01
- **Role:** Centralizes fixed overlay top-offset values used by modal shells and overlay layouts.

## Exports
- `OVERLAY_TOP_OFFSET_PX`
- `OVERLAY_TOP_OFFSET_STYLE`

## Changelog
### 2026-04-01
- Restored file encoding to valid UTF-8 after corruption introduced invalid leading bytes.
- Preserved constant values and template literal output (`top: \`${OVERLAY_TOP_OFFSET_PX}px\``) while fixing Vitest/esbuild parse failures.
