// src/components/modules/TopicCard/TopicCard.jsx
import React, { useRef, useState, useEffect } from 'react';
import { 
    Trash2, Clock, CheckCircle2, MoreVertical, 
    Edit, EyeOff
} from 'lucide-react';

const TopicCard = ({ 
    topic, 
    subjectColor, 
    onSelect, 
    onDelete, 
    onEdit, 
    draggable,
    onDragStart, 
    onDragOver,
    onDrop
}) => {
    // Refs
    const cardRef = useRef(null);
    const dragGhostRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const menuRef = useRef(null);
    
    // State
    const [isDragging, setIsDragging] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isCompletedSeen, setIsCompletedSeen] = useState(false);

    // --- 1. HANDLE "SEEN" LOGIC ---
    useEffect(() => {
        // Check if we've already seen this topic as completed
        const storageKey = `seen_topic_completed_${topic.id}`;
        const hasSeen = localStorage.getItem(storageKey);

        if (hasSeen) {
            setIsCompletedSeen(true);
        } else if (topic.status === 'completed') {
            // If it is completed and we haven't marked it yet, 
            // mark it as seen for the NEXT visit, but keep it visible now.
            localStorage.setItem(storageKey, 'true');
        }
    }, [topic.id, topic.status]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- DRAG HANDLERS ---
    const handleDragStartInternal = (e) => {
        if (onDragStart) onDragStart(e);

        const cardNode = cardRef.current;
        if (cardNode) {
            const rect = cardNode.getBoundingClientRect();
            dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            
            const ghost = cardNode.cloneNode(true);
            Object.assign(ghost.style, {
                position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px`,
                width: `${rect.width}px`, height: `${rect.height}px`,
                opacity: '1', zIndex: '10000', pointerEvents: 'none',
                transform: 'scale(1.05) rotate(0deg)', transition: 'none',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15)'
            });
            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }

        setTimeout(() => setIsDragging(true), 0);
    };

    const handleDragMove = (e) => {
        if (dragGhostRef.current) {
            if (e.clientX === 0 && e.clientY === 0) return;
            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;
            dragGhostRef.current.style.left = `${x}px`;
            dragGhostRef.current.style.top = `${y}px`;
        }
    };

    const handleDragEndInternal = (e) => {
        if (dragGhostRef.current) {
            dragGhostRef.current.remove();
            dragGhostRef.current = null;
        }
        setIsDragging(false); 
    };

    // Helper: Should we show the checkmark/text?
    // Show if generating OR (completed AND not seen yet)
    const showStatus = topic.status === 'generating' || (topic.status === 'completed' && !isCompletedSeen);

    return (
        <div 
            ref={cardRef}
            draggable={draggable}
            onDragStart={handleDragStartInternal}
            onDrag={handleDragMove}
            onDragEnd={handleDragEndInternal}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`group relative h-64 rounded-2xl shadow-lg dark:shadow-slate-900/50 overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-slate-900/70 cursor-pointer 
            ${isDragging ? 'opacity-0 transition-none' : 'opacity-100'} 
            ${topic.isVisible === false ? 'grayscale-[0.5] opacity-80' : ''}`}
        >
            <div 
                onClick={(e) => {
                    if (!dragGhostRef.current && !showMenu) onSelect(topic);
                }} 
                className="w-full h-full text-left relative"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 transition-opacity`}></div>
                
                {/* --- MENU (Top Right) --- */}
                <div className="absolute top-4 right-4 z-30" ref={menuRef}>
                    <button
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setShowMenu(!showMenu); 
                        }}
                        onMouseDown={(e) => e.stopPropagation()} 
                        className={`p-2 rounded-full text-white transition-all duration-200 
                            ${showMenu 
                                ? 'bg-white/30 opacity-100 scale-110' 
                                : 'bg-white/10 hover:bg-white/20 opacity-0 group-hover:opacity-100'
                            }`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right z-40">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onEdit(topic);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                            >
                                <Edit className="w-4 h-4 text-indigo-500" />
                                <span>Editar / Visibilidad</span>
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onDelete(topic.id);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Eliminar</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* --- CONTENT --- */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white pointer-events-none">
                    
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                        
                        {/* Number */}
                        <span className="text-8xl font-black text-white/40 select-none">
                            {topic.number}
                        </span>
                        
                        {/* Status Icons (Animated) */}
                        <div className={`flex gap-2 transition-transform duration-300 ease-out ${
                            /* Move left on hover so Menu fits */
                            'group-hover:-translate-x-10'
                        }`}>
                             
                             {/* Hidden Eye */}
                             {topic.isVisible === false && (
                                <div className="p-1 bg-black/20 rounded-lg" title="Oculto para estudiantes">
                                    <EyeOff className="w-5 h-5 text-white/70" />
                                </div>
                            )}
                            
                            {/* Generating Clock (Always visible while generating) */}
                            {topic.status === 'generating' && (
                                <div className="flex flex-col items-center animate-pulse">
                                    <Clock className="w-6 h-6 animate-spin" />
                                </div>
                            )}

                            {/* Completed Check (Only visible first time) */}
                            {topic.status === 'completed' && !isCompletedSeen && (
                                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                            )}
                        </div>
                    </div>
                    
                    {/* Footer Row */}
                    <div>
                        <h3 className="text-2xl font-bold mb-2 leading-tight line-clamp-2 drop-shadow-md">
                            {topic.title}
                        </h3>
                        
                        {/* Status Text */}
                        {showStatus && (
                            <p className="text-sm opacity-90 font-medium transition-all duration-300">
                                {topic.status === 'generating' 
                                    ? 'Generando...' 
                                    : (topic.status === 'completed' && !isCompletedSeen) 
                                        ? 'Completado' 
                                        : ''}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicCard;