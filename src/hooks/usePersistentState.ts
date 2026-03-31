// src/hooks/usePersistentState.js
import { useCallback, useSyncExternalStore } from 'react';

const PERSISTENCE_EVENT = 'dlp:persistent-state-change';
const NULL_STORAGE_VALUE = '__DLP_NULL_STORAGE_VALUE__';
const snapshotCache = new Map();

const safeParse = (value, fallbackValue: any) => {
    if (value == null) return fallbackValue;

    try {
        return JSON.parse(value);
    } catch {
        return fallbackValue;
    }
};

const createResolvedInitialValue = (initialValue: any) => (
    typeof initialValue === 'function' ? initialValue() : initialValue
);

export const usePersistentState = (storageKey, initialValue: any) => {
    const resolvedInitialValue = createResolvedInitialValue(initialValue);

    const subscribe = useCallback((onStoreChange: any) => {
        const handleStorage = (event: any) => {
            if (!storageKey || event.key === storageKey) {
                onStoreChange();
            }
        };

        const handleCustom = (event: any) => {
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

        const normalizedRaw = rawValue ?? NULL_STORAGE_VALUE;
        const cache = snapshotCache.get(storageKey);

        if (cache?.raw === normalizedRaw) {
            if (normalizedRaw === NULL_STORAGE_VALUE && cache.fallback !== resolvedInitialValue) {
                const nextCacheEntry = {
                    raw: normalizedRaw,
                    parsed: resolvedInitialValue,
                    fallback: resolvedInitialValue,
                };
                snapshotCache.set(storageKey, nextCacheEntry);
                return nextCacheEntry.parsed;
            }

            return cache.parsed;
        }

        const parsed = safeParse(rawValue, resolvedInitialValue);
        snapshotCache.set(storageKey, {
            raw: normalizedRaw,
            parsed,
            fallback: resolvedInitialValue,
        });

        return parsed;
    }, [storageKey, resolvedInitialValue]);

    const state = useSyncExternalStore(subscribe, getSnapshot, () => resolvedInitialValue);

    const setState = useCallback((valueOrUpdater: any) => {
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