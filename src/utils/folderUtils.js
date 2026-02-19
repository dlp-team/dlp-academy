// src/utils/folderUtils.js

/**
 * Checks if targetId is a descendant of possibleParentId in the folder tree.
 * Prevents circular dependencies.
 */
export const isDescendant = (possibleParentId, targetId, allFolders) => {
    if (!possibleParentId || !targetId) return false;
    if (possibleParentId === targetId) return true;
    if (!Array.isArray(allFolders)) return false;

    let current = allFolders.find(f => f.id === targetId);
    const visited = new Set(); // Safety: Prevents browser freeze if DB is already corrupt

    while (current && current.folderId) {
        // If we found the dragged folder in the ancestry of the target -> BLOCK IT
        if (current.folderId === possibleParentId) return true;

        // Safety Break: If we see the same folder twice, stop checking (Assume safe to avoid crash)
        if (visited.has(current.id)) return false;
        visited.add(current.id);

        current = allFolders.find(f => f.id === current.folderId);
    }
    return false;
};

export const isTargetInsideDraggedTree = (draggedFolderId, targetFolderId, allFolders) => {
    if (!draggedFolderId || !targetFolderId) return false;
    if (draggedFolderId === targetFolderId) return true;
    if (!Array.isArray(allFolders)) return false;

    const byId = new Map(allFolders.map(folder => [folder.id, folder]));
    const visited = new Set();
    const stack = [draggedFolderId];

    while (stack.length > 0) {
        const currentId = stack.pop();
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const currentFolder = byId.get(currentId);
        if (!currentFolder) continue;

        const children = Array.isArray(currentFolder.folderIds) ? currentFolder.folderIds : [];
        for (const childId of children) {
            if (childId === targetFolderId) return true;
            if (!visited.has(childId)) stack.push(childId);
        }
    }

    return false;
};

export const isInvalidFolderMove = (draggedFolderId, targetFolderId, allFolders) => {
    if (!draggedFolderId || !targetFolderId) return false;
    if (draggedFolderId === targetFolderId) return true;

    return (
        isTargetInsideDraggedTree(draggedFolderId, targetFolderId, allFolders) ||
        isDescendant(draggedFolderId, targetFolderId, allFolders)
    );
};