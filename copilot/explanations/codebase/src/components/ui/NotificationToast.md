<!-- copilot/explanations/codebase/src/components/ui/NotificationToast.md -->
# NotificationToast.tsx

## Overview
- Source file: `src/components/ui/NotificationToast.tsx`
- Last documented: 2026-04-12
- Role: Shared floating toast shell for unified app notifications.

## Responsibilities
- Renders a responsive floating toast in lower-left or centered bottom position.
- Supports tone variants (`info`, `success`, `warning`, `error`) with consistent light/dark styles.
- Supports optional icon slot, actions slot, and close control.
- Provides offset support for stacked toasts without overlap.

## Main Dependencies
- `react`
- `lucide-react`

## Exports
- `default NotificationToast`

## Changelog
- 2026-04-12: Introduced as shared notification primitive for Home shortcut feedback, undo feedback, and generic app toasts.
