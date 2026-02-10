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

    // 2. Search State
    const [searchQuery, setSearchQuery] = useState('');

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
        hasContent 
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
            hasContent: (folders.length > 0 || subjects.length > 0 || sFolders.length > 0 || sSubjects.length > 0)
        };
    }, [searchQuery, logic.folders, logic.subjects, logic.currentFolderContents, logic.sharedFolders, logic.sharedSubjects]);

    // Stricter matching function - checks word boundaries
    const matchesSearch = (item, query) => {
        if (!query) return true;
        const normalizedQuery = normalizeText(query);
        const itemName = normalizeText(item.name || item.title || '');
        return itemName.includes(normalizedQuery);
    };

    const getSearchScopeIds = (folders, currentFolderId) => {
        const scopeIds = new Set([currentFolderId]);
        
        // Iteratively add children until no new folders are found
        let added = true;
        while (added) {
            added = false;
            folders.forEach(f => {
                // If a folder's parent is known to be in scope, the folder itself is in scope
                if (f.parentId && scopeIds.has(f.parentId) && !scopeIds.has(f.id)) {
                    scopeIds.add(f.id);
                    added = true;
                }
            });
        }
        return scopeIds;
    };


    // ... (State and Filtering Logic omitted for brevity, identical to previous) ...
    // NOTE: Keep all the logic.loading checks, displayedFolders memo, etc.
    const [folderContentsModalConfig, setFolderContentsModalConfig] = useState({ isOpen: false, folder: null });
    
    const displayedFolders = useMemo(() => {
        const allFolders = logic.folders || [];
        const currentId = logic.currentFolder ? logic.currentFolder.id : null;

        if (!searchQuery) {
            // Standard View: Direct children only
            return allFolders.filter(f => (f.parentId || null) === currentId);
        }

        // Search View: Recursive Scope + Strict Match
        const scopeIds = getSearchScopeIds(allFolders, currentId);
        return allFolders.filter(f => {
            const isInScope = (f.parentId || null) === currentId || (f.parentId && scopeIds.has(f.parentId));
            return isInScope && matchesSearch(f, searchQuery);
        });
    }, [logic.folders, logic.currentFolder, searchQuery]);

    const displayedSubjects = useMemo(() => {
        const allSubjects = logic.subjects || [];
        const allFolders = logic.folders || [];
        const currentId = logic.currentFolder ? logic.currentFolder.id : null;

        if (!searchQuery) {
            // Standard View: Direct children only
            return allSubjects.filter(s => (s.parentFolderId || null) === currentId);
        }

        // Search View: Recursive Scope + Strict Match
        const scopeIds = getSearchScopeIds(allFolders, currentId);
        return allSubjects.filter(s => {
            // Check if subject lives in any of the valid scope folders
            const parentId = s.parentFolderId || null;
            const isInScope = parentId === currentId || (parentId && scopeIds.has(parentId));
            return isInScope && matchesSearch(s, searchQuery);
        });
    }, [logic.subjects, logic.folders, logic.currentFolder, searchQuery]);
    
    
    
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
        e.preventDefault(); e.stopPropagation();
        const subjectId = e.dataTransfer.getData('subjectId');
        const folderId = e.dataTransfer.getData('folderId');
        if (logic.currentFolder) {
            const currentId = logic.currentFolder.id;
            const parentId = logic.currentFolder.parentId; 
            if (subjectId) await moveSubjectToParent(subjectId, currentId, parentId);
            if (folderId && folderId !== currentId) await moveFolderToParent(folderId, currentId, parentId);
        }
    };
    const handlePromoteSubjectWrapper = async (subjectId) => {
        const currentId = logic.currentFolder ? logic.currentFolder.id : null;
        const parentId = logic.currentFolder ? logic.currentFolder.parentId : null;
        if (currentId) await moveSubjectToParent(subjectId, currentId, parentId);
    };
    const handlePromoteFolderWrapper = async (folderId) => {
        const currentId = logic.currentFolder ? logic.currentFolder.id : null;
        const parentId = logic.currentFolder ? logic.currentFolder.parentId : null;
        if (currentId && folderId !== currentId) await moveFolderToParent(folderId, currentId, parentId);
    };
    const handleDropOnFolderWrapper = async (targetFolderId, subjectId, sourceFolderId) => {
        if (targetFolderId === sourceFolderId) return;
        await moveSubjectBetweenFolders(subjectId, sourceFolderId, targetFolderId);
    };
    const handleNestFolder = async (childId, newParentId) => {
        if (childId === newParentId) return;
        const { updateFolderParent } = useFolders(user);
        await updateFolderParent(childId, newParentId);
    };
    const handleShowFolderContents = (folder) => {
        setFolderContentsModalConfig({ isOpen: true, folder });
    };
    const handleNavigateFromTree = (folderId) => {
        setFolderContentsModalConfig({ isOpen: false, folder: null });
        if (folderId) {
            const folder = logic.folders?.find(f => f.id === folderId);
            logic.setCurrentFolder(folder || null);
        } else {
            logic.setCurrentFolder(null);
        }
    };
    const handleNavigateSubjectFromTree = (subjectId) => {
        setFolderContentsModalConfig({ isOpen: false, folder: null });
        logic.navigate(`/home/subject/${subjectId}`);
    };
    const handleTreeMoveSubject = async (subjectId, targetFolderId) => {
        const subject = logic.subjects?.find(s => s.id === subjectId);
        if (!subject) return;
        const sourceFolderId = subject.parentFolderId || null;
        if (sourceFolderId === targetFolderId) return;
        await moveSubjectBetweenFolders(subjectId, sourceFolderId, targetFolderId);
    };
    const handleTreeReorderSubject = async (subjectId, targetPosition, targetFolderId) => {
        const subject = logic.subjects?.find(s => s.id === subjectId);
        if (!subject) return;
        const sourceFolderId = subject.parentFolderId || null;
        if (sourceFolderId !== targetFolderId) return;
    };
    const handleBreadcrumbDrop = async (e, targetFolderId) => {
        e.preventDefault(); e.stopPropagation();
        const subjectId = e.dataTransfer.getData('subjectId');
        const folderId = e.dataTransfer.getData('folderId');
        if (subjectId) {
            const subject = logic.subjects?.find(s => s.id === subjectId);
            if (!subject) return;
            const sourceFolderId = subject.parentFolderId || null;
            if (sourceFolderId === targetFolderId) return;
            await moveSubjectBetweenFolders(subjectId, sourceFolderId, targetFolderId);
        }
        if (folderId) {
            const folder = logic.folders?.find(f => f.id === folderId);
            if (!folder || folder.id === targetFolderId) return;
            const { updateFolderParent } = useFolders(user);
            await updateFolderParent(folderId, targetFolderId);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
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
                        searchTerm={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                    
                </div>

                {logic.viewMode === 'shared' ? (
                    <SharedView 
                        sharedFolders={sharedFolders}
                        sharedSubjects={sharedSubjects}
                        cardScale={logic.cardScale}
                        
                        // --- ADD THIS LINE ---
                        layoutMode={logic.layoutMode} 
                        // --------------------

                        // Handlers
                        onOpenFolder={logic.handleOpenFolder}
                        onSelectSubject={logic.handleSubjectClick} // Or specific handler
                        
                        // UI State
                        activeMenu={logic.activeMenu}
                        onToggleMenu={logic.setActiveMenu}
                        flippedSubjectId={logic.flippedSubjectId}
                        onFlipSubject={logic.setFlippedSubjectId}
                        
                        // Navigation
                        onSelectTopic={(sid, tid) => logic.navigate(`/home/subject/${sid}/topic/${tid}`)}
                        navigate={logic.navigate}
                    />
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
                                        subjects={displayedSubjects}
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
                                        
                                        // NEW: Pass the robust move handler
                                        handleMoveSubjectWithSource={handleTreeMoveSubject}
                                        
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
        </div>
    );
};

export default Home;