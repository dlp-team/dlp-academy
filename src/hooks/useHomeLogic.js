// src/hooks/useHomeLogic.js
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from './useSubjects';
import { useFolders } from './useFolders';
import { useUserPreferences } from './useUserPreferences';
import { EDUCATION_LEVELS } from '../utils/subjectConstants';

const normalizeText = (text) => {
    return (text || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

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
        shareFolder,
        unshareFolder,
        addSubjectToFolder
    } = useFolders(user);

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

    // --- NEW: FILTER STATE (Folders/Subjects/All) ---
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'folders', 'subjects'

    // Restore last visited folder from localStorage on mount (if folders are loaded)
    // Guarantee folder persistence and sync with folders array
    useEffect(() => {
        if (!folders || folders.length === 0) {
            return;
        }
        const lastFolderId = localStorage.getItem('dlp_last_folderId');
        //
        // If currentFolder is not set or not found in folders, restore or reset
        if (lastFolderId) {
            const folder = folders.find(f => f.id === lastFolderId);
            if (folder && (!currentFolder || currentFolder.id !== folder.id)) {
                //
                setCurrentFolder(folder);
            } else if (!folder && currentFolder) {
                //
                setCurrentFolder(null);
            }
        } else if (currentFolder) {
            //
            setCurrentFolder(null);
        }
    }, [folders]);
    
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


    // --- 1. FILTER FOLDERS (Fixing the Search Logic here too) ---
    const filteredFolders = useMemo(() => {
        // Safety check
        if (!folders) return [];
        
        // A. SEARCH MODE: Priority #1
        // If there is a query, we search the ENTIRE list and return immediately.
        if (searchQuery && searchQuery.trim().length > 0) {
            const query = normalizeText(searchQuery);
            // Note: We deliberately do NOT check f.parentId here.
            return folders.filter(f => normalizeText(f.name).includes(query));
        }

        // B. NAVIGATION MODE: Priority #2 (Only runs if Search is empty)
        // This is where we respect the hierarchy/current layer.
        return folders.filter(f => {
            if (currentFolder) {
                // If we are inside a folder, only show its children
                return f.parentId === currentFolder.id;
            }
            // If we are at root, only show root folders
            return !f.parentId; 
        });
    }, [folders, currentFolder, searchQuery]);

    // --- 2. FILTER SUBJECTS ---
    const filteredSubjects = useMemo(() => {
        if (!subjects) return [];

        if (searchQuery) {
            const query = normalizeText(searchQuery);
            return subjects.filter(s => normalizeText(s.name).includes(query));
        }

        return subjects.filter(s => {
            if (currentFolder) {
                return s.folderId === currentFolder.id;
            }
            return !s.folderId;
        });
    }, [subjects, currentFolder, searchQuery]);

    


    
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
        // --- NEW: FILTER LOGIC (Hide folders if filter is 'subjects') ---
        if (activeFilter === 'subjects') return [];

        // 1. Normalize Search Query
        const query = searchQuery?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // 2. Original Guard: if not in grid or inside a folder, usually return empty 
        // (Unless searching, where we want to see results regardless of currentFolder)
        if (!query && (viewMode !== 'grid' || currentFolder)) return [];

        let resultFolders = folders.filter(f => 
            f.uid === user?.uid || (f.sharedWithUids && f.sharedWithUids.includes(user?.uid))
        );

        // 3. Apply Search Filter (Recursive/Global)
        if (query) {
            resultFolders = resultFolders.filter(f => {
                const folderName = (f.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return folderName.includes(query);
            });
        }

        // 4. Original Tag Filtering Logic
        if (selectedTags.length > 0) {
            const matchingIds = new Set(filteredSubjectsByTags.map(s => s.id));
            resultFolders = resultFolders.filter(f => (f.subjectIds || []).some(id => matchingIds.has(id)));
        }

        // 5. Original Manual Order
        return applyManualOrder(resultFolders, 'folder');

    }, [folders, viewMode, currentFolder, manualOrder, selectedTags, filteredSubjectsByTags, searchQuery, activeFilter]);



    // --- VIEW GROUPING LOGIC ---
    const groupedContent = useMemo(() => {
        // --- NEW: FILTER LOGIC (Hide subjects if filter is 'folders') ---
        if (activeFilter === 'folders') return {};

        const isRelated = (item) => item.uid === user?.uid || (item.sharedWithUids && item.sharedWithUids.includes(user?.uid));

        const query = searchQuery?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        if (query) {
            // Apply isRelated filter to search results
            const matchedSubjects = subjects.filter(s => {
                const subjectName = (s.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return subjectName.includes(query) && isRelated(s); // Add isRelated check
            });
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

        const sourceSubjects = (selectedTags.length > 0 || viewMode === 'tags') ? filteredSubjectsByTags : subjects;
        const subjectsToGroup = sourceSubjects.filter(isRelated);
        
        if (viewMode === 'usage') {
            const sorted = [...subjectsToGroup].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
            return { 'Recientes': sorted };
        }
        
        if (viewMode === 'courses') {
            // Use EDUCATION_LEVELS for group and year order
            let EDUCATION_LEVELS = {
                'Primaria': ['1º', '2º', '3º', '4º', '5º', '6º'],
                'ESO': ['1º', '2º', '3º', '4º'],
                'Bachillerato': ['1º', '2º'],
                'FP': ['Grado Medio 1', 'Grado Medio 2', 'Grado Superior 1', 'Grado Superior 2'],
                'Universidad': ['1º', '2º', '3º', '4º', '5º', '6º', 'Máster', 'Doctorado']
            };
            try {
                EDUCATION_LEVELS = require('../utils/subjectConstants').EDUCATION_LEVELS || EDUCATION_LEVELS;
            } catch (e) {}

            // Helper to parse course string into group and year
            function parseCourse(course) {
                if (!course || course === null || course === undefined || course === '') return { group: null, year: null };
                for (const group of Object.keys(EDUCATION_LEVELS)) {
                    for (const year of EDUCATION_LEVELS[group]) {
                        // Accept both 'ESO 1º' and 'ESO 1' and similar
                        if (
                            course === `${group} ${year}` ||
                            course === `${group} ${year.replace('º','')}` ||
                            course === `${group} ${year.replace('º','º')}`
                        ) {
                            return { group, year };
                        }
                    }
                }
                // FP special case: allow just 'FP'
                if (course === 'FP') return { group: 'FP', year: '' };
                // Universidad special case: allow just 'Universidad'
                if (course === 'Universidad') return { group: 'Universidad', year: '' };
                return { group: course, year: '' };
            }

            // Group subjects by group and year, and collect those with no course
            const groupMap = {};
            const noCourse = [];
            subjectsToGroup.forEach(sub => {
                const { group, year } = parseCourse(sub.course);
                if (!group && !year) {
                    noCourse.push(sub);
                } else {
                    if (!groupMap[group]) groupMap[group] = {};
                    if (!groupMap[group][year]) groupMap[group][year] = [];
                    groupMap[group][year].push(sub);
                }
            });

            // Build sortedGroups in the desired order
            const sortedGroups = {};
            Object.keys(EDUCATION_LEVELS).forEach(group => {
                EDUCATION_LEVELS[group].forEach(year => {
                    const key = `${group} ${year}`;
                    if (groupMap[group] && groupMap[group][year]) {
                        sortedGroups[key] = groupMap[group][year].slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    }
                });
            });
            // Add any remaining groups/years not in EDUCATION_LEVELS
            Object.keys(groupMap).forEach(group => {
                Object.keys(groupMap[group]).forEach(year => {
                    const key = year ? `${group} ${year}` : group;
                    if (!sortedGroups[key]) {
                        sortedGroups[key] = groupMap[group][year].slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    }
                });
            });
            // Add 'Sin Curso' at the end if there are subjects with no course
            if (noCourse.length > 0) {
                sortedGroups['Sin Curso'] = noCourse.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            }
            return sortedGroups;
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
    }, [subjects, filteredSubjectsByTags, viewMode, currentFolder, folders, manualOrder, activeFilter, searchQuery]);




    const { searchFolders, searchSubjects } = useMemo(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            return { searchFolders: [], searchSubjects: [] };
        }

        const query = normalizeText(searchQuery);
        
        // Helper to check access rights (Owner OR Shared)
        const isRelated = (item) => {
            // 1. Explicit Ownership (if property exists)
            if (item.isOwner === true) return true;
            // 2. UID Match (Fallback if isOwner is missing)
            if (user?.uid && item.uid === user.uid) return true;
            // 3. Shared Access
            if (item.sharedWithUids && Array.isArray(item.sharedWithUids) && user?.uid) {
                return item.sharedWithUids.includes(user.uid);
            }
            return false;
        };

        // Filter Folders
        const sFolders = folders.filter(f => 
            isRelated(f) && normalizeText(f.name).includes(query)
        );

        // Filter Subjects
        const sSubjects = subjects.filter(s => 
            isRelated(s) && normalizeText(s.name).includes(query)
        );

        return { searchFolders: sFolders, searchSubjects: sSubjects };
    }, [folders, subjects, searchQuery, user]);





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
        //
        if (folder && folder.id) {
            const found = folders.find(f => f.id === folder.id);
            setCurrentFolder(found || null);
            if (found) {
                localStorage.setItem('dlp_last_folderId', found.id);
                //
            } else {
                localStorage.removeItem('dlp_last_folderId');
                //
            }
        } else {
            setCurrentFolder(null);
            localStorage.removeItem('dlp_last_folderId');
            //
        }
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
    
    // --- NEW: FILTER HANDLER ---
    const handleFilterChange = (filterType) => {
        setActiveFilter(prev => prev === filterType ? 'all' : filterType);
    };

    // --- DRAG AND DROP HANDLERS ---
    // Accept both (subject, position) and (e, subject)
    const handleDragStartSubject = (a, b) => {
        // If first arg is an event, second is subject
        if (a && typeof a.preventDefault === 'function' && b && typeof b === 'object' && b.id) {
            setDraggedItem(b);
            setDraggedItemType('subject');
        } else if (a && typeof a === 'object' && a.id) {
            setDraggedItem(a);
            setDraggedItemType('subject');
        } else {
            setDraggedItem(null);
            setDraggedItemType(null);
        }
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
            // Only set viewMode if it is not already set (prevents resetting to 'grid' on layout change)
            setViewMode(prev => prev || preferences.viewMode || 'grid');
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
        searchFolders,
        searchSubjects,
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