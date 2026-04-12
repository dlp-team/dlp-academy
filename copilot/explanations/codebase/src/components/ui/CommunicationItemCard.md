<!-- copilot/explanations/codebase/src/components/ui/CommunicationItemCard.md -->
# CommunicationItemCard.tsx

## Overview
- Source file: `src/components/ui/CommunicationItemCard.tsx`
- Last documented: 2026-04-12
- Role: Shared communication row primitive used by notifications and messages previews.

## Responsibilities
- Renders icon, title, message preview, timestamp, actor badge, unread marker, and optional actions.
- Supports interactive rows via keyboard (`Enter`/`Space`) and click activation.
- Centralizes the shared visual structure to avoid drift between message and notification channels.

## Main Dependencies
- `react`
- `src/components/ui/Avatar.tsx`

## Exports
- `default CommunicationItemCard`

## Changelog
- 2026-04-12: Added component as unified card renderer for message conversation rows and notification rows.