<!-- copilot/explanations/temporal/lossless-reports/2026-04-12/autopilot-plan-notifications-topic-direct-messaging.md -->
# Lossless Change Report - Notifications + Direct Messaging + Topic Access

## Date
- 2026-04-12

## Requested Scope
- Unify notification style/components using Home copy/paste feedback direction.
- Move copy/paste-style feedback to bottom-left with responsive support.
- Ensure light/dark adaptation for notification surfaces.
- Replace mailbox icon with non-letter notification icon.
- Add share notification identity metadata (name/photo).
- Add same-institution direct messages.
- Add student-to-teacher message entry in Subject class section.
- Fix teacher access/interactions for Topic study-guide surfaces.

## Preserved Behaviors
- Existing Header notifications panel open/close behavior and unread badge counting preserved.
- Existing shortcut move request approval/rejection flows preserved.
- Existing Home undo behavior preserved (same action callback/close semantics).
- Existing Student read-only constraints in Topic and StudyGuide paths preserved.
- Existing role/institution guardrails for subject/topic access preserved.

## Implemented Changes
- Added shared toast primitive [src/components/ui/NotificationToast.tsx](../../../../../src/components/ui/NotificationToast.tsx) and migrated:
  - [src/components/ui/AppToast.tsx](../../../../../src/components/ui/AppToast.tsx)
  - [src/components/ui/UndoActionToast.tsx](../../../../../src/components/ui/UndoActionToast.tsx)
  - [src/pages/Home/components/HomeShortcutFeedback.tsx](../../../../../src/pages/Home/components/HomeShortcutFeedback.tsx)
- Added shared notification item renderer and metadata helpers:
  - [src/components/ui/NotificationItemCard.tsx](../../../../../src/components/ui/NotificationItemCard.tsx)
  - [src/components/ui/notificationPresentation.tsx](../../../../../src/components/ui/notificationPresentation.tsx)
- Migrated panel/history notification lists to shared item renderer:
  - [src/components/ui/NotificationsPanel.tsx](../../../../../src/components/ui/NotificationsPanel.tsx)
  - [src/pages/Notifications/Notifications.tsx](../../../../../src/pages/Notifications/Notifications.tsx)
- Replaced mailbox glyph with bell-based notification control while keeping unread badge behavior:
  - [src/components/ui/MailboxIcon.tsx](../../../../../src/components/ui/MailboxIcon.tsx)
- Added share notification actor identity fields in share flow:
  - [src/hooks/useSubjects.ts](../../../../../src/hooks/useSubjects.ts)
- Added direct messaging service and Subject class messaging UI:
  - [src/services/directMessageService.ts](../../../../../src/services/directMessageService.ts)
  - [src/pages/Subject/Subject.tsx](../../../../../src/pages/Subject/Subject.tsx)
  - [src/pages/Subject/components/SubjectHeader.tsx](../../../../../src/pages/Subject/components/SubjectHeader.tsx)
- Added Firestore least-privilege rules for same-institution direct messages and controlled peer notification creation:
  - [firestore.rules](../../../../../firestore.rules)
- Adjusted topic/study-guide teacher interaction gating:
  - [src/pages/Topic/hooks/useTopicLogic.ts](../../../../../src/pages/Topic/hooks/useTopicLogic.ts)
  - [src/pages/Content/StudyGuideEditor.tsx](../../../../../src/pages/Content/StudyGuideEditor.tsx)

## Tests Added/Updated
- Added:
  - [tests/unit/components/NotificationToast.test.jsx](../../../../../tests/unit/components/NotificationToast.test.jsx)
  - [tests/unit/components/NotificationItemCard.test.jsx](../../../../../tests/unit/components/NotificationItemCard.test.jsx)
  - [tests/unit/services/directMessageService.test.js](../../../../../tests/unit/services/directMessageService.test.js)
- Existing notification tests remained green:
  - [tests/unit/components/NotificationsPanel.test.jsx](../../../../../tests/unit/components/NotificationsPanel.test.jsx)
  - [tests/unit/components/UndoActionToast.test.jsx](../../../../../tests/unit/components/UndoActionToast.test.jsx)

## Validation Summary
- `get_errors` run on all touched files: clean.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npm run test`: pass (164 files, 745 tests).
- Targeted feature tests: pass for notification and direct-message service suites.

## Risk Notes
- Notifications create-rule broadened only for controlled types (`subject_shared`, `direct_message`) and same-institution recipients.
- Direct message storage is additive (`directMessages` collection), no destructive migration.
- Topic viewer semantics adjusted for non-student teachers to prevent accidental student-tab fallback.
