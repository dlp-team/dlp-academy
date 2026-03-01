import { describe, it, expect } from 'vitest';
import { 
    getEffectiveHomeThemeColors, 
    HOME_THEME_DEFAULT_COLORS 
} from '../../src/utils/themeTokens';

describe('themeTokens utility', () => {
    it('should return default colors when no overrides are provided', () => {
        // Act
        const result = getEffectiveHomeThemeColors(null);

        // Assert
        expect(result).toEqual(HOME_THEME_DEFAULT_COLORS);
        expect(result.primary).toBe('#6366f1'); // Default Indigo
    });

    it('should merge institution overrides with default colors', () => {
        // Arrange: Simulate an institution changing only the primary and accent colors
        const mockInstitutionOverrides = {
            primary: '#ef4444', // Red
            accent: '#f59e0b',  // Amber
        };

        // Act
        const result = getEffectiveHomeThemeColors(mockInstitutionOverrides);

        // Assert
        // The provided colors should be updated
        expect(result.primary).toBe('#ef4444');
        expect(result.accent).toBe('#f59e0b');
        
        // The omitted colors should fall back to the defaults
        expect(result.secondary).toBe(HOME_THEME_DEFAULT_COLORS.secondary);
        expect(result.cardBackground).toBe(HOME_THEME_DEFAULT_COLORS.cardBackground);
    });
});
