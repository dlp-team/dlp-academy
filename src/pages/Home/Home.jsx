// src/pages/Home/Home.jsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
// Logic Hook
import { useHomeLogic } from './hooks/useHomeLogic';
import { useFolders } from '../../hooks/useFolders'; 
import { useHomePageState } from './hooks/useHomePageState';
import { useHomePageHandlers } from './hooks/useHomePageHandlers';

    

// Layout & Global Components
import Header from '../../components/layout/Header';
import OnboardingWizard from '../Onboarding/components/OnboardingWizard';
import BreadcrumbNav from './components/BreadcrumbNav';
import SharedView from './components/SharedView';

// New Sub-Components
import HomeControls from './components/HomeControls';
import HomeContent from './components/HomeContent';
import HomeEmptyState from './components/HomeEmptyState';
import HomeModals from './components/HomeModals';
import HomeShareConfirmModals from './components/HomeShareConfirmModals';
import FolderTreeModal from '../../components/modals/FolderTreeModal'; 
import SubjectTopicsModal from '../Subject/modals/SubjectTopicModal';


const Home = ({ user }) => {
    React.useEffect(() => {
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const logic = useHomeLogic(user, searchQuery);
    const { moveSubjectToParent, moveFolderToParent, moveSubjectBetweenFolders, updateFolder } = useFolders(user);
    const {
        isFilterOpen,
        setIsFilterOpen,
        isScaleOverlayOpen,
        setIsScaleOverlayOpen,
        sharedSelectedTags,
        setSharedSelectedTags,
        sharedAllTags,
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
        hasContent,
        sharedActiveFilter,
        setSharedActiveFilter
    } = useHomePageState({ logic, searchQuery });

    const folderIdFromUrl = searchParams.get('folderId');

    React.useEffect(() => {
        if (!folderIdFromUrl || !Array.isArray(logic.folders) || logic.folders.length === 0) return;

        const targetFolder = logic.folders.find(folder => folder.id === folderIdFromUrl);

        if (targetFolder && (!logic.currentFolder || logic.currentFolder.id !== targetFolder.id)) {
            logic.setCurrentFolder(targetFolder);
            localStorage.setItem('dlp_last_folderId', targetFolder.id);
        }

        if (!targetFolder) {
            const next = new URLSearchParams(searchParams);
            next.delete('folderId');
            setSearchParams(next, { replace: true });
        }
    }, [folderIdFromUrl, logic.folders]);

    React.useEffect(() => {
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
    }, [logic.currentFolder?.id]);

    const {
        handleSaveFolderWrapper,
        handleUpwardDrop,
        handleBreadcrumbDrop,
        handleOpenTopics,
        handleDropOnFolderWrapper,
        handleNestFolder,
        handlePromoteSubjectWrapper,
        handlePromoteFolderWrapper,
        handleShowFolderContents,
        handleNavigateFromTree,
        handleNavigateSubjectFromTree,
        handleTreeMoveSubject,
        handleTreeReorderSubject
    } = useHomePageHandlers({
        logic,
        updateFolder,
        moveSubjectToParent,
        moveFolderToParent,
        moveSubjectBetweenFolders,
        setShareConfirm,
        setUnshareConfirm,
        setTopicsModalConfig,
        setFolderContentsModalConfig
    });

    if (!user || logic.loading || logic.loadingFolders) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

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
                        <HomeShareConfirmModals
                            shareConfirm={shareConfirm}
                            setShareConfirm={setShareConfirm}
                            unshareConfirm={unshareConfirm}
                            setUnshareConfirm={setUnshareConfirm}
                            subjects={logic.subjects || []}
                        />
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
                            draggedItemType={logic.draggedItemType}
                        />

                        {logic.loading ? (
                             <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {hasContent ? (
                                    <HomeContent 
                                        user={user}
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
                handleDeleteFolderAll={logic.handleDeleteFolderAll}
                handleDeleteFolderOnly={logic.handleDeleteFolderOnly}
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
                onNestFolder={handleNestFolder}
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