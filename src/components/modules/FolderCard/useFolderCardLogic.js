// src/components/modules/FolderCard/useFolderCardLogic.js
import { useState, useMemo } from 'react';
import { isShortcutItem } from '../../../utils/permissionUtils';

export const useFolderCardLogic = ({
    folder,
    allFolders, // <--- NEW PROP: We need the list of ALL folders to look up children
    allSubjects,
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
    
    // --- COUNTING LOGIC: Count all descendants by querying relationships ---
    const { subjectCount, folderCount, totalCount } = useMemo(() => {
        if (!allFolders) {
            return { 
                subjectCount: 0, 
                folderCount: 0, 
                totalCount: 0 
            };
        }

        const visited = new Set();
        const getFolderParentId = (entry) => {
            if (!entry) return null;
            if (isShortcutItem(entry)) return entry.shortcutParentId ?? entry.parentId ?? null;
            return entry.parentId ?? null;
        };

        const getSubjectParentId = (entry) => {
            if (!entry) return null;
            if (isShortcutItem(entry)) return entry.shortcutParentId ?? entry.folderId ?? entry.parentId ?? null;
            return entry.folderId ?? null;
        };

        const traverse = (folderId) => {
            if (visited.has(folderId)) return { s: 0, f: 0 };
            visited.add(folderId);

            // Find this folder
            const currentFolder = allFolders.find(f => (f.shortcutId || f.id) === folderId || f.id === folderId);
            if (!currentFolder) return { s: 0, f: 0 };

            // Count direct children by querying parentId/folderId
            // Get child folders where parentId/shortcutParentId === folderId
            const childFolders = allFolders.filter(f => getFolderParentId(f) === folderId);
            const childSubjects = Array.isArray(allSubjects)
                ? allSubjects.filter(s => getSubjectParentId(s) === folderId)
                : [];
            
            let s = childSubjects.length;
            let f = childFolders.length;

            // Recursively count descendants
            childFolders.forEach(child => {
                const childStats = traverse(child.id);
                s += childStats.s;
                f += childStats.f;
            });

            return { s, f };
        };

        visited.clear();
        const stats = traverse(folder.id);

        return {
            subjectCount: stats.s,
            folderCount: stats.f,
            totalCount: stats.s + stats.f
        };

    }, [folder, allFolders, allSubjects]);

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
        const subjectShortcutId = e.dataTransfer.getData('subjectShortcutId');
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
                subjectParentId,
                subjectShortcutId
            });
            onDrop(folder.id, subjectId, subjectType, subjectParentId, subjectShortcutId || null);
        }
        else if (canDrop && onDropFolder && droppedFolderId && droppedFolderId !== folder.id) {
            const droppedFolderShortcutId = e.dataTransfer.getData('folderShortcutId') || null;
            console.log('[DND] FolderCard handleDrop → onDropFolder:', { folderId: folder.id, droppedFolderId, droppedFolderShortcutId });
            onDropFolder(folder.id, droppedFolderId, droppedFolderShortcutId);
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
            e.dataTransfer.setData('folderShortcutId', folder.shortcutId || '');
            e.dataTransfer.setData('position', position.toString());
            e.dataTransfer.setData('treeItem', JSON.stringify({
                id: folder.id,
                type: 'folder',
                parentId: folder.shortcutParentId ?? folder.parentId ?? null,
                shortcutId: folder.shortcutId || null
            }));
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