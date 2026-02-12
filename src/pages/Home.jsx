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
            // NEW: Confirmation overlay state for moving folder out of shared folder
    const [unshareFolderConfirm, setUnshareFolderConfirm] = useState({ open: false, folderId: null, sourceFolder: null, onUnshare: null, onKeepShared: null });
    const [folderContentsModalConfig, setFolderContentsModalConfig] = useState({ isOpen: false, folder: null });
    const [topicsModalConfig, setTopicsModalConfig] = useState({ 
        isOpen: false, 
        subject: null 
    });
    // Confirmation overlay state for sharing
    const [shareConfirm, setShareConfirm] = useState({ open: false, subjectId: null, folder: null, onConfirm: null });
    const [unshareConfirm, setUnshareConfirm] = useState({ open: false, subjectId: null, folder: null, onConfirm: null });
    // NEW: Confirmation overlay state for nesting folder into shared folder
    const [shareFolderConfirm, setShareFolderConfirm] = useState({ open: false, folderId: null, targetFolder: null, onConfirm: null });
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

    // Handler for moving folder with confirmation overlays
    const handleDropOnFolderWrapper = async (targetFolderId, droppedFolderId) => {
        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        if (targetFolderId === currentFolderId) return;
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
        // Check if dropped item is a subject or folder
        const droppedSubject = (logic.subjects || []).find(s => s.id === droppedFolderId);
        if (droppedSubject) {
            // Subject drag-and-drop
            const currentParentId = droppedSubject.parentId || null;
            let sourceFolder = null;
            if (currentParentId) {
                try {
                    const parentSnap = await window.firebase.firestore().collection('folders').doc(currentParentId).get();
                    if (parentSnap.exists) {
                        sourceFolder = { id: currentParentId, ...parentSnap.data() };
                    }
                } catch (e) {
                    console.error('Error fetching parent folder from Firestore:', e);
                }
            }
            // Moving OUT of a shared folder
            if (sourceFolder && sourceFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
                setUnshareConfirm({
                    open: true,
                    subjectId: droppedSubject.id,
                    folder: sourceFolder,
                    onConfirm: async () => {
                        await moveSubjectToParent(droppedSubject.id, currentParentId, targetFolderId);
                        await window.firebase.firestore().collection('subjects').doc(droppedSubject.id).update({
                            sharedWith: [],
                            sharedWithUids: [],
                            isShared: false,
                            updatedAt: new Date()
                        });
                        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
            } else if (targetFolder && targetFolder.isShared) {
                // Use Firestore SDK
                const { doc, updateDoc } = await import('firebase/firestore');
                const { db } = await import('../firebase/config');
                setShareConfirm({
                    open: true,
                    subjectId: droppedSubject.id,
                    folder: targetFolder,
                    onConfirm: async () => {
                        await moveSubjectToParent(droppedSubject.id, currentParentId, targetFolderId);
                        const subjectRef = doc(db, 'subjects', droppedSubject.id);
                        await updateDoc(subjectRef, {
                            sharedWith: targetFolder.sharedWith || [],
                            sharedWithUids: targetFolder.sharedWithUids || [],
                            isShared: true,
                            updatedAt: new Date()
                        });
                        setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
            } else {
                await moveSubjectToParent(droppedSubject.id, currentParentId, targetFolderId);
            }
        } else {
            // Folder drag-and-drop (original logic)
            const droppedFolder = (logic.folders || []).find(f => f.id === droppedFolderId);
            const currentParentId = droppedFolder ? droppedFolder.parentId || null : null;
            let sourceFolder = null;
            if (currentParentId) {
                try {
                    const parentSnap = await window.firebase.firestore().collection('folders').doc(currentParentId).get();
                    if (parentSnap.exists) {
                        sourceFolder = { id: currentParentId, ...parentSnap.data() };
                    }
                } catch (e) {
                    console.error('Error fetching parent folder from Firestore:', e);
                }
            }
            // Moving OUT of a shared folder
            if (sourceFolder && sourceFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
                setUnshareFolderConfirm({
                    open: true,
                    folderId: droppedFolderId,
                    sourceFolder,
                    onUnshare: async () => {
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        await window.firebase.firestore().collection('folders').doc(droppedFolderId).update({
                            sharedWith: [],
                            sharedWithUids: [],
                            isShared: false,
                            updatedAt: new Date()
                        });
                        setUnshareFolderConfirm({ open: false, folderId: null, sourceFolder: null, onUnshare: null, onKeepShared: null });
                    },
                    onKeepShared: async () => {
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        setUnshareFolderConfirm({ open: false, folderId: null, sourceFolder: null, onUnshare: null, onKeepShared: null });
                    }
                });
            } else if (targetFolder && targetFolder.isShared) {
                setShareFolderConfirm({
                    open: true,
                    folderId: droppedFolderId,
                    targetFolder,
                    onConfirm: async () => {
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        setShareFolderConfirm({ open: false, folderId: null, targetFolder: null, onConfirm: null });
                    }
                });
            } else {
                await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
            }
        }
    };

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
            if (subjectId) await moveSubjectToParent(subjectId, currentId, parentId);
            else if (folderId && folderId !== currentId) await moveFolderToParent(folderId, currentId, parentId);
        }
    };
    const handleBreadcrumbDrop = async (targetFolderId, subjectId, droppedFolderId) => {
        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        if (subjectId) {
            await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
        } else if (droppedFolderId) {
            const droppedFolderObj = (logic.folders || []).find(f => f.id === droppedFolderId);
            if (!droppedFolderObj) return;
            const oldParentId = droppedFolderObj.parentId || null;
            let sourceFolder = null;
            if (oldParentId) {
                try {
                    const parentSnap = await window.firebase.firestore().collection('folders').doc(oldParentId).get();
                    if (parentSnap.exists) {
                        sourceFolder = { id: oldParentId, ...parentSnap.data() };
                    }
                } catch (e) {
                    // ...existing code...
                }
            }
            if (sourceFolder && sourceFolder.isShared) {
                console.log('[DEBUG] Overlay should appear: handleBreadcrumbDrop', {
                    droppedFolderId,
                    oldParentId,
                    sourceFolder
                });
                setUnshareFolderConfirm({
                    open: true,
                    folderId: droppedFolderId,
                    sourceFolder,
                    onUnshare: async () => {
                        console.log('[DEBUG] onUnshare triggered: handleBreadcrumbDrop', { droppedFolderId });
                        await moveFolderToParent(droppedFolderId, oldParentId, targetFolderId);
                        await window.firebase.firestore().collection('folders').doc(droppedFolderId).update({
                            sharedWith: [],
                            sharedWithUids: [],
                            isShared: false,
                            updatedAt: new Date()
                        });
                        setUnshareFolderConfirm({ open: false, folderId: null, sourceFolder: null, onUnshare: null, onKeepShared: null });
                    },
                    onKeepShared: async () => {
                        console.log('[DEBUG] onKeepShared triggered: handleBreadcrumbDrop', { droppedFolderId });
                        await moveFolderToParent(droppedFolderId, oldParentId, targetFolderId);
                        setUnshareFolderConfirm({ open: false, folderId: null, sourceFolder: null, onUnshare: null, onKeepShared: null });
                    }
                });
            } else {
                await moveFolderToParent(droppedFolderId, oldParentId, targetFolderId);
            }
        }
    };
    {/* Overlay for unsharing confirmation when moving subject out of shared folder */}
    {unshareConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Vas a mover una asignatura fuera de una carpeta compartida
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Esto hará que la asignatura deje de estar compartida automáticamente con las personas que tenían acceso a la carpeta <span className="font-semibold">"{unshareConfirm.folder?.name}"</span>.<br />¿Deseas continuar?
                </p>
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
            
    
    const handleOpenTopics = (subject) => {
        setTopicsModalConfig({ isOpen: true, subject });
    };
    const handleNestFolder = async (targetFolderId, droppedFolderId) => {
        if (targetFolderId === droppedFolderId) return;
        const droppedFolder = (logic.folders || []).find(f => f.id === droppedFolderId);
        if (!droppedFolder) return;
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
        const currentParentId = droppedFolder.parentId || null;
        // If target folder is shared, show confirmation overlay
        if (targetFolder && targetFolder.isShared) {
            setShareFolderConfirm({
                open: true,
                folderId: droppedFolderId,
                targetFolder,
                onConfirm: async () => {
                    await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                    setShareFolderConfirm({ open: false, folderId: null, targetFolder: null, onConfirm: null });
                }
            });
        } else {
            await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
        }
    };
    const handlePromoteSubjectWrapper = async (subjectId) => {
        if (logic.currentFolder) await moveSubjectToParent(subjectId, logic.currentFolder.id, logic.currentFolder.parentId);
    };
    const handlePromoteFolderWrapper = async (folderId) => {
        if (logic.currentFolder && folderId !== logic.currentFolder.id) {
            const currentParentId = logic.currentFolder.id;
            let sourceFolder = null;
            try {
                const parentSnap = await window.firebase.firestore().collection('folders').doc(currentParentId).get();
                if (parentSnap.exists) {
                    sourceFolder = { id: currentParentId, ...parentSnap.data() };
                }
            } catch (e) {
                // ...existing code...
            }
            if (sourceFolder && sourceFolder.isShared) {
                console.log('[DEBUG] Overlay should appear: handlePromoteFolderWrapper', {
                    folderId,
                    currentParentId,
                    sourceFolder
                });
                setUnshareFolderConfirm({
                    open: true,
                    folderId,
                    sourceFolder,
                    onUnshare: async () => {
                        console.log('[DEBUG] onUnshare triggered: handlePromoteFolderWrapper', { folderId });
                        await moveFolderToParent(folderId, currentParentId, logic.currentFolder.parentId);
                        await window.firebase.firestore().collection('folders').doc(folderId).update({
                            sharedWith: [],
                            sharedWithUids: [],
                            isShared: false,
                            updatedAt: new Date()
                        });
                        setUnshareFolderConfirm({ open: false, folderId: null, sourceFolder: null, onUnshare: null, onKeepShared: null });
                    },
                    onKeepShared: async () => {
                        console.log('[DEBUG] onKeepShared triggered: handlePromoteFolderWrapper', { folderId });
                        await moveFolderToParent(folderId, currentParentId, logic.currentFolder.parentId);
                        setUnshareFolderConfirm({ open: false, folderId: null, sourceFolder: null, onUnshare: null, onKeepShared: null });
                    }
                });
            } else {
                await moveFolderToParent(folderId, currentParentId, logic.currentFolder.parentId);
            }
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
                    onDragOver={(e) => { if (logic.currentFolder) e.preventDefault(); }}
                    onDrop={handleUpwardDrop}
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
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Vas a mover <span className="text-indigo-600 dark:text-indigo-400">
                                            "{logic.subjects?.find(s => s.id === shareConfirm.subjectId)?.name}"
                                        </span> a una carpeta compartida
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Esto hará que la asignatura también sea compartida automáticamente con las mismas personas que tienen acceso a la carpeta <span className="font-semibold">"{shareConfirm.folder?.name}"</span>.<br />¿Deseas continuar?
                                    </p>
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
                        {/* Overlay for sharing confirmation when nesting a folder into a shared folder */}
                        {shareFolderConfirm.open && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Vas a mover la carpeta <span className="text-indigo-600 dark:text-indigo-400">
                                            "{logic.folders?.find(f => f.id === shareFolderConfirm.folderId)?.name}"
                                        </span> dentro de una carpeta compartida
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Esto hará que la carpeta también sea compartida automáticamente con las mismas personas que tienen acceso a la carpeta <span className="font-semibold">"{shareFolderConfirm.targetFolder?.name}"</span>.<br />¿Deseas continuar?
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => setShareFolderConfirm({ open: false, folderId: null, targetFolder: null, onConfirm: null })}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                            onClick={shareFolderConfirm.onConfirm}
                                        >
                                            Sí, compartir carpeta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Overlay for unsharing confirmation when moving folder out of shared folder */}
                        {unshareFolderConfirm.open && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                                        <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Vas a mover la carpeta <span className="text-indigo-600 dark:text-indigo-400">
                                            "{logic.folders?.find(f => f.id === unshareFolderConfirm.folderId)?.name}"
                                        </span> fuera de una carpeta compartida
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Esto hará que la carpeta deje de estar compartida automáticamente con las personas que tenían acceso a la carpeta <span className="font-semibold">"{unshareFolderConfirm.sourceFolder?.name}"</span>.<br />¿Deseas continuar?
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => setUnshareFolderConfirm({ open: false, folderId: null, sourceFolder: null, onUnshare: null, onKeepShared: null })}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="px-6 py-2 rounded-xl bg-yellow-600 text-white font-bold shadow-lg hover:bg-yellow-700 transition-colors"
                                            onClick={unshareFolderConfirm.onUnshare}
                                        >
                                            Sí, dejar de compartir
                                        </button>
                                        <button
                                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                            onClick={unshareFolderConfirm.onKeepShared}
                                        >
                                            Sí, mantener compartido
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