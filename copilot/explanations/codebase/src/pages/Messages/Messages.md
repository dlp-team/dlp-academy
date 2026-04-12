<!-- copilot/explanations/codebase/src/pages/Messages/Messages.md -->
# Messages.tsx

## Overview
- Source file: `src/pages/Messages/Messages.tsx`
- Last documented: 2026-04-12
- Role: Dedicated direct-message workspace rendered at `/messages`.

## Responsibilities
- Loads user direct messages in realtime from `directMessages` for both sender and recipient perspectives.
- Builds conversation groups and thread ordering with deterministic conversation keys.
- Displays participant profile context (role badge + shared subjects) in each conversation.
- Marks unread thread messages as read when a conversation is opened.
- Sends direct messages with `sendDirectMessage` preserving subject context continuity.
- Shows only `direct_message` notifications in-page and links them to matching conversations.

## Main Dependencies
- `src/components/layout/Header.tsx`
- `src/components/ui/CommunicationItemCard.tsx`
- `src/components/ui/NotificationItemCard.tsx`
- `src/hooks/useNotifications.tsx`
- `src/services/directMessageService.ts`
- `src/utils/directMessageUtils.ts`
- `firebase/firestore`

## Exports
- `default Messages`

## Changelog
- 2026-04-12: Added initial Messages hub implementation with conversation list, thread view, participant academic context, and direct-message notification activation.