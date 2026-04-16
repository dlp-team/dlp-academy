// src/hooks/useGhostDrag.js
import { useState, useRef } from 'react';

const GHOST_STACK_OFFSET = 8;
const MAX_STACKED_LAYERS = 4;
const MAX_MULTI_GHOST_PREVIEW = 6;

const escapeSelectionKeyForQuery = (selectionKey: any) => {
    const normalizedKey = String(selectionKey || '');
    if (!normalizedKey) return '';

    if (typeof window !== 'undefined' && window.CSS && typeof window.CSS.escape === 'function') {
        return window.CSS.escape(normalizedKey);
    }

    return normalizedKey.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

export const useGhostDrag = ({
    item,
    type,
    onDragStart,
    onDragEnd,
    multiDragCount = 1,
    selectionKey = null,
    selectedItemKeys = null
}: any) => {
    const [isDragging, setIsDragging] = useState(false);
    const itemRef = useRef<any>(null);
    const dragGhostRef = useRef<any>(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const stagedCompanionNodesRef = useRef<any[]>([]);
    const stagedLeadNodeRef = useRef<any>(null);

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

    const cleanupStagedCompanionNodes = () => {
        if (!Array.isArray(stagedCompanionNodesRef.current) || stagedCompanionNodesRef.current.length === 0) {
            stagedCompanionNodesRef.current = [];
            return;
        }

        stagedCompanionNodesRef.current.forEach((entry: any) => {
            const node = entry?.node;
            if (!node?.style) return;

            node.style.transform = entry.originalTransform || '';
            node.style.opacity = entry.originalOpacity || '';
            node.style.transition = entry.originalTransition || '';
            node.style.pointerEvents = entry.originalPointerEvents || '';
            node.style.zIndex = entry.originalZIndex || '';
            node.style.willChange = entry.originalWillChange || '';
            node.removeAttribute('data-home-multi-drag-companion');
        });

        stagedCompanionNodesRef.current = [];
    };

    const stageLeadNodeAsTopLayer = (leadNode: any) => {
        if (!leadNode?.style) return;

        stagedLeadNodeRef.current = {
            node: leadNode,
            originalPosition: leadNode.style.position,
            originalZIndex: leadNode.style.zIndex,
            originalWillChange: leadNode.style.willChange,
        };

        if (!leadNode.style.position) {
            leadNode.style.position = 'relative';
        }
        leadNode.style.zIndex = '2';
        leadNode.style.willChange = 'transform, opacity';
    };

    const cleanupStagedLeadNode = () => {
        const stagedLead = stagedLeadNodeRef.current;
        const node = stagedLead?.node;
        if (!node?.style) {
            stagedLeadNodeRef.current = null;
            return;
        }

        node.style.position = stagedLead.originalPosition || '';
        node.style.zIndex = stagedLead.originalZIndex || '';
        node.style.willChange = stagedLead.originalWillChange || '';
        stagedLeadNodeRef.current = null;
    };

    const resolveSelectedCompanionNodes = (leadSelectionKey: any, maxNodes: number | null = MAX_MULTI_GHOST_PREVIEW - 1) => {
        if (!(selectedItemKeys instanceof Set) || selectedItemKeys.size === 0) {
            return [];
        }

        const selectedKeys = Array.from(selectedItemKeys)
            .filter((candidate: any) => typeof candidate === 'string' && candidate.trim().length > 0)
            .filter((candidate: any) => candidate !== leadSelectionKey);

        if (selectedKeys.length === 0) {
            return [];
        }

        const companionNodes: any[] = [];
        for (const selectedKey of selectedKeys) {
            const escapedSelectionKey = escapeSelectionKeyForQuery(selectedKey);
            if (!escapedSelectionKey) continue;

            const targetNode = document.querySelector(`[data-selection-key="${escapedSelectionKey}"]`) as any;
            if (!targetNode || companionNodes.includes(targetNode)) continue;

            companionNodes.push(targetNode);
            if (maxNodes !== null && companionNodes.length >= maxNodes) break;
        }

        return companionNodes;
    };

    const stageCompanionNodesTowardLead = (leadNode: any, leadRect: any, companions: any[] = []) => {
        if (!leadNode || !leadRect || !Array.isArray(companions) || companions.length === 0) {
            stagedCompanionNodesRef.current = [];
            return;
        }

        const stagedEntries: any[] = [];

        companions.forEach((companionNode: any, index: any) => {
            if (!companionNode?.getBoundingClientRect || companionNode === leadNode) return;

            const companionRect = companionNode.getBoundingClientRect();
            const layerOffset = Math.min(index + 1, MAX_STACKED_LAYERS) * GHOST_STACK_OFFSET;
            const deltaX = leadRect.left - companionRect.left + layerOffset;
            const deltaY = leadRect.top - companionRect.top + layerOffset;

            stagedEntries.push({
                node: companionNode,
                originalTransform: companionNode.style.transform,
                originalOpacity: companionNode.style.opacity,
                originalTransition: companionNode.style.transition,
                originalPointerEvents: companionNode.style.pointerEvents,
                originalZIndex: companionNode.style.zIndex,
                originalWillChange: companionNode.style.willChange,
            });

            companionNode.setAttribute('data-home-multi-drag-companion', 'true');
            companionNode.style.transition = 'transform 170ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 170ms ease';
            companionNode.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${DRAG_SCALE})`;
            companionNode.style.opacity = '0';
            companionNode.style.pointerEvents = 'none';
            companionNode.style.zIndex = '1';
            companionNode.style.willChange = 'transform, opacity';
        });

        stagedCompanionNodesRef.current = stagedEntries;
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

    const createMultiGhost = (
        cardNode: any,
        rect: any,
        offsetX: any,
        offsetY: any,
        dragCount: any,
        companionNodes: any[] = []
    ) => {
        const previewNodes = [cardNode, ...(Array.isArray(companionNodes) ? companionNodes : [])]
            .filter(Boolean)
            .slice(0, MAX_MULTI_GHOST_PREVIEW);
        const layerCount = Math.max(2, Math.min(previewNodes.length, Math.max(MAX_STACKED_LAYERS, dragCount)));
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
        ghostContainer.dataset.originalScale = String(DRAG_SCALE);
        ghostContainer.dataset.scale = String(DRAG_SCALE);

        for (let layer = layerCount - 1; layer >= 1; layer -= 1) {
            const sourceNode = previewNodes[layer] || cardNode;
            const sourceRect = sourceNode?.getBoundingClientRect ? sourceNode.getBoundingClientRect() : rect;
            const stackedClone = cloneCardForGhost(sourceNode, sourceRect, offsetX, offsetY);
            Object.assign(stackedClone.style, {
                top: `${layer * stackOffset}px`,
                left: `${layer * stackOffset}px`,
                opacity: `${Math.max(0.3, 0.7 - layer * 0.15)}`
            });
            ghostContainer.appendChild(stackedClone);
        }

        const leadClone = cloneCardForGhost(previewNodes[0] || cardNode, rect, offsetX, offsetY);
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
        cleanupStagedCompanionNodes();
        cleanupStagedLeadNode();

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
            // Ghost preview: capped at MAX_MULTI_GHOST_PREVIEW for visual stack rendering
            const selectedCompanionNodes = normalizedMultiDragCount > 1
                ? resolveSelectedCompanionNodes(selectionKey)
                : [];
            // All companions: no cap — all selected items must enter ghost/staging mode
            const allCompanionNodes = normalizedMultiDragCount > 1
                ? resolveSelectedCompanionNodes(selectionKey, null)
                : [];

            if (normalizedMultiDragCount > 1 && allCompanionNodes.length > 0) {
                stageLeadNodeAsTopLayer(cardNode);
                stageCompanionNodesTowardLead(cardNode, rect, allCompanionNodes);
            }

            const ghost = normalizedMultiDragCount > 1
                ? createMultiGhost(cardNode, rect, offsetX, offsetY, normalizedMultiDragCount, selectedCompanionNodes)
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

        cleanupStagedCompanionNodes();
        cleanupStagedLeadNode();
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