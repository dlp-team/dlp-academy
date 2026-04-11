// src/hooks/useGhostDrag.js
import { useState, useRef } from 'react';

const GHOST_STACK_OFFSET = 8;
const MAX_STACKED_LAYERS = 4;

export const useGhostDrag = ({ item, type, onDragStart, onDragEnd, multiDragCount = 1 }: any) => {
    const [isDragging, setIsDragging] = useState(false);
    const itemRef = useRef<any>(null);
    const dragGhostRef = useRef<any>(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    // CONSTANTS
    const DRAG_SCALE = 0.95; // The fixed scale for the ghost while dragging (slightly smaller than original)

    const stripInteractiveGhostClasses = (ghostElement: any) => {
        if (!ghostElement?.classList) return;
        ghostElement.classList.remove('opacity-0', 'transition-all', 'duration-300', 'scale-95', 'hover:scale-105');
    };

    const cloneCardForGhost = (cardNode: any, rect: any, offsetX: any, offsetY: any) => {
        const cloned = cardNode.cloneNode(true);

        Object.assign(cloned.style, {
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            opacity: '1',
            pointerEvents: 'none',
            margin: '0',
            transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: `scale(${DRAG_SCALE})`,
            transformOrigin: `${offsetX}px ${offsetY}px`,
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            willChange: 'transform, left, top'
        });

        stripInteractiveGhostClasses(cloned);
        return cloned;
    };

    const createSingleGhost = (cardNode: any, rect: any, offsetX: any, offsetY: any) => {
        const ghost = cloneCardForGhost(cardNode, rect, offsetX, offsetY);

        Object.assign(ghost.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            zIndex: '2147483647'
        });

        ghost.id = 'active-drag-ghost';
        ghost.dataset.originalScale = DRAG_SCALE;
        ghost.dataset.scale = DRAG_SCALE;

        return ghost;
    };

    const createMultiGhost = (cardNode: any, rect: any, offsetX: any, offsetY: any, dragCount: any) => {
        const layerCount = Math.max(2, Math.min(dragCount, MAX_STACKED_LAYERS));
        const stackOffset = GHOST_STACK_OFFSET;
        const stackedWidth = rect.width + (layerCount - 1) * stackOffset;
        const stackedHeight = rect.height + (layerCount - 1) * stackOffset;

        const ghostContainer = document.createElement('div');
        Object.assign(ghostContainer.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${stackedWidth}px`,
            height: `${stackedHeight}px`,
            zIndex: '2147483647',
            pointerEvents: 'none',
            willChange: 'transform, left, top'
        });

        ghostContainer.id = 'active-drag-ghost';
        ghostContainer.dataset.originalScale = DRAG_SCALE;
        ghostContainer.dataset.scale = DRAG_SCALE;

        for (let layer = layerCount - 1; layer >= 1; layer -= 1) {
            const stackedClone = cloneCardForGhost(cardNode, rect, offsetX, offsetY);
            Object.assign(stackedClone.style, {
                top: `${layer * stackOffset}px`,
                left: `${layer * stackOffset}px`,
                opacity: `${Math.max(0.3, 0.7 - layer * 0.15)}`
            });
            ghostContainer.appendChild(stackedClone);
        }

        const leadClone = cloneCardForGhost(cardNode, rect, offsetX, offsetY);
        Object.assign(leadClone.style, {
            top: '0px',
            left: '0px',
            opacity: '1'
        });
        ghostContainer.appendChild(leadClone);

        const countBadge = document.createElement('div');
        countBadge.textContent = String(dragCount);
        Object.assign(countBadge.style, {
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            minWidth: '26px',
            height: '26px',
            borderRadius: '999px',
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#ffffff',
            border: '2px solid rgba(255,255,255,0.85)',
            fontSize: '12px',
            fontWeight: '700',
            lineHeight: '22px',
            textAlign: 'center',
            padding: '0 6px',
            boxSizing: 'border-box'
        });
        ghostContainer.appendChild(countBadge);

        return ghostContainer;
    };

    const handleDragStartWithCustomImage = (e: any) => {
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

            const resolvedMultiDragCount = Number.isFinite(multiDragCount)
                ? Number(multiDragCount)
                : 1;
            const normalizedMultiDragCount = Math.max(1, resolvedMultiDragCount);

            const ghost = normalizedMultiDragCount > 1
                ? createMultiGhost(cardNode, rect, offsetX, offsetY, normalizedMultiDragCount)
                : createSingleGhost(cardNode, rect, offsetX, offsetY);

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

    const handleDrag = (e: any) => {
        if (dragGhostRef.current && e.clientX !== 0 && e.clientY !== 0) {
            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;
            
            dragGhostRef.current.style.left = `${x}px`;
            dragGhostRef.current.style.top = `${y}px`;
        }
    };

    const handleDragEndCustom = (e: any) => {
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