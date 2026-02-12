// src/hooks/useHomeLogic.js
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from './useSubjects';
import { useFolders } from './useFolders';
import { useUserPreferences } from './useUserPreferences';

const normalizeText = (text) => {
    return (text || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

export const useHomeLogic = (user, searchQuery = '') => {
    console.log("DEBUG: useHomeLogic received searchQuery:", searchQuery);
    const navigate = useNavigate();
    
    // Data Logic
    const { subjects, loading, addSubject, updateSubject, deleteSubject, touchSubject, shareSubject, unshareSubject } = useSubjects(user);
    const { 
        folders, 
        loading: loadingFolders, 
        addFolder, 
        updateFolder, 
        deleteFolder, 
        shareFolder,
        unshareFolder,
        addSubjectToFolder
    } = useFolders(user);

    console.log('DEBUG: Raw Data from Hooks:', { 
        subjectsCount: subjects?.length, 
        foldersCount: folders?.length,
        loading 
    });





    
    const { 
        preferences, 
        loading: loadingPreferences, 
        updatePreference 
    } = useUserPreferences(user, 'home');

    // UI State
    const [viewMode, setViewMode] = useState(preferences?.viewMode || 'grid');
    const [layoutMode, setLayoutMode] = useState(preferences?.layoutMode || 'grid');
    const [cardScale, setCardScale] = useState(preferences?.cardScale || 100); // Default to M (100%)
    const [selectedTags, setSelectedTags] = useState(preferences?.selectedTags || []);
    const [flippedSubjectId, setFlippedSubjectId] = useState(null); 
    const [activeMenu, setActiveMenu] = useState(null);
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [currentFolder, setCurrentFolder] = useState(null); // For navigation
    
    // Drag and Drop State
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedItemType, setDraggedItemType] = useState(null); // 'subject' or 'folder'
    const [dropPosition, setDropPosition] = useState(null);
    
    // Manual ordering state - store positions
    const [manualOrder, setManualOrder] = useState({ subjects: [], folders: [] });
    
    // Modal State
    const [subjectModalConfig, setSubjectModalConfig] = useState({ isOpen: false, isEditing: false, data: null });
    const [folderModalConfig, setFolderModalConfig] = useState({ isOpen: false, isEditing: false, data: null });
    const [deleteConfig, setDeleteConfig] = useState({ isOpen: false, type: null, item: null });

    // --- TAG FILTERING LOGIC ---
    const filteredSubjectsByTags = useMemo(() => {
        if (selectedTags.length === 0) return subjects;
        return subjects.filter(subject => 
            selectedTags.every(tag => subject.tags?.includes(tag))
        );
    }, [subjects, selectedTags]);

    
    // --- FOLDER HELPERS ---
    // Allow optional subjectsList to enable applying tag filters when needed
    const getUnfolderedSubjects = (subjectsList = subjects) => {
        const allFolderSubjectIds = new Set(folders.flatMap(f => f.subjectIds || []));
        return subjectsList.filter(s => !allFolderSubjectIds.has(s.id));
    };

    const getSubjectsInFolder = (folderId, subjectsList = subjects) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder || !folder.subjectIds) return [];
        return subjectsList.filter(s => folder.subjectIds.includes(s.id));
    };

    // --- SHARED CONTENT ---
    const sharedFolders = useMemo(() => {
        return folders.filter(f => !f.isOwner);
    }, [folders]);

    const sharedSubjects = useMemo(() => {
        // Get subjects from shared folders
        const sharedFolderSubjectIds = new Set(
            sharedFolders.flatMap(f => f.subjectIds || [])
        );
        
        // Also include directly shared subjects (where uid !== current user's uid)
        // This handles both:
        // 1. Subjects inside shared folders
        // 2. Subjects directly shared with the user
        return subjects.filter(s => 
            sharedFolderSubjectIds.has(s.id) || // In a shared folder
            (s.uid !== user.uid && s.sharedWithUids?.includes(user.uid)) // Directly shared
        );
    }, [subjects, sharedFolders, user]);

    // --- MANUAL ORDERING ---
    // Apply manual order when in manual mode
    const applyManualOrder = (items, type) => {
        if (viewMode !== 'grid') return items;
        
        const orderArray = type === 'subject' ? manualOrder.subjects : manualOrder.folders;
        if (orderArray.length === 0) return items;
        
        const ordered = [];
        const unordered = [...items];
        
        orderArray.forEach(id => {
            const index = unordered.findIndex(item => item.id === id);
            if (index !== -1) {
                ordered.push(unordered[index]);
                unordered.splice(index, 1);
            }
        });
        
        return [...ordered, ...unordered];
    };

    // Get ordered folders for manual mode
    const orderedFolders = useMemo(() => {
        // 1. Normalize Search Query
        console.log("DEBUG: orderedFolders re-calculating. Query:", searchQuery);
        const query = searchQuery?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // 2. Original Guard: if not in grid or inside a folder, usually return empty 
        // (Unless searching, where we want to see results regardless of currentFolder)
        if (!query && (viewMode !== 'grid' || currentFolder)) return [];

        let resultFolders = folders.filter(f => f.isOwner);

        // 3. Apply Search Filter (Recursive/Global)
        if (query) {
            resultFolders = resultFolders.filter(f => {
                const folderName = (f.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return folderName.includes(query);
            });
            console.log("DEBUG: Folders found for query:", results.length);
        }

        // 4. Original Tag Filtering Logic
        if (selectedTags.length > 0) {
            const matchingIds = new Set(filteredSubjectsByTags.map(s => s.id));
            resultFolders = resultFolders.filter(f => (f.subjectIds || []).some(id => matchingIds.has(id)));
        }

        // 5. Original Manual Order
        return applyManualOrder(resultFolders, 'folder');

    }, [folders, viewMode, currentFolder, manualOrder, selectedTags, filteredSubjectsByTags, searchQuery]);



    // --- VIEW GROUPING LOGIC ---
    const groupedContent = useMemo(() => {
        console.log("DEBUG: groupedContent re-calculating. Query:", searchQuery);
        const query = searchQuery?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // --- NEW: SEARCH LOGIC ---
        if (query) {
            const matchedSubjects = subjects.filter(s => {
                const subjectName = (s.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return subjectName.includes(query);
            });
            console.log("DEBUG: Subjects found for query:", matchedSubjects.length);
            return { 'Resultados de búsqueda': matchedSubjects };
        }

        // In Manual mode with a folder open
        if (viewMode === 'grid' && currentFolder) {
            const folderSubjects = getSubjectsInFolder(currentFolder.id, selectedTags.length > 0 ? filteredSubjectsByTags : subjects);
            return { 
                [currentFolder.name]: applyManualOrder(folderSubjects, 'subject')
            };
        }

        // In Manual mode at root
        if (viewMode === 'grid' && !currentFolder) {
            const unfolderedSubjects = getUnfolderedSubjects(selectedTags.length > 0 ? filteredSubjectsByTags : subjects);
            return { 
                'Todas': applyManualOrder(unfolderedSubjects, 'subject')
            };
        }

        // Shared view is handled separately
        if (viewMode === 'shared') {
            return {};
        }

        const subjectsToGroup = (selectedTags.length > 0 || viewMode === 'tags') ? filteredSubjectsByTags : subjects;
        
        if (viewMode === 'usage') {
            const sorted = [...subjectsToGroup].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
            return { 'Recientes': sorted };
        }
        
        if (viewMode === 'courses') {
            const groups = {};
            subjectsToGroup.forEach(sub => {
                const key = sub.course || 'Sin Curso';
                if (!groups[key]) groups[key] = [];
                groups[key].push(sub);
            });
            return groups;
        }
        
        if (viewMode === 'tags') {
            const groups = {};
            subjectsToGroup.forEach(sub => {
                if (sub.tags?.length > 0) {
                    sub.tags.forEach(tag => {
                        if (!groups[tag]) groups[tag] = [];
                        if (!groups[tag].find(s => s.id === sub.id)) {
                            groups[tag].push(sub);
                        }
                    });
                } else {
                    if (!groups['Sin Etiquetas']) groups['Sin Etiquetas'] = [];
                    groups['Sin Etiquetas'].push(sub);
                }
            });
            return Object.keys(groups).sort().reduce((obj, key) => { obj[key] = groups[key]; return obj; }, {});
        }
        
        return { 'Todas': subjectsToGroup };
    }, [subjects, filteredSubjectsByTags, viewMode, currentFolder, folders, manualOrder]);










    // --- HANDLERS ---
    const handleSaveSubject = async (formData) => {
        const payload = {
            name: formData.name,
            course: formData.course,
            color: formData.color,
            icon: formData.icon || 'book',
            tags: formData.tags,
            cardStyle: formData.cardStyle || 'default',
            modernFillColor: formData.modernFillColor || null,
            updatedAt: new Date(),
            uid: user.uid,
            isShared: false,
            sharedWith: []
        };

        try {
            if (subjectModalConfig.isEditing) {
                // Update existing subject
                await updateSubject(formData.id, payload);
            } else {
                // 1. Prepare new subject data

                // 2. If we are inside a folder, inherit sharing settings
                if (currentFolder) {
                    // Check if the parent folder is shared
                    if (currentFolder.isShared || (currentFolder.sharedWith && currentFolder.sharedWith.length > 0)) {
                        payload.isShared = true;

                        // 1. Start with the users the folder is shared with
                        const parentShares = currentFolder.sharedWith || [];
                        const usersToShareWith = new Set(parentShares);

                        // 2. CRITICAL: Add the Folder Owner
                        // If I am creating this inside someone else's folder, 
                        // I must share it with the owner, otherwise they won't see it.
                        if (currentFolder.ownerId && currentFolder.ownerId !== user.uid) {
                            usersToShareWith.add(currentFolder.ownerId);
                        }

                        // 3. Assign unique list back to payload
                        payload.sharedWith = Array.from(usersToShareWith);
                    }
                }

                // 3. Create the subject
                const newSubject = await addSubject(payload); 
                
                // SAFETY CHECK: Handle if addSubject returns object or string
                const newId = typeof newSubject === 'object' ? newSubject.id : newSubject;
                
                // 4. Link to folder
                if (currentFolder) {
                    await addSubjectToFolder(currentFolder.id, newId);
                }
                
            }

            // Close modal
            setSubjectModalConfig({ isOpen: false, isEditing: false, data: null });
        } catch (error) {
            console.error("Error saving subject:", error);
            // Handle error (maybe show a toast)
        }
    };

    const handleSaveFolder = async (formData) => {
        if (folderModalConfig.isEditing) {
            await updateFolder(formData.id, formData);
        } else {
            await addFolder(formData);
        }
        setFolderModalConfig({ isOpen: false, isEditing: false, data: null });
    };

    const handleDelete = async () => {
        if (deleteConfig.type === 'subject' && deleteConfig.item) {
            await deleteSubject(deleteConfig.item.id);
            // Remove from manual order
            setManualOrder(prev => ({
                ...prev,
                subjects: prev.subjects.filter(id => id !== deleteConfig.item.id)
            }));
        } else if (deleteConfig.type === 'folder' && deleteConfig.item) {
            await deleteFolder(deleteConfig.item.id);
            // Remove from manual order
            setManualOrder(prev => ({
                ...prev,
                folders: prev.folders.filter(id => id !== deleteConfig.item.id)
            }));
        }
        setDeleteConfig({ isOpen: false, type: null, item: null });
    };

    const handleSelectSubject = (id) => {
        touchSubject(id);
        navigate(`/home/subject/${id}`);
    };

    const handleOpenFolder = (folder) => {
        setCurrentFolder(folder);
        // If we're viewing shared content, switch back to grid view to show folder contents
        if (viewMode === 'shared') {
            setViewMode('grid');
        }
    };

    const handleShareFolder = async (folderId, email, role) => {
        // await shareFolder(folderId, email, role);
        setFolderModalConfig({
        isOpen: true,
        isEditing: true,
        data: folder,
        currentFolder: null,
        initialTab: 'sharing'
    });
    };

    const toggleGroup = (groupName) => {
        setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    // --- DRAG AND DROP HANDLERS ---
    const handleDragStartSubject = (subject, position) => {
        setDraggedItem(subject);
        setDraggedItemType('subject');
    };

    const handleDragStartFolder = (folder, position) => {
        setDraggedItem(folder);
        setDraggedItemType('folder');
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDraggedItemType(null);
        setDropPosition(null);
    };

    const handleDragOverSubject = (e, position) => {
        e.preventDefault();
        setDropPosition(position);
    };

    const handleDragOverFolder = (e, position) => {
        e.preventDefault();
        setDropPosition(position);
    };

    const handleDropOnFolder = async (folderId, subjectId) => {
        if (!subjectId || !folderId) return;
        
        // Add subject to folder
        await addSubjectToFolder(folderId, subjectId);
        
        // Clear drag state
        handleDragEnd();
    };

    const handleDropReorderSubject = (draggedId, fromPosition, toPosition) => {
        if (draggedId === undefined || fromPosition === toPosition) return;
        
        const currentSubjects = groupedContent[Object.keys(groupedContent)[0]] || [];
        const newOrder = currentSubjects.map(s => s.id);
        
        // Remove from old position
        const draggedIndex = newOrder.indexOf(draggedId);
        if (draggedIndex !== -1) {
            newOrder.splice(draggedIndex, 1);
        }
        
        // Insert at new position
        newOrder.splice(toPosition, 0, draggedId);
        
        setManualOrder(prev => ({
            ...prev,
            subjects: newOrder
        }));
        
        handleDragEnd();
    };

    const handleDropReorderFolder = (draggedId, fromPosition, toPosition) => {
        if (draggedId === undefined || fromPosition === toPosition) return;
        
        const newOrder = orderedFolders.map(f => f.id);
        
        // Remove from old position
        const draggedIndex = newOrder.indexOf(draggedId);
        if (draggedIndex !== -1) {
            newOrder.splice(draggedIndex, 1);
        }
        
        // Insert at new position
        newOrder.splice(toPosition, 0, draggedId);
        
        setManualOrder(prev => ({
            ...prev,
            folders: newOrder
        }));
        
        handleDragEnd();
    };

    const handlePreferenceChange = (key, value) => {
        // updatePreference is now synchronous with debounced Firestore save
        updatePreference(key, value);
    };

    // Close menus on outside click
    useEffect(() => {
        const closeMenu = () => setActiveMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    // Get all unique tags
    const allTags = useMemo(() => {
        const tagSet = new Set();
        subjects.forEach(s => s.tags?.forEach(t => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }, [subjects]);

    useEffect(() => {
        if (preferences && !loadingPreferences) {
            setViewMode(preferences.viewMode || 'grid');
            setLayoutMode(preferences.layoutMode || 'grid');
            setCardScale(preferences.cardScale || 100);
            setSelectedTags(preferences.selectedTags || []);
        }
    }, [preferences, loadingPreferences]);

    // Check if drag and drop is enabled (only in manual mode with grid layout)
    const isDragAndDropEnabled = viewMode === 'grid' && layoutMode === 'grid';



    return {
        // Data
        subjects,
        folders,
        loading,
        loadingFolders,
        sharedFolders,
        sharedSubjects,
        groupedContent,
        orderedFolders,
        allTags,
        
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
        
        // Modals State
        subjectModalConfig, setSubjectModalConfig,
        folderModalConfig, setFolderModalConfig,
        deleteConfig, setDeleteConfig,

        // Handlers
        handleSaveSubject,
        handleSaveFolder,
        handleDelete,
        handleSelectSubject,
        handleOpenFolder,
        handleShareFolder,
        toggleGroup,
        touchSubject,
        
        // Drag & Drop Handlers
        handleDragStartSubject,
        handleDragStartFolder,
        handleDragEnd,
        handleDragOverSubject,
        handleDragOverFolder,
        handleDropOnFolder,
        handleDropReorderSubject,
        handleDropReorderFolder,
        handlePreferenceChange,

        // Share Functions
        shareFolder,
        unshareFolder,
        shareSubject,
        unshareSubject,

        // Navigation
        
        navigate
    };
};