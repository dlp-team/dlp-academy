// src/pages/Home.jsx
import React, { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
// Firebase
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
// Logic Hook
import { useHomeLogic } from '../hooks/useHomeLogic';
import { useFolders } from '../hooks/useFolders'; 

    

// Layout & Global Components
import Header from '../components/layout/Header';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import BreadcrumbNav from '../components/home/BreadcrumbNav';
import SharedView from '../components/home/SharedView';

// New Sub-Components
import HomeControls from '../components/home/HomeControls';
import HomeContent from '../components/home/HomeContent';
import HomeEmptyState from '../components/home/HomeEmptyState';
import HomeModals from '../components/home/HomeModals';
import FolderTreeModal from '../components/modals/FolderTreeModal'; 
import SubjectTopicsModal from '../components/modals/SubjectTopicModal';


const isDescendant = (possibleParentId, targetId, allFolders) => {
    if (!possibleParentId || !targetId) return false;
    if (possibleParentId === targetId) return true; 
    let current = allFolders.find(f => f.id === targetId);
    const visited = new Set();
    while (current && current.folderId) {
        if (current.folderId === possibleParentId) return true;
        if (visited.has(current.id)) return false; 
        visited.add(current.id);
        current = allFolders.find(f => f.id === current.folderId);
    }
    return false;
};


const Home = ({ user }) => {
    // Top-level debug: confirm Home is mounted
    React.useEffect(() => {
    }, []);
    // 1. Initialize Logic
    const [searchQuery, setSearchQuery] = useState('');
    const logic = useHomeLogic(user, searchQuery);
    const { moveSubjectToParent, moveFolderToParent, moveSubjectBetweenFolders, updateFolder } = useFolders(user);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isScaleOverlayOpen, setIsScaleOverlayOpen] = useState(false);


    // --- 🤖 AUTO-CLEANER: DETECT & FIX LOOPS AUTOMATICALLY ---
    React.useEffect(() => {
        if (!logic.folders || logic.folders.length === 0) return;

        const allFolders = logic.folders;
        let fixedCount = 0;

        allFolders.forEach(folder => {
            // Trace the path of this folder upwards
            let current = folder;
            const path = new Set();
            
            while (current && current.folderId) {
                // If we see the same ID twice, we found a loop!
                if (path.has(current.id)) {
                    // FORCE MOVE TO ROOT
                    updateDoc(doc(db, 'folders', folder.id), { folderId: null });
                    fixedCount++;
                    break;
                }
                path.add(current.id);
                // Move up to parent
                current = allFolders.find(f => f.id === current.folderId);
            }
        });

        if (fixedCount > 0) {
            alert(`✅ Auto-Cleaner Fixed ${fixedCount} corrupted folders! You can now remove the cleaner code.`);
        }
    }, [logic.folders]);
    // -----------------------------------------------------------

    // Persist last visited tab and folder
    const didRestoreRef = React.useRef(false);
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


    // Helper function to normalize text for comparison
    const normalizeText = (text) => {
        return (text || '')
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };

    // --- SHARED TAG FILTER STATE ---
    const [sharedSelectedTags, setSharedSelectedTags] = useState([]);
    const [sharedActiveFilter, setSharedActiveFilter] = useState('all');
    const sharedAllTags = useMemo(() => {
        const folderTags = (logic.sharedFolders || []).flatMap(f => Array.isArray(f.tags) ? f.tags : []);
        const subjectTags = (logic.sharedSubjects || []).flatMap(s => Array.isArray(s.tags) ? s.tags : []);
        return Array.from(new Set([...folderTags, ...subjectTags])).filter(Boolean);
    }, [logic.sharedFolders, logic.sharedSubjects]);

    const {
        filteredFolders,
        filteredSubjects,
        sharedFolders,
        sharedSubjects,
    } = useMemo(() => {
        const query = normalizeText(searchQuery);

        // Helper to filter by query
        const filterList = (list) => list.filter(item =>
            normalizeText(item.name).includes(query)
        );

        // Filter Main Content
        const folders = logic.currentFolderContents?.folders || logic.folders || [];
        const subjects = logic.currentFolderContents?.subjects || logic.subjects || [];

        // Filter Shared Content (by search)
        let sFolders = logic.sharedFolders || [];
        let sSubjects = logic.sharedSubjects || [];
        sFolders = filterList(sFolders);
        sSubjects = filterList(sSubjects);

        // Further filter shared by selected tags if in shared mode
        if (logic.viewMode === 'shared' && sharedSelectedTags.length > 0) {
            sFolders = sFolders.filter(f => Array.isArray(f.tags) && sharedSelectedTags.every(tag => f.tags.includes(tag)));
            sSubjects = sSubjects.filter(s => Array.isArray(s.tags) && sharedSelectedTags.every(tag => s.tags.includes(tag)));
        }

        return {
            filteredFolders: filterList(folders),
            filteredSubjects: filterList(subjects),
            sharedFolders: sFolders,
            sharedSubjects: sSubjects,
        };
    }, [searchQuery, logic.folders, logic.subjects, logic.currentFolderContents, logic.sharedFolders, logic.sharedSubjects, logic.viewMode, sharedSelectedTags]);


    // ... (State and Filtering Logic omitted for brevity, identical to previous) ...
    // NOTE: Keep all the logic.loading checks, displayedFolders memo, etc.
    const [folderContentsModalConfig, setFolderContentsModalConfig] = useState({ isOpen: false, folder: null });
    // Confirmation overlay state for sharing
    const [shareConfirm, setShareConfirm] = useState({ open: false, subjectId: null, folder: null, onConfirm: null });
    const [unshareConfirm, setUnshareConfirm] = useState({ open: false, subjectId: null, folder: null, onConfirm: null });
    const [topicsModalConfig, setTopicsModalConfig] = useState({ 
        isOpen: false, 
        subject: null 
    });

    const displayedFolders = useMemo(() => {
        // If tag filter is active, use filteredFoldersByTags from logic
        if ((logic.selectedTags && logic.selectedTags.length > 0) && logic.filteredFoldersByTags) {
            return logic.filteredFoldersByTags;
        }
        // If searching, return the flat list of search results
        if (searchQuery && logic.searchFolders) {
            return logic.searchFolders;
        }
        // Standard Hierarchy Logic (Original)
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

    // Persist viewMode and currentFolder changes
    React.useEffect(() => {
        if (logic.viewMode) localStorage.setItem('dlp_last_viewMode', logic.viewMode);
    }, [logic.viewMode]);
    // Removed effect that clears dlp_last_folderId when logic.currentFolder is null

    if (!user || logic.loading || logic.loadingFolders) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    // --- HANDLERS (Same as before) ---
    const handleSaveFolderWrapper = (folderData) => {
        const dataWithParent = { ...folderData, parentId: logic.currentFolder ? logic.currentFolder.id : null };
        logic.handleSaveFolder(dataWithParent);
    };
    const handleUpwardDrop = async (e) => {
        e.preventDefault(); e.stopPropagation();
        const subjectId = e.dataTransfer.getData('subjectId');
        const folderId = e.dataTransfer.getData('folderId');
        if (logic.currentFolder) {
            const currentId = logic.currentFolder.id;
            const parentId = logic.currentFolder.parentId; 
            if (subjectId) {
                await moveSubjectToParent(subjectId, currentId, parentId);
            } else if (folderId && folderId !== currentId) {
                await moveFolderToParent(folderId, currentId, parentId);
            }
        }
    };
    const handleBreadcrumbDrop = (targetFolderId, subjectId, droppedFolderId) => {
        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        // If subject is being dropped, use the same overlay logic as handleDropOnFolderWrapper
        if (subjectId) {
            return handleDropOnFolderWrapper(targetFolderId, subjectId, currentFolderId);
        } else if (droppedFolderId) {
            // For folders, use similar overlay logic as in handleNestFolder, but also handle unsharing logic
            const droppedFolder = (logic.folders || []).find(f => f.id === droppedFolderId);
            if (!droppedFolder) return;
            const currentParentId = droppedFolder.parentId || null;
            const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
            // Helper: get shared user IDs from sharedWithUids (array of strings)
            const getSharedUids = (item) => (item && Array.isArray(item.sharedWithUids)) ? item.sharedWithUids : [];
            // Moving OUT of a shared folder (confirmation required if droppedFolder is shared and target is not)
            if (droppedFolder && droppedFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
                // Only show unshare confirmation if droppedFolder.parentId is not null and parent is shared
                if (droppedFolder.parentId) {
                    const parentFolder = (logic.folders || []).find(f => f.id === droppedFolder.parentId);
                    if (parentFolder && parentFolder.isShared) {
                        setUnshareConfirm({
                            open: true,
                            subjectId: null,
                            folder: droppedFolder,
                            onConfirm: async () => {
                                // --- UNSHARE LOGIC FOR FOLDER (breadcrumb) ---
                                const oldSharedWithUids = Array.isArray(droppedFolder.sharedWithUids) ? droppedFolder.sharedWithUids : [];
                                const oldSharedWith = Array.isArray(droppedFolder.sharedWith) ? droppedFolder.sharedWith : [];
                                // Remove sharing from the folder itself
                                await updateFolder(droppedFolderId, {
                                    sharedWith: [],
                                    sharedWithUids: [],
                                    isShared: false
                                });
                                // Remove sharing from all child subjects
                                if (Array.isArray(droppedFolder.subjectIds)) {
                                    for (const subjectId of droppedFolder.subjectIds) {
                                        const subject = (logic.subjects || []).find(s => s.id === subjectId);
                                        if (subject) {
                                            const newSharedWith = (subject.sharedWith || []).filter(u => !oldSharedWithUids.includes(u.uid));
                                            const newSharedWithUids = (subject.sharedWithUids || []).filter(uid => !oldSharedWithUids.includes(uid));
                                            await updateDoc(doc(db, 'subjects', subjectId), {
                                                sharedWith: newSharedWith,
                                                sharedWithUids: newSharedWithUids,
                                                isShared: newSharedWithUids.length > 0
                                            });
                                        }
                                    }
                                }
                                await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                                setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                            }
                        });
                        return true;
                    }
                }
            }
            // Only show confirmation if there is a new user who will gain access (moving INTO a shared folder)
            if (targetFolder && targetFolder.isShared) {
                const droppedShared = new Set(getSharedUids(droppedFolder));
                const targetShared = getSharedUids(targetFolder);
                const newUsers = targetShared.filter(uid => !droppedShared.has(uid));
                if (newUsers.length > 0) {
                    setShareConfirm({
                        open: true,
                        folder: targetFolder,
                        subjectId: null,
                        onConfirm: async () => {
                            await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                            setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                        }
                    });
                    return true;
                }
            }
            // Otherwise, move immediately
            moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
            return false;
        }
    };
    const handleOpenTopics = (subject) => {
        setTopicsModalConfig({ isOpen: true, subject });
    };
    const handleDropOnFolderWrapper = (targetFolderId, subjectId, sourceFolderId) => {
        // Use passed sourceFolderId if provided, otherwise fallback to currentFolder
        const currentFolderId = sourceFolderId !== undefined ? sourceFolderId : (logic.currentFolder ? logic.currentFolder.id : null);
        if (targetFolderId === currentFolderId) {
            return;
        }
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
        const sourceFolder = (logic.folders || []).find(f => f.id === currentFolderId);
        const subject = (logic.subjects || []).find(s => s.id === subjectId);

        // Helper: get shared user IDs from sharedWithUids (array of strings)
        const getSharedUids = (item) => (item && Array.isArray(item.sharedWithUids)) ? item.sharedWithUids : [];

        const sourceIsShared = sourceFolder ? sourceFolder.isShared : undefined;
        const targetIsShared = targetFolder ? targetFolder.isShared : undefined;
        const subjectSharedWithUids = getSharedUids(subject);
        const targetFolderSharedWithUids = getSharedUids(targetFolder);

        if (
            sourceFolder &&
            sourceFolder.isShared &&
            (!targetFolder || !targetFolder.isShared) &&
            Array.isArray(sourceFolder.subjectIds) &&
            sourceFolder.subjectIds.includes(subjectId)
        ) {
            // Check if sourceFolder has a parentId and if that parent is shared
            const parentFolder = sourceFolder.parentId ? (logic.folders || []).find(f => f.id === sourceFolder.parentId) : null;
            if (parentFolder && parentFolder.isShared) {
                
                setUnshareConfirm({
                    open: true,
                    subjectId,
                    folder: sourceFolder,
                    onConfirm: async () => {
                        await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
                        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
                return true;
            }
        }

        // Only show confirmation if there is a new user who will gain access
        if (targetFolder && targetFolder.isShared) {
            const subjectShared = new Set(subjectSharedWithUids);
            const folderShared = targetFolderSharedWithUids;
            const newUsers = folderShared.filter(uid => !subjectShared.has(uid));
            if (newUsers.length > 0) {
                setShareConfirm({
                    open: true,
                    subjectId,
                    folder: targetFolder,
                    onConfirm: async () => {
                        await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
                        setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
                return true;
            }
        }
        moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
        return false;
    };

    const handleNestFolder = async (targetFolderId, droppedFolderId) => {
        if (targetFolderId === droppedFolderId) return;


        if (isDescendant(droppedFolderId, targetFolderId, logic.folders || [])) {
            console.warn("🚫 BLOCKED: Circular dependency detected.");
            return;
        }


        const droppedFolder = (logic.folders || []).find(f => f.id === droppedFolderId);
        if (!droppedFolder) return;
        const currentParentId = droppedFolder.parentId || null;
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);

        // Helper: get shared user IDs from sharedWithUids (array of strings)
        const getSharedUids = (item) => (item && Array.isArray(item.sharedWithUids)) ? item.sharedWithUids : [];


        // Only show unshare confirmation if droppedFolder has a parentId and that parent is shared
        if (
            droppedFolder &&
            droppedFolder.isShared &&
            (!targetFolder || !targetFolder.isShared) &&
            droppedFolder.parentId
        ) {
            const parentFolder = (logic.folders || []).find(f => f.id === droppedFolder.parentId);
            if (parentFolder && parentFolder.isShared) {
                setUnshareConfirm({
                    open: true,
                    subjectId: null,
                    folder: droppedFolder,
                    onConfirm: async () => {
                        // --- UNSHARE LOGIC FOR FOLDER (move out of shared parent) ---
                        const oldSharedWithUids = Array.isArray(droppedFolder.sharedWithUids) ? droppedFolder.sharedWithUids : [];
                        const oldSharedWith = Array.isArray(droppedFolder.sharedWith) ? droppedFolder.sharedWith : [];
                        await updateFolder(droppedFolderId, {
                            sharedWith: [],
                            sharedWithUids: [],
                            isShared: false
                        });
                        // Remove sharing from all child subjects
                        if (Array.isArray(droppedFolder.subjectIds)) {
                            for (const subjectId of droppedFolder.subjectIds) {
                                const subject = (logic.subjects || []).find(s => s.id === subjectId);
                                if (subject) {
                                    const newSharedWith = (subject.sharedWith || []).filter(u => !oldSharedWithUids.includes(u.uid));
                                    const newSharedWithUids = (subject.sharedWithUids || []).filter(uid => !oldSharedWithUids.includes(uid));
                                    await updateDoc(doc(db, 'subjects', subjectId), {
                                        sharedWith: newSharedWith,
                                        sharedWithUids: newSharedWithUids,
                                        isShared: newSharedWithUids.length > 0
                                    });
                                }
                            }
                        }
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
                return;
            }
        }

        // Only show confirmation if there is a new user who will gain access (moving INTO a shared folder)
        if (targetFolder && targetFolder.isShared) {
            const droppedShared = new Set(getSharedUids(droppedFolder));
            const targetShared = getSharedUids(targetFolder);
            const newUsers = targetShared.filter(uid => !droppedShared.has(uid));
            if (newUsers.length > 0) {
                // Show confirmation overlay for folder sharing
                setShareConfirm({
                    open: true,
                    folder: targetFolder,
                    subjectId: null,
                    onConfirm: async () => {
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
                return;
            }
        }
        // If no overlay, just move the folder and DO NOT change its shared state
        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId, { preserveSharing: true });
    };
    const handlePromoteSubjectWrapper = async (subjectId) => {
        // Find current folder and subject
        const currentFolder = logic.currentFolder;
        const parentId = currentFolder ? currentFolder.parentId : null;
        const sourceFolder = currentFolder;
        const subject = (logic.subjects || []).find(s => s.id === subjectId);
        // Helper: get shared user IDs from sharedWithUids (array of strings)
        const getSharedUids = (item) => (item && Array.isArray(item.sharedWithUids)) ? item.sharedWithUids : [];
        const sourceIsShared = sourceFolder ? sourceFolder.isShared : undefined;
        let targetFolder = null;
        if (parentId) {
            targetFolder = (logic.folders || []).find(f => f.id === parentId);
        }
        const targetIsShared = targetFolder ? targetFolder.isShared : undefined;

        // If moving out of a shared folder to a non-shared folder or to root (parentId null), show confirmation
        if (sourceFolder && sourceFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
            setUnshareConfirm({
                open: true,
                subjectId,
                folder: sourceFolder,
                onConfirm: async () => {
                    await moveSubjectToParent(subjectId, currentFolder.id, parentId);
                    setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                }
            });
            return;
        }
        // Otherwise, move immediately
        if (currentFolder) await moveSubjectToParent(subjectId, currentFolder.id, parentId);
    };
    const handlePromoteFolderWrapper = async (folderId) => {
        if (logic.currentFolder && folderId !== logic.currentFolder.id) {
            const currentFolder = logic.currentFolder;
            const parentId = currentFolder.parentId;
            const sourceFolder = currentFolder;
            let targetFolder = null;
            if (parentId) {
                targetFolder = (logic.folders || []).find(f => f.id === parentId);
            }
            // If moving out of a shared folder to a non-shared folder or to root (parentId null), show confirmation
            if (sourceFolder && sourceFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
                setUnshareConfirm({
                    open: true,
                    subjectId: null,
                    folder: sourceFolder,
                    onConfirm: async () => {
                        // --- UNSHARE LOGIC FOR FOLDER ---
                        // Remove all users from sharedWith/sharedWithUids that were only present due to the previous parent
                        const oldSharedWithUids = Array.isArray(sourceFolder.sharedWithUids) ? sourceFolder.sharedWithUids : [];
                        const oldSharedWith = Array.isArray(sourceFolder.sharedWith) ? sourceFolder.sharedWith : [];
                        // Remove sharing from the folder itself
                        await updateFolder(folderId, {
                            sharedWith: [],
                            sharedWithUids: [],
                            isShared: false
                        });
                        // Remove sharing from all child subjects
                        const folder = (logic.folders || []).find(f => f.id === folderId);
                        if (folder && Array.isArray(folder.subjectIds)) {
                            for (const subjectId of folder.subjectIds) {
                                const subject = (logic.subjects || []).find(s => s.id === subjectId);
                                if (subject) {
                                    const newSharedWith = (subject.sharedWith || []).filter(u => !oldSharedWithUids.includes(u.uid));
                                    const newSharedWithUids = (subject.sharedWithUids || []).filter(uid => !oldSharedWithUids.includes(uid));
                                    await updateDoc(doc(db, 'subjects', subjectId), {
                                        sharedWith: newSharedWith,
                                        sharedWithUids: newSharedWithUids,
                                        isShared: newSharedWithUids.length > 0
                                    });
                                }
                            }
                        }
                        await moveFolderToParent(folderId, currentFolder.id, parentId);
                        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
                return;
            }
            await moveFolderToParent(folderId, currentFolder.id, parentId);
        }
    };
    const handleShowFolderContents = (folder) => { setFolderContentsModalConfig({ isOpen: true, folder }); };
    const handleNavigateFromTree = (folder) => {
        setFolderContentsModalConfig({ isOpen: false, folder: null });
        logic.setCurrentFolder(folder);
        if (folder && folder.id) {
            localStorage.setItem('dlp_last_folderId', folder.id);
        }
        if (!folder) {
            localStorage.removeItem('dlp_last_folderId');
        }
    };
    const handleNavigateSubjectFromTree = (subject) => { setFolderContentsModalConfig({ isOpen: false, folder: null }); logic.navigate(`/home/subject/${subject.id}`); };
    
    // EXPOSE THIS
    const handleTreeMoveSubject = async (subjectId, targetFolderId, sourceFolderId) => {
        await moveSubjectBetweenFolders(subjectId, sourceFolderId, targetFolderId);
    };
    
    const handleTreeReorderSubject = async (folderId, subjectId, newIndex) => {
        if (logic.currentFolder && folderId === logic.currentFolder.id) {
             if (logic.handleDropReorderSubject) logic.handleDropReorderSubject(subjectId, newIndex); 
        }
    };

    const hasContent = (logic.subjects || []).length > 0 || displayedFolders.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors">
            <Header user={user} />
            <OnboardingWizard user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Drag Up Zone (Omitted for brevity, logic same) */}
                <div 
                    className="relative transition-all duration-300"
                    onDragOver={(e) => {
                        if (logic.currentFolder) e.preventDefault();
                    }}
                    onDrop={(e) => {

                        handleUpwardDrop(e);
                    }}
                >
                    <HomeControls 
                        viewMode={logic.viewMode}
                        setViewMode={(mode) => {
                            logic.setViewMode(mode);
                            if (mode) localStorage.setItem('dlp_last_viewMode', mode);
                        }}
                        layoutMode={logic.layoutMode}
                        setLayoutMode={logic.setLayoutMode}
                        cardScale={logic.cardScale}
                        setCardScale={logic.setCardScale}
                        allTags={logic.viewMode === 'shared' ? sharedAllTags : (logic.allTags || [])}
                        selectedTags={logic.viewMode === 'shared' ? sharedSelectedTags : (logic.selectedTags || [])}
                        setSelectedTags={logic.viewMode === 'shared' ? setSharedSelectedTags : logic.setSelectedTags}
                        currentFolder={logic.currentFolder}
                        setFolderModalConfig={logic.setFolderModalConfig}
                        { ...(logic.setCollapsedGroups ? { setCollapsedGroups: logic.setCollapsedGroups } : {}) }
                        setCurrentFolder={(folder) => {
                            logic.setCurrentFolder(folder);
                            if (folder && folder.id) {
                                localStorage.setItem('dlp_last_folderId', folder.id);
                            }
                            if (!folder) {
                                localStorage.removeItem('dlp_last_folderId');
                            }
                        }}
                        isDragAndDropEnabled={logic.isDragAndDropEnabled}
                        draggedItem={logic.draggedItem}
                        draggedItemType={logic.draggedItemType}
                        onPreferenceChange={logic.handlePreferenceChange}
                        allFolders={logic.folders || []} 
                        activeFilter={logic.viewMode === 'shared' ? sharedActiveFilter : logic.activeFilter}
                        handleFilterChange={logic.handleFilterChange}
                        onFilterOverlayChange={setIsFilterOpen}
                        onScaleOverlayChange={setIsScaleOverlayOpen}

                        // SEARCH
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                    
                </div>

                {logic.viewMode === 'shared' ? (
                    <SharedView 
                        sharedFolders={sharedFolders}
                        sharedSubjects={sharedSubjects}
                        cardScale={logic.cardScale}
                        allFolders={logic.folders || []}
                        
                        layoutMode={logic.layoutMode} 

                        // Handlers
                        onOpenFolder={logic.handleOpenFolder}
                        onSelectSubject={(subject) => {
                            logic.touchSubject(subject.id);
                            logic.navigate(`/home/subject/${subject.id}`);
                        }}
                        
                        // UI State
                        activeMenu={logic.activeMenu}
                        onToggleMenu={logic.setActiveMenu}
                        flippedSubjectId={logic.flippedSubjectId}
                        onFlipSubject={logic.setFlippedSubjectId}
                        
                        // Navigation
                        onSelectTopic={(sid, tid) => logic.navigate(`/home/subject/${sid}/topic/${tid}`)}
                        navigate={logic.navigate}

                        // Search
                        searchTerm={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                ) : (
                    <>
                        {/* Overlay for sharing confirmation when moving subject into shared folder */}
                        {shareConfirm.open && (
                            <div className="fixed inset-0 z-51 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>
                                    </div>
                                    {(() => {
                                        const isFolder = !shareConfirm.subjectId;
                                        const itemType = isFolder ? 'carpeta' : 'asignatura';
                                        const itemName = isFolder ? (shareConfirm.folder?.name || '') : (() => {
                                            // Find subject name if possible
                                            // Try to get from logic.subjects
                                            if (shareConfirm.subjectId && logic.subjects) {
                                                const subj = logic.subjects.find(s => s.id === shareConfirm.subjectId);
                                                return subj ? subj.name : '';
                                            }
                                            return '';
                                        })();
                                        const folderName = shareConfirm.folder?.name || '';
                                        return (
                                            <>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                    Vas a mover la {itemType} <span className="font-semibold">"{itemName}"</span> a una carpeta compartida
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                                    Esto hará que la {itemType} también sea compartida automáticamente con las mismas personas que tienen acceso a la carpeta <span className="font-semibold">"{folderName}"</span>.<br />¿Deseas continuar?
                                                </p>
                                            </>
                                        );
                                    })()}
                                    <div className="flex justify-center gap-4">
                                        <button
                                            className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null })}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                            onClick={shareConfirm.onConfirm}
                                        >
                                            Sí, compartir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {unshareConfirm.open && (
                        <div className="fixed inset-0 z-51 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>
                            </div>
                            {(() => {
                                const isFolder = !unshareConfirm.subjectId;
                                const itemType = isFolder ? 'carpeta' : 'asignatura';
                                const itemName = isFolder ? (unshareConfirm.folder?.name || '') : (() => {
                                    // Find subject name if possible
                                    if (unshareConfirm.subjectId && logic.subjects) {
                                        const subj = logic.subjects.find(s => s.id === unshareConfirm.subjectId);
                                        return subj ? subj.name : '';
                                    }
                                    return '';
                                })();
                                const folderName = unshareConfirm.folder?.name || '';
                                return (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            Vas a mover la {itemType} <span className="font-semibold">"{itemName}"</span> fuera de una carpeta compartida
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                                            Esto hará que la {itemType} deje de estar compartida automáticamente con las personas que tenían acceso a la carpeta <span className="font-semibold">"{folderName}"</span>.<br />¿Deseas continuar?
                                        </p>
                                    </>
                                );
                            })()}
                            <div className="flex justify-center gap-4">
                                <button
                                className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null })}
                                >
                                Cancelar
                                </button>
                                <button
                                className="px-6 py-2 rounded-xl bg-yellow-600 text-white font-bold shadow-lg hover:bg-yellow-700 transition-colors"
                                onClick={unshareConfirm.onConfirm}
                                >
                                Sí, dejar de compartir
                                </button>
                            </div>
                            </div>
                        </div>
                        )}
                        <BreadcrumbNav 
                            currentFolder={logic.currentFolder} 
                            onNavigate={(folder) => {
                                logic.setCurrentFolder(folder);
                                if (folder && folder.id) localStorage.setItem('dlp_last_folderId', folder.id);
                                if (!folder) localStorage.removeItem('dlp_last_folderId');
                            }}
                            allFolders={logic.folders || []}
                            onDropOnBreadcrumb={handleBreadcrumbDrop}
                            draggedItem={logic.draggedItem}
                        />

                        {logic.loading ? (
                             <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {hasContent ? (
                                    <HomeContent 
                                        subjects={logic.subjects || []}
                                        folders={logic.folders || []}
                                        groupedContent={logic.groupedContent || {}} 
                                        collapsedGroups={logic.collapsedGroups || {}}
                                        orderedFolders={displayedFolders}
                                        
                                        layoutMode={logic.layoutMode || 'grid'}
                                        cardScale={logic.cardScale || 100}
                                        viewMode={logic.viewMode}
                                        currentFolder={logic.currentFolder}
                                        
                                        activeMenu={logic.activeMenu}
                                        setActiveMenu={logic.setActiveMenu}
                                        toggleGroup={logic.toggleGroup}
                                        
                                        setSubjectModalConfig={logic.setSubjectModalConfig}
                                        setFolderModalConfig={logic.setFolderModalConfig}
                                        setDeleteConfig={logic.setDeleteConfig}
                                        
                                        handleSelectSubject={(id) => logic.navigate(`/home/subject/${id}`)}
                                        handleOpenFolder={(folder) => {
                                            logic.setCurrentFolder(folder);
                                            if (folder && folder.id) {
                                                localStorage.setItem('dlp_last_folderId', folder.id);
                                            }
                                            if (!folder) {
                                                localStorage.removeItem('dlp_last_folderId');
                                            }
                                        }}
                                        handleShareFolder={logic.handleShareFolder}
                                        handlePromoteSubject={handlePromoteSubjectWrapper}
                                        handlePromoteFolder={handlePromoteFolderWrapper}
                                        handleDropOnFolder={handleDropOnFolderWrapper}
                                        handleNestFolder={handleNestFolder}
                                        handleShowFolderContents={handleShowFolderContents}
                                        onShareSubject={(subject) => logic.setSubjectModalConfig({ isOpen: true, isEditing: true, data: subject, initialTab: 'sharing' })}
                                        
                                        handleMoveSubjectWithSource={handleTreeMoveSubject}
                                        onOpenTopics={handleOpenTopics}
                                        
                                        isDragAndDropEnabled={logic.isDragAndDropEnabled}
                                        draggedItem={logic.draggedItem}
                                        draggedItemType={logic.draggedItemType}
                                        handleDragStartSubject={logic.handleDragStartSubject}
                                        handleDragStartFolder={logic.handleDragStartFolder}
                                        handleDragEnd={logic.handleDragEnd}
                                        handleDragOverSubject={logic.handleDragOverSubject}
                                        handleDragOverFolder={logic.handleDragOverFolder}
                                        handleDropReorderSubject={logic.handleDropReorderSubject}
                                        handleDropReorderFolder={logic.handleDropReorderFolder}
                                        filterOverlayOpen={isFilterOpen || isScaleOverlayOpen}

                                        
                                        activeFilter={logic.activeFilter}
                                        selectedTags={logic.viewMode === 'shared' ? sharedSelectedTags : (logic.selectedTags || [])}
                                        
                                        navigate={logic.navigate}
                                    />
                                ) : searchQuery ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="text-6xl mb-4">🔍</div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            No se encontraron resultados
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                                            No hay asignaturas o carpetas que coincidan con "<span className="font-semibold">{searchQuery}</span>"
                                        </p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                                        >
                                            Limpiar búsqueda
                                        </button>
                                    </div>
                                ) : (
                                    <HomeEmptyState 
                                        setSubjectModalConfig={logic.setSubjectModalConfig}
                                        setFolderModalConfig={logic.setFolderModalConfig}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </main>

            <HomeModals 
                subjectModalConfig={logic.subjectModalConfig}
                setSubjectModalConfig={logic.setSubjectModalConfig}
                folderModalConfig={logic.folderModalConfig}
                setFolderModalConfig={logic.setFolderModalConfig}
                deleteConfig={logic.deleteConfig}
                setDeleteConfig={logic.setDeleteConfig}
                handleSaveSubject={logic.handleSaveSubject}
                handleSaveFolder={handleSaveFolderWrapper}
                handleShareFolder={logic.handleShareFolder}
                handleDelete={logic.handleDelete}
                onShare={logic.shareFolder}
                onUnshare={logic.unshareFolder}
                onShareSubject={logic.shareSubject}
                onUnshareSubject={logic.unshareSubject}
                currentFolder={logic.currentFolder}
                allFolders={logic.folders || []}
            />
            
            <FolderTreeModal 
                isOpen={folderContentsModalConfig.isOpen}
                onClose={() => setFolderContentsModalConfig({ isOpen: false, folder: null })}
                rootFolder={activeModalFolder}
                allFolders={logic.folders || []}
                allSubjects={logic.subjects || []}
                onNavigateFolder={(folder) => {
                    handleNavigateFromTree(folder);
                    if (folder && folder.id) {
                        localStorage.setItem('dlp_last_folderId', folder.id);
                    }
                    if (!folder) {
                        localStorage.removeItem('dlp_last_folderId');
                    }
                }}
                onNavigateSubject={handleNavigateSubjectFromTree}
                onMoveSubjectToFolder={handleTreeMoveSubject}
                onNestFolder={logic.handleNestFolder}
                onReorderSubject={handleTreeReorderSubject}
                onDropWithOverlay={handleDropOnFolderWrapper}
            />

            <SubjectTopicsModal 
                isOpen={topicsModalConfig.isOpen}
                onClose={() => setTopicsModalConfig({ ...topicsModalConfig, isOpen: false })}
                subject={topicsModalConfig.subject}
            />
            
        </div>
    );
};

export default Home;