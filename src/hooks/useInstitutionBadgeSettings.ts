// src/hooks/useInstitutionBadgeSettings.ts

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { InstitutionBadgeConfig } from '../types/badges';

const DEFAULT_CONFIG: InstitutionBadgeConfig = {
    gradeThreshold: 8,
    enableAutoBadges: true,
    enableManualBadges: true,
    defaultTemplates: [],
};

interface UseInstitutionBadgeSettingsParams {
    institutionId: string | null | undefined;
}

export const useInstitutionBadgeSettings = ({ institutionId }: UseInstitutionBadgeSettingsParams) => {
    const [config, setConfig] = useState<InstitutionBadgeConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!institutionId) {
            setConfig(DEFAULT_CONFIG);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadConfig = async () => {
            setLoading(true);
            setError('');
            try {
                const docRef = doc(db, 'institutions', institutionId, 'settings', 'badgeConfig');
                const snapshot = await getDoc(docRef);

                if (cancelled) return;

                if (snapshot.exists()) {
                    const data = snapshot.data() as Partial<InstitutionBadgeConfig>;
                    setConfig({
                        gradeThreshold: Number.isFinite(data.gradeThreshold) ? data.gradeThreshold! : DEFAULT_CONFIG.gradeThreshold,
                        enableAutoBadges: typeof data.enableAutoBadges === 'boolean' ? data.enableAutoBadges : DEFAULT_CONFIG.enableAutoBadges,
                        enableManualBadges: typeof data.enableManualBadges === 'boolean' ? data.enableManualBadges : DEFAULT_CONFIG.enableManualBadges,
                        defaultTemplates: Array.isArray(data.defaultTemplates) ? data.defaultTemplates : DEFAULT_CONFIG.defaultTemplates,
                    });
                } else {
                    setConfig(DEFAULT_CONFIG);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || 'Error cargando configuración de insignias.');
                    setConfig(DEFAULT_CONFIG);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadConfig();
        return () => { cancelled = true; };
    }, [institutionId]);

    const updateConfig = useCallback(async (updates: Partial<InstitutionBadgeConfig>) => {
        if (!institutionId) throw new Error('institutionId requerido.');
        const docRef = doc(db, 'institutions', institutionId, 'settings', 'badgeConfig');
        await setDoc(docRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
        setConfig((prev) => ({ ...prev, ...updates }));
    }, [institutionId]);

    return {
        config,
        loading,
        error,
        updateConfig,
    };
};
