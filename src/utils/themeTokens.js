export const HOME_THEME_TOKENS = {
    modalBackdropClass: 'absolute inset-0 bg-black/50 dark:bg-black/70 transition-colors',
    modalCardClass:
        'bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[calc(100vh-10rem)] overflow-y-auto shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors',
    mutedTextClass: 'home-token-muted-text',
    dashedCreateCardIndigoClass:
        'home-token-dashed-create-card group relative w-full border-3 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center cursor-pointer',
    dashedCardAmberIdleClass:
        'home-token-dashed-secondary-card',
    dashedCardIndigoIdleClass:
        'home-token-dashed-primary-card'
};

export const HOME_THEME_DEFAULT_COLORS = {
    primary: '#6366f1',
    secondary: '#f59e0b',
    accent: '#14b8a6',
    mutedText: '#6b7280',
    cardBorder: '#d1d5db',
    cardBackground: '#ffffff'
};

const HOME_THEME_TOKEN_KEYS = Object.keys(HOME_THEME_TOKENS);
const HOME_THEME_COLOR_KEYS = Object.keys(HOME_THEME_DEFAULT_COLORS);

const isValidThemeTokenOverride = (value) => {
    return typeof value === 'string' && value.trim().length > 0;
};

const isHexColor = (value) => {
    return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
};

const normalizeHexColor = (value) => {
    if (!isHexColor(value)) return null;
    const trimmed = value.trim();
    if (trimmed.length === 7) return trimmed.toLowerCase();

    const short = trimmed.slice(1).toLowerCase();
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`;
};

const hexToRgb = (hex) => {
    const normalized = normalizeHexColor(hex);
    if (!normalized) return null;

    const int = parseInt(normalized.slice(1), 16);
    return {
        r: (int >> 16) & 255,
        g: (int >> 8) & 255,
        b: int & 255
    };
};

const toRgba = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const pickHomeThemeTokenOverrides = (candidate) => {
    if (!candidate || typeof candidate !== 'object') return null;

    const overrides = HOME_THEME_TOKEN_KEYS.reduce((acc, key) => {
        const value = candidate[key];
        if (isValidThemeTokenOverride(value)) {
            acc[key] = value;
        }
        return acc;
    }, {});

    return Object.keys(overrides).length > 0 ? overrides : null;
};

const pickHomeThemeColorOverrides = (candidate) => {
    if (!candidate || typeof candidate !== 'object') return null;

    const overrides = HOME_THEME_COLOR_KEYS.reduce((acc, key) => {
        const color = normalizeHexColor(candidate[key]);
        if (color) {
            acc[key] = color;
        }
        return acc;
    }, {});

    return Object.keys(overrides).length > 0 ? overrides : null;
};

export const resolveInstitutionHomeThemeOverrides = (institutionData) => {
    if (!institutionData || typeof institutionData !== 'object') return null;

    const candidates = [
        institutionData.homeThemeTokens,
        institutionData.homeTheme,
        institutionData.settings?.homeThemeTokens,
        institutionData.settings?.homeTheme,
        institutionData.customization?.homeThemeTokens,
        institutionData.customization?.homeTheme,
        institutionData.customization?.home?.tokens
    ];

    for (const candidate of candidates) {
        const overrides = pickHomeThemeTokenOverrides(candidate);
        if (overrides) {
            return overrides;
        }
    }

    return null;
};

export const resolveInstitutionHomeThemeColors = (institutionData) => {
    if (!institutionData || typeof institutionData !== 'object') return null;

    const candidates = [
        institutionData.homeThemeColors,
        institutionData.settings?.homeThemeColors,
        institutionData.customization?.homeThemeColors,
        institutionData.customization?.home?.colors
    ];

    for (const candidate of candidates) {
        const overrides = pickHomeThemeColorOverrides(candidate);
        if (overrides) {
            return overrides;
        }
    }

    return null;
};

export const getEffectiveHomeThemeTokens = (overrides) => {
    return {
        ...HOME_THEME_TOKENS,
        ...(overrides || {})
    };
};

export const getEffectiveHomeThemeColors = (overrides) => {
    return {
        ...HOME_THEME_DEFAULT_COLORS,
        ...(overrides || {})
    };
};

export const buildHomeThemeCssVariables = (colors) => {
    const effective = getEffectiveHomeThemeColors(colors);

    return {
        '--home-primary': effective.primary,
        '--home-secondary': effective.secondary,
        '--home-accent': effective.accent,
        '--home-muted-text': effective.mutedText,
        '--home-card-border': effective.cardBorder,
        '--home-card-background': effective.cardBackground,
        '--home-primary-soft': toRgba(effective.primary, 0.12) || 'rgba(99, 102, 241, 0.12)',
        '--home-primary-soft-dark': toRgba(effective.primary, 0.24) || 'rgba(99, 102, 241, 0.24)',
        '--home-secondary-soft': toRgba(effective.secondary, 0.12) || 'rgba(245, 158, 11, 0.12)',
        '--home-secondary-soft-dark': toRgba(effective.secondary, 0.24) || 'rgba(245, 158, 11, 0.24)'
    };
};
