// scripts/lifecycle-dry-run-emulator-check.mjs
import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInWithCustomToken } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';

const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || 'dlp-academ';
const functionsRegion = 'europe-west1';
const institutionId = 'inst-lifecycle-dryrun';
const adminUid = 'admin-lifecycle-dryrun';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error('FIRESTORE_EMULATOR_HOST is required. Run this script via firebase emulators:exec.');
}

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('FIREBASE_AUTH_EMULATOR_HOST is required. Include auth emulator in emulators:exec.');
}

const functionsEmulatorHost = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
const [functionsHost, functionsPortRaw] = functionsEmulatorHost.split(':');
const functionsPort = Number(functionsPortRaw || '5001');

initializeAdminApp({ projectId });
const adminAuth = getAdminAuth();
const db = getFirestore();

const seedAdminProfile = async () => {
  await db.collection('users').doc(adminUid).set({
    email: 'admin-lifecycle-dryrun@example.com',
    role: 'admin',
    institutionId,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
};

const seedSubjects = async () => {
  const subjectsCollection = db.collection('subjects');
  await Promise.all([
    subjectsCollection.doc('dryrun-subject-update').set({
      ownerId: adminUid,
      institutionId,
      name: 'Asignatura DryRun Actualizable',
      periodEndAt: '2025-06-20',
      periodExtraordinaryEndAt: '2025-07-10',
      postCoursePolicy: 'delete',
      inviteCodeEnabled: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
    subjectsCollection.doc('dryrun-subject-aligned').set({
      ownerId: adminUid,
      institutionId,
      name: 'Asignatura DryRun Alineada',
      periodEndAt: '2025-06-20',
      periodExtraordinaryEndAt: '2025-07-10',
      postCoursePolicy: 'retain_all_no_join',
      lifecyclePhase: 'post_extraordinary',
      lifecyclePostCourseVisibility: 'all_no_join',
      lifecycleUnknownPassStatePolicy: 'treat_as_pending_until_extraordinary_end',
      lifecycleAutomationVersion: 1,
      inviteCodeEnabled: false,
      inviteCodeDisabledByLifecycle: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
  ]);
};

const runDryRunCallable = async () => {
  const clientApp = initializeClientApp({
    apiKey: 'demo-api-key',
    authDomain: `${projectId}.firebaseapp.com`,
    projectId,
  });

  const clientAuth = getAuth(clientApp);
  connectAuthEmulator(clientAuth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });

  const customToken = await adminAuth.createCustomToken(adminUid);
  await signInWithCustomToken(clientAuth, customToken);

  const clientFunctions = getFunctions(clientApp, functionsRegion);
  connectFunctionsEmulator(clientFunctions, functionsHost, functionsPort);

  const runLifecycleAutomation = httpsCallable(clientFunctions, 'runSubjectLifecycleAutomation');
  const response = await runLifecycleAutomation({
    institutionId,
    dryRun: true,
    maxPreviewSubjectIds: 5,
  });

  const payload = response.data || {};

  if (payload.success !== true) {
    throw new Error(`Dry-run callable returned non-success payload: ${JSON.stringify(payload)}`);
  }

  if (payload.dryRun !== true) {
    throw new Error(`Expected dryRun=true in response, received: ${JSON.stringify(payload)}`);
  }

  if (!Array.isArray(payload.previewSubjectIds)) {
    throw new Error(`Expected previewSubjectIds array in response, received: ${JSON.stringify(payload)}`);
  }

  if ((payload.updatedSubjects || 0) < 1) {
    throw new Error(`Expected at least one dry-run candidate subject, received: ${JSON.stringify(payload)}`);
  }

  return payload;
};

const main = async () => {
  await seedAdminProfile();
  await seedSubjects();

  const payload = await runDryRunCallable();
  console.log('[lifecycle-dry-run] Callable payload:');
  console.log(JSON.stringify(payload, null, 2));
};

main().catch((error) => {
  console.error('[lifecycle-dry-run] FAILED');
  console.error(error);
  process.exitCode = 1;
});
