<!-- copilot/explanations/codebase/tests/unit/components/DashboardOverlayShell.test.md -->
# DashboardOverlayShell.test.jsx

## Overview
- **Source file:** `tests/unit/components/DashboardOverlayShell.test.jsx`
- **Last documented:** 2026-04-05
- **Role:** Deterministic regression suite for shared dashboard overlay shell behavior.

## Coverage
- Backdrop-close behavior when enabled.
- Backdrop-close blocking when `closeOnBackdropClick` is false.
- Width preset application and constrained root/wrapper layout contract.
- Unsaved-change discard confirmation flow before close.

## Changelog
### 2026-04-05
- Added initial coverage for non-modal overlay-shell unification slice 1.
- Expanded coverage for generalized shell behavior, including dirty-close confirmation and updated constrained viewport defaults.
