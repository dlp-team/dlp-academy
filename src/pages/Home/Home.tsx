// src/pages/Home/Home.tsx
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
import { useHomeCreationGuards } from './hooks/useHomeCreationGuards';


// Layout & Global Components
import Header from '../../components/layout/Header';


// Sub-Components
import HomeControls from './components/HomeControls';
import HomeSelectionToolbar from './components/HomeSelectionToolbar';
import HomeLoader from './components/HomeLoader';
import HomeMainContent from './components/HomeMainContent';
import HomeModals from './components/HomeModals';
import UndoActionToast from '../../components/ui/UndoActionToast';
import AppToast from '../../components/ui/AppToast';
import FolderTreeModal from '../../components/modals/FolderTreeModal'; 
import SubjectTopicsModal from '../Subject/modals/SubjectTopicModal';

// Utils
import {
    getNormalizedRole,
    isSharedForCurrentUser as isSharedForCurrentUserUtil
} from '../../utils/permissionUtils';
import { useInstitutionHomeThemeTokens } from './hooks/useInstitutionHomeThemeTokens';
import {
    saveLastHomeFolderId,
    clearLastHomeFolderId,
    saveLastHomeViewMode
} from './utils/homePersistence';
import {
    getDraggedSelectionKeyFromDropArgs,
    getDraggedSelectionKeyFromDropEvent,
    shouldHandleSelectionDrop
} from './utils/homeSelectionDropUtils';

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
        handleCardFocus,
        shortcutFeedback,
        getCardVisualState,
        registerUndoAction,
        shortcutUndoToast,
        undoLatestShortcutAction,
        clearShortcutUndoToast
    } = useHomeKeyboardCoordination({
        user,
        logic
    });

    const {
        handleSaveFolderWrapper,
        handleUpwardDrop,
        handleBreadcrumbDrop,
        handleOpenTopics,
        handleDropOnFolderWrapper,
        moveSelectionEntryWithShareRules,
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
        rememberOrganization,
        onHomeFeedback: publishHomeFeedback,
        registerUndoAction
    });

    const {
        selectMode,
        setSelectMode,
        selectedItems,
        selectedItemKeys,
        bulkMoveTargetFolderId,
        availableMoveFolders,
        setBulkMoveTargetFolderId,
        clearSelection,
        undoToast,
        undoLastSelectionAction,
        clearUndoToast,
        toggleSelectItem,
        runBulkMoveToFolder,
        handleBulkDelete,
        handleCreateFolderFromSelection
    } = useHomeBulkSelection({
        logic,
        isStudentRole,
        onHomeFeedback: publishHomeFeedback,
        moveSelectionEntryWithShareRules
    });

    const handleSelectionAwareUpwardDrop = React.useCallback((event: any) => {
        const draggedSelectionKey = getDraggedSelectionKeyFromDropEvent(event);
        if (!shouldHandleSelectionDrop({ selectMode, selectedItemKeys, draggedSelectionKey })) {
            return false;
        }

        event.preventDefault();
        event.stopPropagation();
        const parentFolderId = logic.currentFolder?.parentId || null;
        void runBulkMoveToFolder(parentFolderId);
        return true;
    }, [logic.currentFolder?.parentId, runBulkMoveToFolder, selectMode, selectedItemKeys]);

    const handleSelectionAwareBreadcrumbDrop = React.useCallback((
        targetFolderId: any,
        subjectId: any,
        droppedFolderId: any,
        droppedFolderShortcutId: any = null,
        subjectShortcutId: any = null
    ) => {
        const draggedSelectionKey = getDraggedSelectionKeyFromDropArgs({
            subjectId,
            subjectShortcutId,
            folderId: droppedFolderId,
            folderShortcutId: droppedFolderShortcutId
        });

        if (shouldHandleSelectionDrop({ selectMode, selectedItemKeys, draggedSelectionKey })) {
            void runBulkMoveToFolder(targetFolderId || null);
            return 'moved';
        }

        return handleBreadcrumbDrop(
            targetFolderId,
            subjectId,
            droppedFolderId,
            droppedFolderShortcutId,
            subjectShortcutId
        );
    }, [handleBreadcrumbDrop, runBulkMoveToFolder, selectMode, selectedItemKeys]);

    const activeUndoToast = shortcutUndoToast || undoToast;
    const activeUndoAction = shortcutUndoToast ? undoLatestShortcutAction : undoLastSelectionAction;
    const activeUndoClose = shortcutUndoToast ? clearShortcutUndoToast : clearUndoToast;

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

    const {
        canCreateInManualContext,
        canCreateFolderInManualContext,
        effectiveHasContent
    } = useHomeCreationGuards({
        user,
        logic,
        isStudentRole,
        hasContent,
        teacherSubjectCreationAllowed: logic.teacherSubjectCreationAllowed
    });

    React.useEffect(() => {
        if (!bulkActionMessage) return;
        const timer = window.setTimeout(() => {
            setBulkActionMessage('');
            setBulkActionTone('success');
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [bulkActionMessage]);

    const showBulkToast = Boolean(bulkActionMessage);
    const showShortcutToast = !showBulkToast && Boolean(shortcutFeedback);
    const activeHomeToastMessage = showBulkToast ? bulkActionMessage : (showShortcutToast ? shortcutFeedback : '');

    const activeHomeToastVariant = showBulkToast
        ? (['success', 'warning', 'error'].includes(String(bulkActionTone || '').trim())
            ? bulkActionTone
            : 'info')
        : 'info';

    const activeHomeToastTitle = showBulkToast
        ? (activeHomeToastVariant === 'error'
            ? 'Error'
            : activeHomeToastVariant === 'warning'
                ? 'Atencion'
                : 'Accion completada')
        : 'Atajo de teclado';

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
                        if (handleSelectionAwareUpwardDrop(e)) {
                            return;
                        }
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
                        showOnlyCurrentSubjects={Boolean(logic.showOnlyCurrentSubjects)}
                        setShowOnlyCurrentSubjects={logic.setShowOnlyCurrentSubjects}
                        coursesAcademicYearFilter={logic.coursesAcademicYearFilter}
                        setCoursesAcademicYearFilter={logic.setCoursesAcademicYearFilter}
                        availableCourseAcademicYears={logic.availableCourseAcademicYears || []}
                        subjectPeriodFilter={logic.subjectPeriodFilter || ''}
                        setSubjectPeriodFilter={logic.setSubjectPeriodFilter}
                        availableSubjectPeriods={logic.availableSubjectPeriods || []}
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

                <HomeSelectionToolbar
                    visible={logic.viewMode !== 'shared' && logic.viewMode !== 'bin' && !isStudentRole}
                    selectMode={selectMode}
                    selectedCount={selectedItems.length}
                    bulkMoveTargetFolderId={bulkMoveTargetFolderId}
                    folders={availableMoveFolders}
                    onToggleSelectMode={() => {
                        setSelectMode((prev) => !prev);
                        setBulkActionMessage('');
                        setBulkActionTone('success');
                        if (selectMode) {
                            clearSelection();
                            clearUndoToast();
                        }
                    }}
                    onDeleteSelected={handleBulkDelete}
                    onCreateFolderFromSelection={handleCreateFolderFromSelection}
                    onMoveTargetChange={setBulkMoveTargetFolderId}
                    onMoveSelection={() => runBulkMoveToFolder(bulkMoveTargetFolderId || null)}
                    onClearSelection={clearSelection}
                />

                <UndoActionToast
                    message={activeUndoToast?.message || ''}
                    tone="warning"
                    actionLabel={activeUndoToast?.actionLabel || 'Deshacer'}
                    onAction={activeUndoAction}
                    onClose={activeUndoClose}
                />

                <AppToast
                    show={Boolean(activeHomeToastMessage)}
                    title={activeHomeToastTitle}
                    message={activeHomeToastMessage}
                    variant={activeHomeToastVariant}
                    durationMs={showBulkToast ? 3000 : 3200}
                    positionClassName="bottom-24 left-5"
                    onClose={showBulkToast
                        ? () => {
                            setBulkActionMessage('');
                            setBulkActionTone('success');
                        }
                        : undefined}
                />

                <HomeMainContent
                    user={user}
                    logic={logic}
                    isStudentRole={isStudentRole}
                    homeThemeTokens={homeThemeTokens}
                    sharedFolders={sharedFolders}
                    sharedSubjects={sharedSubjects}
                    sharedSelectedTags={sharedSelectedTags}
                    effectiveSharedScopeSelected={effectiveSharedScopeSelected}
                    shareConfirm={shareConfirm}
                    setShareConfirm={setShareConfirm}
                    unshareConfirm={unshareConfirm}
                    setUnshareConfirm={setUnshareConfirm}
                    hasInitialDataLoaded={hasInitialDataLoaded}
                    effectiveHasContent={effectiveHasContent}
                    displayedFolders={displayedFolders}
                    isFilterOpen={isFilterOpen}
                    isScaleOverlayOpen={isScaleOverlayOpen}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    canCreateInManualContext={canCreateInManualContext}
                    selectMode={selectMode}
                    setSelectMode={setSelectMode}
                    selectedItemKeys={selectedItemKeys}
                    toggleSelectItem={toggleSelectItem}
                    runBulkMoveToFolder={runBulkMoveToFolder}
                    handleSetCurrentFolder={handleSetCurrentFolder}
                    handleBreadcrumbDrop={handleSelectionAwareBreadcrumbDrop}
                    handleOpenSubjectSharing={handleOpenSubjectSharing}
                    handlePromoteSubjectWrapper={handlePromoteSubjectWrapper}
                    handlePromoteFolderWrapper={handlePromoteFolderWrapper}
                    handleDropOnFolderWrapper={handleDropOnFolderWrapper}
                    handleNestFolder={handleNestFolder}
                    handleShowFolderContents={handleShowFolderContents}
                    handleTreeMoveSubject={handleTreeMoveSubject}
                    handleOpenTopics={handleOpenTopics}
                    handleCardFocus={handleCardFocus}
                    getCardVisualState={getCardVisualState}
                />
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