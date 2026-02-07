// src/components/home/SubjectCard.jsx
import React from 'react';
import { useSubjectCardLogic } from '../../hooks/useSubjectCardLogic'; // Adjust path
import SubjectCardFront from './SubjectCardFront';
import SubjectCardBack from './SubjectCardBack';

const SubjectCard = (props) => {
    const cardRef = React.useRef(null);
    
    // Refs for the manual drag ghost
    const dragGhostRef = React.useRef(null);
    const dragOffsetRef = React.useRef({ x: 0, y: 0 });

    const { 
        topicCount, 
        isModern, 
        fillColor, 
        scaleMultiplier, 
        handlers 
    } = useSubjectCardLogic(props);

    const { 
        subject, 
        isFlipped, 
        onFlip, 
        onSelect, 
        onSelectTopic, 
        activeMenu, 
        onToggleMenu, 
        onEdit, 
        onDelete,
        draggable = false,
        isDragging = false
    } = props;

    // 1. Start Drag: Create Ghost & Hide Native Image
    const handleDragStartWithCustomImage = (e) => {
        const cardNode = cardRef.current;

        if (cardNode) {
            // A. Calculate offset so the ghost stays under the mouse exactly where you grabbed it
            const rect = cardNode.getBoundingClientRect();
            dragOffsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            // B. Clone the card
            const ghost = cardNode.cloneNode(true);

            // C. Style the ghost (Fixed position, High Z-Index, NO Pointer Events)
            Object.assign(ghost.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: '1',            // <--- FORCE 100% OPACITY
                zIndex: '10000',         // On top of everything
                pointerEvents: 'none',   // Let clicks pass through to drop zones
                transition: 'none',      // No laggy animations
                transform: 'none',       // Reset transforms
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' // Optional: add shadow for depth
            });

            // Remove any classes that might hide it or interfere
            ghost.classList.remove('opacity-0', 'transition-all', 'duration-300');

            // D. Add to body
            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            // E. HIDE the native browser drag image (The semi-transparent one)
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }

        // Call original handler logic
        handlers.handleDragStart(e);
    };

    // 2. While Dragging: Move the Ghost
    const handleDragMove = (e) => {
        if (dragGhostRef.current) {
            // Browsers sometimes fire a final (0,0) event at the end; ignore it.
            if (e.clientX === 0 && e.clientY === 0) return;

            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;

            // Use direct DOM manipulation for performance (avoid React state here)
            dragGhostRef.current.style.left = `${x}px`;
            dragGhostRef.current.style.top = `${y}px`;
        }
    };

    // 3. End Drag: Remove Ghost
    const handleDragEndWithCleanup = (e) => {
        if (dragGhostRef.current) {
            dragGhostRef.current.remove();
            dragGhostRef.current = null;
        }
        handlers.handleDragEnd(e);
    };

    return (
        <div 
            ref={cardRef}
            className={`group relative w-full rounded-2xl shadow-lg dark:shadow-slate-900/50 transition-all ${
                isDragging ? 'opacity-0 scale-95' : 'hover:scale-105'
            } ${
                isModern 
                    ? `bg-gradient-to-br ${subject.color} p-[4px]` 
                    : ''
            }`}
            style={{ aspectRatio: '16 / 10' }}
            draggable={draggable && !isFlipped}
            
            // --- UPDATED HANDLERS ---
            onDragStart={handleDragStartWithCustomImage}
            onDrag={handleDragMove}         // Tracks mouse movement
            onDragEnd={handleDragEndWithCleanup} // Cleans up the ghost
            onDragOver={handlers.handleDragOver}
            onDrop={handlers.handleDrop}
        >
            
            {/* INNER CONTENT */}
            <div className={`h-full w-full rounded-xl overflow-hidden relative ${
                isModern 
                    ? 'bg-white dark:bg-slate-950' 
                    : ''
            }`}>
                
                {/* --- FRONT --- */}
                {!isFlipped && (
                    <SubjectCardFront 
                        subject={subject}
                        onSelect={onSelect}
                        onFlip={onFlip}
                        activeMenu={activeMenu}
                        onToggleMenu={onToggleMenu}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isModern={isModern}
                        fillColor={fillColor}
                        scaleMultiplier={scaleMultiplier}
                        topicCount={topicCount}
                    />
                )}

                {/* --- BACK --- */}
                {isFlipped && (
                    <SubjectCardBack 
                        subject={subject}
                        onFlip={onFlip}
                        onSelectTopic={onSelectTopic}
                        onSelect={onSelect}
                        scaleMultiplier={scaleMultiplier}
                        topicCount={topicCount}
                    />
                )}
            </div>
        </div>
    );
};

export default SubjectCard;