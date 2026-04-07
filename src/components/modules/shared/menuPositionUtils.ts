// src/components/modules/shared/menuPositionUtils.ts

type MenuPositionMode = 'list' | 'card';

type ComputeMenuPositionArgs = {
    triggerRect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;
    menuWidth: number;
    menuHeight: number;
    headerSafeTop?: number;
    menuMargin?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    mode?: MenuPositionMode;
};

const resolveViewportDimension = (explicitValue: number | undefined, fallback: number) => {
    if (typeof explicitValue === 'number') return explicitValue;
    if (typeof window !== 'undefined') return fallback;
    return fallback;
};

export const computeMenuPosition = ({
    triggerRect,
    menuWidth,
    menuHeight,
    headerSafeTop = 112,
    menuMargin = 8,
    viewportWidth,
    viewportHeight,
    mode = 'list'
}: ComputeMenuPositionArgs) => {
    const resolvedViewportWidth = resolveViewportDimension(viewportWidth, typeof window !== 'undefined' ? window.innerWidth : menuWidth + (menuMargin * 2));
    const resolvedViewportHeight = resolveViewportDimension(viewportHeight, typeof window !== 'undefined' ? window.innerHeight : menuHeight + (headerSafeTop + (menuMargin * 2)));

    const safeTop = headerSafeTop + menuMargin;
    const isListMode = mode === 'list';

    const defaultLeft = isListMode ? triggerRect.right - menuWidth : triggerRect.left;
    const oppositeLeft = isListMode ? triggerRect.left : triggerRect.right - menuWidth;
    let left = defaultLeft;

    if (isListMode) {
        if (left < menuMargin) left = oppositeLeft;
    } else if (left + menuWidth > resolvedViewportWidth - menuMargin) {
        left = oppositeLeft;
    }

    left = Math.min(
        Math.max(left, menuMargin),
        Math.max(menuMargin, resolvedViewportWidth - menuWidth - menuMargin)
    );

    const defaultTop = isListMode ? triggerRect.bottom - menuHeight : triggerRect.bottom + 4;
    const oppositeTop = isListMode ? triggerRect.bottom + 4 : triggerRect.top - menuHeight - 4;
    let top = defaultTop;

    if (isListMode) {
        if (top < safeTop) top = oppositeTop;
    } else if (top + menuHeight > resolvedViewportHeight - menuMargin) {
        top = oppositeTop;
    }

    const maxTop = Math.max(safeTop, resolvedViewportHeight - menuHeight - menuMargin);

    return {
        top: Math.min(Math.max(top, safeTop), maxTop),
        left
    };
};
