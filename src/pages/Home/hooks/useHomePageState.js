import React, { useMemo, useRef, useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { normalizeText } from '../../../utils/stringUtils';

export const useHomePageState = ({ logic, searchQuery }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isScaleOverlayOpen, setIsScaleOverlayOpen] = useState(false);

    const [sharedSelectedTags, setSharedSelectedTags] = useState([]);
    const [sharedActiveFilter, setSharedActiveFilter] = useState('all');

    const [folderContentsModalConfig, setFolderContentsModalConfig] = useState({ isOpen: false, folder: null });
    const [shareConfirm, setShareConfirm] = useState({ open: false, subjectId: null, folder: null, onConfirm: null });
    const [unshareConfirm, setUnshareConfirm] = useState({ open: false, subjectId: null, folder: null, onConfirm: null });
    const [topicsModalConfig, setTopicsModalConfig] = useState({
        isOpen: false,
        subject: null
    });

    const didRestoreRef = useRef(false);

    React.useEffect(() => {
        if (!logic.folders || logic.folders.length === 0) return;

        const allFolders = logic.folders;
        let fixedCount = 0;

        allFolders.forEach(folder => {
            let current = folder;
            const path = new Set();

            while (current && current.folderId) {
                if (path.has(current.id)) {
                    updateDoc(doc(db, 'folders', folder.id), { folderId: null });
                    fixedCount++;
                    break;
                }
                path.add(current.id);
                current = allFolders.find(f => f.id === current.folderId);
            }
        });

        if (fixedCount > 0) {
            alert(`✅ Auto-Cleaner Fixed ${fixedCount} corrupted folders! You can now remove the cleaner code.`);
        }
    }, [logic.folders]);

    React.useEffect(() => {
        if (didRestoreRef.current) return;
        if (!logic || !logic.folders) return;
        const lastTab = localStorage.getItem('dlp_last_viewMode');
        const lastFolderId = localStorage.getItem('dlp_last_folderId');
        if (lastTab && logic.setViewMode) logic.setViewMode(lastTab);
        if (lastFolderId && logic.setCurrentFolder) {
            const folder = logic.folders.find(f => f.id === lastFolderId);
            if (folder) logic.setCurrentFolder(folder);
        }
        didRestoreRef.current = true;
    }, [logic.folders]);

    const sharedAllTags = useMemo(() => {
        const folderTags = (logic.sharedFolders || []).flatMap(f => (Array.isArray(f.tags) ? f.tags : []));
        const subjectTags = (logic.sharedSubjects || []).flatMap(s => (Array.isArray(s.tags) ? s.tags : []));
        return Array.from(new Set([...folderTags, ...subjectTags])).filter(Boolean);
    }, [logic.sharedFolders, logic.sharedSubjects]);

    const { filteredFolders, filteredSubjects, sharedFolders, sharedSubjects } = useMemo(() => {
        const query = normalizeText(searchQuery);

        const filterList = list => list.filter(item => normalizeText(item.name).includes(query));

        const folders = logic.currentFolderContents?.folders || logic.folders || [];
        const subjects = logic.currentFolderContents?.subjects || logic.subjects || [];

        let sFolders = logic.sharedFolders || [];
        let sSubjects = logic.sharedSubjects || [];
        sFolders = filterList(sFolders);
        sSubjects = filterList(sSubjects);

        if (logic.viewMode === 'shared' && sharedSelectedTags.length > 0) {
            sFolders = sFolders.filter(
                f => Array.isArray(f.tags) && sharedSelectedTags.every(tag => f.tags.includes(tag))
            );
            sSubjects = sSubjects.filter(
                s => Array.isArray(s.tags) && sharedSelectedTags.every(tag => s.tags.includes(tag))
            );
        }

        return {
            filteredFolders: filterList(folders),
            filteredSubjects: filterList(subjects),
            sharedFolders: sFolders,
            sharedSubjects: sSubjects
        };
    }, [
        searchQuery,
        logic.folders,
        logic.subjects,
        logic.currentFolderContents,
        logic.sharedFolders,
        logic.sharedSubjects,
        logic.viewMode,
        sharedSelectedTags
    ]);

    const displayedFolders = useMemo(() => {
        if (logic.selectedTags && logic.selectedTags.length > 0 && logic.filteredFoldersByTags) {
            return logic.filteredFoldersByTags;
        }
        if (searchQuery && logic.searchFolders) {
            return logic.searchFolders;
        }
        const allFolders = logic.folders || [];
        const currentId = logic.currentFolder ? logic.currentFolder.id : null;
        return allFolders.filter(folder => {
            if (currentId) return folder.parentId === currentId;
            return !folder.parentId;
        });
    }, [logic.folders, logic.currentFolder, logic.searchFolders, searchQuery, logic.selectedTags, logic.filteredFoldersByTags]);

    const activeModalFolder = useMemo(() => {
        if (!folderContentsModalConfig.folder) return null;
        const liveFolder = (logic.folders || []).find(f => f.id === folderContentsModalConfig.folder.id);
        return liveFolder || folderContentsModalConfig.folder;
    }, [logic.folders, folderContentsModalConfig.folder]);

    React.useEffect(() => {
        if (logic.viewMode) localStorage.setItem('dlp_last_viewMode', logic.viewMode);
    }, [logic.viewMode]);

    const hasContent = (logic.subjects || []).length > 0 || displayedFolders.length > 0;

    return {
        isFilterOpen,
        setIsFilterOpen,
        isScaleOverlayOpen,
        setIsScaleOverlayOpen,
        sharedSelectedTags,
        setSharedSelectedTags,
        sharedActiveFilter,
        setSharedActiveFilter,
        sharedAllTags,
        filteredFolders,
        filteredSubjects,
        sharedFolders,
        sharedSubjects,
        folderContentsModalConfig,
        setFolderContentsModalConfig,
        shareConfirm,
        setShareConfirm,
        unshareConfirm,
        setUnshareConfirm,
        topicsModalConfig,
        setTopicsModalConfig,
        displayedFolders,
        activeModalFolder,
        hasContent
    };
};
