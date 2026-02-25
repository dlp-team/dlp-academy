// src/hooks/useShortcuts.js
import { useState, useEffect } from 'react';
import { 
    collection, query, where, addDoc, deleteDoc, doc, 
    getDoc, onSnapshot, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { canView } from '../utils/permissionUtils';

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
    const currentInstitutionId = user?.institutionId || null;

    const debugVisibility = (stage, payload = {}) => {
        console.info('[VISIBILITY_DEBUG][shortcuts]', {
            ts: new Date().toISOString(),
            stage,
            userUid: user?.uid || null,
            institutionId: currentInstitutionId,
            ...payload
        });
    };

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
                debugVisibility('shortcuts_snapshot', { rawCount: snapshot.docs.length });
                const shortcutDocs = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(shortcut => {
                        // Owner always sees their own shortcuts
                        if (shortcut?.ownerId === user?.uid) return true;
                        if (!currentInstitutionId || !shortcut?.institutionId) return true;
                        return shortcut.institutionId === currentInstitutionId;
                    });

                debugVisibility('shortcuts_filtered', {
                    visibleCount: shortcutDocs.length,
                    ids: shortcutDocs.map(s => s.id)
                });
                
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
    }, [user, currentInstitutionId]);

    /**
     * Resolve shortcut targets to their actual data
     * Handles orphaned shortcuts gracefully (target deleted)
     * 
     * @param {Array} shortcuts - Array of shortcut documents
     * @returns {Array} Resolved shortcuts with target data or ghost objects
     */
    async function resolveShortcutTargets(shortcuts) {
        const resolved = await Promise.all(
            shortcuts.map(async (shortcut) => {
                try {
                    const { targetId, targetType } = shortcut;
                    debugVisibility('resolve_start', {
                        shortcutId: shortcut.id,
                        targetId,
                        targetType,
                        shortcutOwnerId: shortcut.ownerId
                    });

                    if (shortcut?.institutionId && shortcut.institutionId !== currentInstitutionId) {
                        debugVisibility('resolve_tenant_mismatch_shortcut', {
                            shortcutId: shortcut.id,
                            shortcutInstitutionId: shortcut.institutionId
                        });
                        return {
                            ...shortcut,
                            isShortcut: true,
                            isOrphan: true,
                            hiddenInManual: shortcut.hiddenInManual === true,
                            shortcutId: shortcut.id,
                            targetData: null,
                            name: '(No access)',
                            _originalTargetId: targetId,
                            _originalTargetType: targetType,
                            _reason: 'tenant-mismatch'
                        };
                    }
                    
                    // Determine collection based on targetType
                    const collectionName = targetType === 'folder' ? 'folders' : 'subjects';
                    const targetRef = doc(db, collectionName, targetId);
                    const targetSnap = await getDoc(targetRef);

                    if (!targetSnap.exists()) {
                        debugVisibility('resolve_target_deleted', { shortcutId: shortcut.id, targetId, targetType });
                        // Target was deleted - return ghost object
                        return {
                            ...shortcut,
                            isShortcut: true,
                            isOrphan: true,
                            hiddenInManual: shortcut.hiddenInManual === true,
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

                    if (targetData?.institutionId && targetData.institutionId !== currentInstitutionId) {
                        debugVisibility('resolve_tenant_mismatch_target', {
                            shortcutId: shortcut.id,
                            targetId,
                            targetInstitutionId: targetData?.institutionId
                        });
                        return {
                            ...shortcut,
                            isShortcut: true,
                            isOrphan: true,
                            hiddenInManual: shortcut.hiddenInManual === true,
                            shortcutId: shortcut.id,
                            targetData: null,
                            name: '(No access)',
                            _originalTargetId: targetId,
                            _originalTargetType: targetType,
                            _reason: 'tenant-mismatch'
                        };
                    }

                    if (!canView(targetData, user.uid)) {
                        debugVisibility('resolve_access_revoked', {
                            shortcutId: shortcut.id,
                            targetId,
                            targetType,
                            targetOwnerId: targetData?.ownerId || targetData?.uid || null,
                            targetSharedWithUids: Array.isArray(targetData?.sharedWithUids) ? targetData.sharedWithUids : []
                        });
                        return {
                            ...shortcut,
                            isShortcut: true,
                            isOrphan: true,
                            hiddenInManual: shortcut.hiddenInManual === true,
                            shortcutId: shortcut.id,
                            targetData: null,
                            name: '(No access)',
                            _originalTargetId: targetId,
                            _originalTargetType: targetType,
                            _reason: 'access-revoked'
                        };
                    }
                    
                    return {
                        ...targetData, // Spread target data first
                        // Override with shortcut-specific properties
                        name: shortcut.shortcutName || targetData.name,
                        course: shortcut.shortcutCourse || targetData.course,
                        tags: Array.isArray(shortcut.shortcutTags) ? shortcut.shortcutTags : targetData.tags,
                        color: shortcut.shortcutColor || targetData.color,
                        icon: shortcut.shortcutIcon || targetData.icon,
                        cardStyle: shortcut.shortcutCardStyle || targetData.cardStyle,
                        modernFillColor: shortcut.shortcutModernFillColor || targetData.modernFillColor,
                        shortcutId: shortcut.id,
                        shortcutOwnerId: shortcut.ownerId,
                        shortcutParentId: shortcut.parentId, // Where shortcut lives
                        isShortcut: true,
                        isOrphan: false,
                        hiddenInManual: shortcut.hiddenInManual === true,
                        targetType: shortcut.targetType,
                        targetId: shortcut.targetId,
                        // Preserve original parentId from target for reference
                        _sourceParentId: targetData.parentId || null,
                        // Use shortcut's parentId for folder navigation
                        parentId: shortcut.parentId
                    };
                } catch (error) {
                    debugVisibility('resolve_error', {
                        shortcutId: shortcut.id,
                        errorCode: error?.code || null,
                        errorMessage: error?.message || String(error)
                    });
                    console.error(`Failed to resolve shortcut ${shortcut.id}:`, error);
                    // Return ghost on error
                    return {
                        ...shortcut,
                        isShortcut: true,
                        isOrphan: true,
                        hiddenInManual: shortcut.hiddenInManual === true,
                        shortcutId: shortcut.id,
                        targetData: null,
                        name: '(Error loading)',
                        _error: error.message
                    };
                }
            })
        );

        return resolved;
    }

    /**
     * Create a new shortcut to a shared item
     * 
     * @param {string} targetId - ID of the subject/folder to shortcut
     * @param {string} targetType - 'subject' | 'folder'
     * @param {string|null} parentId - Where to place shortcut in user's folder tree
     * @param {string} institutionId - Institution ID (for multi-tenant isolation)
     * @returns {Promise<string>} ID of created shortcut
     */
    const createShortcut = async (targetId, targetType, parentId = null, institutionId = null, visualOverrides = {}) => {
        if (!user) {
            console.log('[SHORTCUT] createShortcut: user missing');
            throw new Error("User must be authenticated to create shortcuts");
        }

        const effectiveInstitutionId = institutionId || currentInstitutionId;

        const existingShortcuts = shortcuts.filter(
            shortcut =>
                shortcut.ownerId === user.uid &&
                shortcut.targetId === targetId &&
            shortcut.targetType === targetType &&
            (!shortcut?.institutionId || shortcut.institutionId === effectiveInstitutionId)
        );

        if (existingShortcuts.length > 0) {
            const primaryShortcut = existingShortcuts[0];
            const duplicates = existingShortcuts.slice(1);

            const primaryRef = doc(db, "shortcuts", primaryShortcut.id);
            await updateDoc(primaryRef, {
                parentId,
                institutionId: effectiveInstitutionId,
                ...(typeof visualOverrides.hiddenInManual === 'boolean' ? { hiddenInManual: visualOverrides.hiddenInManual } : {}),
                ...(visualOverrides.shortcutName ? { shortcutName: visualOverrides.shortcutName } : {}),
                ...(visualOverrides.shortcutCourse ? { shortcutCourse: visualOverrides.shortcutCourse } : {}),
                ...(Array.isArray(visualOverrides.shortcutTags) ? { shortcutTags: visualOverrides.shortcutTags } : {}),
                ...(visualOverrides.shortcutColor ? { shortcutColor: visualOverrides.shortcutColor } : {}),
                ...(visualOverrides.shortcutIcon ? { shortcutIcon: visualOverrides.shortcutIcon } : {}),
                ...(visualOverrides.shortcutCardStyle ? { shortcutCardStyle: visualOverrides.shortcutCardStyle } : {}),
                ...(visualOverrides.shortcutModernFillColor !== undefined ? { shortcutModernFillColor: visualOverrides.shortcutModernFillColor } : {}),
                updatedAt: new Date()
            });

            if (duplicates.length > 0) {
                await Promise.all(
                    duplicates.map(duplicate => deleteDoc(doc(db, "shortcuts", duplicate.id)))
                );
            }

            console.log('[SHORTCUT] Existing shortcut updated:', {
                shortcutId: primaryShortcut.id,
                targetId,
                targetType,
                parentId,
                duplicatesRemoved: duplicates.length
            });

            return primaryShortcut.id;
        }

        const shortcutData = {
            ownerId: user.uid,
            parentId: parentId,
            targetId: targetId,
            targetType: targetType,
            institutionId: effectiveInstitutionId,
            hiddenInManual: typeof visualOverrides.hiddenInManual === 'boolean' ? visualOverrides.hiddenInManual : false,
            ...(visualOverrides.shortcutName ? { shortcutName: visualOverrides.shortcutName } : {}),
            ...(visualOverrides.shortcutCourse ? { shortcutCourse: visualOverrides.shortcutCourse } : {}),
            ...(Array.isArray(visualOverrides.shortcutTags) ? { shortcutTags: visualOverrides.shortcutTags } : {}),
            ...(visualOverrides.shortcutColor ? { shortcutColor: visualOverrides.shortcutColor } : {}),
            ...(visualOverrides.shortcutIcon ? { shortcutIcon: visualOverrides.shortcutIcon } : {}),
            ...(visualOverrides.shortcutCardStyle ? { shortcutCardStyle: visualOverrides.shortcutCardStyle } : {}),
            ...(visualOverrides.shortcutModernFillColor !== undefined ? { shortcutModernFillColor: visualOverrides.shortcutModernFillColor } : {}),
            createdAt: new Date()
        };

        console.log('[SHORTCUT] createShortcut called:', {
            targetId,
            targetType,
            parentId,
            institutionId: effectiveInstitutionId,
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

    const updateShortcutAppearance = async (shortcutId, appearanceData = {}) => {
        if (!shortcutId) throw new Error("Shortcut ID required");

        const payload = {
            ...(appearanceData.name !== undefined ? { shortcutName: appearanceData.name } : {}),
            ...(appearanceData.course !== undefined ? { shortcutCourse: appearanceData.course } : {}),
            ...(Array.isArray(appearanceData.tags) ? { shortcutTags: appearanceData.tags } : {}),
            ...(appearanceData.color !== undefined ? { shortcutColor: appearanceData.color } : {}),
            ...(appearanceData.icon !== undefined ? { shortcutIcon: appearanceData.icon } : {}),
            ...(appearanceData.cardStyle !== undefined ? { shortcutCardStyle: appearanceData.cardStyle } : {}),
            ...(appearanceData.modernFillColor !== undefined ? { shortcutModernFillColor: appearanceData.modernFillColor } : {}),
            updatedAt: new Date()
        };

        await updateDoc(doc(db, "shortcuts", shortcutId), payload);
    };

    const setShortcutHiddenInManual = async (shortcutId, hiddenInManual = true) => {
        if (!shortcutId) throw new Error("Shortcut ID required");

        await updateDoc(doc(db, "shortcuts", shortcutId), {
            hiddenInManual: hiddenInManual === true,
            updatedAt: new Date()
        });
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
        updateShortcutAppearance,
        setShortcutHiddenInManual,
        deleteOrphanedShortcuts
    };
};
