<!-- copilot/explanations/codebase/tests/unit/functions/shortcut-move-request-email-optin.test.md -->
# shortcut-move-request-email-optin.test.js

## Overview
- Source file: `tests/unit/functions/shortcut-move-request-email-optin.test.js`
- Last documented: 2026-04-04
- Role: Deterministic unit suite for shortcut move request email opt-in utility behavior.

## Coverage
- Verifies baseline opt-in default (`notifications.email` absent => enabled).
- Verifies explicit opt-out (`notifications.email === false`).
- Verifies owner mail queue decision requires both valid email and opt-in state.
- Verifies requester mail queue fallback remains enabled when requester profile is missing.
- Verifies requester profile opt-out suppresses requester mail queue writes.
