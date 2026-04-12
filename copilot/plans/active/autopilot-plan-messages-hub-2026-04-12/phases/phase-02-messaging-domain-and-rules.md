<!-- copilot/plans/active/autopilot-plan-messages-hub-2026-04-12/phases/phase-02-messaging-domain-and-rules.md -->
# Phase 02 - Messaging Domain and Rules

## Objective
Define/extend direct messaging data model and enforce institution-safe access boundaries.

## Planned Changes
- Review existing `directMessages` writes and introduce conversation-centric read model.
- Add/adjust indexes and query shapes for conversation listing.
- Harden Firestore rules for participant-only reads and same-institution writes.

## Validation
- Positive same-institution conversation send/read checks.
- Negative cross-institution and non-participant read denials.

## Status
- `PLANNED`
