// src/pages/Home/hooks/useHomeFolderRoutingSync.ts
import { useEffect } from 'react';
import { clearLastHomeFolderId } from '../utils/homePersistence';

export const useHomeFolderRoutingSync = ({
    user,
    logic,
    isStudentRole,
    rememberOrganization,
    searchParams,
    setSearchParams,
    folderIdFromUrl,
    setPersistedFolderId,
    setHasInitialDataLoaded
}: any) => {
    useEffect(() => {
        if (!user) {
            setHasInitialDataLoaded(false);
            return;
        }

        if (!logic.loading && !logic.loadingFolders) {
            setHasInitialDataLoaded(true);
        }
    }, [user, logic.loading, logic.loadingFolders, setHasInitialDataLoaded]);

    useEffect(() => {
        if (isStudentRole) {
            if (logic.currentFolder) {
                logic.setCurrentFolder(null);
            }
            if (logic.viewMode === 'shared') {
                logic.setViewMode('grid');
            }
            if (rememberOrganization) {
                clearLastHomeFolderId();
            }
            const next = new URLSearchParams(searchParams);
            if (next.has('folderId')) {
                next.delete('folderId');
                setSearchParams(next, { replace: true });
            }
            return;
        }

        if (!folderIdFromUrl || !Array.isArray(logic.folders) || logic.folders.length === 0) return;

        const targetFolder = logic.folders.find((folder: any) => folder.id === folderIdFromUrl);

        if (targetFolder && (!logic.currentFolder || logic.currentFolder.id !== targetFolder.id)) {
            logic.setCurrentFolder(targetFolder);
            setPersistedFolderId(targetFolder);
        }

        if (!targetFolder) {
            const next = new URLSearchParams(searchParams);
            next.delete('folderId');
            setSearchParams(next, { replace: true });
        }
    }, [folderIdFromUrl, logic.folders, isStudentRole, rememberOrganization, setSearchParams, setPersistedFolderId]);

    useEffect(() => {
        if (isStudentRole) return;
        const next = new URLSearchParams(searchParams);
        const currentId = logic.currentFolder ? logic.currentFolder.id : null;

        if (currentId) {
            if (next.get('folderId') !== currentId) {
                next.set('folderId', currentId);
                setSearchParams(next, { replace: true });
            }
            return;
        }

        if (next.has('folderId')) {
            next.delete('folderId');
            setSearchParams(next, { replace: true });
        }
    }, [logic.currentFolder?.id, isStudentRole, searchParams, setSearchParams]);
};
