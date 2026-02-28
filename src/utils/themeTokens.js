export const HOME_THEME_TOKENS = {
    modalBackdropClass: 'absolute inset-0 bg-black/50 dark:bg-black/70 transition-colors',
    modalCardClass:
        'bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[calc(100vh-10rem)] overflow-y-auto shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors',
    mutedTextClass: 'text-gray-500 dark:text-gray-400',
    dashedCreateCardIndigoClass:
        'group relative w-full border-3 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center cursor-pointer',
    dashedCardAmberIdleClass:
        'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    dashedCardIndigoIdleClass:
        'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
};

const HOME_THEME_TOKEN_KEYS = Object.keys(HOME_THEME_TOKENS);

const isValidThemeTokenOverride = (value) => {
    return typeof value === 'string' && value.trim().length > 0;
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

export const getEffectiveHomeThemeTokens = (overrides) => {
    return {
        ...HOME_THEME_TOKENS,
        ...(overrides || {})
    };
};
