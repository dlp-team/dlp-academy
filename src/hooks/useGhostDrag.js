// src/hooks/useGhostDrag.js
import { useState, useRef } from 'react';

export const useGhostDrag = ({ item, type, onDragStart, onDragEnd }) => {
    const [isDragging, setIsDragging] = useState(false);
    const itemRef = useRef(null);
    const dragGhostRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    // CONSTANTS
    const DRAG_SCALE = 0.95; // The fixed scale for the ghost while dragging (slightly smaller than original)

    const handleDragStartWithCustomImage = (e) => {
        setIsDragging(true);
        const cardNode = itemRef.current; 

        if (cardNode) {
            // A. Calculate offset
            const rect = cardNode.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            dragOffsetRef.current = {
                x: offsetX,
                y: offsetY
            };

            // B. Clone the card
            const ghost = cardNode.cloneNode(true);

            // C. Style the ghost
            Object.assign(ghost.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: '1',
                zIndex: '10000',
                pointerEvents: 'none',
                margin: '0',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)', // Smoother ease-out
                transform: `scale(${DRAG_SCALE})`, // Set initial scale
                transformOrigin: `${offsetX}px ${offsetY}px`,
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            });

            // Remove interference classes
            ghost.classList.remove('opacity-0', 'transition-all', 'duration-300', 'scale-95', 'hover:scale-105');
            ghost.id = 'active-drag-ghost';
            
            // --- THE FIX ---
            // Store the EXACT scale we are using for the drag state. 
            // When BreadcrumbNav reads this on dragLeave, it will restore to 0.95, not the card's internal scale.
            ghost.dataset.originalScale = DRAG_SCALE; 
            ghost.dataset.scale = DRAG_SCALE; // Backup data attribute

            // D. Add to body
            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            // E. Hide native drag image
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }

        if (onDragStart) onDragStart(e, item, type);
    };

    const handleDrag = (e) => {
        if (dragGhostRef.current && e.clientX !== 0 && e.clientY !== 0) {
            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;
            
            dragGhostRef.current.style.left = `${x}px`;
            dragGhostRef.current.style.top = `${y}px`;
        }
    };

    const handleDragEndCustom = (e) => {
        setIsDragging(false);
        if (dragGhostRef.current && dragGhostRef.current.parentNode) {
            dragGhostRef.current.parentNode.removeChild(dragGhostRef.current);
            dragGhostRef.current = null;
        }
        if (onDragEnd) onDragEnd(e);
    };

    return {
        isDragging,
        itemRef,
        dragHandlers: {
            onDragStart: handleDragStartWithCustomImage,
            onDrag: handleDrag,
            onDragEnd: handleDragEndCustom
        }
    };
};