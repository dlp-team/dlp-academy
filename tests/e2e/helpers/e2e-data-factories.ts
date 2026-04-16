// tests/e2e/helpers/e2e-data-factories.ts
import { serverTimestamp } from './e2e-firebase-admin.js';

const E2E_INSTITUTION_ID = process.env.E2E_INSTITUTION_ID;

const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const buildSubjectId = (prefix: string): string => `e2e-subj-${prefix}-${uniqueSuffix()}`;
export const buildFolderId = (prefix: string): string => `e2e-fold-${prefix}-${uniqueSuffix()}`;
export const buildTopicId = (prefix: string): string => `e2e-topic-${prefix}-${uniqueSuffix()}`;
export const buildNotificationId = (prefix: string): string => `e2e-notif-${prefix}-${uniqueSuffix()}`;
export const buildShortcutId = (prefix: string): string => `e2e-short-${prefix}-${uniqueSuffix()}`;

export const buildSubjectData = (ownerId: string, overrides: Record<string, any> = {}): Record<string, any> => ({
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

export const buildFolderData = (ownerId: string, overrides: Record<string, any> = {}): Record<string, any> => ({
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

export const buildTopicData = (ownerId: string, subjectId: string, overrides: Record<string, any> = {}): Record<string, any> => ({
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

export const buildNotificationData = (recipientId: string, overrides: Record<string, any> = {}): Record<string, any> => ({
  recipientId,
  type: 'share',
  read: false,
  e2eSeed: true,
  createdAt: serverTimestamp(),
  ...overrides,
});

export const buildShortcutData = (userId: string, targetId: string, targetType: string, overrides: Record<string, any> = {}): Record<string, any> => ({
  userId,
  targetId,
  targetType,
  e2eSeed: true,
  createdAt: serverTimestamp(),
  ...overrides,
});

export const buildTrashedSubjectData = (ownerId: string, overrides: Record<string, any> = {}): Record<string, any> =>
  buildSubjectData(ownerId, {
    status: 'trashed',
    trashedAt: serverTimestamp(),
    ...overrides,
  });

export const buildTrashedFolderData = (ownerId: string, overrides: Record<string, any> = {}): Record<string, any> =>
  buildFolderData(ownerId, {
    status: 'trashed',
    trashedAt: serverTimestamp(),
    ...overrides,
  });
