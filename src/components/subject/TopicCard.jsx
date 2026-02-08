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
    // Drag Props passed from Grid
    draggable,
    onDragStart, 
    onDragOver,
    onDrop
}) => {
    // Refs for Dragging
    const cardRef = useRef(null);
    const dragGhostRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    
    // State
    const [isDragging, setIsDragging] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

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

    // --- 1. DRAG START HANDLER ---
    const handleDragStartInternal = (e) => {
        const cardNode = cardRef.current;
        
        // A. Call the parent handler FIRST to set dataTransfer (Critical for logic)
        if (onDragStart) {
            onDragStart(e);
        }

        // B. Create the Visual Ghost (Critical for UI)
        if (cardNode) {
            const rect = cardNode.getBoundingClientRect();
            dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            
            const ghost = cardNode.cloneNode(true);
            Object.assign(ghost.style, {
                position: 'fixed', 
                top: `${rect.top}px`, 
                left: `${rect.left}px`,
                width: `${rect.width}px`, 
                height: `${rect.height}px`,
                opacity: '1',  // Fully opaque ghost
                zIndex: '10000', 
                pointerEvents: 'none',
                transform: 'scale(1.05) rotate(3deg)', 
                transition: 'none',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15)'
            });
            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            // Hide native ghost
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }

        // C. Hide Original Card (UI Trick)
        setTimeout(() => {
            setIsDragging(true);
        }, 0);
    };

    // --- 2. DRAG MOVE HANDLER ---
    const handleDragMove = (e) => {
        if (dragGhostRef.current) {
            // Prevent jump to 0,0 on end
            if (e.clientX === 0 && e.clientY === 0) return;
            
            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;
            dragGhostRef.current.style.left = `${x}px`;
            dragGhostRef.current.style.top = `${y}px`;
        }
    };

    // --- 3. DRAG END HANDLER ---
    const handleDragEndInternal = (e) => {
        if (dragGhostRef.current) {
            dragGhostRef.current.remove();
            dragGhostRef.current = null;
        }
        setIsDragging(false); // Show card again
    };

    return (
        <div 
            ref={cardRef}
            // --- CONNECT DRAG EVENTS ---
            draggable={draggable}
            onDragStart={handleDragStartInternal}
            onDrag={handleDragMove}
            onDragEnd={handleDragEndInternal}
            onDragOver={onDragOver}
            onDrop={onDrop}
            
            // --- STYLES ---
            className={`group relative h-64 rounded-2xl shadow-lg dark:shadow-slate-900/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-slate-900/70 cursor-pointer 
            ${isDragging ? 'opacity-0' : 'opacity-100'} 
            ${topic.isVisible === false ? 'grayscale-[0.5] opacity-80' : ''}`}
        >
            <div 
                onClick={(e) => {
                    // Only navigate if we aren't dragging and menu is closed
                    if (!dragGhostRef.current && !showMenu) onSelect(topic);
                }} 
                className="w-full h-full text-left relative"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 transition-opacity`}></div>
                
                {/* --- THREE DOTS MENU (Top Right) --- */}
                <div className="absolute top-4 right-4 z-30" ref={menuRef}>
                    <button
                        onClick={(e) => { 
                            e.stopPropagation(); // Stop click from opening topic
                            setShowMenu(!showMenu); 
                        }}
                        // Use onMouseDown stopPropagation to prevent drag start on the button itself
                        onMouseDown={(e) => e.stopPropagation()} 
                        className={`p-2 rounded-full text-white transition-all duration-200 
                            ${showMenu 
                                ? 'bg-white/30 opacity-100 scale-110' 
                                : 'bg-white/10 hover:bg-white/20 opacity-0 group-hover:opacity-100'
                            }`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* DROPDOWN */}
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

                {/* --- CARD CONTENT --- */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white pointer-events-none">
                    <div className="flex justify-between items-start">
                        <span className="text-6xl font-black text-white/20 select-none">
                            {topic.number}
                        </span>
                        
                        <div className="flex gap-2">
                             {/* Icon for Hidden State */}
                             {topic.isVisible === false && (
                                <div className="p-1 bg-black/20 rounded-lg" title="Oculto para estudiantes">
                                    <EyeOff className="w-5 h-5 text-white/70" />
                                </div>
                            )}
                            
                            {topic.status === 'generating' ? (
                                <Clock className="w-6 h-6 animate-spin" />
                            ) : topic.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                            ) : null}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2 leading-tight line-clamp-2 drop-shadow-md">
                            {topic.title}
                        </h3>
                        <p className="text-sm opacity-90 font-medium">
                            {topic.status === 'generating' ? 'Generando...' : topic.status === 'completed' ? 'Completado' : 'Error'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicCard;