<!-- copilot/explanations/codebase/functions/security/shortcutMoveRequestEmailUtils.md -->
# shortcutMoveRequestEmailUtils.js

## Overview
- Source file: `functions/security/shortcutMoveRequestEmailUtils.js`
- Last documented: 2026-04-04
- Role: Centralized email-notification policy decisions for shortcut move request mail queue writes.

## Responsibilities
- Defines default email-opt-in behavior (`notifications.email !== false`).
- Determines whether owner-side shortcut request emails should be queued.
- Determines whether requester-side resolution emails should be queued.
- Preserves legacy fallback: requester emails stay enabled when requester profile is missing but fallback email exists.

## Exports
- `isEmailNotificationEnabled(userData)`
- `shouldQueueShortcutMoveOwnerMail({ ownerEmail, ownerData })`
- `shouldQueueShortcutMoveRequesterMail({ requesterEmail, requesterData })`
