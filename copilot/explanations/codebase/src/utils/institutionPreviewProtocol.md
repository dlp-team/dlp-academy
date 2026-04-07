<!-- copilot/explanations/codebase/src/utils/institutionPreviewProtocol.md -->
# institutionPreviewProtocol.ts

## Overview
- **Source file:** `src/utils/institutionPreviewProtocol.ts`
- **Last documented:** 2026-04-07
- **Role:** Defines canonical postMessage protocol constants and guard logic for institution customization live preview messaging.

## Responsibilities
- Exposes message source/type constants for iframe preview synchronization.
- Provides `isInstitutionPreviewThemeMessage(...)` type guard for safe runtime filtering.

## Changelog
### 2026-04-07
- Created protocol utility to standardize parent->iframe preview theme/highlight messages.
