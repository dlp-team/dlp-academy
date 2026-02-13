// src/hooks/useGhostDrag.js
import { useState, useRef } from 'react';

export const useGhostDrag = ({ item, type, cardScale = 100, onDragStart, onDragEnd }) => {
    const [isDragging, setIsDragging] = useState(false);
    const itemRef = useRef(null);
    const dragGhostRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    const handleDragStartWithCustomImage = (e) => {
        setIsDragging(true);
        const cardNode = itemRef.current; // The DOM element of the list item

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
                opacity: '1',            // FORCE 100% OPACITY
                zIndex: '10000',         // On top of everything
                pointerEvents: 'none',   // Let clicks pass through to drop zones
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease', // bouncy ease
                transform: 'scale(0.9)',
                transformOrigin: 'center center',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' // optional depth
            });

            // Remove any classes that might hide it or interfere
            ghost.classList.remove('opacity-0', 'transition-all', 'duration-300', 'scale-95');

            // Add ID for Breadcrumb interaction
            ghost.id = 'active-drag-ghost';
            
            // Calculate scale multiplier
            const scaleMultiplier = cardScale ? cardScale / 100 : 1; 
            ghost.dataset.originalScale = scaleMultiplier; // Store original scale

            // D. Add to body
            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            // E. HIDE the native browser drag image (The semi-transparent one)
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }

        if (onDragStart) onDragStart(e, item, type);
    };

    const handleDrag = (e) => {
        // e.clientX/Y drop to 0 at the very end of the drag cycle, ignore those frames
        if (dragGhostRef.current && e.clientX !== 0 && e.clientY !== 0) {
            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;
            
            // Use fixed coordinates to follow the cursor exactly
            dragGhostRef.current.style.left = `${x}px`;
            dragGhostRef.current.style.top = `${y}px`;
        }
    };

    const handleDragEndCustom = (e) => {
        setIsDragging(false);
        // Remove ghost from DOM
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