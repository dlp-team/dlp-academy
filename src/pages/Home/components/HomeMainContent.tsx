// src/pages/Home/components/HomeMainContent.tsx
import React from 'react';
import BreadcrumbNav from './BreadcrumbNav';
import SharedView from './SharedView';
import HomeContent from './HomeContent';
import HomeEmptyState from './HomeEmptyState';
import HomeLoader from './HomeLoader';
import HomeShareConfirmModals from './HomeShareConfirmModals';
import BinView from './BinView';
import { isShortcutItem } from '../../../utils/permissionUtils';

type HomeMainContentProps = {
    user: any;
    logic: any;
    isStudentRole: boolean;
    homeThemeTokens: any;
    sharedFolders: any[];
    sharedSubjects: any[];
    sharedSelectedTags: string[];
    effectiveSharedScopeSelected: boolean;
    shareConfirm: any;
    setShareConfirm: any;
    unshareConfirm: any;
    setUnshareConfirm: any;
    hasInitialDataLoaded: boolean;
    effectiveHasContent: boolean;
    displayedFolders: any[];
    isFilterOpen: boolean;
    isScaleOverlayOpen: boolean;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    canCreateInManualContext: boolean;
    selectMode: boolean;
    selectedItemKeys: Set<string>;
    toggleSelectItem: (item: any, type: any) => void;
    handleSetCurrentFolder: (folder: any) => void;
    handleBreadcrumbDrop: any;
    handleOpenSubjectSharing: (subject: any) => void;
    handlePromoteSubjectWrapper: any;
    handlePromoteFolderWrapper: any;
    handleDropOnFolderWrapper: any;
    handleNestFolder: any;
    handleShowFolderContents: any;
    handleTreeMoveSubject: any;
    handleOpenTopics: any;
    handleCardFocus: any;
    getCardVisualState: any;
};

const HomeMainContent = ({
    user,
    logic,
    isStudentRole,
    homeThemeTokens,
    sharedFolders,
    sharedSubjects,
    sharedSelectedTags,
    effectiveSharedScopeSelected,
    shareConfirm,
    setShareConfirm,
    unshareConfirm,
    setUnshareConfirm,
    hasInitialDataLoaded,
    effectiveHasContent,
    displayedFolders,
    isFilterOpen,
    isScaleOverlayOpen,
    searchQuery,
    setSearchQuery,
    canCreateInManualContext,
    selectMode,
    selectedItemKeys,
    toggleSelectItem,
    handleSetCurrentFolder,
    handleBreadcrumbDrop,
    handleOpenSubjectSharing,
    handlePromoteSubjectWrapper,
    handlePromoteFolderWrapper,
    handleDropOnFolderWrapper,
    handleNestFolder,
    handleShowFolderContents,
    handleTreeMoveSubject,
    handleOpenTopics,
    handleCardFocus,
    getCardVisualState
}: HomeMainContentProps) => {
    if (logic.viewMode === 'bin') {
        return <BinView user={user} cardScale={logic.cardScale} layoutMode={logic.layoutMode} />;
    }

    if (logic.viewMode === 'shared' && !isStudentRole) {
        return (
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
                    onOpenFolder={logic.handleOpenFolder}
                    onSelectSubject={(subject: any) => {
                        logic.touchSubject(subject.id);
                        logic.navigate(`/home/subject/${subject.id}`);
                    }}
                    activeMenu={logic.activeMenu}
                    onToggleMenu={logic.setActiveMenu}
                    flippedSubjectId={logic.flippedSubjectId}
                    onFlipSubject={logic.setFlippedSubjectId}
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
                    searchTerm={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </>
        );
    }

    return (
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
                            completedSubjectIds={logic.completedSubjectIds || []}
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
                            setSubjectCompletion={logic.setSubjectCompletion}
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
    );
};

export default HomeMainContent;
