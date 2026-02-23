// src/pages/Home/hooks/useHomeLogic.js
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../../../hooks/useSubjects';
import { useFolders } from '../../../hooks/useFolders';
import { useShortcuts } from '../../../hooks/useShortcuts';
import { useUserPreferences } from '../../../hooks/useUserPreferences';
import { isDescendant } from '../../../utils/folderUtils';
import { useHomeState } from './useHomeState';
import { useHomeHandlers } from './useHomeHandlers';


export const useHomeLogic = (user, searchQuery = '') => {
    const navigate = useNavigate();
    
    // Data Logic
    const { subjects, loading, addSubject, updateSubject, deleteSubject, touchSubject, shareSubject, unshareSubject } = useSubjects(user);
    const { 
        folders, 
        loading: loadingFolders, 
        addFolder, 
        updateFolder, 
        deleteFolder, 
        deleteFolderOnly,
        shareFolder,
        unshareFolder,
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
        searchFolders,
        searchSubjects,
        sharedFolders,
        sharedSubjects,
        isDragAndDropEnabled
    } = useHomeState({
        user,
        searchQuery,
        subjects,
        folders,
        preferences,
        loadingPreferences
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
        currentFolder,
        viewMode,
        groupedContent,
        orderedFolders,
        subjectModalConfig,
        folderModalConfig,
        deleteConfig,
        setSubjectModalConfig,
        setFolderModalConfig,
        setDeleteConfig,
        setCurrentFolder,
        setViewMode,
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
        updatePreference,
        navigate,
        isDescendant,
        createShortcut,
        updateShortcutAppearance
    });



    return {
        // Data
        subjects, 
        folders,
        shortcuts,
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
        shareSubject,
        unshareSubject,
        
        // Shortcut Functions
        createShortcut,
        deleteShortcut,
        moveShortcut,
        updateShortcutAppearance,
        deleteOrphanedShortcuts,

        // Navigation
        navigate
    };
};