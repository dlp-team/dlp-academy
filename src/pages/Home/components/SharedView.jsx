// src/pages/Home/components/SharedView.jsx
import React, { useMemo, useState } from 'react';
import { Users, Folder as FolderIcon, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Ensure these paths match your project structure
import FolderCard from '../../../components/modules/FolderCard/FolderCard';
import SubjectCard from '../../../components/modules/SubjectCard/SubjectCard';
import ListViewItem from '../../../components/modules/ListViewItem';
import TagFilter from '../../../components/ui/TagFilter';

const SharedView = ({ 
    sharedFolders = [],   
    sharedSubjects = [],  
    layoutMode = 'grid',  
    cardScale = 100,      
    // Actions
    onOpenFolder,
    onSelectSubject,
    // UI State for cards
    activeMenu,
    onToggleMenu,
    flippedSubjectId,
    onFlipSubject,
    // Navigation fallback
    onSelectTopic,
    // All folders needed for drag/drop logic
    allFolders = []
}) => {
    const navigate = useNavigate();

    // --- TAG FILTER STATE ---
    // Collect all tags from shared folders and subjects
    const allTags = useMemo(() => {
        const folderTags = sharedFolders.flatMap(f => Array.isArray(f.tags) ? f.tags : []);
        const subjectTags = sharedSubjects.flatMap(s => Array.isArray(s.tags) ? s.tags : []);
        return Array.from(new Set([...folderTags, ...subjectTags])).filter(Boolean);
    }, [sharedFolders, sharedSubjects]);

    const [selectedTags, setSelectedTags] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    // Filtered shared folders/subjects by selected tags
    const filteredFolders = useMemo(() => {
        if (selectedTags.length === 0) return sharedFolders;
        return sharedFolders.filter(f => Array.isArray(f.tags) && selectedTags.every(tag => f.tags.includes(tag)));
    }, [sharedFolders, selectedTags]);

    const filteredSubjects = useMemo(() => {
        if (selectedTags.length === 0) return sharedSubjects;
        return sharedSubjects.filter(s => Array.isArray(s.tags) && selectedTags.every(tag => s.tags.includes(tag)));
    }, [sharedSubjects, selectedTags]);
    // Calculate grid column width based on scale (matches HomeContent logic)
    const gridStyle = { 
        gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))` 
    };

    // --- COLLAPSE STATE ---
    const [collapsed, setCollapsed] = React.useState({
        folders: false,
        subjects: false
    });

    if (sharedFolders.length === 0 && sharedSubjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 transition-colors">
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    No hay elementos compartidos
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center">
                    Los elementos que otros usuarios compartan contigo aparecerán aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* --- SHARED FOLDERS SECTION --- */}
            {filteredFolders.length > 0 && (
                <div className="space-y-4">
                    <button
                        className="flex items-center gap-2 px-1 w-full text-left group hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg py-2 transition-colors"
                        onClick={() => setCollapsed(c => ({ ...c, folders: !c.folders }))}
                    >
                        <FolderIcon className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex-1">Carpetas Compartidas</h2>
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-full">
                            {filteredFolders.length}
                        </span>
                        <span className={`transition-transform ${collapsed.folders ? '-rotate-90' : ''}`}>▼</span>
                    </button>
                    {!collapsed.folders && (
                        <>
                        {layoutMode === 'grid' ? (
                            <div className="grid gap-6" style={gridStyle}>
                                {filteredFolders
                                    .filter(folder => {
                                        // Only show folders that are not inside another shared folder
                                        if (!folder.parentId) return true;
                                        return !filteredFolders.some(f => f.id === folder.parentId);
                                    })
                                    .map((folder) => (
                                        <div key={folder.id}>
                                            <FolderCard
                                                folder={folder}
                                                allFolders={allFolders}
                                                onOpen={onOpenFolder}
                                                activeMenu={activeMenu}
                                                onToggleMenu={onToggleMenu}
                                                onEdit={() => {}} // Disabled for shared
                                                onDelete={() => {}} // Disabled for shared
                                                onShare={() => {}}
                                                isShared={true}
                                                cardScale={cardScale}
                                            />
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredFolders
                                    .filter(folder => {
                                        // Only show folders that are not inside another shared folder
                                        if (!folder.parentId) return true;
                                        return !filteredFolders.some(f => f.id === folder.parentId);
                                    })
                                    .map((folder) => (
                                        <ListViewItem 
                                            key={folder.id}
                                            item={folder}
                                            type="folder"
                                            onNavigate={() => onOpenFolder(folder)}
                                            cardScale={cardScale}
                                            onEdit={() => {}}
                                            onDelete={() => {}}
                                            draggable={false}
                                            allFolders={filteredFolders}
                                            allSubjects={filteredSubjects}
                                            onDropAction={() => {}}
                                        />
                                    ))}
                            </div>
                        )}
                        </>
                    )}
                </div>
            )}

            {/* --- SHARED SUBJECTS SECTION --- */}
            {filteredSubjects.length > 0 && (
                <div className="space-y-4">
                    <button
                        className="flex items-center gap-2 px-1 w-full text-left group hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg py-2 transition-colors"
                        onClick={() => setCollapsed(c => ({ ...c, subjects: !c.subjects }))}
                    >
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex-1">Asignaturas Compartidas</h2>
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
                            {filteredSubjects.length}
                        </span>
                        <span className={`transition-transform ${collapsed.subjects ? '-rotate-90' : ''}`}>▼</span>
                    </button>
                    {!collapsed.subjects && (
                        <>
                        {layoutMode === 'grid' ? (
                            <div className="grid gap-6" style={gridStyle}>
                                {filteredSubjects.map((subject) => (
                                    <div key={subject.id}>
                                        <SubjectCard
                                            subject={subject}
                                            isFlipped={flippedSubjectId === subject.id}
                                            onFlip={(id) => onFlipSubject(flippedSubjectId === id ? null : id)}
                                            activeMenu={activeMenu}
                                            onToggleMenu={onToggleMenu}
                                            onSelect={() => onSelectSubject(subject)}
                                            onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                                            onEdit={() => {}} 
                                            onDelete={() => {}}
                                            cardScale={cardScale}
                                            isShared={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredSubjects.map((subject) => (
                                    <ListViewItem
                                        key={subject.id}
                                        item={subject}
                                        type="subject"
                                        onNavigateSubject={() => onSelectSubject(subject)}
                                        cardScale={cardScale}
                                        onEdit={() => {}}
                                        onDelete={() => {}}
                                        draggable={false}
                                        onDropAction={() => {}}
                                    />
                                ))}
                            </div>
                        )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default SharedView;