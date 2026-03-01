import { describe, it, expect } from 'vitest';
import { getPermissionLevel } from '../../../src/utils/permissionUtils';

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
