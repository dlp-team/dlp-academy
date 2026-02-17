// src/utils/folderUtils.js

/**
 * Checks if targetId is a descendant of possibleParentId in the folder tree.
 * Prevents circular dependencies.
 */
export const isDescendant = (possibleParentId, targetId, allFolders) => {
    if (!possibleParentId || !targetId) return false;
    if (possibleParentId === targetId) return true; 
    
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