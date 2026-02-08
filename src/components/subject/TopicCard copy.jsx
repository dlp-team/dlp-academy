// src/components/subject/TopicCard.jsx
import React, { useRef } from 'react';
import { Trash2, Clock, CheckCircle2 } from 'lucide-react';

const TopicCard = ({ 
    topic, 
    subjectColor, 
    onSelect, 
    onDelete, 
    // Drag props
    draggable,
    onDragStart,
    onDragOver,
    onDrop
}) => {
    const cardRef = useRef(null);
    const dragGhostRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    // --- CUSTOM VISUALS (Ghost Image) ---
    const handleDragStartInternal = (e) => {
        // 1. Setup Custom Ghost
        const cardNode = cardRef.current;
        if (cardNode) {
            const rect = cardNode.getBoundingClientRect();
            dragOffsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            const ghost = cardNode.cloneNode(true);
            Object.assign(ghost.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: '0.9',
                zIndex: '10000',
                pointerEvents: 'none', // Crucial: lets events pass through to the drop target
                transform: 'scale(1.05) rotate(3deg)',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                transition: 'none'
            });

            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            // Hide native ghost
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }

        // 2. Trigger Parent Logic
        if (onDragStart) onDragStart(e);
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
        // Cleanup ghost
        if (dragGhostRef.current) {
            dragGhostRef.current.remove();
            dragGhostRef.current = null;
        }
    };

    return (
        <div 
            ref={cardRef}
            draggable={draggable}
            onDragStart={handleDragStartInternal}
            onDrag={handleDragMove}
            onDragEnd={handleDragEndInternal}
            onDragOver={onDragOver} // Passed from Grid
            onDrop={onDrop}         // Passed from Grid
            className="group relative h-64 rounded-2xl shadow-lg dark:shadow-slate-900/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-slate-900/70 cursor-pointer"
        >
            <div 
                onClick={(e) => {
                    // Prevent navigation if we were just dragging
                    if (!dragGhostRef.current) onSelect(topic);
                }} 
                className="w-full h-full text-left relative"
            >
                
                {/* Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 transition-opacity`}></div>
                
                {/* Delete Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20 hover:scale-110"
                    title="Eliminar tema"
                >
                    <Trash2 className="w-4 h-4" />
                </button>

                {/* CONTENT */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white pointer-events-none">
                    {/* pointer-events-none on inner content ensures the onDrop always fires on the parent div */}
                    
                    <div className="flex justify-between items-start">
                        <span className="text-6xl font-black text-white/20 select-none">
                            {topic.number}
                        </span>
                        
                        {topic.status === 'generating' ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <Clock className="w-6 h-6 animate-spin" />
                            </div>
                        ) : topic.status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-300 dark:text-emerald-400" />
                        ) : null}
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-bold mb-2 leading-tight line-clamp-2 drop-shadow-md">
                            {topic.title}
                        </h3>
                        <p className="text-sm opacity-90 font-medium">
                            {topic.status === 'generating' 
                                ? 'Generando...' 
                                : topic.status === 'completed' 
                                    ? 'Completado' 
                                    : 'Error'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicCard;