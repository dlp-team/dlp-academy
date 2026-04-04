// tests/unit/functions/rotate-code-handler.test.js
import { describe, expect, it, vi } from 'vitest';
import { HttpsError } from 'firebase-functions/v2/https';
import { createRotateInstitutionalAccessCodeNowHandler } from '../../../functions/security/rotateCodeHandler.js';

const FIXED_NOW = 1710000000000;

const createDbMock = ({ actorData, institutionData }) => {
  const institutionUpdate = vi.fn(async () => {});

  return {
    collection: (collectionName) => ({
      doc: () => ({
        get: async () => {
          if (collectionName === 'users') {
            if (!actorData) {
              return { exists: false, data: () => null };
            }
            return { exists: true, data: () => ({ ...actorData }) };
          }

          if (collectionName === 'institutions') {
            if (!institutionData) {
              return { exists: false, data: () => null };
            }
            return { exists: true, data: () => ({ ...institutionData }) };
          }

          return { exists: false, data: () => null };
        },
        update: institutionUpdate,
      }),
    }),
    __institutionUpdate: institutionUpdate,
  };
};

describe('rotateInstitutionalAccessCodeNow handler', () => {
  it('denies unauthenticated requests', async () => {
    const dbMock = createDbMock({
      actorData: { role: 'admin', institutionId: 'inst-1' },
      institutionData: { accessPolicies: { teachers: { requireCode: true, rotationIntervalHours: 24, codeVersion: 2 } } },
    });

    const handler = createRotateInstitutionalAccessCodeNowHandler({
      dbInstance: dbMock,
      secretProvider: () => 'TEST_SALT',
      codeGenerator: () => 'ABC123',
      nowProvider: () => FIXED_NOW,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    await expect(handler({ auth: null, data: { institutionId: 'inst-1', userType: 'teacher' } })).rejects.toThrow(HttpsError);
    await expect(handler({ auth: null, data: { institutionId: 'inst-1', userType: 'teacher' } })).rejects.toThrow('Authentication is required.');
  });

  it('denies rotation when code policy is disabled for role', async () => {
    const dbMock = createDbMock({
      actorData: { role: 'institutionadmin', institutionId: 'inst-1' },
      institutionData: { accessPolicies: { students: { requireCode: false, rotationIntervalHours: 24, codeVersion: 1 } } },
    });

    const handler = createRotateInstitutionalAccessCodeNowHandler({
      dbInstance: dbMock,
      secretProvider: () => 'TEST_SALT',
      codeGenerator: () => 'ABC123',
      nowProvider: () => FIXED_NOW,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    await expect(handler({
      auth: { uid: 'institution-admin-1' },
      data: { institutionId: 'inst-1', userType: 'student' },
    })).rejects.toThrow('Access code is disabled for this role.');

    expect(dbMock.__institutionUpdate).not.toHaveBeenCalled();
  });

  it('increments codeVersion and returns preview payload for allowed caller', async () => {
    const dbMock = createDbMock({
      actorData: { role: 'institutionadmin', institutionId: 'inst-1' },
      institutionData: { accessPolicies: { teachers: { requireCode: true, rotationIntervalHours: 24, codeVersion: 2 } } },
    });

    const codeGenerator = vi.fn(() => 'NEW123');

    const handler = createRotateInstitutionalAccessCodeNowHandler({
      dbInstance: dbMock,
      secretProvider: () => 'TEST_SALT',
      codeGenerator,
      nowProvider: () => FIXED_NOW,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    const response = await handler({
      auth: { uid: 'institution-admin-1' },
      data: { institutionId: 'inst-1', userType: 'teacher' },
    });

    expect(dbMock.__institutionUpdate).toHaveBeenCalledWith({
      'accessPolicies.teachers.codeVersion': 3,
      'accessPolicies.teachers.codeVersionUpdatedAt': 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    });

    expect(codeGenerator).toHaveBeenCalledWith(expect.objectContaining({
      institutionId: 'inst-1',
      role: 'teacher',
      intervalHours: 24,
      codeVersion: 3,
      currentTimeMs: FIXED_NOW,
      salt: 'TEST_SALT',
    }));

    expect(response).toEqual({
      code: 'NEW123',
      validUntilMs: 1710028800000,
      codeVersion: 3,
    });
  });
});
