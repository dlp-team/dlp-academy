// src/pages/Home/hooks/useHomeCreationGuards.ts
import { useMemo } from 'react';
import {
    canCreateFolderByRole,
    canCreateSubjectByRole,
    getPermissionLevel
} from '../../../utils/permissionUtils';

type HomeCreationGuardsParams = {
    user: any;
    logic: any;
    isStudentRole: boolean;
    hasContent: boolean;
};

export const useHomeCreationGuards = ({ user, logic, isStudentRole, hasContent }: HomeCreationGuardsParams) => {
    const canCreateInManualContext = useMemo(() => {
        if (!canCreateSubjectByRole(user)) return false;
        if (logic.viewMode !== 'grid') return true;
        if (logic.currentFolder?.isShared !== true) return true;
        const permission = user?.uid ? getPermissionLevel(logic.currentFolder, user.uid) : 'none';
        return permission === 'editor' || permission === 'owner';
    }, [logic.viewMode, logic.currentFolder, user]);

    const canCreateFolderInManualContext = useMemo(() => {
        if (!canCreateFolderByRole(user)) return false;
        if (logic.viewMode !== 'grid') return false;
        if (logic.currentFolder?.isShared !== true) return true;
        const permission = user?.uid ? getPermissionLevel(logic.currentFolder, user.uid) : 'none';
        return permission === 'editor' || permission === 'owner';
    }, [logic.viewMode, logic.currentFolder, user]);

    const effectiveHasContent = useMemo(() => {
        if (!isStudentRole) return hasContent;
        return Object.values(logic.groupedContent || {}).some((bucket) => Array.isArray(bucket) && bucket.length > 0);
    }, [isStudentRole, hasContent, logic.groupedContent]);

    return {
        canCreateInManualContext,
        canCreateFolderInManualContext,
        effectiveHasContent
    };
};
