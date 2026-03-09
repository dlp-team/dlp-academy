// copilot/explanations/codebase/tests/e2e/subject-topic-content.spec.md

## Changelog
### 2026-03-09: Phase 03 content-route and editor lifecycle hardening
- Added deterministic route-coverage fallback when topic cards do not expose `Ver` controls.
- Added StudyGuideEditor save-action lifecycle coverage on seeded summary routes.
- Added invalid resource route fallback assertion to ensure controlled empty-state rendering.

## Overview
This E2E suite validates subject/topic navigation and downstream content routes (`resumen`/`resource`) with seeded Firestore fixtures.

## Notes
- Seed resolution supports both environment-provided ids and admin-assisted discovery.
- New checks prioritize route/state integrity over backend-specific toast timing.
