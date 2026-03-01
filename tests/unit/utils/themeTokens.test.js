import { describe, it, expect } from 'vitest';
import {
  getEffectiveHomeThemeColors,
  HOME_THEME_DEFAULT_COLORS,
} from '../../../src/utils/themeTokens';

describe('themeTokens utility', () => {
  it('returns default colors when no overrides are provided', () => {
    const result = getEffectiveHomeThemeColors(null);

    expect(result).toEqual(HOME_THEME_DEFAULT_COLORS);
    expect(result.primary).toBe('#6366f1');
  });

  it('merges institution overrides with default colors', () => {
    const mockInstitutionOverrides = {
      primary: '#ef4444',
      accent: '#f59e0b',
    };

    const result = getEffectiveHomeThemeColors(mockInstitutionOverrides);

    expect(result.primary).toBe('#ef4444');
    expect(result.accent).toBe('#f59e0b');
    expect(result.secondary).toBe(HOME_THEME_DEFAULT_COLORS.secondary);
    expect(result.cardBackground).toBe(HOME_THEME_DEFAULT_COLORS.cardBackground);
  });
});