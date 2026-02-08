// src/pages/Home.jsx
import React, { useMemo } from 'react';
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

const Home = ({ user }) => {
    // 1. Initialize Logic
    const logic = useHomeLogic(user);
    // We use moveSubjectToParent and moveFolderToParent because moving to a breadcrumb 
    // is essentially moving "up" or sideways to a specific parent ID (or null for root).
    const { moveSubjectToParent, moveFolderToParent, moveSubjectBetweenFolders } = useFolders(user);

    // --- FILTERING LOGIC ---
    const displayedFolders = useMemo(() => {
        const allFolders = logic.folders || [];
        const currentId = logic.currentFolder ? logic.currentFolder.id : null;
        
        return allFolders.filter(folder => {
            const parentId = folder.parentId || null;
            return parentId === currentId;
        });
    }, [logic.folders, logic.currentFolder]);

    // 2. Loading State
    if (!user || logic.loading || logic.loadingFolders) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    // --- CUSTOM HANDLERS ---

    const handleSaveFolderWrapper = (folderData) => {
        const dataWithParent = {
            ...folderData,
            parentId: logic.currentFolder ? logic.currentFolder.id : null
        };
        logic.handleSaveFolder(dataWithParent);
    };

    // Handler for the big "Move Up" zone (stays for convenience)
    const handleUpwardDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const subjectId = e.dataTransfer.getData('subjectId');
        const folderId = e.dataTransfer.getData('folderId');
        
        if (logic.currentFolder) {
            const currentId = logic.currentFolder.id;
            const parentId = logic.currentFolder.parentId; 

            if (subjectId) {
                await moveSubjectToParent(subjectId, currentId, parentId);
            } else if (folderId) {
                if (folderId !== currentId) {
                    await moveFolderToParent(folderId, currentId, parentId);
                }
            }
        }
    };

    // NEW: Handler for dropping onto Breadcrumb segments
    const handleBreadcrumbDrop = async (targetFolderId, subjectId, droppedFolderId) => {
        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;

        if (subjectId) {
            // Move subject from current location to the breadcrumb target
            // currentFolderId corresponds to the "from" folder, targetFolderId is the "to" folder (or null for root)
            await moveSubjectToParent(subjectId, currentFolderId, targetFolderId);
        } else if (droppedFolderId) {
            // Find the dropped folder to know its old parent
            const droppedFolderObj = (logic.folders || []).find(f => f.id === droppedFolderId);
            if (!droppedFolderObj) return;
            
            const oldParentId = droppedFolderObj.parentId || null;
            
            // Move folder from old parent to new breadcrumb target
            await moveFolderToParent(droppedFolderId, oldParentId, targetFolderId);
        }
    };


    // Wrapper for dropping Subject -> Folder Card
    const handleDropOnFolderWrapper = async (targetFolderId, subjectId) => {
        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        if (targetFolderId === currentFolderId) return;
        await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
    };

    // Wrapper for nesting folders (Folder Card -> Folder Card)
    const handleNestFolder = async (targetFolderId, droppedFolderId) => {
        if (targetFolderId === droppedFolderId) return;
        const droppedFolder = (logic.folders || []).find(f => f.id === droppedFolderId);
        if (!droppedFolder) return;
        const currentParentId = droppedFolder.parentId || null;
        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
    };

    const handlePromoteSubjectWrapper = async (subjectId) => {
        if (logic.currentFolder) {
            await moveSubjectToParent(subjectId, logic.currentFolder.id, logic.currentFolder.parentId);
        }
    };

    const handlePromoteFolderWrapper = async (folderId) => {
        if (logic.currentFolder && folderId !== logic.currentFolder.id) {
            await moveFolderToParent(folderId, logic.currentFolder.id, logic.currentFolder.parentId);
        }
    };

    const hasSubjects = (logic.subjects || []).length > 0;
    const hasFolders = displayedFolders.length > 0; 
    const hasContent = hasSubjects || hasFolders;

    // 3. Render
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors">
            <Header user={user} />
            <OnboardingWizard user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* UPWARD DROP ZONE - Kept as an alternative big target */}
                <div 
                    className="relative transition-all duration-300"
                    onDragOver={(e) => {
                        if (logic.currentFolder) {
                            e.preventDefault(); 
                        }
                    }}
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

                {/* Main Content */}
                {logic.viewMode === 'shared' ? (
                    <SharedView user={user} />
                ) : (
                    <>
                        {/* NEW PROPS PASSED TO BREADCRUMBNAV */}
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
        </div>
    );
};

export default Home;