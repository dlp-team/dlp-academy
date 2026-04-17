// tests/unit/utils/dragPayloadUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildDragPayload,
  readDragPayloadFromDataTransfer,
  writeDragPayloadToDataTransfer,
} from '../../../src/utils/dragPayloadUtils';

const createDataTransferMock = () => {
  const store = new Map();
  return {
    setData: (key, value) => store.set(key, String(value)),
    getData: (key) => store.get(key) ?? '',
  };
};

describe('dragPayloadUtils', () => {
  it('roundtrips a subject payload through dataTransfer', () => {
    const payload = buildDragPayload({
      id: 'subject-1',
      type: 'subject',
      parentId: 'folder-1',
      shortcutId: 'sc-1',
      position: 3,
    });

    const dataTransfer = createDataTransferMock();
    writeDragPayloadToDataTransfer(dataTransfer, payload);

    expect(readDragPayloadFromDataTransfer(dataTransfer)).toEqual(payload);
  });

  it('roundtrips a folder payload through dataTransfer', () => {
    const payload = buildDragPayload({
      id: 'folder-1',
      type: 'folder',
      shortcutId: 'sc-folder-1',
      position: 1,
    });

    const dataTransfer = createDataTransferMock();
    writeDragPayloadToDataTransfer(dataTransfer, payload);

    expect(readDragPayloadFromDataTransfer(dataTransfer)).toEqual(payload);
  });

  it('returns null when treeItem is malformed JSON', () => {
    const dataTransfer = createDataTransferMock();
    dataTransfer.setData('treeItem', '{invalid-json');

    expect(readDragPayloadFromDataTransfer(dataTransfer)).toBeNull();
  });

  it('parses legacy fallback keys when treeItem is missing', () => {
    const dataTransfer = createDataTransferMock();
    dataTransfer.setData('subjectId', 'subject-legacy');
    dataTransfer.setData('subjectParentId', 'folder-legacy');
    dataTransfer.setData('subjectShortcutId', 'sc-legacy');
    dataTransfer.setData('position', '8');

    expect(readDragPayloadFromDataTransfer(dataTransfer)).toEqual({
      id: 'subject-legacy',
      type: 'subject',
      parentId: 'folder-legacy',
      shortcutId: 'sc-legacy',
      index: null,
      position: 8,
    });
  });
});
