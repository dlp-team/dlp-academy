<!-- copilot/plans/active/autopilot-plan-messages-experience-upgrade-2026-04-13/user-updates.md -->
# User Updates

## How to Use
- Add new requirements under Pending User Updates.
- During implementation, Copilot syncs pending items into README/roadmap/phases.
- After syncing, items move to Processed Updates with date and integration notes.

## Pending User Updates
- None.

## Processed Updates
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
