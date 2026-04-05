<!-- copilot/explanations/codebase/src/components/ui/DashboardOverlayShell.md -->
# DashboardOverlayShell.tsx

## Overview
- **Source file:** `src/components/ui/DashboardOverlayShell.tsx`
- **Last documented:** 2026-04-05
- **Role:** Shared non-modal overlay shell for dashboard-style create/edit/import surfaces, constrained between header and bottom viewport bounds.

## Responsibilities
- Reuse `BaseModal` while standardizing dashboard overlay defaults.
- Provide overlay-width presets (`sm` to `3xl`) with consistent card styling.
- Enforce top-constrained wrapper layout (`pt-24`) and bottom-safe scrollable viewport fit.
- Preserve close interception hooks via `onBeforeClose` and `onBlockedCloseAttempt` passthrough.

## Exports
- `default DashboardOverlayShell`

## Main Dependencies
- `react`
- `src/components/ui/BaseModal`

## Changelog
### 2026-04-05
- Added shared overlay shell for Institution Admin non-modal overlay unification slice 1.
