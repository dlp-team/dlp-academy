<!-- copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionPayloadUtils.md -->

# adminInstitutionPayloadUtils.ts

## Overview
- **Source file:** `src/pages/AdminDashboard/utils/adminInstitutionPayloadUtils.ts`
- **Last documented:** 2026-04-01
- **Role:** Normalizes institutions form input and builds Firestore payload shape for submit flow.

## Responsibilities
- Normalizes form input values (trim, lowercase, timezone fallback, admin parsing).
- Builds standardized institution payload for create/edit writes.
- Centralizes payload-shape semantics used by institutions submit logic.

## Exports
- `type NormalizedInstitutionFormInput`
- `const normalizeInstitutionFormInput`
- `const buildInstitutionPayload`

## Main Dependencies
- `src/pages/AdminDashboard/utils/adminEmailUtils`
