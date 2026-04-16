// tests/e2e/seed/firestore-seed.ts
import admin from 'firebase-admin';

/**
 * Seeds Firestore emulator with user profile documents and institution data
 * required for E2E tests to work. Called from global-setup after Auth users
 * are created in the emulator.
 *
 * Rationale: When using emulators, Firestore starts empty. The app's
 * onAuthStateChanged bootstrap creates a basic student profile, but tests
 * that require admin/teacher/institution-admin roles need pre-seeded
 * profiles with the correct role before the first login.
 */

interface UidMap {
  [envVarName: string]: string;
}

/** Role mapping for each E2E persona. */
const PERSONA_ROLES: Record<string, { role: string; displayName: string }> = {
  E2E_EMAIL: { role: 'student', displayName: 'Default User' },
  E2E_OWNER_EMAIL: { role: 'student', displayName: 'Owner' },
  E2E_EDITOR_EMAIL: { role: 'student', displayName: 'Editor' },
  E2E_VIEWER_EMAIL: { role: 'student', displayName: 'Viewer' },
  E2E_ADMIN_EMAIL: { role: 'admin', displayName: 'Admin' },
  E2E_INSTITUTION_ADMIN_EMAIL: { role: 'institutionadmin', displayName: 'Institution Admin' },
  E2E_TEACHER_EMAIL: { role: 'teacher', displayName: 'Teacher' },
  E2E_STUDENT_EMAIL: { role: 'student', displayName: 'Student' },
  E2E_ONBOARDING_EMAIL: { role: 'student', displayName: 'Onboarding User' },
};

/**
 * Seed `users/{uid}` documents for every E2E persona.
 * Uses merge semantics so re-running is idempotent.
 */
const seedUserProfiles = async (
  db: FirebaseFirestore.Firestore,
  uidMap: UidMap,
): Promise<number> => {
  const institutionId = process.env.E2E_INSTITUTION_ID || null;
  let count = 0;

  for (const [envVar, uid] of Object.entries(uidMap)) {
    const persona = PERSONA_ROLES[envVar];
    if (!persona) continue;

    const email = (process.env[envVar] || '').toLowerCase().trim();
    if (!email) continue;

    // All test personas get the institution ID so the app doesn't show the
    // onboarding/access-code modal that blocks E2E interactions.
    // Exception: onboarding user may need null to test the onboarding flow.
    const userInstitutionId = envVar === 'E2E_ONBOARDING_EMAIL' ? null : institutionId;

    await db.collection('users').doc(uid).set({
      uid,
      email,
      displayName: persona.displayName,
      role: persona.role,
      institutionId: userInstitutionId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        theme: 'system',
        language: 'es',
        viewMode: 'grid',
      },
    }, { merge: true });

    console.log(`  ✔ Seeded users/${uid} (${persona.displayName}, role: ${persona.role})`);
    count++;
  }

  return count;
};

/**
 * Seed the E2E institution document so institution-scoped tests work.
 */
const seedInstitution = async (db: FirebaseFirestore.Firestore): Promise<boolean> => {
  const institutionId = process.env.E2E_INSTITUTION_ID;
  if (!institutionId) {
    console.log('  ⚠ E2E_INSTITUTION_ID not set — skipping institution seed');
    return false;
  }

  await db.collection('institutions').doc(institutionId).set({
    name: 'E2E Test Institution',
    domain: 'e2etesting.test',
    domains: ['e2etesting.test'],
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: {
      brandName: 'E2E Academy',
      primaryColor: '#3b82f6',
    },
  }, { merge: true });

  console.log(`  ✔ Seeded institutions/${institutionId}`);
  return true;
};

/**
 * Main entry point: seeds all Firestore documents needed for E2E tests.
 * Must be called after Auth emulator users are created (needs UID map).
 */
export const seedFirestoreEmulator = async (uidMap: UidMap): Promise<void> => {
  const db = admin.firestore();

  console.log('[firestore-seed] Seeding Firestore emulator...');

  const userCount = await seedUserProfiles(db, uidMap);
  const institutionSeeded = await seedInstitution(db);

  console.log(
    `[firestore-seed] Complete: ${userCount} user profiles` +
    (institutionSeeded ? ', 1 institution' : ''),
  );
};
