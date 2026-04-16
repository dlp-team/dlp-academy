// tests/unit/utils/homeSelectionDropUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  getDraggedSelectionKeyFromDropArgs,
  getDraggedSelectionKeyFromDropEvent,
  shouldHandleSelectionDrop,
} from '../../../src/pages/Home/utils/homeSelectionDropUtils';

const createDropEvent = (payload = {}) => ({
  dataTransfer: {
    getData: (key) => payload[key] || '',
  },
});

describe('homeSelectionDropUtils', () => {
  it('builds subject selection key from drop args (shortcut-first)', () => {
    const selectionKey = getDraggedSelectionKeyFromDropArgs({
      subjectId: 'subject-1',
      subjectShortcutId: 'shortcut-1',
    });

    expect(selectionKey).toBe('subject:shortcut-1');
  });

  it('builds folder selection key from drop args (id fallback)', () => {
    const selectionKey = getDraggedSelectionKeyFromDropArgs({
      folderId: 'folder-1',
    });

    expect(selectionKey).toBe('folder:folder-1');
  });

  it('returns null when drop args do not include a subject or folder id', () => {
    const selectionKey = getDraggedSelectionKeyFromDropArgs({});
    expect(selectionKey).toBeNull();
  });

  it('resolves dragged selection key from a native drop event payload', () => {
    const selectionKey = getDraggedSelectionKeyFromDropEvent(createDropEvent({
      subjectId: 'subject-55',
      subjectShortcutId: 'shortcut-55',
      folderId: '',
      folderShortcutId: '',
    }));

    expect(selectionKey).toBe('subject:shortcut-55');
  });

  it('returns null when drop event has no usable dataTransfer payload', () => {
    expect(getDraggedSelectionKeyFromDropEvent(null)).toBeNull();
    expect(getDraggedSelectionKeyFromDropEvent({})).toBeNull();
  });

  it('accepts grouped selection drop only for active selected dragged key', () => {
    const selectedItemKeys = new Set(['subject:shortcut-a', 'folder:folder-b']);

    expect(shouldHandleSelectionDrop({
      selectMode: true,
      selectedItemKeys,
      draggedSelectionKey: 'subject:shortcut-a',
    })).toBe(true);

    expect(shouldHandleSelectionDrop({
      selectMode: false,
      selectedItemKeys,
      draggedSelectionKey: 'subject:shortcut-a',
    })).toBe(false);

    expect(shouldHandleSelectionDrop({
      selectMode: true,
      selectedItemKeys,
      draggedSelectionKey: 'subject:not-selected',
    })).toBe(false);
  });
});
