// src/pages/Home.jsx
import React, { useMemo, useState } from 'react';
import { Loader2, ArrowUpCircle } from 'lucide-react';
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

const Home = ({ user }) => {
    // Top-level debug: confirm Home is mounted
    React.useEffect(() => {
        console.log('[DEBUG] Home component mounted');
    }, []);
    // 1. Initialize Logic
    const [searchQuery, setSearchQuery] = useState('');
    const logic = useHomeLogic(user, searchQuery);
    const { moveSubjectToParent, moveFolderToParent, moveSubjectBetweenFolders } = useFolders(user);


    // Helper function to normalize text for comparison
    const normalizeText = (text) => {
        return (text || '')
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };

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
        // We look at the current folder contents OR the root lists
        const folders = logic.currentFolderContents?.folders || logic.folders || [];
        const subjects = logic.currentFolderContents?.subjects || logic.subjects || [];
        
        // Filter Shared Content
        // If logic.sharedFolders is undefined, we default to [] to prevent crashes
        const sFolders = logic.sharedFolders || [];
        const sSubjects = logic.sharedSubjects || [];

        return {
            filteredFolders: filterList(folders),
            filteredSubjects: filterList(subjects),
            sharedFolders: filterList(sFolders),
            sharedSubjects: filterList(sSubjects),
        };
    }, [searchQuery, logic.folders, logic.subjects, logic.currentFolderContents, logic.sharedFolders, logic.sharedSubjects]);


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
        const allFolders = logic.folders || [];
        const currentId = logic.currentFolder ? logic.currentFolder.id : null;
        return allFolders.filter(folder => {
            const parentId = folder.parentId || null;
            return parentId === currentId;
        });
    }, [logic.folders, logic.currentFolder]);
    const activeModalFolder = useMemo(() => {
        if (!folderContentsModalConfig.folder) return null;
        const liveFolder = (logic.folders || []).find(f => f.id === folderContentsModalConfig.folder.id);
        return liveFolder || folderContentsModalConfig.folder;
    }, [logic.folders, folderContentsModalConfig.folder]);

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
        console.log('[DEBUG] handleUpwardDrop called');
        e.preventDefault(); e.stopPropagation();
        const subjectId = e.dataTransfer.getData('subjectId');
        const folderId = e.dataTransfer.getData('folderId');
        if (logic.currentFolder) {
            const currentId = logic.currentFolder.id;
            const parentId = logic.currentFolder.parentId; 
            if (subjectId) {
                console.log('[DEBUG] handleUpwardDrop: moving subject', { subjectId, currentId, parentId });
                await moveSubjectToParent(subjectId, currentId, parentId);
            } else if (folderId && folderId !== currentId) {
                console.log('[DEBUG] handleUpwardDrop: moving folder', { folderId, currentId, parentId });
                await moveFolderToParent(folderId, currentId, parentId);
            }
        }
    };
    const handleBreadcrumbDrop = async (targetFolderId, subjectId, droppedFolderId) => {
        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        if (subjectId) await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
        else if (droppedFolderId) {
            const droppedFolderObj = (logic.folders || []).find(f => f.id === droppedFolderId);
            if (!droppedFolderObj) return;
            const oldParentId = droppedFolderObj.parentId || null;
            await moveFolderToParent(droppedFolderId, oldParentId, targetFolderId);
        }
    };
    const handleOpenTopics = (subject) => {
        setTopicsModalConfig({ isOpen: true, subject });
    };
    const handleDropOnFolderWrapper = async (targetFolderId, subjectId) => {
        console.log('[DEBUG] handleDropOnFolderWrapper ENTRY', { targetFolderId, subjectId });
        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        console.log('[DEBUG] currentFolderId:', currentFolderId);
        if (targetFolderId === currentFolderId) {
            console.log('[DEBUG] targetFolderId === currentFolderId, returning');
            return;
        }
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
        const sourceFolder = (logic.folders || []).find(f => f.id === currentFolderId);
        const subject = (logic.subjects || []).find(s => s.id === subjectId);
        console.log('[DEBUG] Folders and subject:', { targetFolder, sourceFolder, subject });

        // Helper: get shared user IDs from sharedWithUids (array of strings)
        const getSharedUids = (item) => (item && Array.isArray(item.sharedWithUids)) ? item.sharedWithUids : [];

        const sourceIsShared = sourceFolder ? sourceFolder.isShared : undefined;
        const targetIsShared = targetFolder ? targetFolder.isShared : undefined;
        const subjectSharedWithUids = getSharedUids(subject);
        const targetFolderSharedWithUids = getSharedUids(targetFolder);
        console.log('[DEBUG] Sharing info:', { sourceIsShared, targetIsShared, subjectSharedWithUids, targetFolderSharedWithUids });

        // Moving OUT of a shared folder (confirmation required if source is shared and target is not)
        console.log('[DEBUG] handleDropOnFolderWrapper: Checking exit (out of shared folder) case', {
            sourceFolder,
            sourceIsShared,
            targetFolder,
            targetIsShared,
            currentFolderId,
            targetFolderId
        });
        if (sourceFolder && sourceFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
            console.log('[DEBUG] handleDropOnFolderWrapper: Condition met: EXIT branch (sourceFolder is shared and targetFolder is not). Triggering unshareConfirm overlay.', {
                sourceFolder,
                targetFolder
            });
            setUnshareConfirm({
                open: true,
                subjectId,
                folder: sourceFolder,
                onConfirm: async () => {
                    console.log('[DEBUG] handleDropOnFolderWrapper: unshareConfirm onConfirm triggered (EXIT branch)');
                    await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
                    setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                }
            });
            return;
        }

        // Only show confirmation if there is a new user who will gain access
        if (targetFolder && targetFolder.isShared) {
            const subjectShared = new Set(subjectSharedWithUids);
            const folderShared = targetFolderSharedWithUids;
            const newUsers = folderShared.filter(uid => !subjectShared.has(uid));
            console.log('[DEBUG] Checking for new users to share:', { subjectShared: Array.from(subjectShared), folderShared, newUsers });
            if (newUsers.length > 0) {
                console.log('[DEBUG] Condition met: new users found. Triggering shareConfirm overlay.');
                setShareConfirm({
                    open: true,
                    subjectId,
                    folder: targetFolder,
                    onConfirm: async () => {
                        console.log('[DEBUG] shareConfirm onConfirm triggered');
                        await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
                        setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
                return;
            }
        }
        console.log('[DEBUG] No confirmation needed, moving subject');
            const handleDragStart = (e) => {
                console.log('[DEBUG] Drag started', { event: e });
            };
        await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
            const handleDragEnd = (e) => {
                console.log('[DEBUG] Drag ended', { event: e });
            };
    };

    const handleNestFolder = async (targetFolderId, droppedFolderId) => {
        if (targetFolderId === droppedFolderId) return;
        const droppedFolder = (logic.folders || []).find(f => f.id === droppedFolderId);
        if (!droppedFolder) return;
        const currentParentId = droppedFolder.parentId || null;
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);

        // Helper: get shared user IDs from sharedWithUids (array of strings)
        const getSharedUids = (item) => (item && Array.isArray(item.sharedWithUids)) ? item.sharedWithUids : [];

        // Debugging output
        console.log('[DEBUG] handleNestFolder:', {
            targetFolderId,
            droppedFolderId,
            droppedFolder,
            targetFolder,
            droppedIsShared: droppedFolder ? droppedFolder.isShared : undefined,
            targetIsShared: targetFolder ? targetFolder.isShared : undefined,
            droppedSharedWithUids: getSharedUids(droppedFolder),
            targetFolderSharedWithUids: getSharedUids(targetFolder),
        });

        // Moving OUT of a shared folder (confirmation required if droppedFolder is shared and target is not)
        if (droppedFolder && droppedFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
            console.log('[DEBUG] Triggering unshareConfirm overlay (folder)');
            setUnshareConfirm({
                open: true,
                subjectId: null,
                folder: droppedFolder,
                onConfirm: async () => {
                    await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                    setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                }
            });
            return;
        }

        // Only show confirmation if there is a new user who will gain access (moving INTO a shared folder)
        if (targetFolder && targetFolder.isShared) {
            const droppedShared = new Set(getSharedUids(droppedFolder));
            const targetShared = getSharedUids(targetFolder);
            const newUsers = targetShared.filter(uid => !droppedShared.has(uid));
            console.log('[DEBUG] Checking for new users to share (folder):', { droppedShared: Array.from(droppedShared), targetShared, newUsers });
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
        console.log('[DEBUG] No confirmation needed, moving folder');
        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
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
        // Debug: Log promote subject context
        console.log('[DEBUG][handlePromoteSubjectWrapper]', {
            currentFolder,
            parentId,
            sourceFolder,
            targetFolder,
            sourceIsShared,
            targetIsShared
        });
        // If moving out of a shared folder to a non-shared folder or to root (parentId null), show confirmation
        if (sourceFolder && sourceFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
            console.log('[DEBUG][handlePromoteSubjectWrapper] Triggering unshareConfirm overlay');
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
    const handleNavigateFromTree = (folder) => { setFolderContentsModalConfig({ isOpen: false, folder: null }); logic.setCurrentFolder(folder); };
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
                        console.log('[DEBUG] Main drop zone onDragOver', {
                            event: e,
                            currentFolder: logic.currentFolder
                        });
                        if (logic.currentFolder) e.preventDefault();
                    }}
                    onDrop={(e) => {
                        console.log('[DEBUG] Main drop zone onDrop', {
                            event: e,
                            currentFolder: logic.currentFolder,
                            dataTransfer: e.dataTransfer ? {
                                types: e.dataTransfer.types,
                                subjectId: e.dataTransfer.getData('subjectId'),
                                folderId: e.dataTransfer.getData('folderId')
                            } : null
                        });
                        handleUpwardDrop(e);
                    }}
                >
                    <HomeControls 
                        viewMode={logic.viewMode}
                        setViewMode={logic.setViewMode}
                        layoutMode={logic.layoutMode}
                        setLayoutMode={logic.setLayoutMode}
                        cardScale={logic.cardScale}
                        setCardScale={logic.setCardScale}
                        allTags={logic.allTags || []}
                        selectedTags={logic.selectedTags || []}
                        setSelectedTags={logic.setSelectedTags}
                        currentFolder={logic.currentFolder}
                        setFolderModalConfig={logic.setFolderModalConfig}
                        setCollapsedGroups={logic.setCollapsedGroups}
                        setCurrentFolder={logic.setCurrentFolder}
                        isDragAndDropEnabled={logic.isDragAndDropEnabled}
                        draggedItem={logic.draggedItem}
                        draggedItemType={logic.draggedItemType}
                        onPreferenceChange={logic.handlePreferenceChange}
                        allFolders={logic.folders || []} 
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
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
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
                            onNavigate={logic.setCurrentFolder}
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
                                        handleOpenFolder={logic.setCurrentFolder}
                                        handleShareFolder={logic.handleShareFolder}
                                        handlePromoteSubject={handlePromoteSubjectWrapper}
                                        handlePromoteFolder={handlePromoteFolderWrapper}
                                        handleDropOnFolder={handleDropOnFolderWrapper}
                                        handleNestFolder={handleNestFolder}
                                        handleShowFolderContents={handleShowFolderContents}
                                        onShareSubject={(subject) => logic.setSubjectModalConfig({ isOpen: true, isEditing: true, data: subject, initialTab: 'sharing' })}
                                        
                                        // NEW: Pass the robust move handler
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
                onNavigateFolder={handleNavigateFromTree}
                onNavigateSubject={handleNavigateSubjectFromTree}
                onMoveSubjectToFolder={handleTreeMoveSubject}
                onNestFolder={handleNestFolder}
                onReorderSubject={handleTreeReorderSubject}
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