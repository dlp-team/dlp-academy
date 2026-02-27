# Tree DnD Shortcut Unification

## Problem Statement
Tree modal drag and drop still uses partially independent logic and payloads, causing shortcut drags to sometimes move source items instead of shortcuts. Behavior differs from list mode and is harder to maintain.

## Scope
- Make Tree modal shortcut drags move shortcuts only.
- Enforce shared-folder shortcut restriction with request confirmation path in Tree modal too.
- Add ghost drag behavior to Tree modal rows, aligned with list mode UX.
- Start centralization by routing Tree modal drop decisions through the same Home handler path used by list mode.

## Non-Goals
- Build full backend owner-approval workflow for request handling.
- Add new notification/email infrastructure implementation.

## Current Status
- Phase 01 completed: Tree modal shortcut-safe drop routing integrated with Home handler path.
- Phase 02 completed: Tree modal ghost drag parity implemented.
- Phase 03 started: shared helper extraction for list/tree DnD centralization.

## Key Decisions / Assumptions
- Shortcut movement policy is global: shortcuts never move into shared folders.
- Home page handler (`useHomePageHandlers`) is the source of truth for move policy.
- Temporary request action remains placeholder until backend workflow exists.
