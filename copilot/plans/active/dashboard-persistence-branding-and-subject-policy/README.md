<!-- copilot/plans/active/dashboard-persistence-branding-and-subject-policy/README.md -->
# Dashboard Persistence, Branding, and Subject Policy

## Problem statement
This change spans Home, dashboard pages, institution customization, and subject permission flows. The current codebase lacks durable tab/section persistence outside Home, admin-to-institution dashboard navigation, policy-backed teacher permissions for class assignment/deletion, and a complete institution icon/logo flow. Subject shortcut cards also need a distinct “passed” state for student-facing non-manual views.

## Scope
- Improve dark-mode card color visibility, especially modern cards and create-subject placeholders.
- Add visual “passed” styling for shortcut subjects hidden from manual but still visible in courses/usage.
- Persist key page tabs/sections/collapsed groups across reloads where requested.
- Allow global admin to enter institution admin dashboard from Institutions tab.
- Extend institution access policies with teacher subject-management permissions.
- Enforce those policies in subject classes/deletion behavior.
- Complete institution icon/logo flow, including repo-side storage rules/config if missing.
- Add/update tests and documentation.

## Non-goals
- Deployment of Firebase rules or hosting.
- Broad UI redesign outside the requested areas.
- Refactoring unrelated dashboard internals.

## Status summary
- Current phase: Phase 1 in progress.
- Storage rules file is currently missing from repo configuration and may be part of the branding permission issue.
- Existing institution policy infrastructure already exists under `institutions.accessPolicies` and will be extended rather than duplicated.

## Key decisions and assumptions
- Persistence will use scoped localStorage helpers unless an existing per-user preference flow already exists for that page.
- Teacher permission toggles will live under `accessPolicies.teachers`.
- “Passed” shortcut styling will key off `hiddenInManual === true` on shortcut subjects and preserve visibility in courses/usage.
- Storage fix will include repo-side rules/config and app-side favicon propagation; actual cloud deployment remains manual.
