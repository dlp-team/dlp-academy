<!-- copilot/plans/active/autopilot-plan-messages-hub-2026-04-12/README.md -->
# Autopilot Plan: Messages Hub + Notification Split

## Status
- Lifecycle: `active`
- Current phase: `phase-02-messaging-domain-and-rules`
- Branch: `feature/hector/autopilot-plan-messages-hub-2026-0412`
- Owner: `hector`

## Source Priority
- Primary source: [source-autopilot-user-spec-messages-hub.md](source-autopilot-user-spec-messages-hub.md)
- Authority rule: source spec requirements are preserved as highest-priority constraints.

## Problem Statement
The platform currently supports direct-message creation from Subject context and message notification events, but lacks a dedicated full messages workspace (conversations list, threaded reading context, profile insights, and message-focused header behavior). The new requirement is to deliver a first-class in-app direct messaging experience with multi-tenant safety, role clarity, and unified notification/message presentation.

## Requested Scope
- Create a dedicated Messages area/page with conversation listing and chat-first UX.
- Keep send-message entrypoint from Subject class/member profile and persist those messages in the same messaging system.
- Show user profile context inside messages (shared subjects + user role such as admin/teacher/student).
- Build a shared component layer that unifies notification/message visual patterns.
- In Header, isolate message notifications into the messages section while preserving non-message notifications separately.
- Add all required functionality for robust direct messaging (state, unread behavior, thread retrieval, metadata consistency).

## Out Of Scope
- External messaging providers (email/SMS/push).
- Cross-institution direct messaging.
- Changes to unrelated dashboards/routes not required by messaging workflow.

## Risk Surface
- Firestore permissions drift (cross-institution leakage risk).
- Notification routing regressions between message and non-message channels.
- Realtime thread performance or stale unread counters.
- UI regressions in existing notification panel/history behaviors.

## Validation Gates
- `get_errors` on all touched files.
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- Targeted runtime checks: Header notifications split, Messages list/thread behavior, Subject-profile entrypoint, common-subject metadata visibility.

## Rollback Strategy
- Keep commits atomic per phase.
- Keep Firestore schema additive only.
- Revert by feature block if any notification or permissions regression appears.

## Progress Notes
- 2026-04-12: Plan package initialized in active lifecycle.
- 2026-04-12: Source spec moved from repository root into this plan folder as `source-autopilot-user-spec-messages-hub.md`.
- 2026-04-12: Intake/governance phase completed on branch `feature/hector/autopilot-plan-messages-hub-2026-0412`.
