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

const verifyEmail = async (email: string | undefined): Promise<void> => {
  if (!email) return;
  try {
    const user = await admin.auth().getUserByEmail(email.trim().toLowerCase());
    if (!user.emailVerified) {
      await admin.auth().updateUser(user.uid, { emailVerified: true });
      console.log(`  ✔ Verified email for ${email}`);
    }
  } catch {
    // Best-effort: skip if user doesn't exist or API fails
  }
};

export default async function globalSetup(): Promise<void> {
  const app = ensureAdmin();
  if (!app) {
    console.warn('[global-setup] Firebase Admin not available — skipping email verification');
    return;
  }

  console.log('[global-setup] Verifying E2E test account emails...');

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
