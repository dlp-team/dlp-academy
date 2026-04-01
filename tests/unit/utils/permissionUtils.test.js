import { describe, it, expect } from 'vitest';
import {
  getPermissionLevel,
  canEdit,
  canDelete,
  shouldShowEditUI,
  shouldShowDeleteUI,
  hasRequiredRoleAccess,
  getNormalizedRole,
  isReadOnlyRole,
  canCreateSubjectByRole,
  canCreateFolderByRole,
  isShortcutItem,
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

  it('enforces teacher route access without granting higher dashboards', () => {
    expect(hasRequiredRoleAccess({ role: 'student' }, 'teacher')).toBe(false);
    expect(hasRequiredRoleAccess({ role: 'teacher' }, 'teacher')).toBe(true);
    expect(hasRequiredRoleAccess({ role: 'institutionadmin' }, 'teacher')).toBe(true);
    expect(hasRequiredRoleAccess({ role: 'admin' }, 'teacher')).toBe(true);

    expect(hasRequiredRoleAccess({ role: 'teacher' }, 'institutionadmin')).toBe(false);
    expect(hasRequiredRoleAccess({ role: 'teacher' }, 'admin')).toBe(false);
  });

  it('normalizes unknown/dirty roles safely', () => {
    expect(getNormalizedRole(' ADMIN ')).toBe('admin');
    expect(getNormalizedRole({ role: 'institutionadmin' })).toBe('institutionadmin');
    expect(getNormalizedRole({ role: 'unknown-role' })).toBe('student');
    expect(getNormalizedRole(null)).toBe('student');
  });

  it('applies read-only and create capabilities by role', () => {
    expect(isReadOnlyRole('student')).toBe(true);
    expect(isReadOnlyRole('teacher')).toBe(false);

    expect(canCreateSubjectByRole('student')).toBe(false);
    expect(canCreateSubjectByRole('teacher')).toBe(true);
    expect(
      canCreateSubjectByRole('teacher', { allowTeacherAutonomousSubjectCreation: false })
    ).toBe(false);
    expect(
      canCreateSubjectByRole('institutionadmin', { allowTeacherAutonomousSubjectCreation: false })
    ).toBe(true);

    expect(canCreateFolderByRole('student')).toBe(false);
    expect(canCreateFolderByRole('institutionadmin')).toBe(true);
  });
});

describe('shortcut and orphan guard helpers', () => {
  it('detects shortcut item shapes', () => {
    expect(isShortcutItem({ targetId: 's-1', targetType: 'subject' })).toBe(true);
    expect(isShortcutItem({ isShortcut: true })).toBe(true);
    expect(isShortcutItem({ shortcutId: 'sc-1' })).toBe(true);
    expect(isShortcutItem({ ownerId: 'u-1' })).toBe(false);
  });

  it('hides edit UI for orphaned shortcuts and allows delete for shortcut owner', () => {
    const orphanShortcut = {
      targetId: 's-1',
      targetType: 'subject',
      ownerId: 'owner-1',
      isOrphan: true,
    };

    const ownedShortcut = {
      targetId: 'f-1',
      targetType: 'folder',
      ownerId: 'owner-1',
    };

    expect(shouldShowEditUI(orphanShortcut, 'owner-1')).toBe(false);
    expect(shouldShowDeleteUI(ownedShortcut, 'owner-1')).toBe(true);
    expect(shouldShowDeleteUI(ownedShortcut, 'other-user')).toBe(false);
  });
});
