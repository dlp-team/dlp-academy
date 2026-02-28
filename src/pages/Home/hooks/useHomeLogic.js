// src/pages/Home/hooks/useHomeLogic.js
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../../../hooks/useSubjects';
import { useFolders } from '../../../hooks/useFolders';
import { useShortcuts } from '../../../hooks/useShortcuts';
import { useUserPreferences } from '../../../hooks/useUserPreferences';
import { isDescendant } from '../../../utils/folderUtils';
import { useHomeState } from './useHomeState';
import { useHomeHandlers } from './useHomeHandlers';
import { isReadOnlyRole } from '../../../utils/permissionUtils';


export const useHomeLogic = (user, searchQuery = '') => {
    const navigate = useNavigate();
    const studentShortcutTagOnlyMode = isReadOnlyRole(user);
    
    // Data Logic
    const { subjects, loading, addSubject, updateSubject, deleteSubject, touchSubject, shareSubject, unshareSubject, transferSubjectOwnership } = useSubjects(user);
    const { 
        folders, 
        loading: loadingFolders, 
        addFolder, 
        updateFolder, 
        deleteFolder, 
        deleteFolderOnly,
        shareFolder,
        unshareFolder,
        transferFolderOwnership,
        addSubjectToFolder
    } = useFolders(user);
    
    // Shortcuts Logic
    const { 
        shortcuts,
        resolvedShortcuts,
        loading: loadingShortcuts,
        createShortcut,
        deleteShortcut,
        moveShortcut,
        updateShortcutAppearance,
        setShortcutHiddenInManual,
        deleteOrphanedShortcuts
    } = useShortcuts(user);

    const { 
        preferences, 
        loading: loadingPreferences, 
        updatePreference 
    } = useUserPreferences(user, 'home');

    const {
        viewMode,
        setViewMode,
        layoutMode,
        setLayoutMode,
        cardScale,
        setCardScale,
        flippedSubjectId,
        setFlippedSubjectId,
        activeMenu,
        setActiveMenu,
        collapsedGroups,
        setCollapsedGroups,
        selectedTags,
        setSelectedTags,
        currentFolder,
        setCurrentFolder,
        activeFilter,
        setActiveFilter,
        draggedItem,
        setDraggedItem,
        draggedItemType,
        setDraggedItemType,
        dropPosition,
        setDropPosition,
        manualOrder,
        setManualOrder,
        subjectModalConfig,
        setSubjectModalConfig,
        folderModalConfig,
        setFolderModalConfig,
        deleteConfig,
        setDeleteConfig,
        groupedContent,
        orderedFolders,
        allTags,
        filteredFoldersByTags,
        filteredFolders,
        searchFolders,
        searchSubjects,
        sharedFolders,
        sharedSubjects,
        isDragAndDropEnabled,
        shortcuts: resolvedShortcutItems
    } = useHomeState({
        user,
        searchQuery,
        subjects,
        folders,
        preferences,
        loadingPreferences,
        updatePreference
    });

    const {
        handleSaveSubject,
        handleSaveFolder,
        handleDelete,
        handleDeleteFolderAll,
        handleDeleteFolderOnly,
        handleSelectSubject,
        handleOpenFolder,
        handleShareFolder,
        toggleGroup,
        handleFilterChange,
        handleDragStartSubject,
        handleDragStartFolder,
        handleDragEnd,
        handleDragOverSubject,
        handleDragOverFolder,
        handleDropOnFolder,
        handleNestFolder,
        handleDropReorderSubject,
        handleDropReorderFolder,
        handlePreferenceChange
    } = useHomeHandlers({
        user,
        subjects,
        folders,
        filteredFolders,
        currentFolder,
        groupedContent,
        orderedFolders,
        subjectModalConfig,
        folderModalConfig,
        deleteConfig,
        setSubjectModalConfig,
        setFolderModalConfig,
        setDeleteConfig,
        setCurrentFolder,
        setCollapsedGroups,
        setManualOrder,
        setActiveFilter,
        setDraggedItem,
        setDraggedItemType,
        setDropPosition,
        touchSubject,
        updateSubject,
        addSubject,
        addSubjectToFolder,
        updateFolder,
        addFolder,
        deleteSubject,
        deleteFolder,
        deleteFolderOnly,
        deleteShortcut,
        unshareSubject,
        unshareFolder,
        updatePreference,
        navigate,
        isDescendant,
        createShortcut,
        updateShortcutAppearance,
        setShortcutHiddenInManual,
        studentShortcutTagOnlyMode
    });



    return {
        // Data
        user,
        subjects,
        folders,
        shortcuts,
        resolvedShortcuts: resolvedShortcutItems,
        searchFolders,
        searchSubjects,
        loading,
        loadingFolders,
        loadingShortcuts,
        sharedFolders,
        sharedSubjects,
        groupedContent,
        orderedFolders,
        allTags,
        filteredFoldersByTags, 
        filteredFolders,
        
        // State
        viewMode, setViewMode,
        layoutMode, setLayoutMode,
        cardScale, setCardScale,
        flippedSubjectId, setFlippedSubjectId,
        activeMenu, setActiveMenu,
        collapsedGroups,
        selectedTags, setSelectedTags,
        currentFolder, setCurrentFolder,
        draggedItem,
        draggedItemType,
        isDragAndDropEnabled,
        loadingPreferences,
        
        // New State
        activeFilter,
        
        // Modals State
        subjectModalConfig, setSubjectModalConfig,
        folderModalConfig, setFolderModalConfig,
        deleteConfig, setDeleteConfig,

        // Handlers
        handleSaveSubject,
        handleSaveFolder,
        handleDelete,
        handleDeleteFolderAll,
        handleDeleteFolderOnly,
        handleSelectSubject,
        handleOpenFolder,
        handleShareFolder,
        toggleGroup,
        touchSubject,
        handleFilterChange,
        
        // Drag & Drop Handlers
        handleDragStartSubject,
        handleDragStartFolder,
        handleDragEnd,
        handleDragOverSubject,
        handleDragOverFolder,
        handleDropOnFolder,
        handleNestFolder,
        handleDropReorderSubject,
        handleDropReorderFolder,
        handlePreferenceChange,

        // Share Functions
        shareFolder,
        unshareFolder,
        transferFolderOwnership,
        shareSubject,
        unshareSubject,
        transferSubjectOwnership,
        
        // Shortcut Functions
        createShortcut,
        deleteShortcut,
        moveShortcut,
        updateShortcutAppearance,
        setShortcutHiddenInManual,
        deleteOrphanedShortcuts,

        // Navigation
        navigate
    };
};