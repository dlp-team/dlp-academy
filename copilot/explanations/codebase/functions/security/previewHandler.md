<!-- copilot/explanations/codebase/functions/security/previewHandler.md -->
# previewHandler.js

## Overview
- Source file: `functions/security/previewHandler.js`
- Last documented: 2026-04-04
- Role: Factory for callable handler that returns deterministic institutional access-code previews with permission enforcement.

## Responsibilities
- Requires authenticated caller and validates institutional preview permissions.
- Validates required preview arguments (`institutionId`, `intervalHours`).
- Generates deterministic role code previews with server-side salt and current time window.
- Computes `validUntilMs` for current rotation window boundary.
- Supports optional `codeVersion` input to align previews with immediate-rotation policy state.

## Exports
- `createGetInstitutionalAccessCodePreviewHandler`

## Changelog
- 2026-04-04: Added optional `codeVersion` support in preview generation payload for immediate rotation compatibility.
