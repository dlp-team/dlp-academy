// tests/unit/utils/homeMergeUtils.test.js
import { describe, expect, it } from 'vitest';
import { mergeSourceAndShortcutItems } from '../../../src/utils/homeMergeUtils';

describe('homeMergeUtils', () => {
  it('keeps source precedence and deduplicates shortcut entries', () => {
    const sourceItems = [{ id: 's1', label: 'Source 1' }];
    const shortcutItems = [
      { shortcutId: 'sc1', label: 'Shortcut 1' },
      { shortcutId: 'sc1', label: 'Shortcut 1 duplicate' },
    ];

    const result = mergeSourceAndShortcutItems({ sourceItems, shortcutItems });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(sourceItems[0]);
    expect(result[1].shortcutId).toBe('sc1');
  });

  it('supports custom key resolvers for merge/dedup behavior', () => {
    const sourceItems = [{ ref: 'a' }, { ref: 'a' }];
    const shortcutItems = [{ ref: 'b' }, { ref: 'b' }];

    const result = mergeSourceAndShortcutItems({
      sourceItems,
      shortcutItems,
      getSourceKey: (item) => item.ref,
      getShortcutKey: (item) => item.ref,
    });

    expect(result).toHaveLength(2);
    expect(result[0].ref).toBe('a');
    expect(result[1].ref).toBe('b');
  });
});
