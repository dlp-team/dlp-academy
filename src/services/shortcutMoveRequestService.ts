// src/services/shortcutMoveRequestService.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const CREATE_SHORTCUT_MOVE_REQUEST_CALLABLE = 'createShortcutMoveRequest';
const RESOLVE_SHORTCUT_MOVE_REQUEST_CALLABLE = 'resolveShortcutMoveRequest';
const ALLOWED_SHORTCUT_TYPES = new Set(['subject', 'folder']);
const ALLOWED_RESOLUTIONS = new Set(['approved', 'rejected']);

export const createShortcutMoveRequest = async ({ shortcutId, targetFolderId, targetId, shortcutType }: any) => {
  const normalizedShortcutType = String(shortcutType || '').trim().toLowerCase();
  if (!ALLOWED_SHORTCUT_TYPES.has(normalizedShortcutType)) {
    throw new Error('shortcutType must be subject or folder.');
  }

  const callable = httpsCallable(functions, CREATE_SHORTCUT_MOVE_REQUEST_CALLABLE);
  const response: any = await callable({
    shortcutId,
    targetFolderId,
    targetId,
    shortcutType: normalizedShortcutType,
  });

  return response?.data || {
    success: false,
    requestId: null,
    status: null,
    targetFolderOwnerUid: null,
  };
};

export const resolveShortcutMoveRequest = async ({ requestId, resolution }: any) => {
  const normalizedResolution = String(resolution || '').trim().toLowerCase();
  if (!ALLOWED_RESOLUTIONS.has(normalizedResolution)) {
    throw new Error('resolution must be approved or rejected.');
  }

  const callable = httpsCallable(functions, RESOLVE_SHORTCUT_MOVE_REQUEST_CALLABLE);
  const response: any = await callable({
    requestId,
    resolution: normalizedResolution,
  });

  return response?.data || {
    success: false,
    requestId,
    status: normalizedResolution,
  };
};
