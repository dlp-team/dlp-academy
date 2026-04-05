<!-- copilot/explanations/codebase/functions/security/institutionAutomationSettings.md -->
# institutionAutomationSettings.js

## Overview
- Source file: `functions/security/institutionAutomationSettings.js`
- Last documented: 2026-04-05
- Role: Shared institution-level automation toggle normalization and enforcement utilities for callable handlers.

## Responsibilities
- Normalizes institution automation flags with backward-compatible defaults:
  - `transferPromotionEnabled`
  - `subjectLifecycleAutomationEnabled`
- Enforces transfer automation toggle via `assertTransferPromotionAutomationEnabled`.
- Throws deterministic `failed-precondition` errors when transfer tooling is disabled for the target institution.

## Exports
- `normalizeInstitutionAutomationSettings`
- `assertTransferPromotionAutomationEnabled`

## Main Dependencies
- `firebase-functions/v2/https`

## Changelog
- 2026-04-05: Added helper module for institution automation defaults and transfer-tool deny-path enforcement shared by transfer dry-run/apply handlers.
