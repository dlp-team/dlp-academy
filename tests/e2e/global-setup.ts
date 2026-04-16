// tests/e2e/global-setup.ts
import 'dotenv/config';
import admin from 'firebase-admin';
import { seedFirestoreEmulator } from './seed/firestore-seed';

const isEmulatorMode = (): boolean =>
  process.env.VITE_USE_EMULATORS === 'true' ||
  !!process.env.FIRESTORE_EMULATOR_HOST ||
  !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

const ensureAdmin = (): admin.app.App | null => {
  if (isEmulatorMode()) {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';

    if (!admin.apps.length) {
      admin.initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'demo-dlp-academy' });
    }
    return admin.app();
  }

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

/** Create or update a user in the Auth emulator with email+password. */
const ensureEmulatorUser = async (
  email: string | undefined,
  password: string | undefined,
  displayName?: string,
): Promise<string | null> => {
  if (!email || !password) return null;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    // Try to get existing user first
    const existing = await admin.auth().getUserByEmail(normalizedEmail);
    // Update password and mark verified
    await admin.auth().updateUser(existing.uid, {
      password,
      emailVerified: true,
      ...(displayName ? { displayName } : {}),
    });
    console.log(`  ✔ Updated emulator user: ${normalizedEmail} (uid: ${existing.uid})`);
    return existing.uid;
  } catch {
    // User doesn't exist — create it
    try {
      const newUser = await admin.auth().createUser({
        email: normalizedEmail,
        password,
        emailVerified: true,
        ...(displayName ? { displayName } : {}),
      });
      console.log(`  ✔ Created emulator user: ${normalizedEmail} (uid: ${newUser.uid})`);
      return newUser.uid;
    } catch (createErr) {
      console.warn(`  ⚠ Failed to create emulator user ${normalizedEmail}:`, createErr);
      return null;
    }
  }
};

/** E2E test personas with their env var mappings. */
const E2E_PERSONAS = [
  { emailVar: 'E2E_EMAIL', passVar: 'E2E_PASSWORD', name: 'Default User' },
  { emailVar: 'E2E_OWNER_EMAIL', passVar: 'E2E_OWNER_PASSWORD', name: 'Owner' },
  { emailVar: 'E2E_EDITOR_EMAIL', passVar: 'E2E_EDITOR_PASSWORD', name: 'Editor' },
  { emailVar: 'E2E_VIEWER_EMAIL', passVar: 'E2E_VIEWER_PASSWORD', name: 'Viewer' },
  { emailVar: 'E2E_ADMIN_EMAIL', passVar: 'E2E_ADMIN_PASSWORD', name: 'Admin' },
  { emailVar: 'E2E_INSTITUTION_ADMIN_EMAIL', passVar: 'E2E_INSTITUTION_ADMIN_PASSWORD', name: 'Institution Admin' },
  { emailVar: 'E2E_TEACHER_EMAIL', passVar: 'E2E_TEACHER_PASSWORD', name: 'Teacher' },
  { emailVar: 'E2E_STUDENT_EMAIL', passVar: 'E2E_STUDENT_PASSWORD', name: 'Student' },
  { emailVar: 'E2E_ONBOARDING_EMAIL', passVar: 'E2E_ONBOARDING_PASSWORD', name: 'Onboarding' },
];

export default async function globalSetup(): Promise<void> {
  const app = ensureAdmin();
  if (!app) {
    console.warn('[global-setup] Firebase Admin not available — skipping email verification');
    return;
  }

  if (isEmulatorMode()) {
    console.log('[global-setup] EMULATOR MODE — Creating/updating test users in Auth emulator...');
    const uidMap: Record<string, string> = {};

    for (const persona of E2E_PERSONAS) {
      const uid = await ensureEmulatorUser(
        process.env[persona.emailVar],
        process.env[persona.passVar],
        persona.name,
      );
      if (uid) {
        uidMap[persona.emailVar] = uid;
      }
    }

    // Store UID map in env for Firestore seeding scripts to reference
    process.env.__E2E_UID_MAP = JSON.stringify(uidMap);
    console.log(`[global-setup] Emulator user setup complete (${Object.keys(uidMap).length} users)`);

    // Seed Firestore emulator with user profiles, institution data, etc.
    await seedFirestoreEmulator(uidMap);

    return;
  }

  // Live mode: verify existing emails
  console.log('[global-setup] Verifying E2E test account emails...');

  const emails = E2E_PERSONAS.map((p) => process.env[p.emailVar]);

  for (const email of emails) {
    await verifyEmail(email);
  }

  console.log('[global-setup] Email verification complete');
}
