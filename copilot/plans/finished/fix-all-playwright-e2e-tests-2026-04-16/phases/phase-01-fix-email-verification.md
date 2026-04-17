<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/phases/phase-01-fix-email-verification.md -->
# Phase 1: Fix Email Verification Blocking

**Status:** `todo`
**Impact:** Unblocks 29 failing tests
**Priority:** CRITICAL PATH — all other phases depend on this

---

## Problem

`App.tsx` line ~190 redirects password-based users with `emailVerified === false` to `/verify-email`.
All E2E test accounts have unverified emails, causing every test that logs in to fail.

## Solution

Create a Playwright `globalSetup` that uses Firebase Admin SDK to mark all E2E user emails as verified before tests run.

## Implementation Steps

### Step 1: Create `tests/e2e/global-setup.ts`

```typescript
// tests/e2e/global-setup.ts
import 'dotenv/config';
import admin from 'firebase-admin';

const ensureAdmin = (): admin.app.App | null => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const normalized = raw.trim().replace(/^'/, '').replace(/'$/, '');
    const sa = JSON.parse(normalized);
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(sa) });
    }
    return admin.app();
  } catch {
    return null;
  }
};

const verifyEmail = async (email: string | undefined) => {
  if (!email) return;
  try {
    const user = await admin.auth().getUserByEmail(email.trim().toLowerCase());
    if (!user.emailVerified) {
      await admin.auth().updateUser(user.uid, { emailVerified: true });
      console.log(`[global-setup] Verified email for ${email}`);
    }
  } catch (e) {
    console.warn(`[global-setup] Could not verify ${email}:`, e);
  }
};

export default async function globalSetup() {
  const app = ensureAdmin();
  if (!app) {
    console.warn('[global-setup] Firebase Admin not available — skipping email verification');
    return;
  }

  const emails = [
    process.env.E2E_EMAIL,
    process.env.E2E_OWNER_EMAIL,
    process.env.E2E_EDITOR_EMAIL,
    process.env.E2E_VIEWER_EMAIL,
    process.env.E2E_ADMIN_EMAIL,
    process.env.E2E_INSTITUTION_ADMIN_EMAIL,
    process.env.E2E_TEACHER_EMAIL,
    process.env.E2E_STUDENT_EMAIL,
    process.env.E2E_ONBOARDING_EMAIL,
  ];

  for (const email of emails) {
    await verifyEmail(email);
  }

  console.log('[global-setup] Email verification complete');
}
```

### Step 2: Update `playwright.config.js`

Add `globalSetup` reference:
```javascript
export default defineConfig({
  globalSetup: './tests/e2e/global-setup.ts',
  testDir: './tests/e2e',
  // ... rest unchanged
});
```

### Step 3: Validate

Run a single auth test to confirm the fix:
```
npx playwright test tests/e2e/auth.spec.js --reporter=list
```

Expected: All 3 auth.spec.js tests pass (including `user can login and reach home`).

## Validation Checklist

- [ ] `global-setup.ts` created and runs without errors
- [ ] `playwright.config.js` updated with `globalSetup`
- [ ] `auth.spec.js` — all 3 tests pass
- [ ] `auth-onboarding.spec.js` — both tests pass
- [ ] Email verification is set BEFORE test execution
- [ ] No modifications to application source code
