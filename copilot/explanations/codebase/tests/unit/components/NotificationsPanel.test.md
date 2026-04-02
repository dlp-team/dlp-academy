<!-- copilot/explanations/codebase/tests/unit/components/NotificationsPanel.test.md -->
# NotificationsPanel.test.jsx

## Changelog
### 2026-04-02
- Added unit coverage for notification panel behavior:
  - empty-state rendering,
  - subject notification click path (`markAsRead` + navigate + close),
  - pending shortcut move request action dispatch (`approved` and `rejected`).

## Overview
- **Source file:** `tests/unit/components/NotificationsPanel.test.jsx`
- **Role:** Behavioral regression suite for notification interactions and shortcut request actions.

## Notes
- Uses mocked `useNavigate` to keep tests deterministic and avoid router setup overhead.
