# Strategy Roadmap: Migrate E2E to Firebase Emulators

## Phase Overview

| Phase | Title | Effort | Risk |
|-------|-------|--------|------|
| 1 | Emulator Connection Layer | Small | Low |
| 2 | Auth Emulator Setup & User Seeding | Medium | Medium |
| 3 | Firestore Emulator Data Seeding | Medium | Medium |
| 4 | Playwright Config & Test Runner Integration | Small | Low |
| 5 | Test Migration & Validation | Large | Medium |
| 6 | CI/CD Pipeline Setup | Medium | Low |
| 7 | Final Validation & Cleanup | Small | Low |

## Execution Order

Phases execute sequentially. Each phase has a validation gate before proceeding.

## Source of Truth

This file is the single source of truth for plan progress. Update phase status here as work completes.

### Phase Status Tracker

- [x] Phase 1: Emulator Connection Layer (pre-existing in config.ts)
- [x] Phase 2: Auth Emulator Setup & User Seeding (pre-existing in global-setup.ts)
- [x] Phase 3: Firestore Emulator Data Seeding (tests/e2e/seed/firestore-seed.ts + global-setup integration)
- [x] Phase 4: Playwright Config & Test Runner Integration (webServer array + npm scripts)
- [x] Phase 5: Test Migration & Validation (67/67 passing, 3 consecutive clean runs — 2026-04-18)
- [ ] Phase 6: CI/CD Pipeline Setup
- [ ] Phase 7: Final Validation & Cleanup
