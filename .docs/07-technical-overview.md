# 07 — Technical Overview

> A concise reference for the technical foundation of DLP Academy.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Language | TypeScript (`.tsx`/`.ts`) — preferred for all new code |
| Styling | Tailwind CSS |
| Backend | Firebase (BaaS) |
| Database | Cloud Firestore (NoSQL) |
| Authentication | Firebase Authentication (email/password) |
| File Storage | Firebase Storage |
| Cloud Functions | Firebase Cloud Functions (Node.js) |
| E2E Testing | Playwright |
| Unit Testing | Vitest |
| Local Dev | Firebase Emulator Suite |

---

## Frontend Architecture

### Project Structure
```
src/
├── App.tsx                  → Root component, routing
├── main.tsx                 → Entry point
├── components/
│   ├── layout/              → Shell: Header, Sidebar
│   ├── modals/              → Modal dialogs
│   ├── modules/             → Feature-specific reusable components
│   └── ui/                  → Primitive UI components (buttons, inputs)
├── hooks/                   → Custom React hooks (useSubjects, useInstitutionBranding, etc.)
├── pages/                   → Route-level components
├── services/                → External integrations (n8n, etc.)
├── utils/                   → Pure utility functions
├── firebase/                → Firebase config and helpers
├── types/                   → TypeScript type definitions
└── styles/                  → Global styles
```

### Key Conventions
- **TypeScript-first:** All new modules in `.ts`/`.tsx`. No new JS duplicates.
- **File path comments:** Every file starts with its own path as a comment
- **No emojis in UI:** Icons only (from icon libraries)
- **Spanish UI text:** All visible user-facing text in Spanish
- **Component registry:** Reusable components documented in `copilot/REFERENCE/COMPONENT_REGISTRY.md`

---

## Firebase / Backend Architecture

### Firestore Collections
```
institutions/{institutionId}         → Institution config, branding, policies
institution_invites/{code}           → Invites for teachers + institutional access codes
users/{uid}                          → User profiles (role, institutionId, etc.)
subjects/{subjectId}                 → Subject metadata + classIds + enrolledStudentUids
subjectInviteCodes/{code}            → Atomic invite code registry (collision prevention)
classes/{classId}                    → Class groups (studentIds, teacherIds, linked subjects)
topics/{topicId}                     → Topics within subjects
  topics/{topicId}/documents/{id}    → Documents in topics
  topics/{topicId}/quizzes/{id}      → Quizzes in topics
quiz_results/{resultId}              → Student quiz submission results
```

### Firestore Rules Philosophy
- **Multi-tenancy enforced at rules level:** Every query that targets institution-scoped data must include `institutionId` matching the authenticated user's institution
- **Role check on every write:** Only the correct role can write to each collection
- **Client-side role escalation blocked:** `role: 'admin'` and `role: 'institutionadmin'` cannot be set from client-side signup
- **Cross-institution reads denied:** A user from Institution A cannot read documents with a different `institutionId`

### Firebase Storage Rules
- Only authenticated users can access files
- Users can only read files from their institution's storage path
- Only teachers/admins can write to storage

---

## Multi-Tenancy Architecture

Every data record that is institution-scoped includes `institutionId`. This field is set on creation and never changed. Firestore rules enforce that:
- Reads of institution-scoped collections require `institutionId == auth.token.institutionId` (stored as a custom claim or fetched from `users/{uid}`)
- Writes to institution-scoped collections require matching `institutionId`

This means the frontend always filters by `institutionId` AND the backend rules enforce the same filter. Both layers must agree.

---

## Authentication Flow

1. User submits email/password at `/login`
2. Firebase Auth `signInWithEmailAndPassword` called
3. On success, `onAuthStateChanged` listener triggers
4. App fetches `users/{uid}` from Firestore to get role and institutionId
5. Role stored in React context/state
6. User redirected to appropriate home page based on role

### Email Verification
- New registrations are redirected to `/verify-email`
- Firebase Auth email verification link is sent
- Until verified, user is stuck on the verification page
- App checks `auth.currentUser.emailVerified` on each protected route load

---

## Local Development

### Firebase Emulator
Run with:
```bash
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```
- **Auth emulator:** localhost:9099
- **Firestore emulator:** localhost:8080
- **Storage emulator:** localhost:9199
- **Functions emulator:** localhost:5001
- **Emulator UI:** http://127.0.0.1:4000

### Dev Server
```bash
npm run dev
```
Runs at `http://localhost:5173`

### Environment Variables
Required in `.env.local`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_USE_EMULATORS=true
```

---

## Testing

### Unit Tests (Vitest)
```bash
npm run test
```
- Test files in `tests/unit/`
- Mocks in `tests/mocks/`
- Firestore rules tests in `tests/rules/`

### E2E Tests (Playwright)
```bash
npx playwright test
```
- Test files in `tests/e2e/`
- Runs against `http://localhost:5173` with emulators
- Helper factories in `tests/e2e/helpers/`

### Running Both
```bash
npm run test && npx playwright test
```

---

## Key Architectural Decisions

1. **Firebase as the full backend** — eliminates need for a custom API server, reduces infrastructure complexity
2. **Emulator-first development** — all development happens against local emulators, no risk to production data
3. **Role stored in Firestore, not Auth custom claims** — easier to update and audit, at the cost of one extra read on login
4. **TypeScript throughout** — prevents runtime type errors, especially important for Firestore document shapes
5. **Multi-tenancy via institutionId** — simple and effective isolation without complex schema design

---

## Last Updated

*2026-04-23 — Initial creation*
