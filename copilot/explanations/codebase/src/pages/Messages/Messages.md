<!-- copilot/explanations/codebase/src/pages/Messages/Messages.md -->
# Messages.tsx

## Overview
- Source file: `src/pages/Messages/Messages.tsx`
- Last documented: 2026-04-13
- Role: Dedicated direct-message workspace rendered at `/messages`.

## Responsibilities
- Loads user direct messages in realtime from `directMessages` for both sender and recipient perspectives.
- Uses indexed/limited direct-message listeners when available and auto-falls back to compatibility queries when the composite index is missing.
- Builds conversation groups and thread ordering with deterministic conversation keys.
- Displays participant profile context (role badge + shared subjects) in each conversation.
- Marks unread thread messages as read when a conversation is opened.
- Sends direct messages with `sendDirectMessage` preserving subject context continuity.
- Supports file attachments and subject/resource references inside composer and thread bubbles.
- Keeps direct-message unread signaling at header level (no in-panel notification list).
- Applies in-view pagination for conversation list and selected thread rendering.

## Main Dependencies
- `src/components/layout/Header.tsx`
- `src/components/ui/CommunicationItemCard.tsx`
- `src/components/ui/Avatar.tsx`
- `src/hooks/useNotifications.tsx`
- `src/services/directMessageService.ts`
- `src/utils/directMessageUtils.ts`
- `firebase/firestore`

## Exports
- `default Messages`

## Changelog
- 2026-04-13: Improved reliability when opening chats by silencing expected `failed-precondition` logs during automatic index fallback and keeping compatibility-mode behavior unchanged.
- 2026-04-13: Hardened subject-reference resource loading with partial-permission tolerance and merge strategy across root and nested subject-topic resource collections.
- 2026-04-13: Added composer file-attachment workflow (validation, removal, send) and message-bubble rendering for image/file attachments.
- 2026-04-13: Added subject/resource reference workflow in composer with route-aware rendering/navigation inside thread bubbles.
- 2026-04-13: Updated conversation rows to render participant avatar as leading visual and added participant avatar to thread/new-chat headers.
- 2026-04-13: Removed in-panel direct-message notifications section and preserved header-level unread signal channel.
- 2026-04-13: Updated initial selection behavior to avoid auto-opening first conversation so read marking happens only after explicit conversation open.
- 2026-04-13: Added archive workflow with `Archivados` inbox filter and archive/unarchive controls in conversation cards and thread header.
- 2026-04-13: Added per-message quick actions in thread bubbles (`Responder con cita`, `Copiar mensaje`) for faster messaging workflows.
- 2026-04-13: Added quoted-reply composer context panel and quoted send formatting to preserve reply intent in plain message schema.
- 2026-04-13: Added per-conversation draft persistence in local storage and automatic draft restoration when switching chats.
- 2026-04-13: Added `Ir al último mensaje` jump control when user scrolls away from recent thread messages.
- 2026-04-13: Added inbox discovery controls with search and quick filters (`Todos`, `No leídos`, `Fijados`) backed by deterministic conversation projection.
- 2026-04-13: Added per-conversation pin/mute controls with local persistence and muted-notification suppression in inbox counters.
- 2026-04-13: Added mobile-first inbox/thread switching with explicit back navigation from thread/new-chat views.
- 2026-04-13: Added thread readability improvements with day separators, grouped bubble rhythm, and sent/read indicators for own messages.
- 2026-04-13: Added composer ergonomics (`Enter` to send, `Shift+Enter` newline, and live character counter hints).
- 2026-04-13: Added indexed+limited sender/recipient listeners with automatic compatibility fallback for environments missing direct-message composite indexes.
- 2026-04-13: Added in-view pagination controls (`Mostrar más conversaciones` and `Mostrar mensajes anteriores`) to reduce render load in large inboxes.
- 2026-04-13: Fixed direct-message listener permission failures by scoping sender/recipient listeners with `institutionId` and explicit permission-denied feedback.
- 2026-04-13: Fixed maximum update depth loop by stabilizing participant/common-subject effects and preventing redundant state updates.
- 2026-04-13: Added institution-wide recipient search with live suggestions to start conversations from `/messages` without an existing thread.
- 2026-04-13: Added new-conversation composer flow (recipient selection + first message send) and automatic thread handoff when the conversation appears in realtime.
- 2026-04-12: Added initial Messages hub implementation with conversation list, thread view, participant academic context, and direct-message notification activation.