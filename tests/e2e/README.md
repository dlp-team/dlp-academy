# E2E Tests

## Overview

DLP Academy uses [Playwright](https://playwright.dev/) for E2E testing against **Firebase Emulators** by default. This provides fast, isolated, and reproducible tests without requiring real Firebase credentials.

## Prerequisites

- **Node.js 20+**
- **Java 17+** (required for Firestore emulator)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Playwright Chromium**: `npx playwright install chromium`

## Running Tests

### Default (Emulator Mode) — Recommended

```bash
# Ensure emulator env vars are set in .env:
# E2E_EMAIL, E2E_PASSWORD, E2E_OWNER_EMAIL, E2E_OWNER_PASSWORD, etc.
# E2E_RUN_MUTATIONS=true
# E2E_INSTITUTION_ID=<your-test-institution-id>

npm run test:e2e
```

This automatically:
1. Starts Firebase Emulators (Auth, Firestore, Storage, Functions)
2. Starts Vite dev server with `VITE_USE_EMULATORS=true`
3. Seeds test users in Auth emulator
4. Seeds Firestore with user profiles, institution, courses, subjects
5. Runs all 75 tests with Chromium

### Interactive UI Mode

```bash
npm run test:e2e:ui
```

### Live Mode (against real Firebase)

```bash
npm run test:e2e:live
```

Requires real credentials in `.env` and `FIREBASE_SERVICE_ACCOUNT_JSON`.

## Test Personas

The global-setup creates 9 test personas in the Auth emulator:

| Persona | Env Vars | Role |
|---------|----------|------|
| Default | `E2E_EMAIL` / `E2E_PASSWORD` | teacher |
| Owner | `E2E_OWNER_EMAIL` / `E2E_OWNER_PASSWORD` | teacher |
| Editor | `E2E_EDITOR_EMAIL` / `E2E_EDITOR_PASSWORD` | teacher |
| Viewer | `E2E_VIEWER_EMAIL` / `E2E_VIEWER_PASSWORD` | student |
| Admin | `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | admin |
| Institution Admin | `E2E_INSTITUTION_ADMIN_EMAIL` / `E2E_INSTITUTION_ADMIN_PASSWORD` | institutionadmin |
| Teacher | `E2E_TEACHER_EMAIL` / `E2E_TEACHER_PASSWORD` | teacher |
| Student | `E2E_STUDENT_EMAIL` / `E2E_STUDENT_PASSWORD` | student |
| Onboarding | `E2E_ONBOARDING_EMAIL` / `E2E_ONBOARDING_PASSWORD` | student (no institution) |

## Configuration

- **Workers**: 3 in emulator mode (prevents emulator overload)
- **Retries**: 2 in emulator mode (handles infrastructure flakiness)
- **Timeout**: 60s for mutation-heavy tests

See [playwright.config.js](../playwright.config.js) for full configuration.

## CI

E2E tests run automatically in GitHub Actions via `.github/workflows/e2e-emulator.yml`:
- Triggers on push to `main`, `development`, and `feature/**` branches
- Uses fixed test personas (no GitHub secrets needed)
- Caches emulator binaries and Playwright browsers
- Uploads test reports and failure traces as artifacts

## File Structure

```
tests/e2e/
├── global-setup.ts              # Auth + Firestore seeding
├── seed/
│   └── firestore-seed.ts        # Firestore data seeding
├── helpers/
│   ├── e2e-auth-helpers.ts      # Login/logout helpers
│   ├── e2e-firebase-admin.ts    # Admin SDK singleton
│   └── e2e-data-factories.ts    # Test data builders
├── home-subject-crud.spec.ts    # Subject CRUD tests
├── home-folder-crud.spec.ts     # Folder CRUD tests
├── home-sharing-operations.spec.ts  # Sharing tests
├── home-bulk-operations.spec.ts # Bulk selection tests
├── home-advanced-operations.spec.ts # Advanced ops tests
├── profile-settings.spec.js     # Profile/settings tests
├── quiz-lifecycle.spec.js       # Quiz flow tests
├── study-flow.spec.js           # Study navigation tests
├── admin-guardrails.spec.js     # Admin access tests
├── subject-topic-content.spec.js # Content navigation tests
└── onboarding-flow.spec.ts      # Onboarding tests
```
