<!-- copilot/explanations/codebase/src/pages/Notifications/Notifications.md -->
# Notifications.tsx

## Overview
- Source file: `src/pages/Notifications/Notifications.tsx`
- Last documented: 2026-04-04
- Role: Dedicated notifications history page rendered at `/notifications`.

## Responsibilities
- Renders full notification history with unread counters and bulk mark-as-read action.
- Reuses shortcut move request approve/reject flows from `useNotifications`.
- Deep-links to subject page (`/home/subject/:subjectId`) when notification payload includes `subjectId`.
- Uses shared header shell for consistent navigation and role context behavior.

## Main Dependencies
- `src/components/layout/Header.tsx`
- `src/hooks/useNotifications.tsx`
- `react-router-dom` navigation
- `lucide-react` icons

## Exports
- `default Notifications`

## Changelog
### 2026-04-09
- Updated notification history cards to match the cleaner dropdown visual language.
- Added shared type-based icon and tone mapping for share/assignment/shortcut and fallback events.
- Switched unread-dot tone to neutral slate and softened hover/background treatment for reduced visual noise.
