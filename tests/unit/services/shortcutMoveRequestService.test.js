// tests/unit/services/shortcutMoveRequestService.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createShortcutMoveRequest,
  resolveShortcutMoveRequest,
} from '../../../src/services/shortcutMoveRequestService';

const serviceMocks = vi.hoisted(() => ({
  httpsCallable: vi.fn(),
  functionsRef: { __type: 'functions' },
  callableFn: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  functions: serviceMocks.functionsRef,
}));

vi.mock('firebase/functions', async () => {
  const actual = await vi.importActual('firebase/functions');
  return {
    ...actual,
    httpsCallable: serviceMocks.httpsCallable,
  };
});

describe('shortcutMoveRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMocks.httpsCallable.mockReturnValue(serviceMocks.callableFn);
    serviceMocks.callableFn.mockResolvedValue({ data: {} });
  });

  it('calls createShortcutMoveRequest callable with normalized payload', async () => {
    serviceMocks.callableFn.mockResolvedValue({
      data: {
        success: true,
        requestId: 'shortcut_move_request_teacher-1_shortcut-1_folder-1',
        status: 'pending',
      },
    });

    const result = await createShortcutMoveRequest({
      shortcutId: 'shortcut-1',
      targetFolderId: 'folder-1',
      targetId: 'subject-1',
      shortcutType: 'SUBJECT',
    });

    expect(serviceMocks.httpsCallable).toHaveBeenCalledWith(serviceMocks.functionsRef, 'createShortcutMoveRequest');
    expect(serviceMocks.callableFn).toHaveBeenCalledWith({
      shortcutId: 'shortcut-1',
      targetFolderId: 'folder-1',
      targetId: 'subject-1',
      shortcutType: 'subject',
    });
    expect(result).toEqual({
      success: true,
      requestId: 'shortcut_move_request_teacher-1_shortcut-1_folder-1',
      status: 'pending',
    });
  });

  it('calls resolveShortcutMoveRequest callable with expected payload', async () => {
    serviceMocks.callableFn.mockResolvedValue({
      data: {
        success: true,
        requestId: 'shortcut_move_request_teacher-1_shortcut-1_folder-1',
        status: 'approved',
      },
    });

    const result = await resolveShortcutMoveRequest({
      requestId: 'shortcut_move_request_teacher-1_shortcut-1_folder-1',
      resolution: 'APPROVED',
    });

    expect(serviceMocks.httpsCallable).toHaveBeenCalledWith(serviceMocks.functionsRef, 'resolveShortcutMoveRequest');
    expect(serviceMocks.callableFn).toHaveBeenCalledWith({
      requestId: 'shortcut_move_request_teacher-1_shortcut-1_folder-1',
      resolution: 'approved',
    });
    expect(result).toEqual({
      success: true,
      requestId: 'shortcut_move_request_teacher-1_shortcut-1_folder-1',
      status: 'approved',
    });
  });

  it('throws when shortcut type is invalid', async () => {
    await expect(createShortcutMoveRequest({
      shortcutId: 'shortcut-1',
      targetFolderId: 'folder-1',
      targetId: 'subject-1',
      shortcutType: 'topic',
    })).rejects.toThrow('shortcutType must be subject or folder.');
  });

  it('throws when resolution is invalid', async () => {
    await expect(resolveShortcutMoveRequest({
      requestId: 'shortcut_move_request_teacher-1_shortcut-1_folder-1',
      resolution: 'pending',
    })).rejects.toThrow('resolution must be approved or rejected.');
  });
});
