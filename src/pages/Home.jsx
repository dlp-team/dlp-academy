// src/pages/Home.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

// Logic Hook
import { useHomeLogic } from '../hooks/useHomeLogic';

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

    // 2. Loading State
    if (!user || logic.loading || logic.loadingFolders) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    // 3. Render
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors">
            <Header user={user} />
            <OnboardingWizard user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Header & Controls */}
                <HomeControls 
                    viewMode={logic.viewMode}
                    setViewMode={logic.setViewMode}
                    layoutMode={logic.layoutMode}
                    setLayoutMode={logic.setLayoutMode}
                    cardScale={logic.cardScale}
                    setCardScale={logic.setCardScale}
                    allTags={logic.allTags}
                    selectedTags={logic.selectedTags}
                    setSelectedTags={logic.setSelectedTags}
                    currentFolder={logic.currentFolder}
                    setFolderModalConfig={logic.setFolderModalConfig}
                    setCollapsedGroups={logic.setCollapsedGroups}
                    setCurrentFolder={logic.setCurrentFolder}
                    isDragAndDropEnabled={logic.isDragAndDropEnabled}
                    draggedItem={logic.draggedItem}
                    draggedItemType={logic.draggedItemType}
                    onPreferenceChange={logic.handlePreferenceChange}
                    allFolders={logic.folders}
                />

                {/* Breadcrumb Navigation */}
                {logic.currentFolder && (
                    <BreadcrumbNav 
                        currentFolder={logic.currentFolder}
                        onNavigate={logic.setCurrentFolder}
                        allFolders={logic.folders}
                    />
                )}

                {/* Shared View */}
                {logic.viewMode === 'shared' && (
                    <SharedView
                        sharedFolders={logic.sharedFolders}
                        sharedSubjects={logic.sharedSubjects}
                        layoutMode={logic.layoutMode}
                        cardScale={logic.cardScale}
                        onOpenFolder={logic.handleOpenFolder}
                        onSelectSubject={logic.handleSelectSubject}
                        activeMenu={logic.activeMenu}
                        onToggleMenu={logic.setActiveMenu}
                        flippedSubjectId={logic.flippedSubjectId}
                        onFlipSubject={(id) => logic.setFlippedSubjectId(logic.flippedSubjectId === id ? null : id)}
                        onSelectTopic={(sid, tid) => logic.navigate(`/home/subject/${sid}/topic/${tid}`)}
                        navigate={logic.navigate}
                    />
                )}

                {/* Content Rendering (Non-Shared Views) */}
                {logic.viewMode !== 'shared' && (
                    <HomeContent 
                        // State
                        viewMode={logic.viewMode}
                        layoutMode={logic.layoutMode}
                        cardScale={logic.cardScale}
                        groupedContent={logic.groupedContent}
                        collapsedGroups={logic.collapsedGroups}
                        currentFolder={logic.currentFolder}
                        orderedFolders={logic.orderedFolders}
                        flippedSubjectId={logic.flippedSubjectId}
                        activeMenu={logic.activeMenu}
                        
                        // Setters
                        setFlippedSubjectId={logic.setFlippedSubjectId}
                        setActiveMenu={logic.setActiveMenu}
                        toggleGroup={logic.toggleGroup}
                        setSubjectModalConfig={logic.setSubjectModalConfig}
                        setFolderModalConfig={logic.setFolderModalConfig}
                        setDeleteConfig={logic.setDeleteConfig}
                        
                        // Handlers
                        handleSelectSubject={logic.handleSelectSubject}
                        handleOpenFolder={logic.handleOpenFolder}
                        handleDropOnFolder={logic.handleDropOnFolder}
                        handlePromoteSubject={logic.handlePromoteSubject}
                        handlePromoteFolder={logic.handlePromoteFolder}
                        
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
                )}

                {/* Empty State */}
                {logic.subjects.length === 0 && logic.folders.length === 0 && logic.viewMode !== 'shared' && (
                    <HomeEmptyState 
                        setSubjectModalConfig={logic.setSubjectModalConfig}
                        setFolderModalConfig={logic.setFolderModalConfig}
                    />
                )}
            </main>

            {/* Modals */}
            <HomeModals 
                subjectModalConfig={logic.subjectModalConfig}
                setSubjectModalConfig={logic.setSubjectModalConfig}
                folderModalConfig={logic.folderModalConfig}
                setFolderModalConfig={logic.setFolderModalConfig}
                deleteConfig={logic.deleteConfig}
                setDeleteConfig={logic.setDeleteConfig}
                handleSaveSubject={logic.handleSaveSubject}
                handleSaveFolder={logic.handleSaveFolder}
                handleShareFolder={logic.handleShareFolder}
                handleDelete={logic.handleDelete}
                currentFolder={logic.currentFolder}
                allFolders={logic.folders}
            />
        </div>
    );
};

export default Home;