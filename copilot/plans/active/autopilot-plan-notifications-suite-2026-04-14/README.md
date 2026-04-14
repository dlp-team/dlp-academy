<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/README.md -->
# Autopilot Plan: Notifications and Message Hover Suite

## Status
- Lifecycle: active
- Current phase: phase-07-validation-doc-sync-and-closure
- Owner: GitHub Copilot

## Source Priority
- Primary source: [source-autopilot-user-spec-notifications-suite.md](source-autopilot-user-spec-notifications-suite.md)
- Secondary source: existing notification stack in [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx), [src/components/layout/Header.tsx](src/components/layout/Header.tsx), [src/components/ui/notificationPresentation.tsx](src/components/ui/notificationPresentation.tsx), and [functions/index.js](functions/index.js).
- Authority rule: keep multi-tenant and least-privilege behavior unchanged while implementing UX and notification taxonomy upgrades.

## Problem Statement
Current notifications and message indicators work, but they do not match the requested taxonomy, icon semantics, hover behavior, topic-content alerts, and formula rendering expectations for educational communication workflows.

## Requested Scope
- Split and normalize notification semantics and iconography:
  - message notifications use message icon,
  - bell notifications use bell icon,
  - topic-content notifications use type-specific icons for test and task.
- Add student notifications when teacher adds visible content in topics.
- Add settings control to disable new-content notifications.
- Add due-soon notification when deliverable assignment has 24 hours remaining.
- Add hover preview on header message icon with latest up to 3 unread messages.
- Bell dropdown navigation behavior:
  - clicking notification item from dropdown goes to notifications page,
  - clicking inside notifications page follows its hyperlink.
- Fix formula duplication in message rendering so formula is shown only in processed LaTeX form.

## Out Of Scope
- Cross-institution notification delivery.
- External push, SMS, or email notification expansion in this phase.
- Destructive schema migrations.

## Risk Surface
- Notification over-generation and duplicate writes.
- Incorrect permission scope for student visibility.
- Header performance regression due to live hover fetch logic.
- Routing regressions in bell/message interactions.

## Validation Gates
- get_errors on all touched files.
- Targeted unit tests for notification mapping and message rendering logic.
- Existing messaging and notification suites.
- npm run lint.

## Rollback Strategy
- Keep additive changes per phase with isolated commits.
- Revert by feature block:
  1. icon/taxonomy layer,
  2. topic-content notifications,
  3. header hover behavior,
  4. formula rendering fix.

## Progress Notes
- 2026-04-14: Plan package created from AUTOPILOT_PLAN intake on branch `feature/hector/autopilot-plan-notifications-suite-2026-0414`.
- 2026-04-14: Implemented notification taxonomy updates, student visible-content notifications, settings new-content toggle support, and 24h due-soon routing metadata in [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx) and [src/components/ui/notificationPresentation.tsx](src/components/ui/notificationPresentation.tsx).
- 2026-04-14: Implemented unread messages hover preview in [src/components/layout/Header.tsx](src/components/layout/Header.tsx) and bell-dropdown-to-page flow in [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx) + [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx).
- 2026-04-14: Implemented message formula plain-text dedup in [src/pages/Messages/Messages.tsx](src/pages/Messages/Messages.tsx) while preserving KaTeX rendering.
- 2026-04-14: Validation complete (`get_errors`, targeted unit tests, `npm run lint`) and lossless report created at [copilot/explanations/temporal/lossless-reports/2026-04-14/autopilot-plan-notifications-suite-phase-02-07.md](copilot/explanations/temporal/lossless-reports/2026-04-14/autopilot-plan-notifications-suite-phase-02-07.md).
