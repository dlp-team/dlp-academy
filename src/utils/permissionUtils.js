// src/utils/permissionUtils.js

/**
 * Permission utilities for checking user access to subjects, folders, and topics.
 * 
 * These helpers implement the permission model defined in the refactor roadmap:
 * - Owner: Full access (create, read, update, delete)
 * - Editor: Can read and modify (via editorUids array)
 * - Viewer: Read-only access (via viewerUids array)
 * 
 * This aligns with Firestore Security Rules (see Phase 07 planning docs).
 */

/**
 * Check if user is the owner of an item
 * 
 * @param {Object} item - Subject, folder, or topic document
 * @param {string} userId - Current user's UID
 * @returns {boolean}
 */
export const isOwner = (item, userId) => {
    if (!item || !userId) {
        // console.log('[PERMISSION] isOwner: false', { item, userId });
        return false;
    }
    const ownerCheck = item.ownerId === userId;
    // console.log('[PERMISSION] isOwner:', { item, userId, ownerCheck });
    return ownerCheck;
};

/**
 * Check if user can edit an item
 * User can edit if they are:
 * 1. The owner, OR
 * 2. Listed in editorUids array
 * 
 * @param {Object} item - Subject, folder, or topic document
 * @param {string} userId - Current user's UID
 * @returns {boolean}
 */
export const canEdit = (item, userId) => {
    if (!item || !userId) {
        // console.log('[PERMISSION] canEdit: false', { item, userId });
        return false;
    }
    // Owner can always edit
    const owner = isOwner(item, userId);
    if (owner) {
        // console.log('[PERMISSION] canEdit: true (owner)', { item, userId });
        return true;
    }
    // Check if user is in editorUids array (new schema)
    const editor = Array.isArray(item.editorUids) && item.editorUids.includes(userId);
    if (editor) {
        // console.log('[PERMISSION] canEdit: true (editorUids)', { item, userId });
        return true;
    }
    // Legacy fallback: check sharedWith array with canEdit property
    let sharedEdit = false;
    if (Array.isArray(item.sharedWith)) {
        sharedEdit = item.sharedWith.some(share => 
            (share.uid === userId || share.email === userId) && (share.canEdit === true || share.role === 'editor')
        );
        if (sharedEdit) {
            // console.log('[PERMISSION] canEdit: true (sharedWith)', { item, userId });
            return true;
        }
    }
    // console.log('[PERMISSION] canEdit: false', { item, userId });
    return false;
};

/**
 * Check if user can view an item
 * User can view if they are:
 * 1. The owner, OR
 * 2. Listed in editorUids array, OR
 * 3. Listed in viewerUids array
 * 
 * @param {Object} item - Subject, folder, or topic document
 * @param {string} userId - Current user's UID
 * @returns {boolean}
 */
export const canView = (item, userId) => {
    if (!item || !userId) return false;
    
    // If user can edit, they can also view
    if (canEdit(item, userId)) return true;
    
    // Check if user is in viewerUids array (new schema)
    if (Array.isArray(item.viewerUids) && item.viewerUids.includes(userId)) {
        return true;
    }
    
    // Legacy fallback: check sharedWith array (any permission level)
    if (Array.isArray(item.sharedWith)) {
        return item.sharedWith.some(share => 
            share.uid === userId || share.email === userId
        );
    }
    
    // Legacy fallback: check sharedWithUids array (simple sharing)
    if (Array.isArray(item.sharedWithUids) && item.sharedWithUids.includes(userId)) {
        return true;
    }
    
    return false;
};

/**
 * Check if user can delete an item
 * Owners and editors can delete
 * 
 * @param {Object} item - Subject, folder, or topic document
 * @param {string} userId - Current user's UID
 * @returns {boolean}
 */
export const canDelete = (item, userId) => {
    return canEdit(item, userId);
};

/**
 * Detect if an item represents a shortcut entry.
 * Canonical shortcut signal is targetId + targetType from shortcuts collection.
 * Resolved shortcuts may also include synthetic flags like isShortcut/shortcutId.
 *
 * @param {Object} item
 * @returns {boolean}
 */
export const isShortcutItem = (item) => {
    if (!item || typeof item !== 'object') return false;

    const hasNativeShortcutShape =
        typeof item.targetId === 'string' &&
        (item.targetType === 'subject' || item.targetType === 'folder');

    return hasNativeShortcutShape || item?.isShortcut === true || Boolean(item?.shortcutId);
};

/**
 * Get user's permission level for an item
 * 
 * @param {Object} item - Subject, folder, or topic document
 * @param {string} userId - Current user's UID
 * @returns {'owner' | 'editor' | 'viewer' | 'none'}
 */
export const getPermissionLevel = (item, userId) => {
    if (!item || !userId) return 'none';
    
    if (isOwner(item, userId)) return 'owner';
    
    // Check editorUids (new schema)
    if (Array.isArray(item.editorUids) && item.editorUids.includes(userId)) {
        return 'editor';
    }
    
    // Check viewerUids (new schema)
    if (Array.isArray(item.viewerUids) && item.viewerUids.includes(userId)) {
        return 'viewer';
    }
    
    // Legacy fallback: check sharedWith array
    if (Array.isArray(item.sharedWith)) {
        const share = item.sharedWith.find(s => 
            s.uid === userId || s.email === userId
        );
        if (share) {
            return (share.canEdit === true || share.role === 'editor') ? 'editor' : 'viewer';
        }
    }
    
    // Legacy fallback: check sharedWithUids (assume viewer)
    if (Array.isArray(item.sharedWithUids) && item.sharedWithUids.includes(userId)) {
        return 'viewer';
    }
    
    return 'none';
};

/**
 * Check if a shortcut is orphaned (target was deleted)
 * 
 * @param {Object} shortcut - Resolved shortcut object
 * @returns {boolean}
 */
export const isOrphanedShortcut = (shortcut) => {
    return isShortcutItem(shortcut) && shortcut?.isOrphan === true;
};

/**
 * Filter items to only those the user can view
 * 
 * @param {Array} items - Array of subjects/folders
 * @param {string} userId - Current user's UID
 * @returns {Array} Filtered items
 */
export const filterViewableItems = (items, userId) => {
    if (!userId || !Array.isArray(items)) return [];
    return items.filter(item => canView(item, userId));
};

/**
 * Filter items to only those the user can edit
 * 
 * @param {Array} items - Array of subjects/folders
 * @param {string} userId - Current user's UID
 * @returns {Array} Filtered items
 */
export const filterEditableItems = (items, userId) => {
    if (!userId || !Array.isArray(items)) return [];
    return items.filter(item => canEdit(item, userId));
};

/**
 * Check if user should see edit UI (edit buttons, forms, etc.)
 * This is the main helper to use in components to show/hide edit actions.
 * 
 * @param {Object} item - Subject, folder, or topic document
 * @param {string} userId - Current user's UID
 * @returns {boolean}
 */
export const shouldShowEditUI = (item, userId) => {
    // Don't show edit UI for orphaned shortcuts
    if (isOrphanedShortcut(item)) return false;

    // Shortcut owner can edit shortcut presentation (local copy UI)
    if (isShortcutItem(item)) {
        return item.ownerId === userId || item.shortcutOwnerId === userId;
    }
    
    // For shortcuts, check permission on the target
    // (The resolved shortcut should already have target's permission data)
    return canEdit(item, userId);
};

/**
 * Check if user should see delete UI (delete buttons)
 * For shortcuts, user can delete their own shortcut even if they can't delete the target.
 * 
 * @param {Object} item - Subject, folder, topic, or shortcut
 * @param {string} userId - Current user's UID
 * @returns {boolean}
 */
export const shouldShowDeleteUI = (item, userId) => {
    // For shortcuts, user can always delete their own shortcut
    if (isShortcutItem(item)) {
        return item.ownerId === userId || item.shortcutOwnerId === userId;
    }

    // For regular items, owners and editors can delete
    return canDelete(item, userId);
};

/**
 * Check if user has the teacher role.
 * @param {Object} user - User object from App.jsx (contains .role)
 * @returns {boolean}
 */
export const isTeacher = (user) => user?.role === 'teacher';
