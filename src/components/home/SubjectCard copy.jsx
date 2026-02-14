// src/components/home/SubjectCard.jsx
import React from 'react';
import { useSubjectCardLogic } from '../../hooks/useSubjectCardLogic';
import SubjectCardFront from './SubjectCardFront';
import { useGhostDrag } from '../../hooks/useGhostDrag';

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
        onSelect, 
        onSelectTopic, 
        activeMenu, 
        onToggleMenu, 
        onEdit, 
        onDelete,
        draggable = false,
        isDragging = false,
        onOpenTopics
    } = props;

    // 1. Start Drag: Create Ghost & Hide Native Image
    const handleDragStartWithCustomImage = (e) => {
        const cardNode = cardRef.current;

        if (cardNode) {
            // A. Calculate offset
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

            // --- NEW: Add ID and Transition for Breadcrumb interaction ---
            ghost.id = 'active-drag-ghost';
            ghost.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'; // bouncy ease
            ghost.dataset.originalScale = scaleMultiplier; // Store original scale
            // -------------------------------------------------------------

            ghost.style.position = 'fixed';
            ghost.style.zIndex = '9999';
            ghost.style.pointerEvents = 'none';
            ghost.style.opacity = '1';
            ghost.style.transform = `scale(0.9)`;
            ghost.style.transformOrigin = 'center center';
            ghost.style.left = `${rect.left}px`;
            ghost.style.top = `${rect.top}px`;


            // D. Add to body
            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            // E. HIDE the native browser drag image (The semi-transparent one)
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
            
            
        }

        handlers.handleDragStart(e);
    };

    // 2. Update Ghost Position
    const handleDrag = (e) => {
        if (dragGhostRef.current && e.clientX !== 0 && e.clientY !== 0) {
            const ghost = dragGhostRef.current;
            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;
            ghost.style.left = `${x}px`;
            ghost.style.top = `${y}px`;
        }
    };

    // 3. End Drag: Cleanup
    const handleDragEnd = (e) => {
        if (dragGhostRef.current) {
            dragGhostRef.current.remove();
            dragGhostRef.current = null;
        }
        handlers.handleDragEnd(e);
    };

    return (
        <div 
            ref={cardRef}
            className={`group relative w-full rounded-2xl shadow-lg dark:shadow-slate-900/50 transition-transform ${
                isDragging ? 'opacity-0 scale-95' : 'hover:scale-105'
            } ${
                isModern 
                    ? `bg-gradient-to-br ${subject.color} p-[4px]` 
                    : ''
            }`}
            style={{ aspectRatio: '16 / 10' }}
            draggable={draggable}
            onDragStart={handleDragStartWithCustomImage}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onDragOver={handlers.handleDragOver}
            onDrop={handlers.handleDrop}
        >
            
            {/* INNER CONTENT */}
            <div className={`h-full w-full rounded-xl overflow-hidden relative ${
                isModern 
                    ? 'bg-white dark:bg-slate-950' 
                    : ''
            }`}>
                
                <SubjectCardFront 
                    subject={subject}
                    onSelect={onSelect}
                    // REMOVE: onFlip={onFlip}
                    activeMenu={activeMenu}
                    onToggleMenu={onToggleMenu}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onShare={props.onShare}
                    isModern={isModern}
                    fillColor={fillColor}
                    scaleMultiplier={scaleMultiplier}
                    topicCount={topicCount}
                    onOpenTopics={onOpenTopics}
                />
            </div>
        </div>
    );
};

export default SubjectCard;