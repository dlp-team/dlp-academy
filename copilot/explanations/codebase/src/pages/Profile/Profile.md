# Profile.jsx

## Overview
- **Source file:** `src/pages/Profile/Profile.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.

## Exports
- `default Profile`

## Main Dependencies
- `react`
- `lucide-react`
- `../../components/layout/Header`
- `./hooks/useProfile`
- `./hooks/useUserStatistics`
- `./components/UserCard`
- `./components/ProfileSubjects`
- `./components/StatsSidebar`
- `./components/BadgesSection`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-03-30
- Added teacher aggregate statistics mode by passing `statsOptions` into `useUserStatistics` and `UserStatistics`.
- Wired teacher profile to assigned-students context (`assignedStudents`) instead of teacher-self metrics.
- Added teacher badge management surface via `BadgesSection` and `awardBadgeToStudent` hook action.
- Hid student badge sidebar card for teacher role using `showBadges={false}`.
