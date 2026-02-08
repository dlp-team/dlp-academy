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

const Home = ({ user }) => {
    // 1. Initialize Logic
    const logic = useHomeLogic(user);
    const { moveSubjectToParent, moveFolderToParent, moveSubjectBetweenFolders } = useFolders(user);

    // --- NEW STATE FOR FOLDER CONTENTS MODAL ---
    const [folderContentsModalConfig, setFolderContentsModalConfig] = useState({
        isOpen: false,
        folder: null
    });

    // --- FILTERING LOGIC ---
    const displayedFolders = useMemo(() => {
        const allFolders = logic.folders || [];
        const currentId = logic.currentFolder ? logic.currentFolder.id : null;
        
        return allFolders.filter(folder => {
            const parentId = folder.parentId || null;
            return parentId === currentId;
        });
    }, [logic.folders, logic.currentFolder]);

    // --- FIX: LIVE FOLDER RESOLUTION ---
    // Instead of using the static folder object saved when we opened the modal (which becomes stale),
    // we search for the latest version of that folder in the live 'logic.folders' list.
    const activeModalFolder = useMemo(() => {
        if (!folderContentsModalConfig.folder) return null;
        
        // Find the fresh version of the currently open folder
        const liveFolder = (logic.folders || []).find(f => f.id === folderContentsModalConfig.folder.id);
        
        // Return live version, or fallback to the initial one (e.g. if loading)
        return liveFolder || folderContentsModalConfig.folder;
    }, [logic.folders, folderContentsModalConfig.folder]);


    // 2. Loading State
    if (!user || logic.loading || logic.loadingFolders) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    // --- HANDLERS ---
    const handleSaveFolderWrapper = (folderData) => {
        const dataWithParent = {
            ...folderData,
            parentId: logic.currentFolder ? logic.currentFolder.id : null
        };
        logic.handleSaveFolder(dataWithParent);
    };

    const handleUpwardDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
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
        if (subjectId) await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
        else if (droppedFolderId) {
            const droppedFolderObj = (logic.folders || []).find(f => f.id === droppedFolderId);
            if (!droppedFolderObj) return;
            const oldParentId = droppedFolderObj.parentId || null;
            await moveFolderToParent(droppedFolderId, oldParentId, targetFolderId);
        }
    };

    const handleDropOnFolderWrapper = async (targetFolderId, subjectId) => {
        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        if (targetFolderId === currentFolderId) return;
        await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
    };

    const handleNestFolder = async (targetFolderId, droppedFolderId) => {
        if (targetFolderId === droppedFolderId) return;
        const droppedFolder = (logic.folders || []).find(f => f.id === droppedFolderId);
        if (!droppedFolder) return;
        const currentParentId = droppedFolder.parentId || null;
        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
    };

    const handlePromoteSubjectWrapper = async (subjectId) => {
        if (logic.currentFolder) await moveSubjectToParent(subjectId, logic.currentFolder.id, logic.currentFolder.parentId);
    };

    const handlePromoteFolderWrapper = async (folderId) => {
        if (logic.currentFolder && folderId !== logic.currentFolder.id) await moveFolderToParent(folderId, logic.currentFolder.id, logic.currentFolder.parentId);
    };

    // --- NEW HANDLER FOR TREE MODAL ---
    const handleShowFolderContents = (folder) => {
        setFolderContentsModalConfig({ isOpen: true, folder });
    };

    const handleNavigateFromTree = (folder) => {
        setFolderContentsModalConfig({ isOpen: false, folder: null });
        logic.setCurrentFolder(folder);
    };

    const handleNavigateSubjectFromTree = (subject) => {
        setFolderContentsModalConfig({ isOpen: false, folder: null });
        logic.navigate(`/home/subject/${subject.id}`);
    };

    // Tree Move: If sourceFolderId is undefined, useFolders hook will now fetch it safely
    const handleTreeMoveSubject = async (subjectId, targetFolderId, sourceFolderId) => {
        await moveSubjectBetweenFolders(subjectId, sourceFolderId, targetFolderId);
    };
    
    const handleTreeReorderSubject = async (folderId, subjectId, newIndex) => {
        if (logic.currentFolder && folderId === logic.currentFolder.id) {
             if (logic.handleDropReorderSubject) {
                 logic.handleDropReorderSubject(subjectId, newIndex); 
             }
        }
    };

    const hasContent = (logic.subjects || []).length > 0 || displayedFolders.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors">
            <Header user={user} />
            <OnboardingWizard user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div 
                    className="relative transition-all duration-300"
                    onDragOver={(e) => { if (logic.currentFolder) e.preventDefault(); }}
                    onDrop={handleUpwardDrop}
                >
                    {logic.isDragAndDropEnabled && logic.draggedItem && logic.currentFolder ? (
                        <div className="w-full h-20 mb-6 rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center gap-3 animate-pulse text-indigo-600 dark:text-indigo-300 z-10">
                            <ArrowUpCircle className="w-8 h-8" />
                            <span className="font-bold text-lg">
                                {logic.currentFolder.parentId ? "Mover a la carpeta anterior" : "Mover al inicio (Root)"}
                            </span>
                        </div>
                    ) : (
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
                    )}
                </div>

                {logic.viewMode === 'shared' ? (
                    <SharedView user={user} />
                ) : (
                    <>
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
                currentFolder={logic.currentFolder}
                allFolders={logic.folders || []}
            />
            
            {/* Folder Tree Modal */}
            <FolderTreeModal 
                isOpen={folderContentsModalConfig.isOpen}
                onClose={() => setFolderContentsModalConfig({ isOpen: false, folder: null })}
                // KEY CHANGE: Pass the live 'activeModalFolder' instead of the stale state
                rootFolder={activeModalFolder}
                allFolders={logic.folders || []}
                allSubjects={logic.subjects || []}
                onNavigateFolder={handleNavigateFromTree}
                onNavigateSubject={handleNavigateSubjectFromTree}
                onMoveSubjectToFolder={handleTreeMoveSubject}
                onNestFolder={handleNestFolder}
                onReorderSubject={handleTreeReorderSubject}
            />
        </div>
    );
};

export default Home;