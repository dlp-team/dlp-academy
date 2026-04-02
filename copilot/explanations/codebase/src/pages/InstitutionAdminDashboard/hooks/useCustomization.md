<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useCustomization.md -->

# useCustomization.ts

## Overview
- Source file: src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts
- Role: Institution customization state and persistence hook for branding assets and theme tokens.

## Changelog
### 2026-04-02
- Added auth-claim synchronization flow before institution branding uploads:
  - compares expected role/institution against token claims,
  - invokes callable `syncCurrentUserClaims` when claims are stale,
  - forces token refresh before upload.
- Added resilient upload helper for branding assets (`icon`, `logo`) with one retry on `storage/unauthorized` after forced claim sync.
- Preserved existing UX behavior for validation and success/error messaging while reducing false 403 upload failures caused by stale/missing token claims.
