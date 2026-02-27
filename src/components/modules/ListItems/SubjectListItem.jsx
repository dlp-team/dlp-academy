// src/components/modules/ListItems/SubjectListItem.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Edit2, Trash2, MoreVertical, Users , Share2 } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../../ui/SubjectIcon';
import { shouldShowEditUI, shouldShowDeleteUI, canEdit as canEditItem, getPermissionLevel, isShortcutItem } from '../../../utils/permissionUtils';
import { SHORTCUT_LIST_MENU_WIDTH } from '../shared/shortcutMenuConfig';

const SubjectListItem = ({ 
    user,
    subject, 
    onSelect, 
    onEdit, 
    onDelete, 
    onShare, 
    onGoToFolder,
    disableAllActions = false,
    disableDeleteActions = false,
    disableUnshareActions = false,
    compact = false, 
    cardScale = 100,
    className = ""
}) => {
    const HEADER_SAFE_TOP = 112;
    const MENU_MARGIN = 8;
    const [showMenu, setShowMenu] = useState(false);
    const menuBtnRef = React.useRef(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    
    const topicCount = subject.topics ? subject.topics.length : 0;
    const isModern = subject.cardStyle === 'modern';
    const scale = (cardScale || 100) / 100;
    const showEditUI = user && shouldShowEditUI(subject, user.uid);
    const showDeleteUI = user && shouldShowDeleteUI(subject, user.uid);
    const canShare = user && canEditItem(subject, user.uid);
    const isShortcut = isShortcutItem(subject);
    const isHiddenFromManual = subject?.hiddenInManual === true;
    const isOrphan = subject?.isOrphan === true;
    const isMovedToShared = subject?._reason === 'moved-to-shared-folder';
    const orphanMessage = subject?._reason === 'access-revoked'
        ? 'La asignatura ya no está compartida'
        : subject?._reason === 'moved-to-shared-folder'
            ? `Esta asignatura se ha movido a la carpeta ${subject?._movedToFolderName || 'compartida'}`
            : 'La asignatura se ha eliminado';
    const shortcutPermissionLevel = isShortcut && user ? getPermissionLevel(subject, user.uid) : 'none';
    const isShortcutEditor = shortcutPermissionLevel === 'editor' || shortcutPermissionLevel === 'owner';
    const canShareFromMenu = isShortcut ? isShortcutEditor : canShare;
    const isSourceOwner = user && subject?.ownerId === user.uid;
    const effectiveShowEditUI = !disableAllActions && showEditUI;
    const effectiveCanShareFromMenu = !disableAllActions && canShareFromMenu;
    const effectiveShowDeleteUI = !disableAllActions && !disableDeleteActions && showDeleteUI;
    const canShowShortcutVisibility = !disableAllActions && isShortcut;
    const canShowShortcutDelete = !disableAllActions && !disableDeleteActions && isShortcut && (isOrphan || (!isSourceOwner && !disableUnshareActions));

    // Minimum scale for the menu is 1 (100%)
    const menuScale = Math.max(scale, 1);
    React.useEffect(() => {
        if (showMenu && menuBtnRef.current) {
            const rect = menuBtnRef.current.getBoundingClientRect();
            const menu = { width: SHORTCUT_LIST_MENU_WIDTH * menuScale, height: 48 * 3 * menuScale };
            const maxTop = Math.max(HEADER_SAFE_TOP + MENU_MARGIN, window.innerHeight - menu.height - MENU_MARGIN);
            setMenuPos({
                top: Math.min(Math.max(rect.bottom - menu.height, HEADER_SAFE_TOP + MENU_MARGIN), maxTop),
                left: rect.right - menu.width
            });
        }
    }, [showMenu, menuScale]);

    // Scaled sizes
    const paddingPx = compact ? 12 * scale : 16 * scale;
    const iconContainerSize = compact ? 40 * scale : 48 * scale;

    return (
        <div 
            className={`group relative rounded-xl transition-all hover:shadow-md cursor-pointer ${
                isModern ? `${getIconColor(subject.color)} border border-gradient-to-br ${subject.color} hover:border-gradient-to-br ${subject.color} ` : ` bg-gradient-to-br ${subject.color} hover:border-indigo-300 `
            } ${isOrphan ? 'opacity-55' : ''} ${className}`} // Apply external className
            style={{ padding: `${paddingPx}px` }}
            onClick={() => {
                if (isOrphan && isShortcut) return;
                onSelect(subject.id);
            }}
        >
            <div className="flex items-center gap-4">
                {/* ICON */}
                <div 
                    className={`$${
                        isModern ? 'bg-white/90 dark:bg-slate-900/90' : 'bg-white/20'
                    } rounded-lg flex items-center justify-center shadow-sm backdrop-blur-sm ml-3`}
                    style={{ width: `${iconContainerSize}px`, height: `${iconContainerSize}px` }}
                >
                    {subject.icon ? (
                         <SubjectIcon 
                            iconName={subject.icon} 
                            className={isModern ? '' : 'text-white'}
                            style={{ width: `${32 * scale}px`, height: `${32 * scale}px` }} 
                        />
                    ) : (
                        <div className={`font-bold text-lg ${isModern ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`}>
                            {subject.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 
                            className={`font-bold truncate ${isModern ? 'text-gray-800 dark:text-gray-100' : 'text-white'}`}
                            style={{ fontSize: `${18 * scale}px` }}
                        >
                            {subject.name}
                        </h3>
                        {/* Shared icon for subjects, right of title */}
                        {(
                            subject.isShared === true ||
                            (Array.isArray(subject.sharedWith) && subject.sharedWith.length > 0) ||
                            (Array.isArray(subject.sharedWithUids) && subject.sharedWithUids.length > 0)
                        ) && (
                            <div
                                className={`flex items-center justify-center rounded-full ml-1`}
                                style={{
                                    width: `${20 * scale}px`,
                                    height: `${20 * scale}px`,
                                    minWidth: `${20 * scale}px`
                                }}
                                title="Asignatura compartida"
                            >
                                <Users
                                    className={isModern ? 'text-gray-900 dark:text-white' : 'text-white'}
                                    style={{ width: `${12 * scale}px`, height: `${12 * scale}px` }}
                                />
                            </div>
                        )}
                    </div>
                    {!isOrphan && (
                        <div className="flex items-center gap-2 mt-1">
                            <span 
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                    isModern 
                                        ? 'bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400' 
                                        : 'bg-white/20 text-white/90'
                                }`}
                                style={{ fontSize: `${16 * scale}px` }}
                            >
                                {topicCount} temas
                            </span>
                        </div>
                    )}
                </div>

                {isOrphan && (
                    <span
                        className={`font-semibold whitespace-nowrap ${isModern ? 'text-slate-700 dark:text-slate-200' : 'text-white/95'}`}
                        style={{ fontSize: `${12 * scale}px` }}
                    >
                        {orphanMessage}
                    </span>
                )}

                {/* ACTIONS */}
                <div className="flex items-center gap-2 relative">
                    {!isOrphan && (
                        <button 
                            ref={menuBtnRef}
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className={`p-2 rounded-full transition-colors opacity-100 ${
                                isModern 
                                    ? 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400' 
                                    : 'hover:bg-white/20 text-white'
                            }`}
                        >
                            <MoreVertical size={20 * scale} />
                        </button>
                    )}

                    {showMenu && (
                        <>
                        {typeof window !== 'undefined' && window.document && createPortal(
                            <>
                                <div 
                                    className="fixed inset-x-0 bottom-0 z-[100]" 
                                    style={{ top: `${HEADER_SAFE_TOP}px` }}
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
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
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEdit(subject); setShowMenu(false); }}
                                        disabled={!effectiveShowEditUI}
                                        style={{ fontSize: `${14 * menuScale}px`, display: effectiveShowEditUI ? 'flex' : 'none' }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                    >
                                        <Edit2 size={14 * menuScale} /> Editar
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onShare && onShare(subject); setShowMenu(false); }}
                                        disabled={!effectiveCanShareFromMenu}
                                        style={{ fontSize: `${14 * menuScale}px`, display: effectiveCanShareFromMenu ? 'flex' : 'none' }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                    >
                                        <Share2 size={14 * menuScale} /> Compartir
                                    </button>
                                    {canShowShortcutVisibility && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(subject, isHiddenFromManual ? 'showInManual' : 'removeShortcut'); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400 transition-colors cursor-pointer"
                                            style={{ fontSize: `${14 * menuScale}px` }}
                                        >
                                            <Trash2 size={14 * menuScale} /> <span className="whitespace-nowrap">{isHiddenFromManual ? 'Mostrar en manual' : 'Quitar de manual'}</span>
                                        </button>
                                    )}
                                    {canShowShortcutDelete && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDelete(subject, (isOrphan || disableUnshareActions) ? 'deleteShortcut' : 'unshareAndDelete'); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                            style={{ fontSize: `${14 * menuScale}px` }}
                                        >
                                            <Trash2 size={14 * menuScale} /> Eliminar
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(subject, 'delete'); setShowMenu(false); }}
                                        disabled={!effectiveShowDeleteUI || isShortcut}
                                        style={{ fontSize: `${14 * menuScale}px`, display: !isShortcut && effectiveShowDeleteUI ? 'flex' : 'none' }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={14 * menuScale} /> Eliminar
                                    </button>
                                    {!effectiveShowEditUI && !effectiveCanShareFromMenu && !effectiveShowDeleteUI && !canShowShortcutVisibility && !canShowShortcutDelete && (
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
                <>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {isMovedToShared && subject?._movedToFolderId ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (typeof onGoToFolder === 'function') {
                                        onGoToFolder(subject._movedToFolderId);
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
                                {`Ir a carpeta ${subject?._movedToFolderName || ''}`.trim()}
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(subject, 'deleteShortcut'); }}
                                className="pointer-events-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
                                style={{ fontSize: `${13 * scale}px` }}
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

export default SubjectListItem;