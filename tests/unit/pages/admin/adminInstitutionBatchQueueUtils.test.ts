// tests/unit/pages/admin/adminInstitutionBatchQueueUtils.test.js
import { describe, expect, it, vi } from 'vitest';
import {
  queueInstitutionCreateBatchOps,
  queueInstitutionEditBatchOps,
} from '../../../../src/pages/AdminDashboard/utils/adminInstitutionBatchQueueUtils';

describe('adminInstitutionBatchQueueUtils', () => {
  it('queues edit operations for update, invite sync and institutional code', () => {
    const batch = {
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const createAutoInviteRef = vi.fn(() => ({ kind: 'auto-invite-ref' }));
    const createInviteRefById = vi.fn((id) => ({ kind: 'invite-ref', id }));
    const createTimestamp = vi.fn(() => 'ts');

    queueInstitutionEditBatchOps({
      batch,
      institutionRef: { kind: 'institution-ref' },
      institutionPayload: { name: 'Institucion Demo' },
      existingInvites: [
        { id: 'inv-remove', email: 'old@demo.edu' },
        { id: 'inv-keep', email: 'keep@demo.edu' },
      ],
      admins: ['keep@demo.edu', 'new@demo.edu'],
      institutionalCode: 'CODE-123',
      institutionId: 'inst-1',
      createAutoInviteRef,
      createInviteRefById,
      createTimestamp,
    });

    expect(batch.update).toHaveBeenCalledWith({ kind: 'institution-ref' }, { name: 'Institucion Demo' });
    expect(batch.delete).toHaveBeenCalledWith({ kind: 'invite-ref', id: 'inv-remove' });
    expect(batch.set).toHaveBeenCalledWith(
      { kind: 'auto-invite-ref' },
      {
        email: 'new@demo.edu',
        role: 'institutionadmin',
        institutionId: 'inst-1',
        invitedAt: 'ts',
      }
    );
    expect(batch.set).toHaveBeenCalledWith(
      { kind: 'invite-ref', id: 'CODE-123' },
      {
        type: 'institutional',
        institutionId: 'inst-1',
        createdAt: 'ts',
      }
    );
  });

  it('queues create operations for institution and admin invites', () => {
    const batch = {
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const createAutoInviteRef = vi.fn(() => ({ kind: 'auto-invite-ref' }));
    const createInviteRefById = vi.fn((id) => ({ kind: 'invite-ref', id }));
    const createTimestamp = vi.fn(() => 'ts');

    queueInstitutionCreateBatchOps({
      batch,
      institutionRef: { kind: 'institution-ref' },
      institutionPayload: { name: 'Institucion Demo' },
      admins: ['one@demo.edu', 'two@demo.edu'],
      institutionalCode: '',
      institutionId: 'inst-2',
      createAutoInviteRef,
      createInviteRefById,
      createTimestamp,
    });

    expect(batch.set).toHaveBeenCalledWith(
      { kind: 'institution-ref' },
      { name: 'Institucion Demo', enabled: true, createdAt: 'ts' }
    );

    expect(batch.set).toHaveBeenCalledWith(
      { kind: 'auto-invite-ref' },
      {
        email: 'one@demo.edu',
        role: 'institutionadmin',
        institutionId: 'inst-2',
        invitedAt: 'ts',
      }
    );

    expect(batch.set).toHaveBeenCalledWith(
      { kind: 'auto-invite-ref' },
      {
        email: 'two@demo.edu',
        role: 'institutionadmin',
        institutionId: 'inst-2',
        invitedAt: 'ts',
      }
    );

    expect(createInviteRefById).not.toHaveBeenCalled();
    expect(batch.update).not.toHaveBeenCalled();
    expect(batch.delete).not.toHaveBeenCalled();
  });
});
