// tests/unit/utils/selectionVisualUtils.test.js
import { describe, it, expect } from 'vitest';
import {
  getHomeUnselectedDimmingClass,
  getBinUnselectedDimmingClass,
} from '../../../src/utils/selectionVisualUtils';

describe('selectionVisualUtils', () => {
  it('returns empty class when Home selection is inactive', () => {
    expect(
      getHomeUnselectedDimmingClass({
        hasSelection: false,
        isSelected: false,
      })
    ).toBe('');
  });

  it('returns empty class for selected Home cards', () => {
    expect(
      getHomeUnselectedDimmingClass({
        hasSelection: true,
        isSelected: true,
      })
    ).toBe('');
  });

  it('dims unselected Home cards when a selection exists', () => {
    expect(
      getHomeUnselectedDimmingClass({
        hasSelection: true,
        isSelected: false,
      })
    ).toBe('brightness-[0.92] saturate-[0.72]');
  });

  it('keeps stronger Bin dimming for subjects than folders', () => {
    expect(
      getBinUnselectedDimmingClass({
        hasSelection: true,
        isSelected: false,
        isFolderLike: false,
      })
    ).toBe('brightness-[0.91] saturate-[0.66]');

    expect(
      getBinUnselectedDimmingClass({
        hasSelection: true,
        isSelected: false,
        isFolderLike: true,
      })
    ).toBe('brightness-[0.93] saturate-[0.76]');
  });
});
