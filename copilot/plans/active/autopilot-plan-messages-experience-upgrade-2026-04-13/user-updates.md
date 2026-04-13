<!-- copilot/plans/active/autopilot-plan-messages-experience-upgrade-2026-04-13/user-updates.md -->
# User Updates

## How to Use
- Add new requirements under Pending User Updates.
- During implementation, Copilot syncs pending items into README/roadmap/phases.
- After syncing, items move to Processed Updates with date and integration notes.

## Pending User Updates
- None.

## Processed Updates
- 2026-04-13: After user report ("no encuentro la opcion en StudyGuide"), added discoverability hotfix for ask-teacher flow: visible quick action button in StudyGuide plus relaxed role gate (authenticated viewers) while preserving right-click path. Synced in:
	- [src/pages/Content/StudyGuide.tsx](src/pages/Content/StudyGuide.tsx)
	- [copilot/explanations/temporal/lossless-reports/2026-04-13/studyguide-contextual-teacher-questions-and-chat-reliability.md](copilot/explanations/temporal/lossless-reports/2026-04-13/studyguide-contextual-teacher-questions-and-chat-reliability.md)
- 2026-04-13: Applied follow-up requested by user to complete missing behavior: StudyGuide now preserves exact selected text/formula context in teacher-question references, and Messages reference picker now enforces hierarchical selection (`Asignatura -> Tema -> Recurso`) including topic-level references. Synced in:
	- [src/pages/Content/StudyGuide.tsx](src/pages/Content/StudyGuide.tsx)
	- [src/pages/Messages/Messages.tsx](src/pages/Messages/Messages.tsx)
	- [src/utils/studyGuideQuestionUtils.ts](src/utils/studyGuideQuestionUtils.ts)
	- [src/services/directMessageService.ts](src/services/directMessageService.ts)
	- [tests/unit/utils/studyGuideQuestionUtils.test.js](tests/unit/utils/studyGuideQuestionUtils.test.js)
	- [copilot/explanations/temporal/lossless-reports/2026-04-13/studyguide-contextual-teacher-questions-and-chat-reliability.md](copilot/explanations/temporal/lossless-reports/2026-04-13/studyguide-contextual-teacher-questions-and-chat-reliability.md)
- 2026-04-13: Added student StudyGuide contextual messaging workflow requested by user: selected-text right-click action (`Preguntar al profesor`) with teacher selection, custom message, and direct-message payload linked to the exact guide route. Also addressed runtime blockers reported in chat entry (index fallback noise and subject-reference permission failures). Synced in:
	- `src/pages/Content/StudyGuide.tsx`
	- `src/utils/studyGuideQuestionUtils.ts`
	- `tests/unit/utils/studyGuideQuestionUtils.test.js`
	- `src/pages/Messages/Messages.tsx`
	- `firestore.rules`
	- `firestore.indexes.json`
	- `src/firebase/config.ts`
	- `copilot/explanations/temporal/lossless-reports/2026-04-13/studyguide-contextual-teacher-questions-and-chat-reliability.md`
- 2026-04-13: Applied AUTOPILOT intake extension from `AUTOPILOT_PLAN.md` on a new branch with the remaining requested messaging upgrades: participant avatars on inbox/thread headers, file attachments, header-level unread-chat counter alignment, removal of in-panel message notifications, clickable common-subject chips, and subject/resource reference insertion (study guides, summaries, PDFs). Synced in:
	- `src/pages/Messages/Messages.tsx`
	- `src/services/directMessageService.ts`
	- `src/components/layout/Header.tsx`
	- `src/components/ui/CommunicationItemCard.tsx`
	- `storage.rules`
	- `tests/unit/services/directMessageService.test.js`
	- `tests/unit/components/CommunicationItemCard.test.jsx`
	- `copilot/explanations/temporal/lossless-reports/2026-04-13/messages-experience-upgrade-whatsapp-instagram-inspired.md`
- 2026-04-13: Upgraded Messages experience with inbox discovery controls (search/filtros), pin/mute/archive conversation controls, mobile inbox-thread navigation, thread day separators, sent/read cues, composer keyboard ergonomics, plus quote/copy/jump-to-latest/draft workflows in the thread panel. Synced in:
	- `src/pages/Messages/Messages.tsx`
	- `src/utils/directMessageUtils.ts`
	- `tests/unit/utils/directMessageUtils.test.js`
	- `copilot/explanations/temporal/lossless-reports/2026-04-13/messages-experience-upgrade-whatsapp-instagram-inspired.md`
