// src/components/modules/FolderCard/FolderCardBody.jsx
import React, { useRef, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Folder, MoreVertical, Edit2, Trash2, Share2, Users, ListTree, RotateCcw } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../../ui/SubjectIcon';
import { shouldShowEditUI, shouldShowDeleteUI, canEdit as canEditItem, getPermissionLevel, isShortcutItem } from '../../../utils/permissionUtils';
import { SHORTCUT_CARD_MENU_WIDTH } from '../shared/shortcutMenuConfig';

const FolderCardBody = ({
    folder,
    user,
    isModern,
    gradientClass,
    fillColor,
    scaleMultiplier,
    subjectCount,
    folderCount,
    totalCount,    
    activeMenu,
    onToggleMenu,
    onEdit,
    onDelete,
    onShare,
    onShowContents,
    onGoToFolder,
    filterOverlayOpen,
    onCloseFilterOverlay,
    disableAllActions = false,
    disableDeleteActions = false
}) => {
    // Permission checks
    const showEditUI = user && shouldShowEditUI(folder, user.uid);
    const showDeleteUI = user && shouldShowDeleteUI(folder, user.uid);
    const canShare = user && canEditItem(folder, user.uid); // Only editors can share
    const isShortcut = isShortcutItem(folder);
    const isHiddenFromManual = folder?.hiddenInManual === true;
    const isOrphan = folder?.isOrphan === true;
    const isMovedToShared = folder?._reason === 'moved-to-shared-folder';
    const orphanMessage = folder?._reason === 'access-revoked'
        ? 'Carpeta descompartida'
        : folder?._reason === 'moved-to-shared-folder'
            ? `Esta carpeta se ha movido a la carpeta ${folder?._movedToFolderName || 'compartida del creador'}`
            : 'Archivo original eliminado';
    const shortcutPermissionLevel = isShortcut && user ? getPermissionLevel(folder, user.uid) : 'none';
    const isShortcutEditor = shortcutPermissionLevel === 'editor' || shortcutPermissionLevel === 'owner';
    const canShareFromMenu = isShortcut ? isShortcutEditor : canShare;
    const isSourceOwner = user && folder?.ownerId === user.uid;
    const effectiveShowEditUI = !disableAllActions && showEditUI;
    const effectiveCanShareFromMenu = !disableAllActions && canShareFromMenu;
    const effectiveShowDeleteUI = !disableAllActions && !disableDeleteActions && showDeleteUI;
    const canShowShortcutDelete = !disableAllActions && !disableDeleteActions && isShortcut && (isOrphan || !isSourceOwner);
    const canShowShortcutVisibility = !disableAllActions && isShortcut;
    const hasMenuActions = effectiveShowEditUI || effectiveCanShareFromMenu || effectiveShowDeleteUI || canShowShortcutVisibility || canShowShortcutDelete;
    // 1. Logic: No useState needed here. We use CSS for hover states.
    // Enforce a minimum scale of 1 for the menu
    const menuScale = Math.max(scaleMultiplier, 1);
    const shiftX = 48 * scaleMultiplier;
    const menuBtnRef = useRef(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    useLayoutEffect(() => {
        if (activeMenu === folder.id && menuBtnRef.current) {
            const rect = menuBtnRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + 4,
                left: rect.left,
            });
        }
    }, [activeMenu, folder.id]);
    
    return (
        <div className={`relative z-10 h-full w-full rounded-b-2xl rounded-tr-2xl rounded-tl-none shadow-lg overflow-hidden ${
            isModern 
            ? `bg-gradient-to-br ${gradientClass} p-[3px] ${isOrphan ? 'saturate-50 brightness-95' : ''}` 
                : ''
        }`}>
             
            {/* INNER CONTENT CONTAINER */}
            <div className={`h-full w-full rounded-xl rounded-tl-none overflow-hidden relative flex flex-col justify-between ${
                isModern 
                    ? 'bg-white dark:bg-slate-950' 
                    : ''
            }`}>
                
                {/* --- FRONT VISUALS --- */}
                {!isModern && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-100 ${isOrphan ? 'saturate-50 brightness-95' : ''}`}></div>
                )}
                {isModern && fillColor && (
                    <div className={`absolute inset-0 ${fillColor} ${isOrphan ? 'saturate-50 brightness-95' : ''}`}></div>
                )}
                {/* Hover Overlay */}
                {isModern && (
                    <div className="absolute inset-0 bg-slate-100/30 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                )}

               {/* --- ACTION GROUP WRAPPER (Top Right) --- */}
                {!isOrphan && (
                <div 
                    className="absolute z-30 flex items-center justify-end" 
                    style={{
                        top: `${16 * scaleMultiplier}px`,
                        right: `${16 * scaleMultiplier}px`,
                        height: `${32 * scaleMultiplier}px`
                    }}
                >
                    {/* 1. Badge / Counter */}
                    <div 
                        className={`transition-all duration-300 ease-out 
                            ${(!filterOverlayOpen ? 'group-hover:-translate-x-[var(--shift-x)]' : '')}
                            ${activeMenu === folder.id ? '-translate-x-[var(--shift-x)]' : ''}
                        `}
                        style={{
                            '--shift-x': `${shiftX}px`,
                        }}
                    >
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (typeof onCloseFilterOverlay === 'function') onCloseFilterOverlay();
                                if (onShowContents) onShowContents(folder);
                            }}
                            className={`${
                                isModern 
                                    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600' 
                                    : 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30'
                            } rounded-full cursor-pointer hover:scale-105 flex items-center gap-2 shadow-sm transition-all`}
                            style={{
                                fontSize: `${12 * scaleMultiplier}px`,
                                padding: `${6 * scaleMultiplier}px ${12 * scaleMultiplier}px`
                            }}
                            title="Ver estructura del contenido"
                        >
                            <ListTree size={12 * scaleMultiplier} />
                            
                            {/* --- FIXED TEXT LOGIC --- */}
                            <span className="font-bold whitespace-nowrap">
                                {/* Default View: Visible normally, Hidden on Card Hover (unless filterOverlayOpen) */}
                                <span
                                    className={`block ${!filterOverlayOpen ? 'animate-in fade-in duration-200 group-hover:hidden' : ''}`}
                                >
                                    {totalCount} {totalCount === 1 ? 'elemento' : 'elementos'}
                                </span>

                                {/* Hover View: Hidden normally, Visible on Card Hover (unless filterOverlayOpen) */}
                                {!filterOverlayOpen && (
                                    <span
                                        className="hidden group-hover:flex items-center gap-2 animate-in fade-in duration-200"
                                    >
                                        <span>{subjectCount} {subjectCount === 1 ? 'asig.' : 'asigs.'}</span>
                                        <span className="opacity-40">|</span>
                                        <span>{folderCount} {folderCount === 1 ? 'carp.' : 'carps.'}</span>
                                    </span>
                                )}
                            </span>

                        </button>
                    </div>

                    {/* 2. Dots Menu */}
                    {!filterOverlayOpen && (
                        <div className="absolute right-0"> 
                            {hasMenuActions && (
                                <button
                                    ref={menuBtnRef}
                                    onClick={(e) => { e.stopPropagation(); onToggleMenu(folder.id); }}
                                    className={`rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center ${
                                        isModern
                                            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800'
                                            : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                                    } ${
                                        activeMenu === folder.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
                                    }`}
                                    style={{ 
                                        width: `${32 * scaleMultiplier}px`, 
                                        height: `${32 * scaleMultiplier}px` 
                                    }}
                                >
                                    <MoreVertical size={15 * scaleMultiplier} />
                                </button>
                            )}

                            {/* Dropdown Menu rendered in a portal */}
                            {activeMenu === folder.id && typeof window !== 'undefined' && createPortal(
                                <div
                                    className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1 animate-in fade-in zoom-in-95 duration-100 transition-colors"
                                    style={{
                                        position: 'fixed',
                                        top: menuPos.top,
                                        left: menuPos.left,
                                        zIndex: 9999,
                                        width: `${SHORTCUT_CARD_MENU_WIDTH * menuScale}px`,
                                        transform: `scale(${menuScale})`,
                                        transformOrigin: 'top left'
                                    }}
                                >
                                    {(effectiveShowEditUI || effectiveShowDeleteUI || canShowShortcutVisibility || canShowShortcutDelete || effectiveCanShareFromMenu) ? (
                                        <>
                                            {effectiveShowEditUI && (
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(folder); onToggleMenu(null); }} className="w-full flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors" style={{ fontSize: `${14 * menuScale}px` }}>
                                                    <Edit2 size={14 * menuScale} /> Editar
                                                </button>
                                            )}
                                            {effectiveCanShareFromMenu && (
                                                <button onClick={(e) => { e.stopPropagation(); onShare(folder); onToggleMenu(null); }} className="w-full flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors" style={{ fontSize: `${14 * menuScale}px` }}>
                                                    <Share2 size={14 * menuScale} /> Compartir
                                                </button>
                                            )}
                                            {(effectiveShowEditUI || effectiveCanShareFromMenu) && (effectiveShowDeleteUI || isShortcut) && (
                                                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                            )}
                                            {canShowShortcutVisibility && (
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(folder, isHiddenFromManual ? 'showInManual' : 'removeShortcut'); onToggleMenu(null); }} className="w-full flex items-center gap-2 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400 transition-colors" style={{ fontSize: `${14 * menuScale}px` }}>
                                                    {isHiddenFromManual ? <RotateCcw size={14 * menuScale} /> : <Trash2 size={14 * menuScale} />}
                                                    <span className="whitespace-nowrap">{isHiddenFromManual ? 'Mostrar en manual' : 'Quitar de manual'}</span>
                                                </button>
                                            )}
                                            {canShowShortcutDelete && (
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(folder, isOrphan ? 'deleteShortcut' : 'unshareAndDelete'); onToggleMenu(null); }} className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors" style={{ fontSize: `${14 * menuScale}px` }}>
                                                    <Trash2 size={14 * menuScale} /> Eliminar
                                                </button>
                                            )}
                                            {!isShortcut && effectiveShowDeleteUI && (
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(folder); onToggleMenu(null); }} className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors" style={{ fontSize: `${14 * menuScale}px` }}>
                                                    <Trash2 size={14 * menuScale} /> Eliminar
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-2 text-xs text-center text-gray-500 dark:text-gray-400">Solo lectura</div>
                                    )}
                                </div>,
                                document.body
                            )}
                        </div>
                    )}
                </div>
                )}

                {/* --- CONTENT AREA --- */}
                <div className={`relative h-full flex flex-col justify-between pointer-events-none ${
                    isModern ? '' : 'text-white'
                }`}
                style={{ padding: `${24 * scaleMultiplier}px` }}>
                    
                    {/* Top: Icon */}
                    <div className="flex justify-between items-start"
                        style={{ paddingTop: `${8 * scaleMultiplier}px` }}>

                        {/* 1. WRAPPER: relative position to allow overlaying icons */}
                        <div className="relative inline-flex items-center justify-center">

                            {/* 2. BACKGROUND: The Main Folder Icon */}
                            {isModern ? (
                                <div 
                                    className={`${getIconColor(folder.color)} flex items-center justify-center rounded-lg`}
                                    style={{ width: `${28 * scaleMultiplier}px`, height: `${28 * scaleMultiplier}px` }}
                                >
                                    {/* If it's shared, we hide the default folder icon to show the user icon, 
                                        OR we keep it. Here I keep it but you can remove it if you want ONLY the user icon. */}
                                    {folder.icon ? (
                                        <SubjectIcon 
                                            iconName={folder.icon} 
                                            style={{ width: `${16 * scaleMultiplier}px`, height: `${16 * scaleMultiplier}px` }}
                                        />
                                    ) : (
                                        <Folder 
                                            className="text-indigo-600 dark:text-indigo-400"
                                            style={{ width: `${16 * scaleMultiplier}px`, height: `${16 * scaleMultiplier}px` }}
                                        />
                                    )}
                                </div>
                            ) : (
                                // Classic Mode Folder
                                <div style={{ width: `${48 * scaleMultiplier}px`, height: `${48 * scaleMultiplier}px` }}>
                                    {folder.icon ? (
                                        <SubjectIcon 
                                            iconName={folder.icon} 
                                            className="text-white opacity-80"
                                            style={{ width: `${48 * scaleMultiplier}px`, height: `${48 * scaleMultiplier}px` }}
                                        />
                                    ) : (
                                        <Folder 
                                            className="text-white opacity-80"
                                            style={{ width: `${48 * scaleMultiplier}px`, height: `${48 * scaleMultiplier}px` }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* 3. OVERLAY: The User Icon (Placed Absolute "Inside") */}
                            {folder.isShared && (
                                <div 
                                    className="absolute inset-0 flex items-center justify-center z-10"
                                    style={{
                                        // Optional: slight offset if you want it to look like it's peeking out
                                        bottom: isModern ? 0 : '-6px', 
                                    }} 
                                >
                                    <div className={`flex items-center justify-center rounded-full opacity-70 ${isModern ? 'bg-black/10' : ''}`}>
                                        <Users 
                                            className={isModern ? "text-indigo-900" : "text-white"}
                                            style={{ 
                                                // Scale logic: Make it smaller than the folder so it fits "inside"
                                                width: `${(isModern ? 14 : 20) * scaleMultiplier}px`, 
                                                height: `${(isModern ? 14 : 20) * scaleMultiplier}px` 
                                            }} 
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom: Text Info */}
                    <div>
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-2">
                            {folder.parentId && (
                                <div className={`inline-flex items-center gap-1 rounded-full ${
                                    isModern 
                                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800' 
                                        : 'bg-white/20 text-white border border-white/20'
                                }`}
                                style={{
                                    padding: `${2 * scaleMultiplier}px ${8 * scaleMultiplier}px`,
                                    fontSize: `${10 * scaleMultiplier}px`
                                }}>
                                    <Folder size={10 * scaleMultiplier} />
                                    <span className="font-bold uppercase tracking-wider">Subcarpeta</span>
                                </div>
                            )}
                        </div>
                        
                        <h3 
                            className={`font-bold tracking-tight truncate ${
                                isModern 
                                    ? `bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent` 
                                    : 'text-white'
                            }`}
                            style={{ 
                                fontSize: `${24 * scaleMultiplier}px`,
                                marginBottom: `${4 * scaleMultiplier}px`
                            }}
                        >
                            {folder.name}
                        </h3>

                        {folder.description && (
                            <p 
                                className={`line-clamp-1 font-medium ${
                                    isModern 
                                        ? 'text-gray-400 dark:text-gray-500' 
                                        : 'text-white/70'
                                }`}
                                style={{ fontSize: `${14 * scaleMultiplier}px` }}
                            >
                                {folder.description}
                            </p>
                        )}

                        {/* Folder tags */}
                        {folder.tags && folder.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {folder.tags.slice(0, 3).map(tag => (
                                    <span 
                                        key={tag} 
                                        className={`rounded ${
                                            isModern 
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                                                : 'bg-white/20 text-white/90'
                                        }`}
                                        style={{ 
                                            fontSize: `${10 * scaleMultiplier}px`,
                                            padding: `${2 * scaleMultiplier}px ${6 * scaleMultiplier}px`
                                        }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {folder.tags.length > 3 && (
                                    <span 
                                        className={`${
                                            isModern 
                                                ? 'text-gray-400 dark:text-gray-500' 
                                                : 'text-white/80'
                                        }`}
                                        style={{ fontSize: `${10 * scaleMultiplier}px` }}
                                    >
                                        +{folder.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        )}


                    </div>
                </div>

            </div>

            {isOrphan && (
                <>
                    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none text-center">
                        <span
                            className={`font-semibold ${isModern ? 'text-slate-700 dark:text-slate-200' : 'text-white/95'}`}
                            style={{ fontSize: `${12 * scaleMultiplier}px` }}
                        >
                            {orphanMessage}
                        </span>
                    </div>
                    <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {isMovedToShared && folder?._movedToFolderId ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (typeof onGoToFolder === 'function') {
                                        onGoToFolder(folder._movedToFolderId);
                                    }
                                }}
                                className="pointer-events-auto px-4 py-2 rounded-lg font-semibold shadow-lg flex justify-center items-center"
                                style={{
                                    fontSize: `${13 * scaleMultiplier}px`,
                                    background: 'rgba(30,41,59,0.35)',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    transition: 'background 0.2s',
                                }}
                            >
                                {`Ir a carpeta ${folder?._movedToFolderName || ''}`.trim()}
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(folder, 'deleteShortcut'); }}
                                className="pointer-events-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
                                style={{ fontSize: `${13 * scaleMultiplier}px` }}
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default FolderCardBody;;