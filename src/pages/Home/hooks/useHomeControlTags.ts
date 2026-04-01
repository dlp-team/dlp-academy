// src/pages/Home/hooks/useHomeControlTags.ts
import React, { useMemo } from 'react';

type HomeControlTagsParams = {
    logic: any;
    isStudentRole: boolean;
    sharedFolders: any[];
    sharedSubjects: any[];
    sharedSelectedTags: string[];
    setSharedSelectedTags: (tags: string[]) => void;
    effectiveSharedScopeSelected: boolean;
    isSharedForCurrentUser: (item: any) => boolean;
};

export const useHomeControlTags = ({
    logic,
    isStudentRole,
    sharedFolders,
    sharedSubjects,
    sharedSelectedTags,
    setSharedSelectedTags,
    effectiveSharedScopeSelected,
    isSharedForCurrentUser
}: HomeControlTagsParams) => {
    const availableControlTags = useMemo(() => {
        const sourceFolders = logic.viewMode === 'shared' ? (sharedFolders || []) : (logic.filteredFolders || logic.folders || []);
        const sourceSubjects = logic.viewMode === 'shared' ? (sharedSubjects || []) : (logic.filteredSubjects || logic.subjects || []);

        const roleScopedFolders = isStudentRole ? [] : sourceFolders;

        const effectiveFolders = effectiveSharedScopeSelected ? roleScopedFolders : roleScopedFolders.filter((item) => !isSharedForCurrentUser(item));
        const effectiveSubjects = effectiveSharedScopeSelected ? sourceSubjects : sourceSubjects.filter((item) => !isSharedForCurrentUser(item));

        const tagSet = new Set();
        effectiveFolders.forEach((folder) => (Array.isArray(folder?.tags) ? folder.tags : []).forEach((tag) => tagSet.add(tag)));
        effectiveSubjects.forEach((subject) => (Array.isArray(subject?.tags) ? subject.tags : []).forEach((tag) => tagSet.add(tag)));

        return Array.from(tagSet).filter(Boolean).sort();
    }, [
        logic.viewMode,
        sharedFolders,
        sharedSubjects,
        logic.filteredFolders,
        logic.folders,
        logic.filteredSubjects,
        logic.subjects,
        effectiveSharedScopeSelected,
        isSharedForCurrentUser,
        isStudentRole
    ]);

    React.useEffect(() => {
        const availableTagSet = new Set(availableControlTags);
        if (logic.viewMode === 'shared') {
            const pruned = (sharedSelectedTags || []).filter((tag) => availableTagSet.has(tag));
            if (pruned.length !== (sharedSelectedTags || []).length) {
                setSharedSelectedTags(pruned);
            }
            return;
        }

        const currentTags = logic.selectedTags || [];
        const pruned = currentTags.filter((tag) => availableTagSet.has(tag));
        if (pruned.length !== currentTags.length) {
            logic.setSelectedTags(pruned);
        }
    }, [availableControlTags, logic.viewMode, sharedSelectedTags, setSharedSelectedTags, logic.selectedTags, logic.setSelectedTags]);

    return { availableControlTags };
};