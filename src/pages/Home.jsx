// src/pages/Home.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

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
    const logic = useHomeLogic(user);
    const { moveSubjectToParent, moveFolderToParent } = useFolders(user);

    if (!user || logic.loading || logic.loadingFolders) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    // --- CUSTOM HANDLERS ---

    // Ensure new folders get the correct parentId (or null for root)
    const handleSaveFolderWrapper = (folderData) => {
        const dataWithParent = {
            ...folderData,
            parentId: logic.currentFolder ? logic.currentFolder.id : null
        };
        logic.handleSaveFolder(dataWithParent);
    };

    // Promote handlers
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

    const hasContent = (logic.subjects || []).length > 0 || (logic.folders || []).length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors">
            <Header user={user} />
            <OnboardingWizard user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
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

                {logic.viewMode === 'shared' ? (
                    <SharedView user={user} />
                ) : (
                    <>
                        <BreadcrumbNav 
                            currentFolder={logic.currentFolder} 
                            onNavigate={logic.setCurrentFolder}
                            allFolders={logic.folders || []}
                        />

                        {logic.loading ? (
                             <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {hasContent ? (
                                    <HomeContent 
                                        // --- CRITICAL DEFENSIVE PROPS ---
                                        subjects={logic.subjects || []}
                                        folders={logic.folders || []}
                                        groupedContent={logic.groupedContent || {}} // Prevents the crash
                                        collapsedGroups={logic.collapsedGroups || {}}
                                        orderedFolders={logic.folders || []}
                                        
                                        // UI State
                                        layoutMode={logic.layoutMode}
                                        cardScale={logic.cardScale}
                                        viewMode={logic.viewMode}
                                        currentFolder={logic.currentFolder}
                                        
                                        // Menu & Actions
                                        toggleGroup={logic.toggleGroup}
                                        activeMenu={logic.activeMenu}
                                        setActiveMenu={logic.setActiveMenu}
                                        setSubjectModalConfig={logic.setSubjectModalConfig}
                                        setFolderModalConfig={logic.setFolderModalConfig}
                                        setDeleteConfig={logic.setDeleteConfig}
                                        
                                        // Handlers
                                        handleSelectSubject={(id) => logic.navigate(`/home/subject/${id}`)}
                                        handleOpenFolder={logic.setCurrentFolder}
                                        handleDropOnFolder={logic.handleDropOnFolder}
                                        handlePromoteSubject={handlePromoteSubjectWrapper} // Pass wrapper
                                        handlePromoteFolder={handlePromoteFolderWrapper}   // Pass wrapper
                                        
                                        // Drag & Drop
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