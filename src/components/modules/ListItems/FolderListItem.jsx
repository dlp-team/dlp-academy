// src/components/modules/ListItems/FolderListItem.jsx
import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { ChevronRight, Folder, GripVertical, Users, MoreVertical, Edit2, Trash2, Share2, RotateCcw } from 'lucide-react';
import { createPortal } from 'react-dom';
import SubjectIcon from '../../ui/SubjectIcon';
import ListViewItem from '../ListViewItem';
import { useGhostDrag } from '../../../hooks/useGhostDrag';
import { shouldShowEditUI, shouldShowDeleteUI, canEdit as canEditItem, getPermissionLevel, isShortcutItem } from '../../../utils/permissionUtils';
import { SHORTCUT_LIST_MENU_WIDTH } from '../shared/shortcutMenuConfig';

const FolderListItem = ({ 
    user,
    item, 
    index,
    parentId,
    depth = 0,
    allFolders, 
    allSubjects, 
    onNavigate, 
    onNavigateSubject,
    onEdit,
    onDelete,
    onShare = () => {},
    onGoToFolder,
    disableAllActions = false,
    disableDeleteActions = false,
    cardScale = 100, 
    onDragStart,
    onDragEnd,
    onDropAction,
    draggable = true,
    path
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuBtnRef = useRef(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const currentUserId = user?.uid || null;
    const showEditUI = currentUserId ? shouldShowEditUI(item, currentUserId) : false;
    const showDeleteUI = currentUserId ? shouldShowDeleteUI(item, currentUserId) : false;
    const canShare = currentUserId ? canEditItem(item, currentUserId) : false;
    const isShortcut = isShortcutItem(item);
    const isHiddenFromManual = item?.hiddenInManual === true;
    const isOrphan = item?.isOrphan === true;
    const isMovedToShared = item?._reason === 'moved-to-shared-folder';
    const orphanMessage = item?._reason === 'access-revoked'
        ? 'La carpeta ya no está compartida'
        : item?._reason === 'moved-to-shared-folder'
            ? `Esta carpeta se ha movido a la carpeta ${item?._movedToFolderName || 'compartida del creador'}`
            : 'La carpeta se ha eliminado';
    const shortcutPermissionLevel = isShortcut && currentUserId ? getPermissionLevel(item, currentUserId) : 'none';
    const isShortcutEditor = shortcutPermissionLevel === 'editor' || shortcutPermissionLevel === 'owner';
    const canShareFromMenu = isShortcut ? isShortcutEditor : canShare;
    const isSourceOwner = Boolean(currentUserId && item?.ownerId && item.ownerId === currentUserId);
    const effectiveShowEditUI = !disableAllActions && showEditUI;
    const effectiveCanShareFromMenu = !disableAllActions && canShareFromMenu;
    const effectiveShowDeleteUI = !disableAllActions && !disableDeleteActions && showDeleteUI;
    const canShowShortcutDelete = !disableAllActions && !disableDeleteActions && isShortcut && (isOrphan || !isSourceOwner);
    const canShowShortcutVisibility = !disableAllActions && isShortcut;
    const hasMenuActions = effectiveShowEditUI || effectiveCanShareFromMenu || effectiveShowDeleteUI || canShowShortcutVisibility || canShowShortcutDelete;


    const scale = cardScale / 100;
    const type = 'folder';
    // Minimum scale for the menu is 1 (100%)
    const menuScale = Math.max(scale, 1);

    React.useEffect(() => {
        if (showMenu && menuBtnRef.current) {
            const rect = menuBtnRef.current.getBoundingClientRect();
            const menu = { width: SHORTCUT_LIST_MENU_WIDTH * menuScale, height: 48 * 3 * menuScale };
            setMenuPos({
                top: rect.bottom - menu.height,
                left: rect.right - menu.width
            });
        }
    }, [showMenu, menuScale]);

    const getFolderParentId = (folderEntry) => {
        if (!folderEntry) return null;
        if (isShortcutItem(folderEntry)) return folderEntry.shortcutParentId ?? folderEntry.parentId ?? null;
        return folderEntry.parentId ?? null;
    };

    const getSubjectParentId = (subjectEntry) => {
        if (!subjectEntry) return null;
        if (isShortcutItem(subjectEntry)) return subjectEntry.shortcutParentId ?? subjectEntry.folderId ?? subjectEntry.parentId ?? null;
        return subjectEntry.folderId ?? null;
    };


    // --- CHILDREN CALCULATION ---
    // Count all descendants recursively (matches grid mode behavior)
    const { subjectCount, folderCount, totalCount } = useMemo(() => {
        if (!allFolders || !allSubjects) {
            return { subjectCount: 0, folderCount: 0, totalCount: 0 };
        }

        const visited = new Set();

        const traverse = (folderId) => {
            if (visited.has(folderId)) return { s: 0, f: 0 };
            visited.add(folderId);

            const childFolders = allFolders.filter(f => getFolderParentId(f) === folderId);
            const childSubjects = allSubjects.filter(s => getSubjectParentId(s) === folderId);

            let s = childSubjects.length;
            let f = childFolders.length;

            childFolders.forEach(child => {
                const childStats = traverse(child.id);
                s += childStats.s;
                f += childStats.f;
            });

            return { s, f };
        };

        const stats = traverse(item.id);
        
        return {
            subjectCount: stats.s,
            folderCount: stats.f,
            totalCount: stats.s + stats.f
        };
    }, [item, allFolders, allSubjects]);

    // --- 2. CHILDREN CALCULATION FOR RENDERING ---
    let childFolders = [];
    let childSubjects = [];

    // Query direct children by parentId and folderId (not from arrays)
    childFolders = Array.isArray(allFolders) ? allFolders.filter(f => getFolderParentId(f) === item.id) : [];
    childSubjects = Array.isArray(allSubjects) ? allSubjects.filter(s => getSubjectParentId(s) === item.id) : [];
    
    const hasChildren = childFolders.length > 0 || childSubjects.length > 0;

    
    // --- LABELS (must be after counts) ---
    const totalLabel = totalCount === 1 ? 'elemento' : 'elementos';
    const subjectLabel = subjectCount === 1 ? 'asignatura' : 'asignaturas';
    const folderLabel = folderCount === 1 ? 'carpeta' : 'carpetas';

    // --- DRAG HANDLERS ---
    const handleLocalDragStart = (e) => {
        if (!draggable) {
            e.preventDefault();
            return;
        }
        //e.stopPropagation();
        const dragData = {
            id: item.id,
            type: type,
            parentId: item.shortcutParentId ?? parentId,
            shortcutId: item.shortcutId || null,
            index: typeof index === 'number' ? index : null
        };
        e.dataTransfer.setData('folderId', item.id);
        e.dataTransfer.setData('folderShortcutId', item.shortcutId || '');
        e.dataTransfer.setData('treeItem', JSON.stringify(dragData));
        
        if (onDragStart) onDragStart(item); 
    };

    // Initialize custom ghost drag hook
    const { 
        isDragging, 
        itemRef, 
        dragHandlers 
    } = useGhostDrag({ 
        item, 
        type: 'folder', 
        cardScale, 
        onDragStart: handleLocalDragStart,
        onDragEnd 
    });

    const handleDragOver = (e) => {
        e.preventDefault(); //e.stopPropagation();
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault(); //e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); 
        if (!draggable) return;
        setIsDragOver(false);

        const treeDataString = e.dataTransfer.getData('treeItem');
        let draggedData;

        if (treeDataString) {
            draggedData = JSON.parse(treeDataString);
        } else {
            const sId = e.dataTransfer.getData('subjectId');
            const fId = e.dataTransfer.getData('folderId');
            if (sId) draggedData = { id: sId, type: 'subject' };
            else if (fId) draggedData = { id: fId, type: 'folder' };
        }

        if (!draggedData || draggedData.id === item.id) return;

        onDropAction(draggedData, { id: item.id, type: type, parentId: parentId, index });
        
        if (!isExpanded) setIsExpanded(true);
    };

    const handleClickFolder = (e) => { e.stopPropagation(); setIsExpanded(!isExpanded); };

    // --- STYLES & INDENTATION ---
    const indent = depth * (100 * scale); // 32px per level, scaled
    const iconBoxSize = 48 * scale;
    const iconSize = 28 * scale;
    const paddingY = 16 * scale;
    const paddingX = 16 * scale;

    return (
        <div className="select-none animate-in fade-in duration-200">
            {/* ROW CONTAINER */}
            <div 
                ref={itemRef}
                draggable={draggable}
                onDragStart={dragHandlers.onDragStart}
                onDrag={dragHandlers.onDrag}
                onDragEnd={dragHandlers.onDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative group rounded-xl transition-all duration-200 border border-transparent z-10 ${
                    isDragOver 
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500 scale-[1.01] shadow-md'
                        : ''
                } ${isDragging ? 'opacity-0 scale-95 transition-none' : ''}`}
                style={{ marginLeft: `${indent}px` }}
            >
                <div 
                    onClick={handleClickFolder}
                    className={`flex items-center gap-4 rounded-xl cursor-pointer transition-colors ${
                        isDragOver ? '' : 'bg-white dark:bg-slate-900 shadow-sm hover:shadow-md border border-gray-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                    style={{ padding: `${paddingY}px ${paddingX}px` }}
                >
                    <div className="flex items-center gap-1 -ml-1">
                        <div className={`text-gray-300 cursor-grab active:cursor-grabbing ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ transform: `scale(${scale})` }}>
                            <GripVertical size={16} />
                        </div>
                        <div className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} style={{ transformOrigin: 'center', transform: `scale(${scale}) ${isExpanded ? 'rotate(0deg)' : 'rotate(0deg)'}` }}>
                            <ChevronRight size={20} />
                        </div>
                    </div>
                    <div className={`relative flex items-center justify-center rounded-lg bg-gradient-to-br ${item.color || 'from-indigo-500 to-purple-500'} ${isOrphan ? 'saturate-50 brightness-95' : ''}`} style={{ width: `${iconBoxSize}px`, height: `${iconBoxSize}px`, flexShrink: 0 }}>
                        {/* Main folder or subject icon */}
                        {(item.icon && !isOrphan) ? (
                            <SubjectIcon iconName={item.icon} className="text-white" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                        ) : (
                            <Folder className="text-white" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                        )}
                        {/* Shared icon inside folder icon, like FolderCardBody, but smaller */}
                        {(item.isShared === true || (Array.isArray(item.sharedWith) && item.sharedWith.length > 0) || (Array.isArray(item.sharedWithUids) && item.sharedWithUids.length > 0)) && (
                            <div
                                className="absolute inset-0 flex items-center justify-center z-10 bottom--"
                                style={{ pointerEvents: 'none' }}
                            >
                                <div className="flex items-center justify-center rounded-full opacity-80 bg-none"
                                    style={{
                                        width: `${iconSize * 0.45}px`,
                                        height: `${iconSize * 0.45}px`,
                                        transform: 'translateY(2px)'
                                    }}
                                >
                                    <Users
                                        className="text-white"
                                        style={{ width: `${iconSize * 0.4}px`, height: `${iconSize * 0.4}px` }}
                                        strokeWidth={2.5}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate" style={{ fontSize: `${18 * scale}px` }}>
                                {item.name}
                            </h4>
                            {/* Shared icon for subjects, right of title */}
                            {type === 'subject' && (
                                (item.isShared === true || (Array.isArray(item.sharedWith) && item.sharedWith.length > 0) || (Array.isArray(item.sharedWithUids) && item.sharedWithUids.length > 0)) && (
                                    <div 
                                        className={`flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 ml-2`}
                                        style={{ 
                                            width: `${24 * scale}px`, 
                                            height: `${24 * scale}px`,
                                            minWidth: `${24 * scale}px` 
                                        }}
                                        title="Asignatura compartida"
                                    >
                                        <Users 
                                            className="text-indigo-600 dark:text-indigo-400"
                                            style={{ width: `${14 * scale}px`, height: `${14 * scale}px` }}
                                        />
                                    </div>
                                )
                            )}
                            
                        </div>
                        <div className="flex items-center flex-wrap gap-x-2 text-gray-500 mt-0.5" style={{ fontSize: `${16 * scale}px` }}>
                            {/* Total Count */}
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                {totalCount} {totalLabel}
                            </span>
                            
                            <span className="text-gray-300">•</span>
                            
                            {/* Detail Counts */}
                            <span className="text-gray-400 dark:text-gray-500">
                                {subjectCount} {subjectLabel}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                                {folderCount} {folderLabel}
                            </span>
                        </div>
                        
                    </div>
                    {isOrphan && (
                        <span
                            className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap mr-1"
                            style={{ fontSize: `${12 * scale}px` }}
                        >
                            {orphanMessage}
                        </span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); if (isOrphan && isShortcut) return; onNavigate(item); }} className="text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" style={{ padding: `${8 * scale}px` }}>
                        <Folder style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} />
                    </button>
                    {/* Three Dots Menu Button */}
                    <div className="relative ml-2 flex items-center">
                        {!isOrphan && hasMenuActions && (
                            <button
                                ref={menuBtnRef}
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className={`p-2 rounded-full transition-colors opacity-100 hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400`}
                            >
                                <MoreVertical size={20 * scale} />
                            </button>
                        )}
                        {showMenu && (
                            <>
                                {typeof window !== 'undefined' && window.document && createPortal(
                                    <>
                                        <div 
                                            className="fixed inset-0 z-[100]" 
                                            onClick={e => { e.stopPropagation(); setShowMenu(false); }}
                                        />
                                        <div
                                            className="fixed z-[101] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1 animate-in fade-in zoom-in-95 duration-100 transition-none"
                                            style={{
                                                top: menuPos.top + 'px',
                                                left: menuPos.left + 'px',
                                                width: `${SHORTCUT_LIST_MENU_WIDTH * menuScale}px`,
                                                transform: `scale(${menuScale})`,
                                                transformOrigin: 'bottom right',
                                                pointerEvents: 'auto'
                                            }}
                                        >
                                            {(effectiveShowEditUI || effectiveShowDeleteUI || canShowShortcutVisibility || canShowShortcutDelete || effectiveCanShareFromMenu) ? (
                                                <>
                                                    {effectiveShowEditUI && (
                                                        <button 
                                                            onClick={e => { e.stopPropagation(); onEdit(item); setShowMenu(false); }}
                                                            className="w-full flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                                            style={{ fontSize: `${14 * menuScale}px` }}
                                                        >
                                                            <Edit2 size={14 * menuScale} /> Editar
                                                        </button>
                                                    )}
                                                    {effectiveCanShareFromMenu && (
                                                        <button 
                                                            onClick={e => { e.stopPropagation(); onShare(item); setShowMenu(false); }}
                                                            className="w-full flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                                            style={{ fontSize: `${14 * menuScale}px` }}
                                                        >
                                                            <Share2 size={14 * menuScale} /> Compartir
                                                        </button>
                                                    )}
                                                    {(effectiveShowEditUI || effectiveCanShareFromMenu) && (effectiveShowDeleteUI || canShowShortcutVisibility || canShowShortcutDelete) && (
                                                        <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                                    )}
                                                    {canShowShortcutVisibility && (
                                                        <button 
                                                            onClick={e => { e.stopPropagation(); onDelete(item, isHiddenFromManual ? 'showInManual' : 'removeShortcut'); setShowMenu(false); }}
                                                            className="w-full flex items-center gap-2 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400 transition-colors cursor-pointer"
                                                            style={{ fontSize: `${14 * menuScale}px` }}
                                                        >
                                                            {isHiddenFromManual ? <RotateCcw size={14 * menuScale} /> : <Trash2 size={14 * menuScale} />} {isHiddenFromManual ? 'Mostrar en manual' : 'Quitar de manual'}
                                                        </button>
                                                    )}
                                                    {canShowShortcutDelete && (
                                                        <button 
                                                            onClick={e => { e.stopPropagation(); onDelete(item, isOrphan ? 'deleteShortcut' : 'unshareAndDelete'); setShowMenu(false); }}
                                                            className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                                            style={{ fontSize: `${14 * menuScale}px` }}
                                                        >
                                                            <Trash2 size={14 * menuScale} /> Eliminar
                                                        </button>
                                                    )}
                                                    {!isShortcut && effectiveShowDeleteUI && (
                                                        <button 
                                                            onClick={e => { e.stopPropagation(); onDelete(item); setShowMenu(false); }}
                                                            className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                                            style={{ fontSize: `${14 * menuScale}px` }}
                                                        >
                                                            <Trash2 size={14 * menuScale} /> Eliminar
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="p-2 text-xs text-center text-gray-500 dark:text-gray-400">Solo lectura</div>
                                            )}
                                        </div>
                                    </>,
                                    window.document.body
                                )}
                            </>
                        )}
                    </div>
                    
                </div>

                {isOrphan && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {isMovedToShared && item?._movedToFolderId ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (typeof onGoToFolder === 'function') {
                                        onGoToFolder(item._movedToFolderId);
                                    }
                                }}
                                className="pointer-events-auto px-4 py-2 rounded-lg font-semibold shadow-lg flex justify-center items-center"
                                style={{
                                    fontSize: `${13 * scale}px`,
                                    background: 'rgba(30,41,59,0.35)',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    transition: 'background 0.2s',
                                }}
                            >
                                {`Ir a carpeta ${item?._movedToFolderName || ''}`.trim()}
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item, 'deleteShortcut'); }}
                                className="pointer-events-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
                                style={{ fontSize: `${13 * scale}px` }}
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* CHILDREN (Recursive) */}
            <div 
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="mt-2 flex flex-col gap-2">
                        {hasChildren ? (
                            <>
                                {childFolders.map((folder, childIndex) => (
                                    <ListViewItem
                                        key={folder.id}
                                        item={folder}
                                        type="folder"
                                        index={childIndex}
                                        parentId={item.id} 
                                        depth={depth + 1}
                                        allFolders={allFolders}
                                        allSubjects={allSubjects}
                                        onNavigate={onNavigate}
                                        onNavigateSubject={onNavigateSubject}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onShare={onShare}
                                        onGoToFolder={onGoToFolder}
                                        disableAllActions={disableAllActions}
                                        disableDeleteActions={disableDeleteActions}
                                        cardScale={cardScale}
                                        onDragStart={onDragStart}
                                        onDragEnd={onDragEnd}
                                        onDropAction={onDropAction}
                                        draggable={draggable}
                                        path={path}
                                    />
                                ))}
                                {childSubjects.map((subject, childIndex) => (
                                    <ListViewItem
                                        key={subject.id}
                                        item={subject}
                                        type="subject"
                                        index={childIndex}
                                        parentId={item.id} 
                                        depth={depth + 1}
                                        allFolders={allFolders}
                                        allSubjects={allSubjects}
                                        onNavigate={onNavigate}
                                        onNavigateSubject={onNavigateSubject}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onShare={onShare}
                                        onGoToFolder={onGoToFolder}
                                        disableAllActions={disableAllActions}
                                        disableDeleteActions={disableDeleteActions}
                                        cardScale={cardScale}
                                        onDragStart={onDragStart}
                                        onDragEnd={onDragEnd}
                                        onDropAction={onDropAction}
                                        draggable={draggable}
                                        path={path}
                                    />
                                ))}
                            </>
                        ) : (
                            <div 
                                className="text-gray-400 italic py-3 pl-4 border-l-2 border-dashed border-gray-300 dark:border-slate-700" 
                                style={{ 
                                    marginLeft: `${indent + (32 * scale)}px`, 
                                    fontSize: `${12 * scale}px` 
                                }}
                            >
                                Carpeta vacía
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FolderListItem;