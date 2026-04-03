// src/pages/Home/hooks/useHomeLogic.js
// src/pages/Home/hooks/useHomeLogic.js
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../../../hooks/useSubjects';
import { useFolders } from '../../../hooks/useFolders';
import { useShortcuts } from '../../../hooks/useShortcuts';
import { useUserPreferences } from '../../../hooks/useUserPreferences';
import { isDescendant } from '../../../utils/folderUtils';
import { useHomeState } from '../../../hooks/useHomeState';
import { useHomeHandlers } from '../../../hooks/useHomeHandlers';
import { isReadOnlyRole } from '../../../utils/permissionUtils';


export const useHomeLogic = (user: any, searchQuery = '', rememberOrganization = true, onHomeFeedback: any = null) => {
    const navigate = useNavigate();
    const studentShortcutTagOnlyMode = isReadOnlyRole(user);
    
    // Data Logic
    const {
        subjects,
        loading,
        teacherSubjectCreationAllowed,
        completedSubjectIds,
        setSubjectCompletion,
        addSubject,
        updateSubject,
        deleteSubject,
        touchSubject,
        shareSubject,
        unshareSubject,
        transferSubjectOwnership,
        getTrashedSubjects,
        restoreSubject
    } = useSubjects(user);
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
        showOnlyCurrentSubjects,
        setShowOnlyCurrentSubjects,
        coursesAcademicYearFilter,
        setCoursesAcademicYearFilter,
        availableCourseAcademicYears,
        subjectPeriodFilter,
        setSubjectPeriodFilter,
        availableSubjectPeriods,
        currentFolder,
        setCurrentFolder,
        activeFilter,
        setActiveFilter,
        draggedItem,
        setDraggedItem,
        draggedItemType,
        setDraggedItemType,
        setDropPosition,
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
        shortcuts: resolvedShortcuts,
        isDragAndDropEnabled
    } = useHomeState({
        user,
        searchQuery,
        subjects,
        folders,
        completedSubjectIds,
        preferences,
        loadingPreferences,
        updatePreference,
        rememberOrganization
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
        getTrashedSubjects,
        restoreSubject,
        deleteFolderOnly,
        updatePreference,
        navigate,
        isDescendant,
        createShortcut,
        updateShortcutAppearance,
        setShortcutHiddenInManual,
        studentShortcutTagOnlyMode,
        rememberOrganization,
        onHomeFeedback
    });



    return {
        // Data
        user,
        subjects,
        folders,
        teacherSubjectCreationAllowed,
        completedSubjectIds,
        shortcuts,
        resolvedShortcuts,
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
        showOnlyCurrentSubjects,
        setShowOnlyCurrentSubjects,
        coursesAcademicYearFilter,
        setCoursesAcademicYearFilter,
        availableCourseAcademicYears,
        subjectPeriodFilter,
        setSubjectPeriodFilter,
        availableSubjectPeriods,
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

        // Direct CRUD (for keyboard workflows)
        addSubject,
        addFolder,
        updateSubject,
        updateFolder,
        deleteSubject,
        deleteFolder,
        setSubjectCompletion,
        
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