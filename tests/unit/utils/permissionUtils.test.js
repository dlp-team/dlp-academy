import { describe, it, expect } from 'vitest';
import {
  getPermissionLevel,
  canEdit,
  canDelete,
  shouldShowEditUI,
  shouldShowDeleteUI,
  hasRequiredRoleAccess,
} from '../../../src/utils/permissionUtils';

describe('getPermissionLevel', () => {
  it('returns owner for ownerId match', () => {
    const item = { ownerId: 'u-1' };
    expect(getPermissionLevel(item, 'u-1')).toBe('owner');
  });

  it('returns editor when user is in editorUids', () => {
    const item = { ownerId: 'u-2', editorUids: ['u-1'] };
    expect(getPermissionLevel(item, 'u-1')).toBe('editor');
  });

  it('returns viewer when user is in viewerUids', () => {
    const item = { ownerId: 'u-2', viewerUids: ['u-1'] };
    expect(getPermissionLevel(item, 'u-1')).toBe('viewer');
  });

  it('returns none when user has no access', () => {
    const item = { ownerId: 'u-2', editorUids: ['u-3'], viewerUids: ['u-4'] };
    expect(getPermissionLevel(item, 'u-1')).toBe('none');
  });
});

describe('viewer denial guardrails', () => {
  const viewerUserId = 'viewer-1';
  const sharedViewerItem = {
    ownerId: 'owner-1',
    viewerUids: [viewerUserId],
  };

  it('denies edit capability for viewer-only access', () => {
    expect(canEdit(sharedViewerItem, viewerUserId)).toBe(false);
    expect(canDelete(sharedViewerItem, viewerUserId)).toBe(false);
  });

  it('hides edit/delete UI for viewer-only access', () => {
    expect(shouldShowEditUI(sharedViewerItem, viewerUserId)).toBe(false);
    expect(shouldShowDeleteUI(sharedViewerItem, viewerUserId)).toBe(false);
  });

  it('allows editor access when role is elevated', () => {
    const editorItem = {
      ownerId: 'owner-1',
      editorUids: ['editor-1'],
    };

    expect(canEdit(editorItem, 'editor-1')).toBe(true);
    expect(shouldShowEditUI(editorItem, 'editor-1')).toBe(true);
    expect(shouldShowDeleteUI(editorItem, 'editor-1')).toBe(true);
  });
});

describe('route role guard helpers', () => {
  it('enforces institution-admin route access by role rank', () => {
    expect(hasRequiredRoleAccess({ role: 'viewer' }, 'institutionadmin')).toBe(false);
    expect(hasRequiredRoleAccess({ role: 'teacher' }, 'institutionadmin')).toBe(false);
    expect(hasRequiredRoleAccess({ role: 'institutionadmin' }, 'institutionadmin')).toBe(true);
    expect(hasRequiredRoleAccess({ role: 'admin' }, 'institutionadmin')).toBe(true);
  });
});
