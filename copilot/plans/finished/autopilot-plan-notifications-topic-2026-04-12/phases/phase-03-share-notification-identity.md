<!-- copilot/plans/finished/autopilot-plan-notifications-topic-2026-04-12/phases/phase-03-share-notification-identity.md -->
# Phase 03 - Shared Subject Notification Identity

## Objective
Ensure share notifications include and render sharer identity details (name + photo) in centralized notification UIs.

## Planned Changes
- Extend share notification payload schema from `useSubjects` share flow.
- Add renderer support in notifications list/panel/toasts.
- Fallback behavior when photo is missing.

## Validation
- Share subject as teacher/admin and verify recipient rendering.
- Ensure previous notifications without new fields still render.

## Status
- `COMPLETED`
