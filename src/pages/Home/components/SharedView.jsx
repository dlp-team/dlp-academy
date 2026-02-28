// src/pages/Home/components/SharedView.jsx
import React, { useMemo, useState } from 'react';
import { Users, Folder as FolderIcon, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Ensure these paths match your project structure
import FolderCard from '../../../components/modules/FolderCard/FolderCard';
import SubjectCard from '../../../components/modules/SubjectCard/SubjectCard';
import ListViewItem from '../../../components/modules/ListViewItem';
import TagFilter from '../../../components/ui/TagFilter';
import { HOME_THEME_TOKENS } from '../../../utils/themeTokens';
import { mergeSourceAndShortcutItems } from '../../../utils/mergeUtils';
import { isShortcutItem } from '../../../utils/permissionUtils';

const SharedView = ({ 
    user,
    homeThemeTokens = HOME_THEME_TOKENS,
    sharedFolders = [],   
    sharedSubjects = [],  
    layoutMode = 'grid',  
    cardScale = 100,      
    currentFolder = null,
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
    allFolders = [],
    allSubjects = [],
    onEditFolder = () => {},
    onDeleteFolder = () => {},
    onShareFolder = () => {},
    onEditSubject = () => {},
    onDeleteSubject = () => {},
    onShareSubject = () => {}
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

    const fullFolderTreeForCounts = useMemo(() => {
        const shortcutFolders = (sharedFolders || []).filter(folder => isShortcutItem(folder));
        return mergeSourceAndShortcutItems({
            sourceItems: allFolders || [],
            shortcutItems: shortcutFolders
        });
    }, [allFolders, sharedFolders]);

    const fullSubjectTreeForCounts = useMemo(() => {
        const shortcutSubjects = (sharedSubjects || []).filter(subject => isShortcutItem(subject));
        return mergeSourceAndShortcutItems({
            sourceItems: allSubjects || [],
            shortcutItems: shortcutSubjects
        });
    }, [allSubjects, sharedSubjects]);

    const folderById = useMemo(() => {
        const map = new Map();
        (fullFolderTreeForCounts || []).forEach(folder => {
            if (folder?.id) map.set(folder.id, folder);
        });
        (sharedFolders || []).forEach(folder => {
            if (folder?.id && !map.has(folder.id)) map.set(folder.id, folder);
        });
        return map;
    }, [fullFolderTreeForCounts, sharedFolders]);

    const getFolderParentId = (folderEntry) => {
        if (!folderEntry) return null;
        return folderEntry.shortcutParentId ?? folderEntry.parentId ?? null;
    };

    const hasSharedAncestorFolder = (folderId) => {
        if (!folderId) return false;
        let cursorId = folderId;
        let safety = 0;
        while (cursorId && safety < 200) {
            const cursor = folderById.get(cursorId);
            if (!cursor) return false;
            if (cursor.isShared === true) return true;
            cursorId = getFolderParentId(cursor);
            safety += 1;
        }
        return false;
    };

    const isInsideSharedFolderForItem = (item, itemType) => {
        if (!item) return false;
        if (itemType === 'folder') {
            return hasSharedAncestorFolder(getFolderParentId(item));
        }
        const parentId = item.shortcutParentId ?? item.folderId ?? item.parentId ?? null;
        return hasSharedAncestorFolder(parentId);
    };

    const tagFilteredFolders = useMemo(() => {
        if (selectedTags.length === 0) return sharedFolders;
        return sharedFolders.filter(f => Array.isArray(f.tags) && selectedTags.every(tag => f.tags.includes(tag)));
    }, [sharedFolders, selectedTags]);

    const filteredFolders = useMemo(() => {
        const folderIdsInScope = new Set(tagFilteredFolders.map(folder => folder.id));
        const currentFolderId = currentFolder?.id || null;

        return tagFilteredFolders.filter(folder => {
            const parentId = getFolderParentId(folder);

            if (currentFolderId) {
                return parentId === currentFolderId;
            }

            if (!parentId) return true;
            return !folderIdsInScope.has(parentId);
        });
    }, [tagFilteredFolders, currentFolder]);

    const filteredSubjects = useMemo(() => {
        const tagFilteredSubjects = selectedTags.length === 0
            ? sharedSubjects
            : sharedSubjects.filter(s => Array.isArray(s.tags) && selectedTags.every(tag => s.tags.includes(tag)));

        const currentFolderId = currentFolder?.id || null;
        if (!currentFolderId) {
            return tagFilteredSubjects;
        }

        return tagFilteredSubjects.filter(subject => {
            const parentId = subject.shortcutParentId ?? subject.folderId ?? subject.parentId ?? null;
            return parentId === currentFolderId;
        });
    }, [sharedSubjects, selectedTags, currentFolder]);
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
                <p className={`${homeThemeTokens.mutedTextClass} max-w-sm text-center`}>
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
                                    .map((folder) => (
                                        <div key={folder.id}>
                                            <FolderCard
                                                user={user}
                                                folder={folder}
                                                allFolders={fullFolderTreeForCounts}
                                                allSubjects={fullSubjectTreeForCounts}
                                                onOpen={onOpenFolder}
                                                activeMenu={activeMenu}
                                                onToggleMenu={onToggleMenu}
                                                onEdit={(f) => onEditFolder(f)}
                                                onDelete={(f, action = 'delete') => {
                                                    if (action === 'unshareAndDelete' && isInsideSharedFolderForItem(f, 'folder')) return;
                                                    onDeleteFolder(f, action);
                                                }}
                                                onShare={(f) => onShareFolder(f)}
                                                isShared={true}
                                                cardScale={cardScale}
                                                disableUnshareActions={isInsideSharedFolderForItem(folder, 'folder')}
                                            />
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredFolders
                                    .map((folder) => (
                                        <ListViewItem 
                                            key={folder.id}
                                            user={user}
                                            item={folder}
                                            type="folder"
                                            onNavigate={() => onOpenFolder(folder)}
                                            cardScale={cardScale}
                                            onEdit={(f) => onEditFolder(f)}
                                            onDelete={(f, action = 'delete') => {
                                                if (action === 'unshareAndDelete' && isInsideSharedFolderForItem(f, 'folder')) return;
                                                onDeleteFolder(f, action);
                                            }}
                                            onShare={(f) => onShareFolder(f)}
                                            draggable={false}
                                            allFolders={fullFolderTreeForCounts}
                                            allSubjects={fullSubjectTreeForCounts}
                                            onDropAction={() => {}}
                                            disableUnshareActions={isInsideSharedFolderForItem(folder, 'folder')}
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
                                            user={user}
                                            subject={subject}
                                            isFlipped={flippedSubjectId === subject.id}
                                            onFlip={(id) => onFlipSubject(flippedSubjectId === id ? null : id)}
                                            activeMenu={activeMenu}
                                            onToggleMenu={onToggleMenu}
                                            onSelect={() => onSelectSubject(subject)}
                                            onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                                            onEdit={(e, s) => onEditSubject(e, s)} 
                                            onDelete={(e, s, action = 'delete') => {
                                                if (action === 'unshareAndDelete' && isInsideSharedFolderForItem(s, 'subject')) return;
                                                onDeleteSubject(e, s, action);
                                            }}
                                            onShare={(s) => onShareSubject(s)}
                                            cardScale={cardScale}
                                            isShared={true}
                                            disableUnshareActions={isInsideSharedFolderForItem(subject, 'subject')}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredSubjects.map((subject) => (
                                    <ListViewItem
                                        key={subject.id}
                                        user={user}
                                        item={subject}
                                        type="subject"
                                        onNavigateSubject={() => onSelectSubject(subject)}
                                        cardScale={cardScale}
                                        onEdit={(s) => onEditSubject({ stopPropagation: () => {} }, s)}
                                        onDelete={(s, action = 'delete') => {
                                            if (action === 'unshareAndDelete' && isInsideSharedFolderForItem(s, 'subject')) return;
                                            onDeleteSubject({ stopPropagation: () => {} }, s, action);
                                        }}
                                        onShare={(s) => onShareSubject(s)}
                                        draggable={false}
                                        onDropAction={() => {}}
                                        allFolders={allFolders}
                                        allSubjects={filteredSubjects}
                                        disableUnshareActions={isInsideSharedFolderForItem(subject, 'subject')}
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