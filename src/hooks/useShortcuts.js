// src/hooks/useShortcuts.js
import { useState, useEffect } from 'react';
import { 
    collection, query, where, addDoc, deleteDoc, doc, 
    getDoc, onSnapshot, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Custom hook to manage user's shortcuts collection
 * 
 * Shortcuts allow users to organize shared content in their own folder structure
 * without mutating the source item's parentId or ownership.
 * 
 * Schema:
 * - ownerId: string - User who created the shortcut
 * - parentId: string | null - Where shortcut appears in user's folder tree
 * - targetId: string - ID of the source subject/folder
 * - targetType: 'subject' | 'folder' - Type discrimination
 * - institutionId: string - Institution boundary (for multi-tenant isolation)
 * - createdAt: timestamp
 * 
 * @param {Object} user - Current authenticated user
 * @returns {Object} { shortcuts, resolvedShortcuts, loading, createShortcut, deleteShortcut, moveShortcut }
 */
export const useShortcuts = (user) => {
    const [shortcuts, setShortcuts] = useState([]);
    const [resolvedShortcuts, setResolvedShortcuts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setShortcuts([]);
            setResolvedShortcuts([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Query shortcuts owned by current user
        const shortcutsQuery = query(
            collection(db, "shortcuts"),
            where("ownerId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(
            shortcutsQuery,
            async (snapshot) => {
                const shortcutDocs = snapshot.docs.map(d => ({ 
                    id: d.id, 
                    ...d.data() 
                }));
                
                setShortcuts(shortcutDocs);

                // Resolve targets for all shortcuts
                const resolved = await resolveShortcutTargets(shortcutDocs);
                setResolvedShortcuts(resolved);
                setLoading(false);
            },
            (error) => {
                console.error("Error listening to shortcuts:", error);
                setShortcuts([]);
                setResolvedShortcuts([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    /**
     * Resolve shortcut targets to their actual data
     * Handles orphaned shortcuts gracefully (target deleted)
     * 
     * @param {Array} shortcuts - Array of shortcut documents
     * @returns {Array} Resolved shortcuts with target data or ghost objects
     */
    const resolveShortcutTargets = async (shortcuts) => {
        const resolved = await Promise.all(
            shortcuts.map(async (shortcut) => {
                try {
                    const { targetId, targetType } = shortcut;
                    
                    // Determine collection based on targetType
                    const collectionName = targetType === 'folder' ? 'folders' : 'subjects';
                    const targetRef = doc(db, collectionName, targetId);
                    const targetSnap = await getDoc(targetRef);

                    if (!targetSnap.exists()) {
                        // Target was deleted - return ghost object
                        return {
                            ...shortcut,
                            isShortcut: true,
                            isOrphan: true,
                            shortcutId: shortcut.id,
                            targetData: null,
                            name: '(Deleted)',
                            // Preserve original metadata for cleanup
                            _originalTargetId: targetId,
                            _originalTargetType: targetType
                        };
                    }

                    // Target exists - return normalized object with metadata
                    const targetData = { id: targetSnap.id, ...targetSnap.data() };
                    
                    return {
                        ...targetData, // Spread target data first
                        // Override with shortcut-specific properties
                        shortcutId: shortcut.id,
                        shortcutParentId: shortcut.parentId, // Where shortcut lives
                        isShortcut: true,
                        isOrphan: false,
                        targetType: shortcut.targetType,
                        targetId: shortcut.targetId,
                        // Preserve original parentId from target for reference
                        _sourceParentId: targetData.parentId || null,
                        // Use shortcut's parentId for folder navigation
                        parentId: shortcut.parentId
                    };
                } catch (error) {
                    console.error(`Failed to resolve shortcut ${shortcut.id}:`, error);
                    // Return ghost on error
                    return {
                        ...shortcut,
                        isShortcut: true,
                        isOrphan: true,
                        shortcutId: shortcut.id,
                        targetData: null,
                        name: '(Error loading)',
                        _error: error.message
                    };
                }
            })
        );

        return resolved;
    };

    /**
     * Create a new shortcut to a shared item
     * 
     * @param {string} targetId - ID of the subject/folder to shortcut
     * @param {string} targetType - 'subject' | 'folder'
     * @param {string|null} parentId - Where to place shortcut in user's folder tree
     * @param {string} institutionId - Institution ID (for multi-tenant isolation)
     * @returns {Promise<string>} ID of created shortcut
     */
    const createShortcut = async (targetId, targetType, parentId = null, institutionId = 'default') => {
        if (!user) {
            console.log('[SHORTCUT] createShortcut: user missing');
            throw new Error("User must be authenticated to create shortcuts");
        }

        const shortcutData = {
            ownerId: user.uid,
            parentId: parentId,
            targetId: targetId,
            targetType: targetType,
            institutionId: institutionId,
            createdAt: new Date()
        };

        console.log('[SHORTCUT] createShortcut called:', {
            targetId,
            targetType,
            parentId,
            institutionId,
            user,
            shortcutData
        });

        try {
            const docRef = await addDoc(collection(db, "shortcuts"), shortcutData);
            console.log('[SHORTCUT] Shortcut created:', {
                docId: docRef.id,
                shortcutData
            });
            return docRef.id;
        } catch (error) {
            console.error('[SHORTCUT] Error creating shortcut:', error, shortcutData);
            throw error;
        }
    };

    /**
     * Delete a shortcut (does not affect the source item)
     * 
     * @param {string} shortcutId - ID of shortcut to delete
     * @returns {Promise<void>}
     */
    const deleteShortcut = async (shortcutId) => {
        if (!shortcutId) throw new Error("Shortcut ID required");
        
        await deleteDoc(doc(db, "shortcuts", shortcutId));
        console.log(`Shortcut deleted: ${shortcutId}`);
    };

    /**
     * Move shortcut to different folder in user's hierarchy
     * 
     * @param {string} shortcutId - ID of shortcut to move
     * @param {string|null} newParentId - New parent folder ID (null = root)
     * @returns {Promise<void>}
     */
    const moveShortcut = async (shortcutId, newParentId) => {
        if (!shortcutId) throw new Error("Shortcut ID required");
        
        const shortcutRef = doc(db, "shortcuts", shortcutId);
        await updateDoc(shortcutRef, { 
            parentId: newParentId,
            updatedAt: new Date()
        });
        
        console.log(`Shortcut moved: ${shortcutId} → folder:${newParentId || 'root'}`);
    };

    /**
     * Batch delete orphaned shortcuts for current user
     * Useful for cleanup after multiple source deletions
     * 
     * @returns {Promise<number>} Count of deleted orphans
     */
    const deleteOrphanedShortcuts = async () => {
        const orphans = resolvedShortcuts.filter(s => s.isOrphan);
        
        await Promise.all(
            orphans.map(orphan => deleteShortcut(orphan.shortcutId))
        );
        
        console.log(`Deleted ${orphans.length} orphaned shortcuts`);
        return orphans.length;
    };

    return {
        shortcuts,              // Raw shortcut docs
        resolvedShortcuts,      // Shortcuts with resolved target data
        loading,
        createShortcut,
        deleteShortcut,
        moveShortcut,
        deleteOrphanedShortcuts
    };
};
