<!-- copilot/explanations/codebase/src/pages/ThemePreview/ThemePreview.md -->
# ThemePreview.tsx

## Overview
- **Source file:** `src/pages/ThemePreview/ThemePreview.tsx`
- **Last documented:** 2026-04-14
- **Role:** Public preview route that renders the real `Home` surface using same-origin postMessage user context from institution customization.

## Responsibilities
- Resolves initial preview role from URL query (`/theme-preview?role=teacher|student`).
- Listens for institution-preview messages and ignores foreign origins.
- Applies runtime theme/highlight CSS payloads for live visual parity.
- Accepts sanitized preview-user context from customization payload and resolves a Home-compatible preview user.
- Forces preview role context (`teacher`/`student`) on top of received user data for deterministic role-surface parity.
- Renders real `Home` route composition (no hardcoded preview dataset markup).

## Main Dependencies
- `react`
- `react-router-dom`
- `src/pages/Home/Home.tsx`
- `src/utils/institutionPreviewProtocol.ts`

## Changelog
### 2026-04-15
- Expanded wildcard topic-content preview (`/theme-preview/home/subject/:subjectId/topic/:topicId/*`) to render section-specific mock cards for:
	- study guide (`resumen`),
	- formulas,
	- quizzes,
	- exams,
	- assignments.
- The deep preview screen now derives section type from path segments and presents focused mock copy instead of a single generic placeholder.

### 2026-04-14
- Locked resolved preview-user `roles` and `availableRoles` to the toolbar-selected preview role (`teacher`/`student`).
- Removed duplicate in-app role-switch selector visibility inside iframe preview while preserving top-toolbar role control.
- Kept same-origin message validation and live style-tag injection behavior unchanged.

### 2026-04-10
- Replaced hardcoded preview rendering with real `Home` route composition.
- Added preview-user context consumption from same-origin customization postMessage payload.
- Added route-level fallback state while waiting for preview user context.

### 2026-04-08
- Added new public `ThemePreview` page for iframe-based institution customization preview.
- Added secure same-origin message listener for preview payload updates.
- Added query-role bootstrap support and live role/color synchronization.
