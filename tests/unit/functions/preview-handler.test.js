// tests/unit/functions/preview-handler.test.js
import { describe, expect, it } from 'vitest';
import { HttpsError } from 'firebase-functions/v2/https';
import { createGetInstitutionalAccessCodePreviewHandler } from '../../../functions/security/previewHandler.js';

const FIXED_NOW = 1710000000000;

const createDbMock = (userData) => ({
  collection: (collectionName) => ({
    doc: (uid) => ({
      get: async () => {
        if (collectionName !== 'users') {
          return { exists: false, data: () => null };
        }

        if (!userData) {
          return { exists: false, data: () => null };
        }

        return {
          exists: true,
          data: () => ({ ...userData, uid }),
        };
      },
    }),
  }),
});

const createHandler = (userData) => createGetInstitutionalAccessCodePreviewHandler({
  dbInstance: createDbMock(userData),
  secretProvider: () => 'TEST_SERVER_SALT',
  codeGenerator: ({ institutionId, role, intervalHours }) => {
    const seed = `${institutionId}-${role}-${intervalHours}`;
    return seed.toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(6, 'X').slice(0, 6);
  },
  nowProvider: () => FIXED_NOW,
});

describe('getInstitutionalAccessCodePreview privilege boundaries', () => {
  it('denies unauthenticated requests', async () => {
    const handler = createHandler({ role: 'admin', institutionId: 'inst-1' });

    await expect(handler({ auth: null, data: { institutionId: 'inst-1' } })).rejects.toThrow(HttpsError);
    await expect(handler({ auth: null, data: { institutionId: 'inst-1' } })).rejects.toThrow('Authentication is required.');
  });

  it('denies when user profile is missing', async () => {
    const handler = createHandler(null);

    await expect(handler({ auth: { uid: 'user-1' }, data: { institutionId: 'inst-1' } })).rejects.toThrow(HttpsError);
    await expect(handler({ auth: { uid: 'user-1' }, data: { institutionId: 'inst-1' } })).rejects.toThrow('No user profile found.');
  });

  it('denies institution admin from different institution', async () => {
    const handler = createHandler({ role: 'institutionadmin', institutionId: 'inst-2' });

    await expect(handler({
      auth: { uid: 'institution-admin-2' },
      data: { institutionId: 'inst-1', userType: 'teacher', intervalHours: 24 },
    })).rejects.toThrow('Not allowed to preview this code.');
  });

  it('denies teacher even in same institution', async () => {
    const handler = createHandler({ role: 'teacher', institutionId: 'inst-1' });

    await expect(handler({
      auth: { uid: 'teacher-1' },
      data: { institutionId: 'inst-1', userType: 'teacher', intervalHours: 24 },
    })).rejects.toThrow('Not allowed to preview this code.');
  });

  it('allows global admin and returns deterministic preview payload', async () => {
    const handler = createHandler({ role: 'admin', institutionId: 'inst-2' });

    const response = await handler({
      auth: { uid: 'admin-1' },
      data: { institutionId: 'inst-1', userType: 'teacher', intervalHours: 24 },
    });

    expect(response.code).toHaveLength(6);
    expect(response.validUntilMs).toBeGreaterThan(FIXED_NOW);
  });

  it('allows same-tenant institution admin', async () => {
    const handler = createHandler({ role: 'institutionadmin', institutionId: 'inst-1' });

    const response = await handler({
      auth: { uid: 'institution-admin-1' },
      data: { institutionId: 'inst-1', userType: 'student', intervalHours: 12 },
    });

    expect(response.code).toHaveLength(6);
    expect(response.validUntilMs).toBeGreaterThan(FIXED_NOW);
  });
});
