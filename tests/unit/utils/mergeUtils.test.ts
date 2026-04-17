// tests/unit/utils/mergeUtils.test.js
import { describe, expect, it } from 'vitest';
import { mergeSourceAndShortcutItems } from '../../../src/utils/mergeUtils';

describe('mergeUtils', () => {
  it('deduplicates source and shortcut items, including missing identifiers', () => {
    const sourceItems = [{ id: 'a' }, { id: 'a' }, { name: 'no-id-1' }, { name: 'no-id-2' }];
    const shortcutItems = [
      { shortcutId: 'sc-1' },
      { shortcutId: 'sc-1' },
      { id: 'fallback-id' },
      { name: 'no-shortcut-id' },
      { name: 'no-shortcut-id-2' },
    ];

    const result = mergeSourceAndShortcutItems({ sourceItems, shortcutItems });

    expect(result).toHaveLength(5);
    expect(result[0].id).toBe('a');
    expect(result[1].name).toBe('no-id-1');
    expect(result[2].shortcutId).toBe('sc-1');
    expect(result[3].id).toBe('fallback-id');
    expect(result[4].name).toBe('no-shortcut-id');
  });
});
