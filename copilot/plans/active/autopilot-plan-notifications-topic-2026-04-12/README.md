<!-- copilot/plans/active/autopilot-plan-notifications-topic-2026-04-12/README.md -->
# Autopilot Plan: Notifications + Topic Access + Direct Messaging

## Status
- Lifecycle: `active`
- Current phase: `phase-07-validation-docs-closure`
- Branch: `feature/hector/autopilot-plan-notifications-topic-2026-0412`
- Owner: `hector`

## Source Priority
- Primary source: [source-autopilot-user-spec-notifications-topic.md](source-autopilot-user-spec-notifications-topic.md)
- Authority rule: the source spec is preserved as the highest-priority requirement set.

## Problem Statement
The current UX uses multiple notification patterns and isolated components (header toast, undo toast, topic-local toast). This creates style drift, weak theming consistency, and difficult maintenance. In parallel, Topic study-guide access for teachers is inconsistent, and there is no direct-message channel inside the institution/class context.

## Requested Scope
- Unify notification style system around centralized component(s).
- Reposition Home copy/paste-derived notifications to bottom-left (currently too high/centered).
- Ensure notifications adapt to light/dark mode.
- Centralize notification rendering logic for easier updates.
- Replace mailbox-style center icon with a non-letter visual.
- Add a dedicated notification variant for shared subjects including sharer name and profile photo.
- Add direct messages between users in the same institution.
- Add student-to-teacher direct message entry from Subject class section.
- Fix Topic study-guide visibility/interactions so teachers can access and interact (not admin-only behavior).

## Out Of Scope
- External messaging providers or email/push integrations.
- Cross-institution messaging.
- Full redesign of unrelated Header/Home/Topic layouts.

## Risk Surface
- Firestore rule regressions for multi-tenant boundaries.
- Notification duplication or race conditions from multiple listeners.
- Permission drift for Topic/StudyGuide access and edit controls.
- UI regressions on mobile due notification position changes.

## Validation Gates
- `get_errors` on all touched files.
- `npm run lint`
- `npm run test`
- `npx tsc --noEmit`
- `npm run build` (if shared UI/routing footprint grows)
- Targeted runtime checks: Header notification panel, Home keyboard feedback/undo, Subject class members messaging, Topic study guide cards/links.

## Rollback Strategy
- Keep commits atomic by feature block (notifications, direct messages, topic access).
- Revert by commit if regressions appear in one block.
- Keep schema additive for direct messages; avoid destructive migrations.

## Progress Notes
- Phase 01 intake/governance completed on 2026-04-12.
- Source spec moved to this plan folder as `source-autopilot-user-spec-notifications-topic.md`.
- Plan package directories/files populated and linked for implementation.
- Phases 02-06 implemented: notification centralization, share identity rendering, direct messaging, student-to-teacher entrypoint, and teacher study-guide access adjustments.
