// tests/unit/utils/folderUtils.test.js
import { describe, expect, it } from 'vitest';
import { isDescendant, isInvalidFolderMove, isTargetInsideDraggedTree } from '../../../src/utils/folderUtils';

describe('folderUtils', () => {
  const tree = [
    { id: 'root', parentId: null },
    { id: 'child', parentId: 'root' },
    { id: 'grandchild', parentId: 'child' },
  ];

  it('detects descendant relationships', () => {
    expect(isDescendant('root', 'grandchild', tree)).toBe(true);
    expect(isDescendant('child', 'root', tree)).toBe(false);
  });

  it('detects targets inside dragged subtree', () => {
    expect(isTargetInsideDraggedTree('child', 'grandchild', tree)).toBe(true);
    expect(isTargetInsideDraggedTree('grandchild', 'root', tree)).toBe(false);
  });

  it('returns invalid move for self-target or subtree target', () => {
    expect(isInvalidFolderMove('child', 'child', tree)).toBe(true);
    expect(isInvalidFolderMove('child', 'grandchild', tree)).toBe(true);
  });

  it('handles corrupted cyclic structures safely using visited guard', () => {
    const corrupt = [
      { id: 'a', parentId: 'b' },
      { id: 'b', parentId: 'a' },
    ];

    expect(isDescendant('x', 'a', corrupt)).toBe(false);
  });
});
