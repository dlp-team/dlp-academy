<!-- copilot/plans/active/autopilot-plan-messages-experience-upgrade-2026-04-13/README.md -->
# Autopilot Plan: Messages Experience Upgrade

## Status
- Lifecycle: active
- Current phase: phase-09-validation-doc-sync-closure (completed)
- Owner: GitHub Copilot

## Source Priority
- Primary source: [source-user-request-messages-experience-upgrade.md](source-user-request-messages-experience-upgrade.md)
- Intake extension source: [source-autopilot-user-spec-messages-suite.md](source-autopilot-user-spec-messages-suite.md)
- Secondary source: existing Messages implementation and prior hardening work from 2026-04-13.
- Authority rule: preserve multi-tenant safety and least-privilege behavior while improving UX.

## Problem Statement
The direct-messages module is functional and secure, but still lacks several practical inbox and thread experiences users expect from modern messaging products (searchable inbox, workflow controls, mobile-first chat navigation, and richer message readability signals).

## Requested Scope
- Build a step-by-step execution plan and apply it in this same request.
- Upgrade conversation discovery and management (search/filter plus practical controls).
- Improve thread readability and composer behavior for fast day-to-day messaging.
- Improve mobile UX so direct messages are practical on small screens.
- Implement AUTOPILOT intake requirements: avatar-first chat list/thread header, file attachments, header-level unread chats, clickable common-subject chips, and exact academic resource references in chat.
- Keep all visible UI text in Spanish and maintain existing architecture patterns.

## Out Of Scope
- Cross-institution direct messages.
- External push/email/SMS delivery.
- Breaking schema changes that require full data migration beyond current direct-message model.

## Risk Surface
- UI regressions in existing conversation selection/read-marking behavior.
- State loops or render thrash on high-volume conversations.
- Mobile layout regressions in existing desktop behavior.

## Validation Gates
- get_errors on touched files.
- Targeted unit tests for new message utilities.
- Existing direct-message unit tests.
- npm run lint on touched scope when applicable.

## Rollback Strategy
- Keep changes additive and isolated to Messages page + utility/test layers.
- Revert by feature block if regressions appear (inbox controls, mobile UX, thread rendering).

## Progress Notes
- 2026-04-13: Plan package created in active lifecycle.
- 2026-04-13: Phase 01 completed with requirement synthesis and architecture-safe scope definition.
- 2026-04-13: Phase 02 completed with inbox search, filters, and pin/mute controls wired into conversation cards.
- 2026-04-13: Phase 03 completed with mobile inbox/thread switching and back navigation controls.
- 2026-04-13: Phase 04 completed with thread day separators, read/sent indicators, and keyboard-first composer behavior.
- 2026-04-13: Phase 05 completed with targeted tests, get_errors validation, and docs/lossless sync.
- 2026-04-13: Phase 06 optimization/risk review completed; implementation ready for lifecycle transition to inReview.
- 2026-04-13: Phase 07 completed with AUTOPILOT intake binding and remaining-gap audit on a new dedicated branch.
- 2026-04-13: Phase 08 completed with avatar-led conversation cards, thread-header avatars, attachment upload/rendering, header unread-chat signal alignment, and subject/resource reference workflows.
- 2026-04-13: Phase 09 completed with full validation (`get_errors`, targeted tests, lint) and plan/docs synchronization.
