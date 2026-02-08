// src/components/modals/FolderTreeModal.jsx
import React from 'react';
import { X, Folder, ChevronRight, FileText, CornerDownRight } from 'lucide-react';
import SubjectIcon from '../modals/SubjectIcon';

const TreeItem = ({ 
    item, 
    type, 
    allFolders, 
    allSubjects, 
    onNavigateFolder, 
    onNavigateSubject, 
    depth = 0 
}) => {
    // Determine children if it's a folder
    let childFolders = [];
    let childSubjects = [];

    if (type === 'folder') {
        if (item.folderIds && item.folderIds.length > 0) {
            childFolders = allFolders.filter(f => item.folderIds.includes(f.id));
        }
        if (item.subjectIds && item.subjectIds.length > 0) {
            childSubjects = allSubjects.filter(s => item.subjectIds.includes(s.id));
        }
    }

    const hasChildren = childFolders.length > 0 || childSubjects.length > 0;
    
    // Handler for clicking this item
    const handleClick = (e) => {
        e.stopPropagation();
        if (type === 'folder') {
            onNavigateFolder(item);
        } else {
            onNavigateSubject(item);
        }
    };

    return (
        <div className="select-none">
            {/* The Item Row */}
            <div 
                onClick={handleClick}
                className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    type === 'folder' 
                        ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-800 dark:text-gray-100' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                }`}
                style={{ marginLeft: `${depth * 20}px` }}
            >
                {/* Visual Connector for hierarchy */}
                {depth > 0 && (
                    <CornerDownRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                )}

                {/* Icon */}
                <div className="shrink-0">
                    {type === 'folder' ? (
                        item.icon ? (
                            <SubjectIcon iconName={item.icon} className="w-5 h-5 text-indigo-500" />
                        ) : (
                            <Folder size={20} className="text-indigo-500 fill-indigo-100 dark:fill-indigo-900/30" />
                        )
                    ) : (
                        item.icon ? (
                             <div className="w-5 h-5 flex items-center justify-center">
                                <SubjectIcon iconName={item.icon} className="w-4 h-4" />
                             </div>
                        ) : (
                            <FileText size={18} className="text-slate-400" />
                        )
                    )}
                </div>

                {/* Name */}
                <span className={`text-sm truncate ${type === 'folder' ? 'font-medium' : ''}`}>
                    {item.name}
                </span>

                {/* Count Badge for Folders */}
                {type === 'folder' && (
                    <span className="text-xs text-gray-400 ml-auto group-hover:text-indigo-500">
                        {childFolders.length + childSubjects.length}
                    </span>
                )}
            </div>

            {/* Recursively render children */}
            {hasChildren && (
                <div className="border-l-2 border-gray-100 dark:border-slate-800 ml-3.5 my-1">
                    {childFolders.map(folder => (
                        <TreeItem 
                            key={folder.id} 
                            item={folder} 
                            type="folder" 
                            allFolders={allFolders} 
                            allSubjects={allSubjects}
                            onNavigateFolder={onNavigateFolder}
                            onNavigateSubject={onNavigateSubject}
                            depth={depth + 1} 
                        />
                    ))}
                    {childSubjects.map(subject => (
                        <TreeItem 
                            key={subject.id} 
                            item={subject} 
                            type="subject" 
                            allFolders={allFolders} 
                            allSubjects={allSubjects}
                            onNavigateFolder={onNavigateFolder}
                            onNavigateSubject={onNavigateSubject}
                            depth={depth + 1} 
                        />
                    ))}
                </div>
            )}
            
            {/* Empty State for Folders */}
            {type === 'folder' && !hasChildren && (
                <div className="ml-9 py-1 text-xs text-gray-400 italic">
                    (Vacío)
                </div>
            )}
        </div>
    );
};

const FolderTreeModal = ({ 
    isOpen, 
    onClose, 
    rootFolder, 
    allFolders, 
    allSubjects, 
    onNavigateFolder,
    onNavigateSubject 
}) => {
    if (!isOpen || !rootFolder) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${rootFolder.color || 'from-indigo-500 to-purple-500'}`}>
                            <Folder className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white">
                                {rootFolder.name}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Contenido de la carpeta
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tree Content (Scrollable) */}
                <div className="p-4 overflow-y-auto min-h-[300px] custom-scrollbar">
                    {/* We render the contents of the root folder, not the root folder itself as a tree item to avoid redundancy, 
                        unless you want the top node to be selectable too. 
                        Here we render the children directly for a "contents view". */}
                    
                    {(() => {
                        const childFolders = allFolders.filter(f => rootFolder.folderIds?.includes(f.id));
                        const childSubjects = allSubjects.filter(s => rootFolder.subjectIds?.includes(s.id));
                        
                        if (childFolders.length === 0 && childSubjects.length === 0) {
                            return (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                    <Folder size={48} className="mb-2 opacity-20" />
                                    <p>Esta carpeta está vacía</p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-1">
                                {childFolders.map(folder => (
                                    <TreeItem 
                                        key={folder.id} 
                                        item={folder} 
                                        type="folder" 
                                        allFolders={allFolders} 
                                        allSubjects={allSubjects} 
                                        onNavigateFolder={onNavigateFolder}
                                        onNavigateSubject={onNavigateSubject}
                                    />
                                ))}
                                {childSubjects.map(subject => (
                                    <TreeItem 
                                        key={subject.id} 
                                        item={subject} 
                                        type="subject" 
                                        allFolders={allFolders} 
                                        allSubjects={allSubjects} 
                                        onNavigateFolder={onNavigateFolder}
                                        onNavigateSubject={onNavigateSubject}
                                    />
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default FolderTreeModal;