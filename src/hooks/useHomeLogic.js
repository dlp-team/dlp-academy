// src/hooks/useHomeLogic.js
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from './useSubjects'; // Assumed path based on context
import { useFolders } from './useFolders';   // Assumed path based on context

export const useHomeLogic = (user) => {
    const navigate = useNavigate();
    
    // Data Logic
    const { subjects, loading, addSubject, updateSubject, deleteSubject, touchSubject } = useSubjects(user);
    const { 
        folders, 
        loading: loadingFolders, 
        addFolder, 
        updateFolder, 
        deleteFolder, 
        shareFolder,
        addSubjectToFolder
    } = useFolders(user);

    // UI State
    const [viewMode, setViewMode] = useState('grid'); // grid, usage, courses, tags, shared
    const [layoutMode, setLayoutMode] = useState('grid'); // grid, list, folders
    const [cardScale, setCardScale] = useState(125); // 75, 100, 125 (125 is default/original)
    const [flippedSubjectId, setFlippedSubjectId] = useState(null); 
    const [activeMenu, setActiveMenu] = useState(null);
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [selectedTags, setSelectedTags] = useState([]);
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
    const getUnfolderedSubjects = () => {
        const allFolderSubjectIds = new Set(folders.flatMap(f => f.subjectIds || []));
        return subjects.filter(s => !allFolderSubjectIds.has(s.id));
    };

    const getSubjectsInFolder = (folderId) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder || !folder.subjectIds) return [];
        return subjects.filter(s => folder.subjectIds.includes(s.id));
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
        return subjects.filter(s => sharedFolderSubjectIds.has(s.id));
    }, [subjects, sharedFolders]);

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

    // --- VIEW GROUPING LOGIC ---
    const groupedContent = useMemo(() => {
        // In Manual mode with a folder open
        if (viewMode === 'grid' && currentFolder) {
            const folderSubjects = getSubjectsInFolder(currentFolder.id);
            return { 
                [currentFolder.name]: applyManualOrder(folderSubjects, 'subject')
            };
        }

        // In Manual mode at root
        if (viewMode === 'grid' && !currentFolder) {
            const unfolderedSubjects = getUnfolderedSubjects();
            return { 
                'Todas': applyManualOrder(unfolderedSubjects, 'subject')
            };
        }

        // Shared view is handled separately
        if (viewMode === 'shared') {
            return {};
        }

        const subjectsToGroup = viewMode === 'tags' ? filteredSubjectsByTags : subjects;
        
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

    // Get ordered folders for manual mode
    const orderedFolders = useMemo(() => {
        if (viewMode !== 'grid' || currentFolder) return [];
        return applyManualOrder(folders.filter(f => f.isOwner), 'folder');
    }, [folders, viewMode, currentFolder, manualOrder]);


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
        };

        if (subjectModalConfig.isEditing) {
            await updateSubject(formData.id, payload);
        } else {
            payload.createdAt = new Date();
            const newSubject = await addSubject(payload);
            
            // If in a folder, add to that folder
            if (currentFolder) {
                await addSubjectToFolder(currentFolder.id, newSubject.id);
            }
        }
        setSubjectModalConfig({ isOpen: false, isEditing: false, data: null });
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
    };

    const handleShareFolder = async (folderId, email, role) => {
        await shareFolder(folderId, email, role);
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
        
        // Drag & Drop Handlers
        handleDragStartSubject,
        handleDragStartFolder,
        handleDragEnd,
        handleDragOverSubject,
        handleDragOverFolder,
        handleDropOnFolder,
        handleDropReorderSubject,
        handleDropReorderFolder,
        
        navigate
    };
};