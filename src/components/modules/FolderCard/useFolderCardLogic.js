// src/components/modules/FolderCard/useFolderCardLogic.js
import { useState, useMemo } from 'react';

export const useFolderCardLogic = ({
    folder,
    allFolders, // <--- NEW PROP: We need the list of ALL folders to look up children
    cardScale,
    canDrop,
    draggable,
    onDragOver,
    onDrop,          
    onDropFolder,    
    onDropReorder,
    onDragStart,
    onDragEnd,
    position
}) => {
    const [isOver, setIsOver] = useState(false);
    
    // --- RECURSIVE COUNTING LOGIC WITH LOUD DEBUGGING ---
    const { subjectCount, folderCount, totalCount } = useMemo(() => {
        // 1. Fallback: If allFolders isn't passed, use shallow counts
        if (!allFolders || allFolders.length === 0) {
            const sCount = folder.subjectIds?.length || 0;
            const fCount = folder.folderIds?.length || 0;
            return { 
                subjectCount: sCount, 
                folderCount: fCount, 
                totalCount: sCount + fCount 
            };
        }

        // 2. Preparation
        const folderMap = new Map(allFolders.map(f => [f.id, f]));
        const visited = new Set();

        // 3. The Recursive Function
        const traverse = (currentId) => {
            if (visited.has(currentId)) return { s: 0, f: 0 };
            visited.add(currentId);

            const currentFolder = folderMap.get(currentId);
            if (!currentFolder) return { s: 0, f: 0 };

            // Count items in THIS folder
            let s = currentFolder.subjectIds?.length || 0;
            
            // Count immediate subfolders
            const subFolderIds = currentFolder.folderIds || [];
            let f = subFolderIds.length; 

            // Recursively add counts from children
            subFolderIds.forEach(childId => {
                const childStats = traverse(childId);
                s += childStats.s;
                f += childStats.f;
            });

            return { s, f };
        };

        // 4. Execute
        visited.clear();
        const stats = traverse(folder.id);

        // 5. Apply Adjustments (Subtract 1 from folders as requested)
        // We use Math.max to ensure we don't display "-1" for empty folders
        const adjustedFolderCount = Math.max(0, stats.f - 1);

        return {
            subjectCount: stats.s,
            folderCount: stats.f,
            totalCount: stats.s + stats.f
        };

    }, [folder, allFolders]);

    // --- VISUAL & STYLE ---
    const isModern = folder.cardStyle === 'modern';
    const fillColor = folder.modernFillColor || folder.fillColor;
    const scaleMultiplier = cardScale / 100;
    const gradientClass = folder.color || 'from-amber-400 to-amber-600';

    // --- DRAG AND DROP HANDLERS ---
    const handleDragOver = (e) => {
        console.log('[DND] FolderCard handleDragOver:', { canDrop, draggable, position });
        if (canDrop) {
            e.preventDefault();
            e.stopPropagation();
            setIsOver(true);
        } else if (draggable && onDragOver) {
            e.preventDefault();
            onDragOver(e, position);
        }
    };

    const handleDragLeave = (e) => {
        console.log('[DND] FolderCard handleDragLeave:', { position });
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
    };

    const handleDrop = (e) => {
        console.log('[DND] FolderCard handleDrop:', {
            folderId: folder.id,
            canDrop,
            draggable,
            position,
            subjectId: e.dataTransfer.getData('subjectId'),
            draggedPosition: e.dataTransfer.getData('position'),
            droppedFolderId: e.dataTransfer.getData('folderId')
        });
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);

        const subjectId = e.dataTransfer.getData('subjectId');
        const draggedPosition = e.dataTransfer.getData('position');
        const droppedFolderId = e.dataTransfer.getData('folderId');

        if (canDrop && onDrop && subjectId && !droppedFolderId) {
            // Try to get subject type and parentId from dataTransfer or context
            const subjectType = e.dataTransfer.getData('subjectType') || 'subject';
            const subjectParentId = e.dataTransfer.getData('subjectParentId') || null;
            console.log('[DND] FolderCard handleDrop → onDrop:', {
                folderId: folder.id,
                subjectId,
                subjectType,
                subjectParentId
            });
            onDrop(folder.id, subjectId, subjectType, subjectParentId);
        }
        else if (canDrop && onDropFolder && droppedFolderId && droppedFolderId !== folder.id) {
            console.log('[DND] FolderCard handleDrop → onDropFolder:', { folderId: folder.id, droppedFolderId });
            onDropFolder(folder.id, droppedFolderId);
        }
        else if (draggable && onDropReorder && droppedFolderId && draggedPosition !== undefined) {
            console.log('[DND] FolderCard handleDrop → onDropReorder:', { droppedFolderId, draggedPosition, position });
            onDropReorder(droppedFolderId, parseInt(draggedPosition), position);
        }
    };

    const handleDragStart = (e) => {
        if (draggable && onDragStart) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('folderId', folder.id);
            e.dataTransfer.setData('position', position.toString());
            onDragStart(folder, position);
        }
    };

    const handleDragEnd = (e) => {
        if (draggable && onDragEnd) {
            onDragEnd();
        }
    };

    return {
        state: { isOver },
        data: {
            subjectCount,
            folderCount,
            totalCount,
            isModern,
            fillColor,
            scaleMultiplier,
            gradientClass
        },
        handlers: {
            handleDragOver,
            handleDragLeave,
            handleDrop,
            handleDragStart,
            handleDragEnd
        }
    };
};