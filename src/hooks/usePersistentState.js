// src/hooks/usePersistentState.js
import { useCallback, useRef, useSyncExternalStore } from 'react';

const PERSISTENCE_EVENT = 'dlp:persistent-state-change';

const safeParse = (value, fallbackValue) => {
    if (value == null) return fallbackValue;

    try {
        return JSON.parse(value);
    } catch {
        return fallbackValue;
    }
};

const createResolvedInitialValue = (initialValue) => (
    typeof initialValue === 'function' ? initialValue() : initialValue
);

export const usePersistentState = (storageKey, initialValue) => {
    const initialValueRef = useRef({
        key: storageKey,
        value: createResolvedInitialValue(initialValue)
    });

    if (initialValueRef.current.key !== storageKey) {
        initialValueRef.current = {
            key: storageKey,
            value: createResolvedInitialValue(initialValue)
        };
    }

    const resolvedInitialValue = initialValueRef.current.value;

    const snapshotCacheRef = useRef({
        key: storageKey,
        raw: '__INITIAL__',
        parsed: resolvedInitialValue
    });

    if (snapshotCacheRef.current.key !== storageKey) {
        snapshotCacheRef.current = {
            key: storageKey,
            raw: '__INITIAL__',
            parsed: resolvedInitialValue
        };
    }

    const subscribe = useCallback((onStoreChange) => {
        const handleStorage = (event) => {
            if (!storageKey || event.key === storageKey) {
                onStoreChange();
            }
        };

        const handleCustom = (event) => {
            if (!storageKey || event.detail?.key === storageKey) {
                onStoreChange();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener(PERSISTENCE_EVENT, handleCustom);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener(PERSISTENCE_EVENT, handleCustom);
        };
    }, [storageKey]);

    const getSnapshot = useCallback(() => {
        if (!storageKey) return resolvedInitialValue;

        let rawValue;
        try {
            rawValue = localStorage.getItem(storageKey);
        } catch {
            return resolvedInitialValue;
        }

        const normalizedRaw = rawValue ?? '__NULL__';
        const cache = snapshotCacheRef.current;

        if (cache.raw === normalizedRaw) {
            return cache.parsed;
        }

        const parsed = safeParse(rawValue, resolvedInitialValue);
        snapshotCacheRef.current = {
            key: storageKey,
            raw: normalizedRaw,
            parsed
        };

        return parsed;
    }, [storageKey, resolvedInitialValue]);

    const state = useSyncExternalStore(subscribe, getSnapshot, () => resolvedInitialValue);

    const setState = useCallback((valueOrUpdater) => {
        if (!storageKey) return;

        const currentValue = getSnapshot();
        const nextValue = typeof valueOrUpdater === 'function'
            ? valueOrUpdater(currentValue)
            : valueOrUpdater;

        try {
            const serializedNextValue = JSON.stringify(nextValue);
            const currentStoredValue = localStorage.getItem(storageKey);

            if (currentStoredValue === serializedNextValue) {
                return undefined;
            }

            localStorage.setItem(storageKey, serializedNextValue);
            window.dispatchEvent(new CustomEvent(PERSISTENCE_EVENT, { detail: { key: storageKey } }));
        } catch {
            return undefined;
        }

        return undefined;
    }, [storageKey, getSnapshot]);

    return [state, setState];
};

export default usePersistentState;