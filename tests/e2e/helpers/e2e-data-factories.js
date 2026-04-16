// tests/e2e/helpers/e2e-data-factories.js
import { serverTimestamp } from './e2e-firebase-admin.js';

const E2E_INSTITUTION_ID = process.env.E2E_INSTITUTION_ID;

const uniqueSuffix = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const buildSubjectId = (prefix) => `e2e-subj-${prefix}-${uniqueSuffix()}`;
export const buildFolderId = (prefix) => `e2e-fold-${prefix}-${uniqueSuffix()}`;
export const buildTopicId = (prefix) => `e2e-topic-${prefix}-${uniqueSuffix()}`;
export const buildNotificationId = (prefix) => `e2e-notif-${prefix}-${uniqueSuffix()}`;
export const buildShortcutId = (prefix) => `e2e-short-${prefix}-${uniqueSuffix()}`;

export const buildSubjectData = (ownerId, overrides = {}) => ({
  name: `[E2E] Materia ${uniqueSuffix()}`,
  color: 'from-blue-400 to-blue-600',
  ownerId,
  status: 'active',
  topicCount: 0,
  ...(E2E_INSTITUTION_ID ? { institutionId: E2E_INSTITUTION_ID } : {}),
  e2eSeed: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

export const buildFolderData = (ownerId, overrides = {}) => ({
  name: `[E2E] Carpeta ${uniqueSuffix()}`,
  ownerId,
  parentId: null,
  status: 'active',
  ...(E2E_INSTITUTION_ID ? { institutionId: E2E_INSTITUTION_ID } : {}),
  e2eSeed: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

export const buildTopicData = (ownerId, subjectId, overrides = {}) => ({
  name: `[E2E] Tema ${uniqueSuffix()}`,
  ownerId,
  subjectId,
  status: 'active',
  order: 0,
  e2eSeed: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

export const buildNotificationData = (recipientId, overrides = {}) => ({
  recipientId,
  type: 'share',
  read: false,
  e2eSeed: true,
  createdAt: serverTimestamp(),
  ...overrides,
});

export const buildShortcutData = (userId, targetId, targetType, overrides = {}) => ({
  userId,
  targetId,
  targetType,
  e2eSeed: true,
  createdAt: serverTimestamp(),
  ...overrides,
});

export const buildTrashedSubjectData = (ownerId, overrides = {}) =>
  buildSubjectData(ownerId, {
    status: 'trashed',
    trashedAt: serverTimestamp(),
    ...overrides,
  });

export const buildTrashedFolderData = (ownerId, overrides = {}) =>
  buildFolderData(ownerId, {
    status: 'trashed',
    trashedAt: serverTimestamp(),
    ...overrides,
  });
