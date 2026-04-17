// tests/e2e/seed/firestore-seed.ts
import admin from 'firebase-admin';

/**
 * Seeds Firestore emulator with user profile documents, institution data,
 * courses, and classes required for E2E tests to work. Called from
 * global-setup after Auth users are created in the emulator.
 *
 * Rationale: When using emulators, Firestore starts empty. The app's
 * onAuthStateChanged bootstrap creates a basic student profile, but tests
 * that require teacher/admin/institution-admin roles and institution data
 * need pre-seeded documents with the correct shape before the first login.
 */

interface UidMap {
  [envVarName: string]: string;
}

/**
 * Role mapping for each E2E persona.
 * Owner/Editor/Default need 'teacher' so the Home page shows create buttons
 * and folder management (studentMode=false). Viewer stays 'student' for
 * read-only test scenarios.
 */
const PERSONA_ROLES: Record<string, { role: string; displayName: string }> = {
  E2E_EMAIL: { role: 'teacher', displayName: 'Default User' },
  E2E_OWNER_EMAIL: { role: 'teacher', displayName: 'Owner' },
  E2E_EDITOR_EMAIL: { role: 'teacher', displayName: 'Editor' },
  E2E_VIEWER_EMAIL: { role: 'student', displayName: 'Viewer' },
  E2E_ADMIN_EMAIL: { role: 'admin', displayName: 'Admin' },
  E2E_INSTITUTION_ADMIN_EMAIL: { role: 'institutionadmin', displayName: 'Institution Admin' },
  E2E_TEACHER_EMAIL: { role: 'teacher', displayName: 'Teacher' },
  E2E_STUDENT_EMAIL: { role: 'student', displayName: 'Student' },
  E2E_ONBOARDING_EMAIL: { role: 'student', displayName: 'Onboarding User' },
};

/** Deterministic IDs for seed data so tests can reference them. */
const SEED_COURSE_ID = 'e2e-course-001';
const SEED_CLASS_ID = 'e2e-class-001';

/**
 * Mirror the frontend's getDefaultAcademicYear() logic so seed data always
 * falls within the default UI filter range.
 * July-December → currentYear/currentYear+1; January-June → (currentYear-1)/currentYear.
 */
const getDefaultAcademicYear = (referenceDate = new Date()): string => {
  const currentYear = referenceDate.getFullYear();
  const monthIndex = referenceDate.getMonth();
  const startYear = monthIndex >= 6 ? currentYear : currentYear - 1;
  return `${startYear}-${startYear + 1}`;
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
 * Seed the E2E institution document with academic calendar and policies
 * so institution-scoped tests (dashboard, subject creation) work.
 */
const seedInstitution = async (db: FirebaseFirestore.Firestore): Promise<boolean> => {
  const institutionId = process.env.E2E_INSTITUTION_ID;
  if (!institutionId) {
    console.log('  ⚠ E2E_INSTITUTION_ID not set — skipping institution seed');
    return false;
  }

  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-15`;
  const yearOrdEnd = `${now.getFullYear()}-06-30`;
  const yearExtraEnd = `${now.getFullYear()}-07-31`;

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
    academicCalendar: {
      startDate: yearStart,
      ordinaryEndDate: yearOrdEnd,
      extraordinaryEndDate: yearExtraEnd,
      periodization: {
        mode: 'trimester',
        customLabel: '',
      },
    },
    courseLifecycle: {
      postCoursePolicy: 'archive',
    },
    accessPolicies: {
      teacherCanCreateSubjects: true,
      teacherCanShareSubjects: true,
      studentCanAccessShared: true,
    },
  }, { merge: true });

  console.log(`  ✔ Seeded institutions/${institutionId}`);
  return true;
};

/**
 * Seed one course and one class so institution-admin dashboard tests
 * (courses/classes tabs) find data to render.
 */
const seedCoursesAndClasses = async (
  db: FirebaseFirestore.Firestore,
  uidMap: UidMap,
): Promise<number> => {
  const institutionId = process.env.E2E_INSTITUTION_ID;
  if (!institutionId) return 0;

  const teacherUid = uidMap.E2E_TEACHER_EMAIL || uidMap.E2E_OWNER_EMAIL || '';
  const academicYear = getDefaultAcademicYear();

  // Seed course
  await db.collection('courses').doc(SEED_COURSE_ID).set({
    name: 'E2E Curso General',
    institutionId,
    academicYear,
    status: 'active',
    color: '#6366f1',
    level: 'Bachillerato',
    grade: '1',
    createdBy: teacherUid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`  ✔ Seeded courses/${SEED_COURSE_ID}`);

  // Seed class linked to course
  await db.collection('classes').doc(SEED_CLASS_ID).set({
    name: 'E2E Clase A',
    courseId: SEED_COURSE_ID,
    institutionId,
    academicYear,
    status: 'active',
    teacherId: teacherUid,
    studentIds: [],
    createdBy: teacherUid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`  ✔ Seeded classes/${SEED_CLASS_ID}`);
  return 2;
};

/**
 * Seed the E2E_SUBJECT_ID subject so tests that navigate to
 * /home/subject/{id} (study-flow, user-journey) find a real document.
 */
const seedE2ESubject = async (
  db: FirebaseFirestore.Firestore,
  uidMap: UidMap,
): Promise<boolean> => {
  const subjectId = process.env.E2E_SUBJECT_ID;
  if (!subjectId) {
    console.log('  ⚠ E2E_SUBJECT_ID not set — skipping subject seed');
    return false;
  }

  const institutionId = process.env.E2E_INSTITUTION_ID || null;
  const ownerUid = uidMap.E2E_EMAIL || uidMap.E2E_OWNER_EMAIL || '';

  await db.collection('subjects').doc(subjectId).set({
    name: 'E2E Asignatura General',
    color: 'from-blue-400 to-blue-600',
    ownerId: ownerUid,
    status: 'active',
    topicCount: 0,
    course: SEED_COURSE_ID,
    ...(institutionId ? { institutionId } : {}),
    e2eSeed: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`  ✔ Seeded subjects/${subjectId}`);
  return true;
};

/**
 * Seed the E2E_SHARED_FOLDER_ID folder so sharing/drag-drop tests that
 * reference a pre-existing shared folder find a document in the emulator.
 * Also creates a shared subject inside the folder for drag-drop tests.
 */
const seedSharedFolder = async (
  db: FirebaseFirestore.Firestore,
  uidMap: UidMap,
): Promise<boolean> => {
  const sharedFolderId = process.env.E2E_SHARED_FOLDER_ID;
  if (!sharedFolderId) {
    console.log('  ⚠ E2E_SHARED_FOLDER_ID not set — skipping shared folder seed');
    return false;
  }

  const institutionId = process.env.E2E_INSTITUTION_ID || null;
  const ownerUid = uidMap.E2E_OWNER_EMAIL || uidMap.E2E_EMAIL || '';
  const editorUid = uidMap.E2E_EDITOR_EMAIL || '';
  const viewerUid = uidMap.E2E_VIEWER_EMAIL || '';

  const editorEmail = (process.env.E2E_EDITOR_EMAIL || '').toLowerCase().trim();
  const viewerEmail = (process.env.E2E_VIEWER_EMAIL || '').toLowerCase().trim();

  const sharedWith: Array<Record<string, unknown>> = [];
  const sharedWithUids: string[] = [];
  const editorUids: string[] = [];
  const viewerUids: string[] = [];

  if (editorUid) {
    sharedWith.push({ uid: editorUid, email: editorEmail, role: 'editor', canEdit: true });
    sharedWithUids.push(editorUid);
    editorUids.push(editorUid);
  }
  if (viewerUid) {
    sharedWith.push({ uid: viewerUid, email: viewerEmail, role: 'viewer', canEdit: false });
    sharedWithUids.push(viewerUid);
    viewerUids.push(viewerUid);
  }

  await db.collection('folders').doc(sharedFolderId).set({
    name: 'E2E Shared Folder',
    ownerId: ownerUid,
    parentId: null,
    status: 'active',
    isShared: true,
    sharedWith,
    sharedWithUids,
    editorUids,
    viewerUids,
    ...(institutionId ? { institutionId } : {}),
    e2eSeed: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`  ✔ Seeded folders/${sharedFolderId} (shared folder)`);
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
  const courseClassCount = await seedCoursesAndClasses(db, uidMap);
  const subjectSeeded = await seedE2ESubject(db, uidMap);
  const sharedFolderSeeded = await seedSharedFolder(db, uidMap);

  console.log(
    `[firestore-seed] Complete: ${userCount} user profiles` +
    (institutionSeeded ? ', 1 institution' : '') +
    (courseClassCount > 0 ? `, ${courseClassCount} course/class docs` : '') +
    (subjectSeeded ? ', 1 subject' : '') +
    (sharedFolderSeeded ? ', 1 shared folder' : ''),
  );
};
