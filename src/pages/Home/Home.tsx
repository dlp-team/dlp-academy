// src/pages/Home/Home.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';


// Logic Hook
import { useHomeLogic } from './hooks/useHomeLogic';
import { useFolders } from '../../hooks/useFolders'; 
import { useHomePageState } from './hooks/useHomePageState';
import { useHomePageHandlers } from './hooks/useHomePageHandlers';
import { useHomeFolderRoutingSync } from './hooks/useHomeFolderRoutingSync';
import { useHomeTreeData } from './hooks/useHomeTreeData';
import { useHomeBulkSelection } from './hooks/useHomeBulkSelection';
import { useHomeControlTags } from './hooks/useHomeControlTags';
import { useHomeKeyboardCoordination } from './hooks/useHomeKeyboardCoordination';


// Layout & Global Components
import Header from '../../components/layout/Header';
import BreadcrumbNav from './components/BreadcrumbNav';
import SharedView from './components/SharedView';


// Sub-Components
import HomeControls from './components/HomeControls';
import HomeSelectionToolbar from './components/HomeSelectionToolbar';
import HomeShortcutFeedback from './components/HomeShortcutFeedback';
import HomeContent from './components/HomeContent';
import HomeEmptyState from './components/HomeEmptyState';
import HomeLoader from './components/HomeLoader';
import HomeModals from './components/HomeModals';
import HomeShareConfirmModals from './components/HomeShareConfirmModals';
import BinView from './components/BinView';
import FolderTreeModal from '../../components/modals/FolderTreeModal'; 
import SubjectTopicsModal from '../Subject/modals/SubjectTopicModal';

// Utils
import {
    canCreateFolderByRole,
    canCreateSubjectByRole,
    getPermissionLevel,
    getNormalizedRole,
    isShortcutItem,
    isSharedForCurrentUser as isSharedForCurrentUserUtil
} from '../../utils/permissionUtils';
import { useInstitutionHomeThemeTokens } from './hooks/useInstitutionHomeThemeTokens';
import {
    saveLastHomeFolderId,
    clearLastHomeFolderId,
    saveLastHomeViewMode
} from './utils/homePersistence';

const HomeControlsComponent: any = HomeControls;

const Home = ({ user }: any) => {

    const [searchQuery, setSearchQuery] = useState('');
    const [sharedScopeSelected, setSharedScopeSelected] = useState(true);
    const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);
    const [bulkActionMessage, setBulkActionMessage] = useState('');
    const [bulkActionTone, setBulkActionTone] = useState('success');
    const [searchParams, setSearchParams] = useSearchParams();
    const homeThemeTokens = useInstitutionHomeThemeTokens(user);
    const isStudentRole = useMemo(() => getNormalizedRole(user) === 'student', [user]);
    const rememberOrganization = user?.rememberSort !== false;
    const defaultViewMode = user?.viewMode || 'grid';

    const publishHomeFeedback = React.useCallback((message, tone = 'success') => {
        setBulkActionTone(tone);
        setBulkActionMessage(message || '');
    }, []);

    const logic: any = useHomeLogic(user, searchQuery, rememberOrganization, publishHomeFeedback);
    const {
        selectMode,
        setSelectMode,
        selectedItems,
        selectedItemKeys,
        bulkMoveTargetFolderId,
        setBulkMoveTargetFolderId,
        clearSelection,
        toggleSelectItem,
        runBulkMoveToFolder,
        handleBulkDelete,
        handleCreateFolderFromSelection
    } = useHomeBulkSelection({
        logic,
        isStudentRole,
        onHomeFeedback: publishHomeFeedback
    });
    const { moveSubjectToParent, moveFolderToParent, moveSubjectBetweenFolders, updateFolder } = useFolders(user);
    const {
        isFilterOpen,
        setIsFilterOpen,
        isScaleOverlayOpen,
        setIsScaleOverlayOpen,
        sharedSelectedTags,
        setSharedSelectedTags,
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
        sharedActiveFilter
    } = useHomePageState({
        logic,
        searchQuery,
        rememberOrganization,
        defaultViewMode,
        showSharedTab: !isStudentRole,
        onHomeFeedback: publishHomeFeedback
    });

    const folderIdFromUrl = searchParams.get('folderId');
    const setPersistedFolderId = React.useCallback((folder: any) => {
        if (!rememberOrganization) return;
        if (folder && folder.id) {
            saveLastHomeFolderId(folder.id);
        } else {
            clearLastHomeFolderId();
        }
    }, [rememberOrganization]);

    const setPersistedViewMode = React.useCallback((mode: any) => {
        if (!rememberOrganization) return;
        if (mode) {
            saveLastHomeViewMode(mode);
        }
    }, [rememberOrganization]);

    const handleSetCurrentFolder = React.useCallback((folder: any) => {
        logic.setCurrentFolder(folder);
        setPersistedFolderId(folder);
    }, [logic, setPersistedFolderId]);

    const handleOpenSubjectSharing = React.useCallback((subject: any) => {
        logic.setSubjectModalConfig({ isOpen: true, isEditing: true, data: subject, initialTab: 'sharing' });
    }, [logic]);

    useHomeFolderRoutingSync({
        user,
        logic,
        isStudentRole,
        rememberOrganization,
        searchParams,
        setSearchParams,
        folderIdFromUrl,
        setPersistedFolderId,
        setHasInitialDataLoaded
    });

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
        currentUserId: user?.uid || null,
        updateFolder,
        moveSubjectToParent,
        moveFolderToParent,
        moveSubjectBetweenFolders,
        setShareConfirm,
        setUnshareConfirm,
        setTopicsModalConfig,
        setFolderContentsModalConfig,
        rememberOrganization
    });

    const { handleCardFocus, shortcutFeedback, getCardVisualState } = useHomeKeyboardCoordination({
        user,
        logic
    });

    const { treeFolders, treeSubjects } = useHomeTreeData(logic);

    const isSharedForCurrentUser = React.useCallback((item: any) => {
        return isSharedForCurrentUserUtil(item, user);
    }, [user]);

    const effectiveSharedScopeSelected = logic.viewMode === 'shared' ? true : sharedScopeSelected;

    const { availableControlTags } = useHomeControlTags({
        logic,
        isStudentRole,
        sharedFolders,
        sharedSubjects,
        sharedSelectedTags,
        setSharedSelectedTags,
        effectiveSharedScopeSelected,
        isSharedForCurrentUser
    });

    React.useEffect(() => {
        if (logic.viewMode === 'shared' && sharedScopeSelected !== true) {
            setSharedScopeSelected(true);
        }
    }, [logic.viewMode, sharedScopeSelected]);

    const canCreateInManualContext = useMemo(() => {
        if (!canCreateSubjectByRole(user)) return false;
        if (logic.viewMode !== 'grid') return true;
        if (logic.currentFolder?.isShared !== true) return true;
        const permission = user?.uid ? getPermissionLevel(logic.currentFolder, user.uid) : 'none';
        return permission === 'editor' || permission === 'owner';
    }, [logic.viewMode, logic.currentFolder, user]);

    const canCreateFolderInManualContext = useMemo(() => {
        if (!canCreateFolderByRole(user)) return false;
        if (logic.viewMode !== 'grid') return false;
        if (logic.currentFolder?.isShared !== true) return true;
        const permission = user?.uid ? getPermissionLevel(logic.currentFolder, user.uid) : 'none';
        return permission === 'editor' || permission === 'owner';
    }, [logic.viewMode, logic.currentFolder, user]);

    const effectiveHasContent = useMemo(() => {
        if (!isStudentRole) return hasContent;
        return Object.values(logic.groupedContent || {}).some((bucket) => Array.isArray(bucket) && bucket.length > 0);
    }, [isStudentRole, hasContent, logic.groupedContent]);

    React.useEffect(() => {
        if (!bulkActionMessage) return;
        const timer = window.setTimeout(() => {
            setBulkActionMessage('');
            setBulkActionTone('success');
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [bulkActionMessage]);

    if (!user || (!hasInitialDataLoaded && (logic.loading || logic.loadingFolders))) {
        return <HomeLoader fullPage />;
    }

    return (
        <div
            className="home-page min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors"
            style={homeThemeTokens.cssVariables}
        >
            <Header user={user} />

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Drag Up Zone (Omitted for brevity, logic same) */}
                <div 
                    className="relative transition-all duration-300"
                    onDragOver={(e: any) => {
                        if (logic.currentFolder) e.preventDefault();
                    }}
                    onDrop={(e: any) => {

                        handleUpwardDrop(e);
                    }}
                >
                    <HomeControlsComponent 
                        viewMode={logic.viewMode}
                        setViewMode={(mode: any) => {
                            logic.setViewMode(mode);
                            setPersistedViewMode(mode);
                        }}
                        layoutMode={logic.layoutMode}
                        setLayoutMode={logic.setLayoutMode}
                        cardScale={logic.cardScale}
                        setCardScale={logic.setCardScale}
                        allTags={availableControlTags}
                        selectedTags={logic.viewMode === 'shared' ? sharedSelectedTags : (logic.selectedTags || [])}
                        setSelectedTags={logic.viewMode === 'shared' ? setSharedSelectedTags : logic.setSelectedTags}
                        currentFolder={logic.currentFolder}
                        setFolderModalConfig={logic.setFolderModalConfig}
                        { ...(logic.setCollapsedGroups ? { setCollapsedGroups: logic.setCollapsedGroups } : {}) }
                        setCurrentFolder={(folder: any) => {
                            handleSetCurrentFolder(folder);
                        }}
                        isDragAndDropEnabled={logic.isDragAndDropEnabled}
                        draggedItem={logic.draggedItem}
                        draggedItemType={logic.draggedItemType}
                        onPreferenceChange={logic.handlePreferenceChange}
                        allFolders={logic.folders || []} 
                        allSubjects={logic.subjects || []}
                        activeFilter={logic.viewMode === 'shared' ? sharedActiveFilter : logic.activeFilter}
                        handleFilterChange={logic.handleFilterChange}
                        onFilterOverlayChange={setIsFilterOpen}
                        onScaleOverlayChange={setIsScaleOverlayOpen}
                        sharedScopeSelected={effectiveSharedScopeSelected}
                        onSharedScopeChange={setSharedScopeSelected}
                        canCreateFolder={canCreateFolderInManualContext}
                        showSharedTab={!isStudentRole}
                        hideSharedScopeToggle={isStudentRole || logic.viewMode === 'shared'}
                        studentMode={isStudentRole}

                        // SEARCH
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                </div>

                <HomeShortcutFeedback message={shortcutFeedback} mutedTextClass={homeThemeTokens.mutedTextClass} />

                <HomeSelectionToolbar
                    visible={logic.viewMode !== 'shared' && logic.viewMode !== 'bin' && !isStudentRole}
                    selectMode={selectMode}
                    selectedCount={selectedItems.length}
                    bulkMoveTargetFolderId={bulkMoveTargetFolderId}
                    folders={logic.folders || []}
                    onToggleSelectMode={() => {
                        setSelectMode((prev) => !prev);
                        setBulkActionMessage('');
                        setBulkActionTone('success');
                        if (selectMode) clearSelection();
                    }}
                    onDeleteSelected={handleBulkDelete}
                    onCreateFolderFromSelection={handleCreateFolderFromSelection}
                    onMoveTargetChange={setBulkMoveTargetFolderId}
                    onMoveSelection={() => runBulkMoveToFolder(bulkMoveTargetFolderId || null)}
                    onClearSelection={clearSelection}
                />

                {bulkActionMessage ? (
                    <p className={`mt-3 text-sm rounded-lg px-3 py-2 border ${
                        bulkActionTone === 'error'
                            ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : bulkActionTone === 'warning'
                                ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    }`}>
                        {bulkActionMessage}
                    </p>
                ) : null}

                {logic.viewMode === 'bin' ? (
                    <BinView user={user} cardScale={logic.cardScale} layoutMode={logic.layoutMode} />
                ) : logic.viewMode === 'shared' && !isStudentRole ? (
                    <>
                        <BreadcrumbNav
                            currentFolder={logic.currentFolder}
                            onNavigate={(folder: any) => {
                                handleSetCurrentFolder(folder);
                            }}
                            allFolders={logic.folders || []}
                            onDropOnBreadcrumb={handleBreadcrumbDrop}
                            draggedItem={logic.draggedItem}
                            draggedItemType={logic.draggedItemType}
                        />
                        <SharedView 
                            user={user}
                            homeThemeTokens={homeThemeTokens}
                            sharedFolders={sharedFolders}
                            sharedSubjects={sharedSubjects}
                            cardScale={logic.cardScale}
                            allFolders={logic.folders || []}
                            allSubjects={logic.subjects || []}
                            currentFolder={logic.currentFolder}
                            
                            layoutMode={logic.layoutMode} 

                            // Handlers
                            onOpenFolder={logic.handleOpenFolder}
                            onSelectSubject={(subject: any) => {
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

                            onEditFolder={(f) => logic.setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                            onDeleteFolder={(f, action = 'delete') => {
                                if (isShortcutItem(f) && f?.shortcutId) {
                                    logic.setDeleteConfig({
                                        isOpen: true,
                                        type: 'shortcut-folder',
                                        action: action === 'unshareAndDelete'
                                            ? 'unshare'
                                            : action === 'deleteShortcut'
                                                ? 'deleteShortcut'
                                            : action === 'showInManual'
                                                ? 'unhide'
                                                : 'hide',
                                        item: f
                                    });
                                    return;
                                }
                                logic.setDeleteConfig({ isOpen: true, type: 'folder', item: f });
                            }}
                            onShareFolder={(f) => logic.setFolderModalConfig({ isOpen: true, isEditing: true, data: f, initialTab: 'sharing' })}
                            onEditSubject={(e, s: any) => {
                                e.stopPropagation();
                                logic.setSubjectModalConfig({ isOpen: true, isEditing: true, data: s });
                                logic.setActiveMenu(null);
                            }}
                            onDeleteSubject={(e, s, action = 'delete') => {
                                e.stopPropagation();
                                if (isShortcutItem(s) && s?.shortcutId) {
                                    logic.setDeleteConfig({
                                        isOpen: true,
                                        type: 'shortcut-subject',
                                        action: action === 'unshareAndDelete'
                                            ? 'unshare'
                                            : action === 'deleteShortcut'
                                                ? 'deleteShortcut'
                                            : action === 'showInManual'
                                                ? 'unhide'
                                                : 'hide',
                                        item: s
                                    });
                                } else {
                                    logic.setDeleteConfig({ isOpen: true, type: 'subject', item: s });
                                }
                                logic.setActiveMenu(null);
                            }}
                            onShareSubject={(s: any) => {
                                handleOpenSubjectSharing(s);
                                logic.setActiveMenu(null);
                            }}
                            onOpenSubjectClasses={(s: any) => {
                                logic.setSubjectModalConfig({ isOpen: true, isEditing: true, data: s, initialTab: 'classes' });
                                logic.setActiveMenu(null);
                            }}

                            // Search
                            searchTerm={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                    </>
                ) : (
                    <>
                        <HomeShareConfirmModals
                            homeThemeTokens={homeThemeTokens}
                            shareConfirm={shareConfirm}
                            setShareConfirm={setShareConfirm}
                            unshareConfirm={unshareConfirm}
                            setUnshareConfirm={setUnshareConfirm}
                            subjects={logic.subjects || []}
                        />
                        <BreadcrumbNav 
                            currentFolder={logic.currentFolder} 
                            onNavigate={(folder: any) => {
                                handleSetCurrentFolder(folder);
                            }}
                            allFolders={logic.folders || []}
                            onDropOnBreadcrumb={handleBreadcrumbDrop}
                            draggedItem={logic.draggedItem}
                            draggedItemType={logic.draggedItemType}
                        />

                        {!hasInitialDataLoaded && logic.loading ? (
                            <HomeLoader />
                        ) : (
                            <>
                                {effectiveHasContent ? (
                                    <HomeContent 
                                        user={user}
                                        homeThemeTokens={homeThemeTokens}
                                        subjects={logic.subjects || []}
                                        folders={isStudentRole ? [] : (logic.folders || [])}
                                        resolvedShortcuts={isStudentRole
                                            ? (logic.resolvedShortcuts || []).filter(item => item?.targetType === 'subject')
                                            : (logic.resolvedShortcuts || [])}
                                        groupedContent={logic.groupedContent || {}} 
                                        collapsedGroups={logic.collapsedGroups || {}}
                                        orderedFolders={isStudentRole ? [] : displayedFolders}
                                        
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
                                        handleOpenFolder={(folder: any) => {
                                            handleSetCurrentFolder(folder);
                                        }}
                                        onCardFocus={handleCardFocus}
                                        getCardVisualState={getCardVisualState}
                                        handleShareFolder={logic.handleShareFolder}
                                        handlePromoteSubject={handlePromoteSubjectWrapper}
                                        handlePromoteFolder={handlePromoteFolderWrapper}
                                        handleDropOnFolder={handleDropOnFolderWrapper}
                                        handleNestFolder={handleNestFolder}
                                        handleShowFolderContents={handleShowFolderContents}
                                        onShareSubject={handleOpenSubjectSharing}
                                        
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
                                        sharedScopeSelected={effectiveSharedScopeSelected}
                                        studentMode={isStudentRole}
                                        selectMode={selectMode}
                                        selectedItemKeys={selectedItemKeys}
                                        onToggleSelectItem={toggleSelectItem}
                                        
                                        navigate={logic.navigate}
                                    />
                                ) : searchQuery ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="text-6xl mb-4">🔍</div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            No se encontraron resultados
                                        </h3>
                                        <p className={`${homeThemeTokens.mutedTextClass} text-center max-w-md`}>
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
                                        homeThemeTokens={homeThemeTokens}
                                        setSubjectModalConfig={logic.setSubjectModalConfig}
                                        viewMode={logic.viewMode}
                                        layoutMode={logic.layoutMode}
                                        canCreateSubject={canCreateInManualContext}
                                        cardScale={logic.cardScale || 100}
                                        currentFolder={logic.currentFolder}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </main>

            <HomeModals 
                user={user}
                homeThemeTokens={homeThemeTokens}
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
                onTransferOwnership={logic.transferFolderOwnership}
                onDeleteShortcut={logic.deleteShortcut}
                onShareSubject={logic.shareSubject}
                onUnshareSubject={logic.unshareSubject}
                onTransferSubjectOwnership={logic.transferSubjectOwnership}
                currentFolder={logic.currentFolder}
                allFolders={isStudentRole ? [] : (logic.folders || [])}
                subjects={logic.subjects || []}
                studentShortcutTagOnlyMode={isStudentRole}
            />
            
            <FolderTreeModal 
                isOpen={folderContentsModalConfig.isOpen}
                onClose={() => setFolderContentsModalConfig({ isOpen: false, folder: null })}
                rootFolder={activeModalFolder}
                allFolders={isStudentRole ? [] : treeFolders}
                allSubjects={treeSubjects}
                onNavigateFolder={(folder: any) => {
                    handleNavigateFromTree(folder);
                    setPersistedFolderId(folder);
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