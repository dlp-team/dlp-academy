// src/pages/Home/Home.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';


// Logic Hook
import { useHomeLogic } from './hooks/useHomeLogic';
import { useFolders } from '../../hooks/useFolders'; 
import { useHomePageState } from './hooks/useHomePageState';
import { useHomePageHandlers } from './hooks/useHomePageHandlers';
import { useHomeKeyboardShortcuts } from './hooks/useHomeKeyboardShortcuts';


// Layout & Global Components
import Header from '../../components/layout/Header';
import BreadcrumbNav from './components/BreadcrumbNav';
import SharedView from './components/SharedView';


// Sub-Components
import HomeControls from './components/HomeControls';
import HomeSelectionToolbar from './components/HomeSelectionToolbar';
import HomeContent from './components/HomeContent';
import HomeEmptyState from './components/HomeEmptyState';
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
import { mergeSourceAndShortcutItems } from '../../utils/mergeUtils';
import { useInstitutionHomeThemeTokens } from './hooks/useInstitutionHomeThemeTokens';
import {
    saveLastHomeFolderId,
    clearLastHomeFolderId,
    saveLastHomeViewMode
} from './utils/homePersistence';



const Home = ({ user }) => {

    const [searchQuery, setSearchQuery] = useState('');
    const [sharedScopeSelected, setSharedScopeSelected] = useState(true);
    const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [selectedItemsByKey, setSelectedItemsByKey] = useState({});
    const [bulkMoveTargetFolderId, setBulkMoveTargetFolderId] = useState('');
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

    const logic = useHomeLogic(user, searchQuery, rememberOrganization, publishHomeFeedback);
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
    const setPersistedFolderId = React.useCallback((folder) => {
        if (!rememberOrganization) return;
        if (folder && folder.id) {
            saveLastHomeFolderId(folder.id);
        } else {
            clearLastHomeFolderId();
        }
    }, [rememberOrganization]);

    const setPersistedViewMode = React.useCallback((mode) => {
        if (!rememberOrganization) return;
        if (mode) {
            saveLastHomeViewMode(mode);
        }
    }, [rememberOrganization]);

    const handleSetCurrentFolder = React.useCallback((folder) => {
        logic.setCurrentFolder(folder);
        setPersistedFolderId(folder);
    }, [logic, setPersistedFolderId]);

    const handleOpenSubjectSharing = React.useCallback((subject) => {
        logic.setSubjectModalConfig({ isOpen: true, isEditing: true, data: subject, initialTab: 'sharing' });
    }, [logic]);

    React.useEffect(() => {
        if (!user) {
            setHasInitialDataLoaded(false);
            return;
        }

        if (!logic.loading && !logic.loadingFolders) {
            setHasInitialDataLoaded(true);
        }
    }, [user, logic.loading, logic.loadingFolders]);

    React.useEffect(() => {
        if (isStudentRole) {
            if (logic.currentFolder) {
                logic.setCurrentFolder(null);
            }
            if (logic.viewMode === 'shared') {
                logic.setViewMode('grid');
            }
            if (rememberOrganization) {
                clearLastHomeFolderId();
            }
            const next = new URLSearchParams(searchParams);
            if (next.has('folderId')) {
                next.delete('folderId');
                setSearchParams(next, { replace: true });
            }
            return;
        }

        if (!folderIdFromUrl || !Array.isArray(logic.folders) || logic.folders.length === 0) return;

        const targetFolder = logic.folders.find(folder => folder.id === folderIdFromUrl);

        if (targetFolder && (!logic.currentFolder || logic.currentFolder.id !== targetFolder.id)) {
            logic.setCurrentFolder(targetFolder);
            setPersistedFolderId(targetFolder);
        }

        if (!targetFolder) {
            const next = new URLSearchParams(searchParams);
            next.delete('folderId');
            setSearchParams(next, { replace: true });
        }
    }, [folderIdFromUrl, logic.folders, isStudentRole, rememberOrganization, setSearchParams, setPersistedFolderId]);

    React.useEffect(() => {
        if (isStudentRole) return;
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
    }, [logic.currentFolder?.id, isStudentRole]);

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

    const { handleCardFocus, shortcutFeedback, getCardVisualState } = useHomeKeyboardShortcuts({
        user,
        logic
    });

    const treeFolders = useMemo(() => {
        const baseFolders = Array.isArray(logic.folders) ? logic.folders : [];
        const shortcutFolders = Array.isArray(logic.resolvedShortcuts)
            ? logic.resolvedShortcuts.filter(item => item?.targetType === 'folder')
            : [];

        return mergeSourceAndShortcutItems({
            sourceItems: baseFolders,
            shortcutItems: shortcutFolders
        });
    }, [logic.folders, logic.resolvedShortcuts]);

    const treeSubjects = useMemo(() => {
        const baseSubjects = Array.isArray(logic.subjects) ? logic.subjects : [];
        const shortcutSubjects = Array.isArray(logic.resolvedShortcuts)
            ? logic.resolvedShortcuts.filter(item => item?.targetType === 'subject')
            : [];

        return mergeSourceAndShortcutItems({
            sourceItems: baseSubjects,
            shortcutItems: shortcutSubjects
        });
    }, [logic.subjects, logic.resolvedShortcuts]);

    const isSharedForCurrentUser = React.useCallback((item) => {
        return isSharedForCurrentUserUtil(item, user);
    }, [user]);

    const effectiveSharedScopeSelected = logic.viewMode === 'shared' ? true : sharedScopeSelected;

    React.useEffect(() => {
        if (logic.viewMode === 'shared' && sharedScopeSelected !== true) {
            setSharedScopeSelected(true);
        }
    }, [logic.viewMode, sharedScopeSelected]);

    const availableControlTags = useMemo(() => {
        const sourceFolders = logic.viewMode === 'shared' ? (sharedFolders || []) : (logic.filteredFolders || logic.folders || []);
        const sourceSubjects = logic.viewMode === 'shared' ? (sharedSubjects || []) : (logic.filteredSubjects || logic.subjects || []);

        const roleScopedFolders = isStudentRole ? [] : sourceFolders;

        const effectiveFolders = effectiveSharedScopeSelected ? roleScopedFolders : roleScopedFolders.filter(item => !isSharedForCurrentUser(item));
        const effectiveSubjects = effectiveSharedScopeSelected ? sourceSubjects : sourceSubjects.filter(item => !isSharedForCurrentUser(item));

        const tagSet = new Set();
        effectiveFolders.forEach(folder => (Array.isArray(folder?.tags) ? folder.tags : []).forEach(tag => tagSet.add(tag)));
        effectiveSubjects.forEach(subject => (Array.isArray(subject?.tags) ? subject.tags : []).forEach(tag => tagSet.add(tag)));

        return Array.from(tagSet).filter(Boolean).sort();
    }, [logic.viewMode, sharedFolders, sharedSubjects, logic.filteredFolders, logic.folders, logic.filteredSubjects, logic.subjects, effectiveSharedScopeSelected, isSharedForCurrentUser, isStudentRole]);

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

    const selectedItems = useMemo(() => Object.values(selectedItemsByKey), [selectedItemsByKey]);
    const selectedItemKeys = useMemo(() => new Set(Object.keys(selectedItemsByKey)), [selectedItemsByKey]);

    const buildSelectionKey = React.useCallback((item, type) => `${type}:${item?.shortcutId || item?.id}`, []);

    const clearSelection = React.useCallback(() => {
        setSelectedItemsByKey({});
        setBulkMoveTargetFolderId('');
    }, []);

    const setSelectionFromEntries = React.useCallback((entries = []) => {
        const nextSelection = {};
        entries.forEach((entry) => {
            if (!entry?.key) return;
            nextSelection[entry.key] = entry;
        });
        setSelectedItemsByKey(nextSelection);
        if (entries.length === 0) {
            setBulkMoveTargetFolderId('');
        }
    }, []);

    const toggleSelectItem = React.useCallback((item, type) => {
        if (!item?.id || !type) return;
        const key = buildSelectionKey(item, type);
        setSelectedItemsByKey((prev) => {
            if (prev[key]) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return {
                ...prev,
                [key]: { key, type, item }
            };
        });
    }, [buildSelectionKey]);

    const runBulkMoveToFolder = React.useCallback(async (targetFolderId) => {
        const destination = targetFolderId || null;
        const itemsToMove = Object.values(selectedItemsByKey);
        if (itemsToMove.length === 0) return;

        const settledResults = await Promise.allSettled(
            itemsToMove.map(async (entry) => {
                const item = entry?.item;
                const type = entry?.type;
                if (!item?.id || !type) {
                    return { moved: false, skipped: true, entry };
                }

                try {
                    if (type === 'subject') {
                        if (isShortcutItem(item) && item?.shortcutId) {
                            await logic.moveShortcut(item.shortcutId, destination);
                            return { moved: true, entry };
                        }

                        await logic.updateSubject(item.id, { folderId: destination });
                        return { moved: true, entry };
                    }

                    if (type === 'folder') {
                        if (destination && item.id === destination) {
                            return { moved: false, skipped: true, entry };
                        }

                        if (isShortcutItem(item) && item?.shortcutId) {
                            await logic.moveShortcut(item.shortcutId, destination);
                            return { moved: true, entry };
                        }

                        await logic.updateFolder(item.id, { parentId: destination });
                        return { moved: true, entry };
                    }

                    return { moved: false, skipped: true, entry };
                } catch (error) {
                    const wrappedError = new Error(error?.message || 'No se pudo mover el elemento.');
                    wrappedError.entry = entry;
                    throw wrappedError;
                }
            })
        );

        let moved = 0;
        const failedEntries = [];

        settledResults.forEach((result) => {
            if (result.status === 'fulfilled') {
                if (result.value?.moved) moved += 1;
                return;
            }

            if (result.reason?.entry) {
                failedEntries.push(result.reason.entry);
            }
        });

        if (failedEntries.length > 0) {
            setSelectionFromEntries(failedEntries);
            setSelectMode(true);
        } else {
            clearSelection();
            setSelectMode(false);
        }

        if (failedEntries.length === 0) {
            publishHomeFeedback(`Se movieron ${moved} elemento(s).`, 'success');
        } else if (moved === 0) {
            publishHomeFeedback('No se pudieron mover los elementos seleccionados por permisos o conflictos.', 'error');
        } else {
            publishHomeFeedback(`Se movieron ${moved} elemento(s) y ${failedEntries.length} no se pudieron mover.`, 'warning');
        }
    }, [selectedItemsByKey, logic, clearSelection, setSelectionFromEntries, publishHomeFeedback]);

    const handleBulkDelete = React.useCallback(async () => {
        const itemsToDelete = Object.values(selectedItemsByKey);
        if (itemsToDelete.length === 0) return;

        const settledResults = await Promise.allSettled(
            itemsToDelete.map(async (entry) => {
                const item = entry?.item;
                const type = entry?.type;
                if (!item?.id || !type) {
                    return { deleted: false, skipped: true, entry };
                }

                try {
                    if (isShortcutItem(item) && item?.shortcutId) {
                        await logic.deleteShortcut(item.shortcutId);
                        return { deleted: true, entry };
                    }

                    if (type === 'subject') {
                        await logic.deleteSubject(item.id);
                        return { deleted: true, entry };
                    }

                    await logic.deleteFolder(item.id);
                    return { deleted: true, entry };
                } catch (error) {
                    const wrappedError = new Error(error?.message || 'No se pudo eliminar el elemento.');
                    wrappedError.entry = entry;
                    throw wrappedError;
                }
            })
        );

        let deleted = 0;
        const failedEntries = [];

        settledResults.forEach((result) => {
            if (result.status === 'fulfilled') {
                if (result.value?.deleted) deleted += 1;
                return;
            }

            if (result.reason?.entry) {
                failedEntries.push(result.reason.entry);
            }
        });

        if (failedEntries.length > 0) {
            setSelectionFromEntries(failedEntries);
            setSelectMode(true);
        } else {
            clearSelection();
            setSelectMode(false);
        }

        if (failedEntries.length === 0) {
            publishHomeFeedback(`Se eliminaron ${deleted} elemento(s).`, 'success');
        } else if (deleted === 0) {
            publishHomeFeedback('No se pudieron eliminar los elementos seleccionados por permisos o dependencias.', 'error');
        } else {
            publishHomeFeedback(`Se eliminaron ${deleted} elemento(s) y ${failedEntries.length} no se pudieron eliminar.`, 'warning');
        }
    }, [selectedItemsByKey, logic, clearSelection, setSelectionFromEntries, publishHomeFeedback]);

    const handleCreateFolderFromSelection = React.useCallback(async () => {
        const itemsToOrganize = Object.values(selectedItemsByKey);
        if (itemsToOrganize.length === 0) return;

        try {
            const createdFolder = await logic.addFolder({
                name: 'Nueva carpeta seleccionada',
                parentId: logic.currentFolder?.id || null,
                color: 'from-amber-400 to-amber-600'
            });

            await runBulkMoveToFolder(createdFolder?.id || null);
            publishHomeFeedback('Se creó una carpeta nueva y se procesó la selección.', 'success');
            setSelectMode(false);
        } catch {
            publishHomeFeedback('No se pudo crear la carpeta para organizar la selección.', 'error');
        }
    }, [selectedItemsByKey, logic, runBulkMoveToFolder, publishHomeFeedback]);

    React.useEffect(() => {
        if (logic.viewMode === 'shared' || logic.viewMode === 'bin' || isStudentRole) {
            setSelectMode(false);
            clearSelection();
        }
    }, [logic.viewMode, isStudentRole, clearSelection]);

    React.useEffect(() => {
        if (!bulkActionMessage) return;
        const timer = window.setTimeout(() => {
            setBulkActionMessage('');
            setBulkActionTone('success');
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [bulkActionMessage]);

    React.useEffect(() => {
        const availableTagSet = new Set(availableControlTags);
        if (logic.viewMode === 'shared') {
            const pruned = (sharedSelectedTags || []).filter(tag => availableTagSet.has(tag));
            if (pruned.length !== (sharedSelectedTags || []).length) {
                setSharedSelectedTags(pruned);
            }
            return;
        }

        const currentTags = logic.selectedTags || [];
        const pruned = currentTags.filter(tag => availableTagSet.has(tag));
        if (pruned.length !== currentTags.length) {
            logic.setSelectedTags(pruned);
        }
    }, [availableControlTags, logic.viewMode, sharedSelectedTags, setSharedSelectedTags, logic.selectedTags, logic.setSelectedTags]);

    if (!user || (!hasInitialDataLoaded && (logic.loading || logic.loadingFolders))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    return (
        <div
            className="home-page min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors"
            style={homeThemeTokens.cssVariables}
        >
            <Header user={user} />

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
                        setCurrentFolder={(folder) => {
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

                {shortcutFeedback ? (
                    <p className={`${homeThemeTokens.mutedTextClass} mt-4 rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60`}>
                        {shortcutFeedback}
                    </p>
                ) : null}

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
                            onNavigate={(folder) => {
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
                            onEditSubject={(e, s) => {
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
                            onShareSubject={(s) => {
                                handleOpenSubjectSharing(s);
                                logic.setActiveMenu(null);
                            }}
                            onOpenSubjectClasses={(s) => {
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
                            onNavigate={(folder) => {
                                handleSetCurrentFolder(folder);
                            }}
                            allFolders={logic.folders || []}
                            onDropOnBreadcrumb={handleBreadcrumbDrop}
                            draggedItem={logic.draggedItem}
                            draggedItemType={logic.draggedItemType}
                        />

                        {!hasInitialDataLoaded && logic.loading ? (
                             <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            </div>
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
                                        handleOpenFolder={(folder) => {
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
                onNavigateFolder={(folder) => {
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