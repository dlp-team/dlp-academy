const THEME_TRANSITION_CLASS = 'theme-switching';
const THEME_TRANSITION_DURATION_MS = 260;

let transitionCleanupTimer: ReturnType<typeof setTimeout> | null = null;

const prefersDarkMode = (): boolean => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const beginThemeTransition = (root: HTMLElement): void => {
    root.style.setProperty('--theme-transition-duration', `${THEME_TRANSITION_DURATION_MS}ms`);
    root.classList.add(THEME_TRANSITION_CLASS);

    if (transitionCleanupTimer) {
        clearTimeout(transitionCleanupTimer);
    }

    transitionCleanupTimer = setTimeout(() => {
        root.classList.remove(THEME_TRANSITION_CLASS);
    }, THEME_TRANSITION_DURATION_MS + 200);
};

export type ThemeType = 'light' | 'dark' | 'system' | string | null;

export const resolveThemeMode = (theme: ThemeType): 'light' | 'dark' => {
    if (theme === 'system') {
        return prefersDarkMode() ? 'dark' : 'light';
    }

    return theme === 'dark' ? 'dark' : 'light';
};

interface ApplyThemeOptions {
    animate?: boolean;
    persist?: boolean;
}

export const applyThemeToDom = (theme: ThemeType, options: ApplyThemeOptions = {}): 'light' | 'dark' => {
    if (typeof document === 'undefined') {
        return resolveThemeMode(theme);
    }

    const { animate = false, persist = true } = options;
    const root = document.documentElement;
    const resolvedTheme = resolveThemeMode(theme);
    const shouldUseDark = resolvedTheme === 'dark';
    const currentlyDark = root.classList.contains('dark');
    const hasThemeChanged = shouldUseDark !== currentlyDark;

    if (animate && hasThemeChanged) {
        beginThemeTransition(root);
    }

    root.classList.toggle('dark', shouldUseDark);

    if (persist && typeof window !== 'undefined') {
        localStorage.setItem('theme', theme || 'system');
    }

    return resolvedTheme;
};
