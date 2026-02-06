// src/components/home/SharedView.jsx
import React from 'react';
import { Users, Folder as FolderIcon, BookOpen } from 'lucide-react';
import FolderCard from './FolderCard';
import SubjectCard from './SubjectCard';

const SharedView = ({ 
    sharedFolders, 
    sharedSubjects, 
    layoutMode,
    cardScale,
    onOpenFolder,
    onSelectSubject,
    activeMenu,
    onToggleMenu,
    flippedSubjectId,
    onFlipSubject,
    onSelectTopic,
    navigate
}) => {
    const getCardDimensions = () => {
        const baseHeight = 256;
        const scaledHeight = (baseHeight * cardScale) / 100;
        return { height: `${scaledHeight}px` };
    };

    if (sharedFolders.length === 0 && sharedSubjects.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    No hay contenido compartido
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Cuando alguien comparta carpetas o asignaturas contigo, aparecerán aquí
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Shared Folders Section */}
            {sharedFolders.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 transition-colors">
                        <FolderIcon className="text-amber-500 dark:text-amber-400" size={20} />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            Carpetas Compartidas
                        </h3>
                        <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full transition-colors">
                            {sharedFolders.length}
                        </span>
                    </div>

                    {layoutMode === 'grid' && (
                        <div 
                            className="grid gap-6"
                            style={{
                                gridTemplateColumns: `repeat(auto-fill, minmax(${cardScale * 2.5}px, 1fr))`
                            }}
                        >
                            {sharedFolders.map((folder) => (
                                <div key={folder.id} style={getCardDimensions()}>
                                    <FolderCard
                                        folder={folder}
                                        onOpen={onOpenFolder}
                                        activeMenu={activeMenu}
                                        onToggleMenu={onToggleMenu}
                                        onEdit={() => {}}
                                        onDelete={() => {}}
                                        onShare={() => {}}
                                        cardScale={cardScale}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {layoutMode === 'list' && (
                        <div className="space-y-2">
                            {sharedFolders.map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() => onOpenFolder(folder)}
                                    className="w-full p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex items-center gap-4 cursor-pointer"
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${folder.color} flex items-center justify-center`}>
                                        <FolderIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{folder.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {folder.subjectIds?.length || 0} asignaturas • {folder.ownerEmail}
                                        </p>
                                    </div>
                                    <Users size={20} className="text-blue-500 dark:text-blue-400" />
                                </button>
                            ))}
                        </div>
                    )}

                    {layoutMode === 'folders' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {sharedFolders.map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() => onOpenFolder(folder)}
                                    className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${folder.color} flex items-center justify-center mb-3 mx-auto`}>
                                        <FolderIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-medium text-gray-900 dark:text-white text-center truncate">
                                        {folder.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                                        {folder.subjectIds?.length || 0} asignaturas
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Shared Subjects Section */}
            {sharedSubjects.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 transition-colors">
                        <BookOpen className="text-indigo-500 dark:text-indigo-400" size={20} />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            Asignaturas Compartidas
                        </h3>
                        <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full transition-colors">
                            {sharedSubjects.length}
                        </span>
                    </div>

                    <div 
                        className="grid gap-6"
                        style={{
                            gridTemplateColumns: `repeat(auto-fill, minmax(${cardScale * 2.5}px, 1fr))`
                        }}
                    >
                        {sharedSubjects.map((subject) => (
                            <div key={subject.id} style={getCardDimensions()}>
                                <SubjectCard
                                    subject={subject}
                                    isFlipped={flippedSubjectId === subject.id}
                                    onFlip={onFlipSubject}
                                    activeMenu={activeMenu}
                                    onToggleMenu={onToggleMenu}
                                    onSelect={onSelectSubject}
                                    onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                    cardScale={cardScale}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedView;