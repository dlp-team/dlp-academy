<!-- copilot/explanations/codebase/src/pages/AdminDashboard/components/AdminConfirmModal.md -->

# AdminConfirmModal.tsx

## Overview
- **Source file:** `src/pages/AdminDashboard/components/AdminConfirmModal.tsx`
- **Last documented:** 2026-04-01
- **Role:** Shared in-page confirmation dialog for destructive/admin-sensitive actions.

## Responsibilities
- Renders a modal only when `isOpen` is true.
- Displays title/description and configurable confirmation label.
- Routes cancel/confirm button actions through provided handlers.
- Supports disabled/loading confirmation state via `isConfirming`.

## Exports
- `default AdminConfirmModal`

## Main Dependencies
- `react`
