// src/components/home/SharedView.jsx
import React from 'react';
import { Users, Folder as FolderIcon, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Ensure these paths match your project structure
import FolderCard from './FolderCard';
import SubjectCard from './SubjectCard';
import ListViewItem from './ListViewItem';

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

    // Calculate grid column width based on scale (matches HomeContent logic)
    const gridStyle = { 
        gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))` 
    };

    // --- EMPTY STATE ---
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
            {sharedFolders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <FolderIcon className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Carpetas Compartidas</h2>
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-full">
                            {sharedFolders.length}
                        </span>
                    </div>

                    {layoutMode === 'grid' ? (
                        /* GRID LAYOUT */
                        <div className="grid gap-6" style={gridStyle}>
                            {sharedFolders.map((folder) => (
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
                        /* LIST LAYOUT */
                        <div className="space-y-2">
                            {sharedFolders.map((folder) => (
                                <ListViewItem 
                                    key={folder.id}
                                    item={folder}
                                    type="folder"
                                    onNavigate={() => onOpenFolder(folder)}
                                    cardScale={cardScale}
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                    draggable={false}
                                    allFolders={sharedFolders}
                                    allSubjects={sharedSubjects}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- SHARED SUBJECTS SECTION --- */}
            {sharedSubjects.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Asignaturas Compartidas</h2>
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
                            {sharedSubjects.length}
                        </span>
                    </div>

                    {layoutMode === 'grid' ? (
                        /* GRID LAYOUT */
                        <div className="grid gap-6" style={gridStyle}>
                            {sharedSubjects.map((subject) => (
                                <div key={subject.id}>
                                    <SubjectCard
                                        subject={subject}
                                        isFlipped={flippedSubjectId === subject.id}
                                        onFlip={(id) => onFlipSubject(flippedSubjectId === id ? null : id)}
                                        activeMenu={activeMenu}
                                        onToggleMenu={onToggleMenu}
                                        onSelect={() => onSelectSubject(subject)}
                                        onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                                        
                                        // Read-only actions for shared items
                                        onEdit={() => {}} 
                                        onDelete={() => {}}
                                        
                                        cardScale={cardScale}
                                        isShared={true}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* LIST LAYOUT */
                        <div className="space-y-2">
                            {sharedSubjects.map((subject) => (
                                <ListViewItem
                                    key={subject.id}
                                    item={subject}
                                    type="subject"
                                    onNavigateSubject={() => onSelectSubject(subject)}
                                    cardScale={cardScale}
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                    draggable={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SharedView;