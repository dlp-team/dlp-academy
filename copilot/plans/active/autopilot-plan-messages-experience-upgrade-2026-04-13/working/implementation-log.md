<!-- copilot/plans/active/autopilot-plan-messages-experience-upgrade-2026-04-13/working/implementation-log.md -->
# Implementation Log

## 2026-04-13
- Created plan package and initialized execution roadmap.
- Loaded instruction/skill constraints and component registry.
- Scoped implementation toward inbox controls, mobile chat navigation, and thread UX polish.
- Implemented inbox search/filter UI wiring and practical conversation controls (pin/mute) with persistence.
- Implemented mobile inbox/thread switching with explicit back navigation in thread and new-conversation views.
- Implemented thread timeline readability improvements (day separators + own-message sent/read indicators).
- Implemented composer ergonomics upgrades (Enter-to-send, Shift+Enter newline, character counter hints).
- Implemented thread interaction upgrades: quote reply workflow, per-message copy action, jump-to-latest control, and per-conversation draft persistence.
- Implemented archived conversation workflow (archive/unarchive actions, archived filter, muted+archived-aware counters/notifications).
- Validated with `get_errors`, `tests/unit/utils/directMessageUtils.test.js` (8/8), and `tests/unit/services/directMessageService.test.js` (3/3).
- Started AUTOPILOT intake extension from `AUTOPILOT_PLAN.md` on new branch `feature/hector/autopilot-plan-messages-suite-2026-0413`.
- Added participant-avatar leading mode in conversation list cards and participant avatar block in thread/new-conversation headers.
- Added composer file attachments workflow (selection, limits, removal) and backend upload support in `directMessageService` with per-conversation storage paths.
- Added message-bubble attachment rendering for images/files and subject-resource reference cards with in-app navigation.
- Added subject-content reference picker (asignatura completa + `documents`/`resumen` resources by topic).
- Removed in-panel message-notification list and aligned unread indicator behavior to header-level message entrypoint.
- Updated header unread badge to prioritize unread chat conversation count (`directMessages` unread group) over raw notification count fallback.
- Validation rerun completed: `get_errors` clean, `npm run test -- tests/unit/services/directMessageService.test.js tests/unit/utils/directMessageUtils.test.js tests/unit/components/CommunicationItemCard.test.jsx` (14/14), `npm run lint` passed.
