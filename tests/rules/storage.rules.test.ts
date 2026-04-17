// tests/rules/storage.rules.test.ts
import { describe, it, beforeAll, afterAll, afterEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ID = 'dlp-academy-storage-rules-tests';
const FIRESTORE_RULES_PATH = path.resolve(process.cwd(), 'firestore.rules');
const STORAGE_RULES_PATH = path.resolve(process.cwd(), 'storage.rules');
const BUCKET_URL = `gs://${PROJECT_ID}.firebasestorage.app`;

let testEnv;

const storageRef = (context, objectPath) => {
  return context.storage(BUCKET_URL).ref(objectPath);
};

const uploadString = (fileRef, value) => fileRef.putString(value);
const getDownloadURL = (fileRef) => fileRef.getDownloadURL();

const authContext = (uid, { role, institutionId }: { role?: string; institutionId?: string } = {}) => testEnv.authenticatedContext(uid, {
  sub: uid,
  role,
  institutionId,
});
const seedUser = async ({ uid, role, institutionId }) => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users', uid), {
      uid,
      role,
      institutionId,
      email: `${uid}@test.com`,
      displayName: uid,
      country: 'ES',
    });
  });
};

const seedBaseUsers = async () => {
  await seedUser({ uid: 'admin-1', role: 'admin', institutionId: 'inst-1' });
  await seedUser({ uid: 'institution-admin-1', role: 'institutionadmin', institutionId: 'inst-1' });
  await seedUser({ uid: 'institution-admin-2', role: 'institutionadmin', institutionId: 'inst-2' });
  await seedUser({ uid: 'teacher-1', role: 'teacher', institutionId: 'inst-1' });
  await seedUser({ uid: 'student-1', role: 'student', institutionId: 'inst-1' });
};

describe('Storage rules integration', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: fs.readFileSync(FIRESTORE_RULES_PATH, 'utf8'),
      },
      storage: {
        rules: fs.readFileSync(STORAGE_RULES_PATH, 'utf8'),
      },
    });

    await seedBaseUsers();
  });

  afterEach(async () => {
    await testEnv.clearStorage();
    await testEnv.clearFirestore();
    await seedBaseUsers();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('allows profile picture write/read for owner and global admin', async () => {
    const ownerCtx = authContext('teacher-1', { role: 'teacher', institutionId: 'inst-1' });
    const ownerRef = storageRef(ownerCtx, 'profile-pictures/teacher-1');

    await assertSucceeds(uploadString(ownerRef, 'owner-avatar'));
    await assertSucceeds(getDownloadURL(ownerRef));

    const adminCtx = authContext('admin-1', { role: 'admin', institutionId: 'inst-1' });
    const adminRef = storageRef(adminCtx, 'profile-pictures/teacher-1');
    await assertSucceeds(getDownloadURL(adminRef));
  });

  it('denies profile picture write/read for non-owner non-admin', async () => {
    const ownerCtx = authContext('teacher-1', { role: 'teacher', institutionId: 'inst-1' });
    const ownerRef = storageRef(ownerCtx, 'profile-pictures/teacher-1');
    await assertSucceeds(uploadString(ownerRef, 'owner-avatar'));

    const studentCtx = authContext('student-1', { role: 'student', institutionId: 'inst-1' });
    const studentRef = storageRef(studentCtx, 'profile-pictures/teacher-1');

    await assertFails(uploadString(studentRef, 'hijack'));
    await assertFails(getDownloadURL(studentRef));
  });

  it('allows branding write/read for same-tenant institution admin and global admin', async () => {
    const institutionAdminCtx = authContext('institution-admin-1', { role: 'institutionadmin', institutionId: 'inst-1' });
    const brandingRef = storageRef(institutionAdminCtx, 'institutions/inst-1/branding/logo.png');

    await assertSucceeds(uploadString(brandingRef, 'branding-logo'));
    await assertSucceeds(getDownloadURL(brandingRef));

    const adminCtx = authContext('admin-1', { role: 'admin', institutionId: 'inst-1' });
    const adminRef = storageRef(adminCtx, 'institutions/inst-1/branding/logo.png');
    await assertSucceeds(getDownloadURL(adminRef));
    await assertSucceeds(uploadString(adminRef, 'branding-logo-admin'));
  });

  it('denies cross-tenant branding writes and non-admin/non-institutionadmin writes', async () => {
    const wrongInstitutionAdminCtx = authContext('institution-admin-2', { role: 'institutionadmin', institutionId: 'inst-2' });
    const crossTenantBrandingRef = storageRef(wrongInstitutionAdminCtx, 'institutions/inst-1/branding/logo.png');

    await assertFails(uploadString(crossTenantBrandingRef, 'cross-tenant-write'));

    const teacherCtx = authContext('teacher-1', { role: 'teacher', institutionId: 'inst-1' });
    const teacherBrandingRef = storageRef(teacherCtx, 'institutions/inst-1/branding/logo.png');
    await assertFails(uploadString(teacherBrandingRef, 'teacher-write'));

    const studentCtx = authContext('student-1', { role: 'student', institutionId: 'inst-1' });
    const studentBrandingRef = storageRef(studentCtx, 'institutions/inst-1/branding/logo.png');
    await assertFails(uploadString(studentBrandingRef, 'student-write'));
  });

  it('denies writes to unspecified paths (global deny fallback)', async () => {
    const adminCtx = authContext('admin-1', { role: 'admin', institutionId: 'inst-1' });
    const unknownPathRef = storageRef(adminCtx, 'misc/unsafe/path/file.txt');

    await assertFails(uploadString(unknownPathRef, 'blocked-path'));
  });

  it('denies unauthenticated access to protected storage paths', async () => {
    const adminCtx = authContext('admin-1', { role: 'admin', institutionId: 'inst-1' });
    const adminRef = storageRef(adminCtx, 'institutions/inst-1/branding/logo.png');
    await assertSucceeds(uploadString(adminRef, 'seeded-logo'));

    const anonymousCtx = testEnv.unauthenticatedContext();
    const anonymousBrandingRef = storageRef(anonymousCtx, 'institutions/inst-1/branding/logo.png');

    await assertFails(getDownloadURL(anonymousBrandingRef));
    await assertFails(uploadString(anonymousBrandingRef, 'anonymous-write'));
  });

  it('blocks former owner profile access after auth switch (impersonation guard)', async () => {
    const ownerCtx = authContext('teacher-1', { role: 'teacher', institutionId: 'inst-1' });
    const ownerRef = storageRef(ownerCtx, 'profile-pictures/teacher-1');
    await assertSucceeds(uploadString(ownerRef, 'owner-avatar'));

    const impersonatorCtx = authContext('institution-admin-1', { role: 'institutionadmin', institutionId: 'inst-1' });
    const impersonatorRef = storageRef(impersonatorCtx, 'profile-pictures/teacher-1');

    await assertFails(uploadString(impersonatorRef, 'impersonation-attempt'));
    await assertFails(getDownloadURL(impersonatorRef));
  });

  it('keeps profile access owner-bound even when users doc is removed', async () => {
    const ownerCtx = authContext('teacher-1', { role: 'teacher', institutionId: 'inst-1' });
    const ownerRef = storageRef(ownerCtx, 'profile-pictures/teacher-1');
    await assertSucceeds(uploadString(ownerRef, 'owner-avatar'));

    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(doc(ctx.firestore(), 'users', 'teacher-1'));
    });

    const staleOwnerCtx = authContext('teacher-1', { role: 'teacher', institutionId: 'inst-1' });
    const staleOwnerRef = storageRef(staleOwnerCtx, 'profile-pictures/teacher-1');

    await assertSucceeds(getDownloadURL(staleOwnerRef));
  });
});
