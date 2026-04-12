<!-- copilot/plans/active/autopilot-plan-messages-hub-2026-04-12/README.md -->
# Autopilot Plan: Messages Hub + Notification Split

## Status
- Lifecycle: `active`
- Current phase: `phase-09-optimization-risk-review (completed)`
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
- 2026-04-12: Added dedicated `/messages` route/page with conversation list, thread view, send flow, and participant profile context.
- 2026-04-12: Separated direct-message notifications from general notifications in Header and notifications history.
- 2026-04-12: Introduced shared `CommunicationItemCard` primitive and reused it through `NotificationItemCard`.
- 2026-04-12: Validation gates executed (`get_errors`, lint, typecheck, targeted tests, full test suite).
- 2026-04-12: Documentation sync executed (lossless report + codebase explanation updates for all touched modules).
- 2026-04-12: Optimization/risk review completed; out-of-scope refactor risk recorded in `copilot/plans/out-of-scope-risk-log.md`.
