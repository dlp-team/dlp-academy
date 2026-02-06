// src/pages/Home.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Loader2, LayoutGrid, Clock, Folder as FolderIcon, Tag, Trash2, 
    Users, FolderPlus, ChevronDown
} from 'lucide-react';
import SubjectIcon from '../components/modals/SubjectIcon';


// Layout & Logic
import Header from '../components/layout/Header';
import { useSubjects } from '../hooks/useSubjects';
import { useFolders } from '../hooks/useFolders';

// Sub-Components
import SubjectCard from '../components/home/SubjectCard'; 
import FolderCard from '../components/home/FolderCard';
import SubjectFormModal from '../components/modals/SubjectFormModal';
import FolderManager from '../components/home/FolderManager';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import ViewLayoutSelector from '../components/home/ViewLayoutSelector';
import CardScaleSlider from '../components/home/CardScaleSlider';
import TagFilter from '../components/home/TagFilter';
import SubjectListItem from '../components/home/SubjectListItem';
import BreadcrumbNav from '../components/home/BreadcrumbNav';
import SharedView from '../components/home/SharedView';

const Home = ({ user }) => {
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
        addSubjectToFolder,
        removeSubjectFromFolder 
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

    // Show collapsible groups only in certain modes
    const showCollapsibleGroups = ['courses', 'tags', 'shared'].includes(viewMode);

    // Check if drag and drop is enabled (only in manual mode with grid layout)
    const isDragAndDropEnabled = viewMode === 'grid' && layoutMode === 'grid';

    if (!user || loading || loadingFolders) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors">
            <Header user={user} />
            <OnboardingWizard user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Header & Controls */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Asignaturas</h2>
                            <p className="text-gray-600 dark:text-gray-400">Gestiona tu contenido educativo</p>
                        </div>
                        
                        {/* View Mode Switcher */}
                        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 inline-flex transition-colors">
                            {[
                                { id: 'grid', icon: LayoutGrid, label: 'Manual' },
                                { id: 'usage', icon: Clock, label: 'Uso' },
                                { id: 'courses', icon: FolderIcon, label: 'Cursos' },
                                { id: 'tags', icon: Tag, label: 'Etiquetas' },
                                { id: 'shared', icon: Users, label: 'Compartido' }
                            ].map(mode => (
                                <button 
                                    key={mode.id}
                                    onClick={() => {
                                        setViewMode(mode.id);
                                        setSelectedTags([]);
                                        setCollapsedGroups({});
                                        setCurrentFolder(null);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        viewMode === mode.id 
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                                    }`}
                                >
                                    <mode.icon size={16} /> 
                                    <span className="hidden sm:inline">{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Controls Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Layout Mode Selector */}
                        {viewMode !== 'shared' && (
                            <ViewLayoutSelector 
                                layoutMode={layoutMode} 
                                setLayoutMode={setLayoutMode}
                                viewMode={viewMode}
                            />
                        )}

                        {/* Card Scale Slider */}
                        <CardScaleSlider 
                            cardScale={cardScale} 
                            setCardScale={setCardScale}
                        />

                        {/* Tag Filter (only in tags mode) */}
                        {viewMode === 'tags' && allTags.length > 0 && (
                            <TagFilter 
                                allTags={allTags}
                                selectedTags={selectedTags}
                                setSelectedTags={setSelectedTags}
                            />
                        )}

                        {/* Create Folder Button (Manual mode only) */}
                        {viewMode === 'grid' && !currentFolder && (
                            <button
                                onClick={() => setFolderModalConfig({ isOpen: true, isEditing: false, data: null })}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                            >
                                <FolderPlus size={16} />
                                <span>Nueva Carpeta</span>
                            </button>
                        )}
                        
                        {/* Drag and Drop Hint */}
                        {isDragAndDropEnabled && draggedItem && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-medium">
                                    {draggedItemType === 'subject' && !currentFolder ? 'Arrastra sobre carpeta o reordena' : 'Arrastra para reordenar'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Breadcrumb Navigation */}
                {currentFolder && (
                    <BreadcrumbNav 
                        currentFolder={currentFolder}
                        onNavigate={setCurrentFolder}
                    />
                )}

                {/* Shared View */}
                {viewMode === 'shared' && (
                    <SharedView
                        sharedFolders={sharedFolders}
                        sharedSubjects={sharedSubjects}
                        layoutMode={layoutMode}
                        cardScale={cardScale}
                        onOpenFolder={handleOpenFolder}
                        onSelectSubject={handleSelectSubject}
                        activeMenu={activeMenu}
                        onToggleMenu={setActiveMenu}
                        flippedSubjectId={flippedSubjectId}
                        onFlipSubject={(id) => setFlippedSubjectId(flippedSubjectId === id ? null : id)}
                        onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                        navigate={navigate}
                    />
                )}

                {/* Content Rendering (Non-Shared Views) */}
                {viewMode !== 'shared' && Object.entries(groupedContent).map(([groupName, groupSubjects]) => {
                    const isCollapsed = collapsedGroups[groupName];
                    const showGroupHeader = showCollapsibleGroups;

                    return (
                        <div key={groupName} className="mb-10">
                            {/* Group Header */}
                            {showGroupHeader && (
                                <button
                                    onClick={() => toggleGroup(groupName)}
                                    className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 transition-colors w-full text-left group hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer"
                                >
                                    <ChevronDown 
                                        size={20} 
                                        className={`text-gray-400 dark:text-gray-500 transition-transform ${
                                            isCollapsed ? '-rotate-90' : ''
                                        }`}
                                    />
                                    {viewMode === 'courses' && <FolderIcon className="text-indigo-500 dark:text-indigo-400" size={20} />}
                                    {viewMode === 'tags' && <Tag className="text-pink-500 dark:text-pink-400" size={20} />}
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {groupName}
                                    </h3>
                                    <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full transition-colors">
                                        {groupSubjects.length}
                                    </span>
                                </button>
                            )}

                            {/* Content Area */}
                            {!isCollapsed && (
                                <>
                                    {/* GRID LAYOUT */}
                                    {layoutMode === 'grid' && (
                                        <div key={groupName} className="mb-10">
                                            <div 
                                                className="grid gap-6"
                                                style={{ 
                                                    gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))` 
                                                }}
                                            >
                                                {/* Create Button (Grid Mode only) - NOT DRAGGABLE */}
                                                {viewMode === 'grid' && (
                                                    <div>
                                                        <button 
                                                            onClick={() => setSubjectModalConfig({ isOpen: true, isEditing: false, data: null })} 
                                                            className="group relative w-full border-3 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
                                                            style={{ aspectRatio: '16 / 10' }}
                                                        >
                                                            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60 flex items-center justify-center transition-colors">
                                                                <Plus className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                Crear Nueva Asignatura
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Folders (Manual mode at root only) - DRAGGABLE */}
                                                {viewMode === 'grid' && !currentFolder && orderedFolders.map((folder, index) => (
                                                    <div key={`folder-${folder.id}`}>
                                                        <FolderCard
                                                            folder={folder}
                                                            onOpen={handleOpenFolder}
                                                            activeMenu={activeMenu}
                                                            onToggleMenu={setActiveMenu}
                                                            onEdit={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                                                            onDelete={(f) => setDeleteConfig({ isOpen: true, type: 'folder', item: f })}
                                                            onShare={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                                                            cardScale={cardScale}
                                                            onDrop={handleDropOnFolder}
                                                            canDrop={isDragAndDropEnabled && draggedItemType === 'subject'}
                                                            draggable={isDragAndDropEnabled}
                                                            onDragStart={handleDragStartFolder}
                                                            onDragEnd={handleDragEnd}
                                                            onDragOver={handleDragOverFolder}
                                                            onDropReorder={handleDropReorderFolder}
                                                            position={index}
                                                            isDragging={draggedItem?.id === folder.id}
                                                        />
                                                    </div>
                                                ))}

                                                {/* Subject Cards - DRAGGABLE */}
                                                {groupSubjects.map((subject, index) => (
                                                    <div key={`${groupName}-${subject.id}`}>
                                                        <SubjectCard
                                                            subject={subject}
                                                            isFlipped={flippedSubjectId === subject.id}
                                                            onFlip={(id) => setFlippedSubjectId(flippedSubjectId === id ? null : id)}
                                                            activeMenu={activeMenu}
                                                            onToggleMenu={setActiveMenu}
                                                            onSelect={handleSelectSubject}
                                                            onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                                                            onEdit={(e, s) => { 
                                                                e.stopPropagation(); 
                                                                setSubjectModalConfig({ isOpen: true, isEditing: true, data: s }); 
                                                                setActiveMenu(null); 
                                                            }}
                                                            onDelete={(e, s) => { 
                                                                e.stopPropagation(); 
                                                                setDeleteConfig({ isOpen: true, type: 'subject', item: s }); 
                                                                setActiveMenu(null); 
                                                            }}
                                                            cardScale={cardScale}
                                                            isDragging={draggedItem?.id === subject.id}
                                                            onDragStart={handleDragStartSubject}
                                                            onDragEnd={handleDragEnd}
                                                            onDragOver={handleDragOverSubject}
                                                            onDrop={handleDropReorderSubject}
                                                            draggable={isDragAndDropEnabled}
                                                            position={index}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* LIST LAYOUT */}
                                    {layoutMode === 'list' && (
                                        <div className="space-y-2">
                                            {groupSubjects.map((subject) => (
                                                <SubjectListItem
                                                    key={subject.id}
                                                    subject={subject}
                                                    onSelect={handleSelectSubject}
                                                    onEdit={(s) => setSubjectModalConfig({ isOpen: true, isEditing: true, data: s })}
                                                    onDelete={(s) => setDeleteConfig({ isOpen: true, type: 'subject', item: s })}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* FOLDERS LAYOUT */}
                                    {layoutMode === 'folders' && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {groupSubjects.map((subject) => (
                                                <button
                                                    key={subject.id}
                                                    onClick={() => handleSelectSubject(subject.id)}
                                                    className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer"
                                                >
                                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${subject.color} flex items-center justify-center mb-3 mx-auto`}>
                                                        <SubjectIcon iconName={subject.icon} className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white text-center truncate">
                                                        {subject.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                                                        {subject.topics?.length || 0} temas
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}

                
                {/* Empty State */}
                {subjects.length === 0 && folders.length === 0 && viewMode !== 'shared' && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                            <LayoutGrid className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No hay contenido todavía</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Crea tu primera asignatura o carpeta para empezar</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setSubjectModalConfig({ isOpen: true, isEditing: false, data: null })}
                                className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg transition-colors cursor-pointer inline-flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Crear Asignatura
                            </button>
                            <button
                                onClick={() => setFolderModalConfig({ isOpen: true, isEditing: false, data: null })}
                                className="px-6 py-3 bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-xl font-medium shadow-lg transition-colors cursor-pointer inline-flex items-center gap-2"
                            >
                                <FolderPlus size={20} />
                                Crear Carpeta
                            </button>
                        </div>
                    </div>
                )}
            </main>


            {/* Modals */}
            <SubjectFormModal 
                isOpen={subjectModalConfig.isOpen}
                isEditing={subjectModalConfig.isEditing}
                initialData={subjectModalConfig.data}
                onClose={() => setSubjectModalConfig({ ...subjectModalConfig, isOpen: false })}
                onSave={handleSaveSubject}
            />

            <FolderManager
                isOpen={folderModalConfig.isOpen}
                onClose={() => setFolderModalConfig({ ...folderModalConfig, isOpen: false })}
                onSave={handleSaveFolder}
                initialData={folderModalConfig.data}
                isEditing={folderModalConfig.isEditing}
                onShare={handleShareFolder}
            />

            {/* Delete Confirmation */}
            {deleteConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            ¿Eliminar {deleteConfig.type === 'folder' ? 'Carpeta' : 'Asignatura'}?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {deleteConfig.type === 'folder' 
                                ? `Se eliminará la carpeta "${deleteConfig.item?.name}" pero las asignaturas se mantendrán.`
                                : `Se eliminarán "${deleteConfig.item?.name}" y sus temas.`
                            }
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setDeleteConfig({ isOpen: false, type: null, item: null })} 
                                className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDelete} 
                                className="px-5 py-2.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" /> Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;