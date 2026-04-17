// tests/unit/utils/menuPositionUtils.test.js
import { describe, expect, it } from 'vitest';
import { computeMenuPosition } from '../../../src/components/modules/shared/menuPositionUtils';

describe('menuPositionUtils', () => {
  it('calculates default list-mode position when there is enough space', () => {
    const result = computeMenuPosition({
      triggerRect: { left: 200, right: 260, top: 300, bottom: 340 },
      menuWidth: 128,
      menuHeight: 144,
      headerSafeTop: 112,
      menuMargin: 8,
      viewportWidth: 1200,
      viewportHeight: 900,
      mode: 'list',
    });

    expect(result).toEqual({
      left: 132,
      top: 196,
    });
  });

  it('flips list-mode position when left and top underflow', () => {
    const result = computeMenuPosition({
      triggerRect: { left: 4, right: 40, top: 120, bottom: 140 },
      menuWidth: 128,
      menuHeight: 144,
      headerSafeTop: 112,
      menuMargin: 8,
      viewportWidth: 400,
      viewportHeight: 400,
      mode: 'list',
    });

    expect(result).toEqual({
      left: 8,
      top: 144,
    });
  });

  it('flips card-mode position when right and bottom overflow', () => {
    const result = computeMenuPosition({
      triggerRect: { left: 350, right: 380, top: 340, bottom: 360 },
      menuWidth: 164,
      menuHeight: 144,
      headerSafeTop: 112,
      menuMargin: 8,
      viewportWidth: 400,
      viewportHeight: 420,
      mode: 'card',
    });

    expect(result).toEqual({
      left: 216,
      top: 192,
    });
  });
});
