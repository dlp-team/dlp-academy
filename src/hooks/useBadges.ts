// src/hooks/useBadges.ts

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { BadgeTemplate, StudentBadge } from '../types/badges';

interface UseBadgesParams {
    institutionId: string | null | undefined;
    userId?: string | null;
}

export const useBadges = ({ institutionId, userId }: UseBadgesParams) => {
    const [templates, setTemplates] = useState<BadgeTemplate[]>([]);
    const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load badge templates for institution
    useEffect(() => {
        if (!institutionId) {
            setTemplates([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'badgeTemplates'),
            where('institutionId', '==', institutionId),
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                setTemplates(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BadgeTemplate)));
                setLoading(false);
            },
            (err) => {
                setError(err.message || 'Error cargando insignias.');
                setLoading(false);
            },
        );

        return unsubscribe;
    }, [institutionId]);

    // Load student badges if userId provided
    useEffect(() => {
        if (!institutionId || !userId) {
            setStudentBadges([]);
            return;
        }

        const q = query(
            collection(db, 'studentBadges'),
            where('institutionId', '==', institutionId),
            where('studentId', '==', userId),
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                setStudentBadges(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StudentBadge)));
            },
            (err) => {
                setError(err.message || 'Error cargando insignias del alumno.');
            },
        );

        return unsubscribe;
    }, [institutionId, userId]);

    const createTemplate = useCallback(async (template: Omit<BadgeTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!institutionId) throw new Error('institutionId requerido.');
        return addDoc(collection(db, 'badgeTemplates'), {
            ...template,
            institutionId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }, [institutionId]);

    const awardBadge = useCallback(async (badge: Omit<StudentBadge, 'id' | 'awardedAt'>) => {
        if (!institutionId) throw new Error('institutionId requerido.');
        return addDoc(collection(db, 'studentBadges'), {
            ...badge,
            institutionId,
            status: 'active',
            awardedAt: serverTimestamp(),
        });
    }, [institutionId]);

    const revokeBadge = useCallback(async (badgeId: string, revokedBy: string) => {
        if (!badgeId) throw new Error('badgeId requerido.');
        return updateDoc(doc(db, 'studentBadges', badgeId), {
            status: 'revoked',
            revokedAt: serverTimestamp(),
            revokedBy,
        });
    }, []);

    const getStudentBadges = useCallback(async (studentId: string): Promise<StudentBadge[]> => {
        if (!institutionId || !studentId) return [];
        const q = query(
            collection(db, 'studentBadges'),
            where('institutionId', '==', institutionId),
            where('studentId', '==', studentId),
            where('status', '==', 'active'),
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StudentBadge));
    }, [institutionId]);

    return {
        templates,
        studentBadges,
        loading,
        error,
        createTemplate,
        awardBadge,
        revokeBadge,
        getStudentBadges,
    };
};
