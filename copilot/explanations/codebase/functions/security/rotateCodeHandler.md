<!-- copilot/explanations/codebase/functions/security/rotateCodeHandler.md -->
# rotateCodeHandler.js

## Overview
- Source file: `functions/security/rotateCodeHandler.js`
- Last documented: 2026-04-04
- Role: Factory for immediate institutional access-code rotation while preserving configured interval windows.

## Responsibilities
- Requires authenticated caller and institution-admin/global-admin permissions.
- Validates institution scope and target role (`teacher`/`student`).
- Enforces role policy precondition (`requireCode === true`).
- Increments role-specific `codeVersion` in institution access policies.
- Returns immediate preview payload (`code`, `validUntilMs`, `codeVersion`) after update.

## Exports
- `createRotateInstitutionalAccessCodeNowHandler`

## Changelog
- 2026-04-04: Added versioned code-rotation handler to support immediate code regeneration without altering rotation intervals.
