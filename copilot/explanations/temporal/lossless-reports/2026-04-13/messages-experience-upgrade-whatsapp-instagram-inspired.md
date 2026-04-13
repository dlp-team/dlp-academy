<!-- copilot/explanations/temporal/lossless-reports/2026-04-13/messages-experience-upgrade-whatsapp-instagram-inspired.md -->
# Lossless Change Report - Messages Experience Upgrade

## Date
- 2026-04-13

## Requested Scope
- Create a step-by-step plan and apply practical/visual direct-message upgrades inspired by modern chat products.
- Keep existing multi-tenant and security boundaries intact.

## Implemented Changes
- Messages inbox upgrades:
  - Added conversation search input.
  - Added quick filters (Todos, No leídos, Fijados).
  - Added pin and mute controls per conversation with per-user local persistence.
  - Added archive and unarchive controls with dedicated `Archivados` filter mode.
- Mobile UX upgrades:
  - Added inbox/thread panel switching for mobile viewport.
  - Added explicit back navigation from thread/new-chat views to inbox.
- Thread readability/composer upgrades:
  - Added date separators in thread rendering.
  - Added own-message state cues (Enviado/Leído).
  - Added Enter-to-send with Shift+Enter newline behavior.
  - Added auto-scroll behavior that keeps bottom-stick only when user is near latest messages.
  - Added `Ir al último mensaje` control when thread viewport is away from latest content.
  - Added per-message quick actions (copy and quoted reply) inside thread bubbles.
  - Added quoted-reply composer context and send formatting.
  - Added per-conversation draft persistence and auto-restoration when switching chats.
  - Added composer attachment flow (file picker, limits, removal, send integration).
  - Added subject/resource reference picker (`Asignatura completa`, `documentos`, `resumen`) with route-aware reference cards in message bubbles.
- Identity/navigation upgrades:
  - Added participant avatar as leading visual in conversation list cards.
  - Added participant avatar in selected-thread and new-conversation headers.
  - Converted common-subject chips to clickable subject navigation actions.
- Notification channel refinement:
  - Removed in-panel message notifications list from `/messages`.
  - Updated header message badge to prioritize unread chat-conversation count from `directMessages` unread state.
- Service/storage upgrades:
  - Extended `sendDirectMessage` to support attachment uploads to Storage and optional subject-reference metadata.
  - Added storage rule path for direct-message attachments scoped by institution and conversation participants.
- Utility centralization:
  - Added `applyConversationInboxFilters` to project/sort conversations with pin/mute/search/filter logic.
  - Added `formatThreadDayLabel` and `buildThreadRows` for thread date separators.

## Preserved Behaviors
- Existing direct-message Firestore read/write flow remains unchanged.
- Existing read-marking on conversation open remains active and now avoids implicit read on auto-selected first thread.
- Existing direct-message notifications channel remains active for header counter behavior.
- Existing institution-scoped assumptions remain unchanged.

## Validation
- `get_errors` clean on touched files.
- `npm run test -- tests/unit/services/directMessageService.test.js tests/unit/utils/directMessageUtils.test.js tests/unit/components/CommunicationItemCard.test.jsx` -> pass (14/14).
- `npm run lint` -> pass.

## Continuation Notes
- The final pass wired previously prepared inbox/thread state into the rendered UI, including mobile back navigation, muted-aware counters, and conversation-level action chips.
- A second enhancement pass added practical thread interaction features (copy/quote/jump/drafts) inspired by modern chat ergonomics while preserving existing schema/rules.
- A third enhancement pass added archived conversation management to keep active inboxes focused while preserving archived access via filter controls.
- A fourth AUTOPILOT intake pass delivered remaining user-requested gaps (attachments, header unread chats, avatar-led layout, and exact subject resource references).
- Plan artifacts in `copilot/plans/active/autopilot-plan-messages-experience-upgrade-2026-04-13/` were synchronized to include new intake source, extension phases, checklist updates, and implementation log evidence.

## Touched Files
- `src/pages/Messages/Messages.tsx`
- `src/components/layout/Header.tsx`
- `src/components/ui/CommunicationItemCard.tsx`
- `src/services/directMessageService.ts`
- `storage.rules`
- `src/utils/directMessageUtils.ts`
- `tests/unit/components/CommunicationItemCard.test.jsx`
- `tests/unit/services/directMessageService.test.js`
- `tests/unit/utils/directMessageUtils.test.js`
- `copilot/plans/active/autopilot-plan-messages-experience-upgrade-2026-04-13/**`
- `BRANCH_LOG.md`
- `copilot/ACTIVE-GOVERNANCE/BRANCHES_STATUS.md`
- `copilot/explanations/codebase/src/pages/Messages/Messages.md`
- `copilot/explanations/codebase/src/components/layout/Header.md`
- `copilot/explanations/codebase/src/components/ui/CommunicationItemCard.md`
- `copilot/explanations/codebase/src/services/directMessageService.md`
- `copilot/explanations/codebase/src/utils/directMessageUtils.md`
