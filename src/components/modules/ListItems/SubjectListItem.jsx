// src/components/modules/ListItems/SubjectListItem.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Edit2, Trash2, MoreVertical, Users , Share2 } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../../ui/SubjectIcon';
import { shouldShowEditUI, shouldShowDeleteUI, canEdit as canEditItem } from '../../../utils/permissionUtils';

const SubjectListItem = ({ 
    user,
    subject, 
    onSelect, 
    onEdit, 
    onDelete, 
    onShare, 
    compact = false, 
    cardScale = 100,
    className = ""
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuBtnRef = React.useRef(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    
    const topicCount = subject.topics ? subject.topics.length : 0;
    const isModern = subject.cardStyle === 'modern';
    const scale = (cardScale || 100) / 100;
    const showEditUI = user && shouldShowEditUI(subject, user.uid);
    const showDeleteUI = user && shouldShowDeleteUI(subject, user.uid);
    const canShare = user && canEditItem(subject, user.uid);
    const isShortcut = subject?.isShortcut === true;

    // Minimum scale for the menu is 1 (100%)
    const menuScale = Math.max(scale, 1);
    React.useEffect(() => {
        if (showMenu && menuBtnRef.current) {
            const rect = menuBtnRef.current.getBoundingClientRect();
            const menu = { width: 128 * menuScale, height: 48 * 3 * menuScale };
            setMenuPos({
                top: rect.bottom - menu.height,
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
            } ${className}`} // Apply external className
            style={{ padding: `${paddingPx}px` }}
            onClick={() => onSelect(subject.id)}
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
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 relative">
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

                    {showMenu && (
                        <>
                        {typeof window !== 'undefined' && window.document && createPortal(
                            <>
                                <div 
                                    className="fixed inset-0 z-[100]" 
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                                />
                                <div
                                    className="fixed z-[101] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1 animate-in fade-in zoom-in-95 duration-100 transition-none"
                                    style={{
                                        top: menuPos.top + 'px',
                                        left: menuPos.left + 'px',
                                        width: `${128 * menuScale}px`,
                                        transform: `scale(${menuScale})`,
                                        transformOrigin: 'bottom right',
                                        pointerEvents: 'auto'
                                    }}
                                >
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEdit(subject); setShowMenu(false); }}
                                        disabled={!showEditUI}
                                        style={{ fontSize: `${14 * menuScale}px`, display: showEditUI ? 'flex' : 'none' }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                    >
                                        <Edit2 size={14 * menuScale} /> Editar
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onShare && onShare(subject); setShowMenu(false); }}
                                        disabled={!canShare}
                                        style={{ fontSize: `${14 * menuScale}px`, display: canShare ? 'flex' : 'none' }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                    >
                                        <Share2 size={14 * menuScale} /> Compartir
                                    </button>
                                    {isShortcut && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(subject); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400 transition-colors cursor-pointer"
                                            style={{ fontSize: `${14 * menuScale}px` }}
                                        >
                                            <Trash2 size={14 * menuScale} /> Quitar de mi vista
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(subject); setShowMenu(false); }}
                                        disabled={!showDeleteUI || isShortcut}
                                        style={{ fontSize: `${14 * menuScale}px`, display: !isShortcut && showDeleteUI ? 'flex' : 'none' }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={14 * menuScale} /> Eliminar
                                    </button>
                                    {!showEditUI && !canShare && !showDeleteUI && !isShortcut && (
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
        </div>
    );
};

export default SubjectListItem;