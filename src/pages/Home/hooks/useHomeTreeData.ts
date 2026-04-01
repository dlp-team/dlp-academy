// src/pages/Home/hooks/useHomeTreeData.ts
import { useMemo } from 'react';
import { mergeSourceAndShortcutItems } from '../../../utils/mergeUtils';

export const useHomeTreeData = (logic: any) => {
    const treeFolders = useMemo(() => {
        const baseFolders = Array.isArray(logic.folders) ? logic.folders : [];
        const shortcutFolders = Array.isArray(logic.resolvedShortcuts)
            ? logic.resolvedShortcuts.filter((item: any) => item?.targetType === 'folder')
            : [];

        return (mergeSourceAndShortcutItems as any)({
            sourceItems: baseFolders as any[],
            shortcutItems: shortcutFolders as any[]
        }) as any[];
    }, [logic.folders, logic.resolvedShortcuts]);

    const treeSubjects = useMemo(() => {
        const baseSubjects = Array.isArray(logic.subjects) ? logic.subjects : [];
        const shortcutSubjects = Array.isArray(logic.resolvedShortcuts)
            ? logic.resolvedShortcuts.filter((item: any) => item?.targetType === 'subject')
            : [];

        return (mergeSourceAndShortcutItems as any)({
            sourceItems: baseSubjects as any[],
            shortcutItems: shortcutSubjects as any[]
        }) as any[];
    }, [logic.subjects, logic.resolvedShortcuts]);

    return {
        treeFolders,
        treeSubjects
    };
};
