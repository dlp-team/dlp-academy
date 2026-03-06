// src/hooks/useShortcuts.js
import { useState, useEffect, useRef } from 'react';
import { 
    collection, query, where, addDoc, deleteDoc, doc, 
    onSnapshot, updateDoc, getDoc
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
    const promotingShortcutIdsRef = useRef(new Set());
    const canReadHomeData = Boolean(user?.role && user?.country && user?.displayName);

    const buildAppearanceFromTargetData = (targetType, targetData = {}) => {
        if (targetType === 'folder') {
            return {
                shortcutName: targetData.name,
                shortcutTags: Array.isArray(targetData.tags) ? targetData.tags : [],
                shortcutColor: targetData.color,
                shortcutIcon: targetData.icon,
                shortcutCardStyle: targetData.cardStyle,
                shortcutModernFillColor: targetData.modernFillColor
            };
        }

        return {
            shortcutName: targetData.name,
            shortcutCourse: targetData.course,
            shortcutTags: Array.isArray(targetData.tags) ? targetData.tags : [],
            shortcutColor: targetData.color,
            shortcutIcon: targetData.icon,
            shortcutCardStyle: targetData.cardStyle,
            shortcutModernFillColor: targetData.modernFillColor
        };
    };

    const buildMissingShortcutAppearanceUpdate = (shortcut, targetType, targetData = {}) => {
        const sourceAppearance = buildAppearanceFromTargetData(targetType, targetData);
        const updateData = {};

        if (!shortcut?.shortcutName && sourceAppearance.shortcutName) {
            updateData.shortcutName = sourceAppearance.shortcutName;
        }
        if (targetType === 'subject' && shortcut?.shortcutCourse === undefined && sourceAppearance.shortcutCourse !== undefined) {
            updateData.shortcutCourse = sourceAppearance.shortcutCourse;
        }
        if (!Array.isArray(shortcut?.shortcutTags) && Array.isArray(sourceAppearance.shortcutTags)) {
            updateData.shortcutTags = sourceAppearance.shortcutTags;
        }
        if (!shortcut?.shortcutColor && sourceAppearance.shortcutColor) {
            updateData.shortcutColor = sourceAppearance.shortcutColor;
        }
        if (!shortcut?.shortcutIcon && sourceAppearance.shortcutIcon) {
            updateData.shortcutIcon = sourceAppearance.shortcutIcon;
        }
        if (!shortcut?.shortcutCardStyle && sourceAppearance.shortcutCardStyle) {
            updateData.shortcutCardStyle = sourceAppearance.shortcutCardStyle;
        }
        if (shortcut?.shortcutModernFillColor === undefined && sourceAppearance.shortcutModernFillColor !== undefined) {
            updateData.shortcutModernFillColor = sourceAppearance.shortcutModernFillColor;
        }

        return updateData;
    };

    useEffect(() => {
        if (!user || !canReadHomeData) {
            setShortcuts([]);
            setResolvedShortcuts([]);
            setLoading(false);
            return;
        }

        // Query shortcuts owned by current user
        const shortcutsQuery = query(
            collection(db, "shortcuts"),
            where("ownerId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(
            shortcutsQuery,
            async (snapshot) => {
                const shortcutDocs = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(shortcut => {
                        // Owner always sees their own shortcuts
                        if (shortcut?.ownerId === user?.uid) return true;
                        if (!currentInstitutionId || !shortcut?.institutionId) return true;
                        return shortcut.institutionId === currentInstitutionId;
                    });
                
                setShortcuts(shortcutDocs);
                if (shortcutDocs.length === 0) {
                    setResolvedShortcuts([]);
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Error listening to shortcuts:", error);
                setShortcuts([]);
                setResolvedShortcuts([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, currentInstitutionId, canReadHomeData]);

    useEffect(() => {
        if (!user || !canReadHomeData) return;

        if (!Array.isArray(shortcuts) || shortcuts.length === 0) return;

        let isMounted = true;
        let loadedCount = 0;
        const targetUnsubscribers = [];
        const resolvedMap = new Map();

        const emit = () => {
            if (!isMounted) return;
            const ordered = shortcuts.map(s => resolvedMap.get(s.id)).filter(Boolean);
            setResolvedShortcuts(ordered);
        };

        const buildResolvedFromSnapshot = async (shortcut, targetSnap) => {
            const { targetId, targetType } = shortcut;
            const fallbackAppearance = {
                name: shortcut.shortcutName || shortcut.name || (targetType === 'folder' ? 'Carpeta' : 'Asignatura'),
                course: shortcut.shortcutCourse || null,
                tags: Array.isArray(shortcut.shortcutTags) ? shortcut.shortcutTags : [],
                color: shortcut.shortcutColor || 'from-slate-500 to-slate-700',
                icon: shortcut.shortcutIcon || (targetType === 'folder' ? 'folder' : 'book'),
                cardStyle: shortcut.shortcutCardStyle || 'default',
                modernFillColor: shortcut.shortcutModernFillColor || null
            };

            if (shortcut?.institutionId && shortcut.institutionId !== currentInstitutionId) {
                return {
                    ...shortcut,
                    ...fallbackAppearance,
                    isShortcut: true,
                    isOrphan: true,
                    hiddenInManual: shortcut.hiddenInManual === true,
                    shortcutId: shortcut.id,
                    shortcutParentId: shortcut.parentId ?? null,
                    parentId: shortcut.parentId ?? null,
                    targetData: null,
                    _originalTargetId: targetId,
                    _originalTargetType: targetType,
                    _reason: 'tenant-mismatch'
                };
            }

            if (!targetSnap.exists()) {
                return {
                    ...shortcut,
                    ...fallbackAppearance,
                    isShortcut: true,
                    isOrphan: true,
                    hiddenInManual: shortcut.hiddenInManual === true,
                    shortcutId: shortcut.id,
                    shortcutParentId: shortcut.parentId ?? null,
                    parentId: shortcut.parentId ?? null,
                    targetData: null,
                    _originalTargetId: targetId,
                    _originalTargetType: targetType,
                    _reason: shortcut?.orphanReason || 'target-missing'
                };
            }

            const targetData = { id: targetSnap.id, ...targetSnap.data() };

            if (targetData?.institutionId && targetData.institutionId !== currentInstitutionId) {
                return {
                    ...shortcut,
                    ...fallbackAppearance,
                    isShortcut: true,
                    isOrphan: true,
                    hiddenInManual: shortcut.hiddenInManual === true,
                    shortcutId: shortcut.id,
                    shortcutParentId: shortcut.parentId ?? null,
                    parentId: shortcut.parentId ?? null,
                    targetData: null,
                    _originalTargetId: targetId,
                    _originalTargetType: targetType,
                    _reason: 'tenant-mismatch'
                };
            }

            if (!canView(targetData, user.uid)) {
                return {
                    ...shortcut,
                    ...fallbackAppearance,
                    isShortcut: true,
                    isOrphan: true,
                    hiddenInManual: shortcut.hiddenInManual === true,
                    shortcutId: shortcut.id,
                    shortcutParentId: shortcut.parentId ?? null,
                    parentId: shortcut.parentId ?? null,
                    targetData: null,
                    _originalTargetId: targetId,
                    _originalTargetType: targetType,
                    _reason: shortcut?.orphanReason || 'access-revoked'
                };
            }

            const parentFolderId = targetType === 'subject'
                ? (targetData.folderId || null)
                : (targetData.parentId || null);

            if (parentFolderId) {
                try {
                    const parentFolderSnap = await getDoc(doc(db, 'folders', parentFolderId));
                    if (parentFolderSnap.exists()) {
                        const parentFolderData = parentFolderSnap.data() || {};
                        if (parentFolderData.isShared === true) {
                            return {
                                ...shortcut,
                                ...fallbackAppearance,
                                isShortcut: true,
                                isOrphan: true,
                                hiddenInManual: shortcut.hiddenInManual === true,
                                shortcutId: shortcut.id,
                                shortcutParentId: shortcut.parentId ?? null,
                                parentId: shortcut.parentId ?? null,
                                targetData: null,
                                _originalTargetId: targetId,
                                _originalTargetType: targetType,
                                _reason: 'moved-to-shared-folder',
                                _movedToFolderName: parentFolderData.name || 'carpeta compartida',
                                _movedToFolderId: parentFolderId
                            };
                        }
                    }
                } catch (_) {
                    // Ignore parent folder lookup failures and continue with normal resolved shortcut
                }
            }

            return {
                ...targetData,
                name: shortcut.shortcutName || targetData.name,
                course: shortcut.shortcutCourse || targetData.course,
                tags: Array.isArray(shortcut.shortcutTags) ? shortcut.shortcutTags : targetData.tags,
                color: shortcut.shortcutColor || targetData.color,
                icon: shortcut.shortcutIcon || targetData.icon,
                cardStyle: shortcut.shortcutCardStyle || targetData.cardStyle,
                modernFillColor: shortcut.shortcutModernFillColor || targetData.modernFillColor,
                shortcutId: shortcut.id,
                shortcutOwnerId: shortcut.ownerId,
                shortcutParentId: shortcut.parentId,
                isShortcut: true,
                isOrphan: false,
                hiddenInManual: shortcut.hiddenInManual === true,
                targetType: shortcut.targetType,
                targetId: shortcut.targetId,
                _sourceParentId: targetData.parentId || null,
                parentId: shortcut.parentId
            };
        };

        shortcuts.forEach(shortcut => {
            const collectionName = shortcut.targetType === 'folder' ? 'folders' : 'subjects';
            const targetRef = doc(db, collectionName, shortcut.targetId);

            const unsub = onSnapshot(targetRef, async (targetSnap) => {
                try {
                    if (targetSnap.exists()) {
                        const targetData = targetSnap.data() || {};

                        const missingAppearanceUpdate = buildMissingShortcutAppearanceUpdate(shortcut, shortcut.targetType, targetData);
                        if (Object.keys(missingAppearanceUpdate).length > 0) {
                            try {
                                await updateDoc(doc(db, 'shortcuts', shortcut.id), {
                                    ...missingAppearanceUpdate,
                                    updatedAt: new Date()
                                });
                            } catch (_) {
                                // Best effort cache update.
                            }
                        }

                        const targetOwnerId = targetData?.ownerId || targetData?.uid || null;
                        if (targetOwnerId && targetOwnerId === user?.uid) {
                            if (promotingShortcutIdsRef.current.has(shortcut.id)) {
                                return;
                            }
                            promotingShortcutIdsRef.current.add(shortcut.id);
                            try {
                                const shortcutParentId = shortcut?.parentId ?? null;
                                const targetUpdate = {
                                    updatedAt: new Date()
                                };

                                if (shortcut.targetType === 'subject') {
                                    targetUpdate.folderId = shortcutParentId;
                                    if (shortcut?.shortcutName) targetUpdate.name = shortcut.shortcutName;
                                    if (shortcut?.shortcutCourse !== undefined) targetUpdate.course = shortcut.shortcutCourse;
                                    if (Array.isArray(shortcut?.shortcutTags)) targetUpdate.tags = shortcut.shortcutTags;
                                    if (shortcut?.shortcutColor) targetUpdate.color = shortcut.shortcutColor;
                                    if (shortcut?.shortcutIcon) targetUpdate.icon = shortcut.shortcutIcon;
                                    if (shortcut?.shortcutCardStyle) targetUpdate.cardStyle = shortcut.shortcutCardStyle;
                                    if (shortcut?.shortcutModernFillColor !== undefined) targetUpdate.modernFillColor = shortcut.shortcutModernFillColor;
                                } else {
                                    targetUpdate.parentId = shortcutParentId;
                                    if (shortcut?.shortcutName) targetUpdate.name = shortcut.shortcutName;
                                    if (Array.isArray(shortcut?.shortcutTags)) targetUpdate.tags = shortcut.shortcutTags;
                                    if (shortcut?.shortcutColor) targetUpdate.color = shortcut.shortcutColor;
                                    if (shortcut?.shortcutIcon) targetUpdate.icon = shortcut.shortcutIcon;
                                    if (shortcut?.shortcutCardStyle) targetUpdate.cardStyle = shortcut.shortcutCardStyle;
                                    if (shortcut?.shortcutModernFillColor !== undefined) targetUpdate.modernFillColor = shortcut.shortcutModernFillColor;
                                }

                                await updateDoc(targetRef, targetUpdate);
                                await deleteDoc(doc(db, 'shortcuts', shortcut.id));
                            } catch (promoteError) {
                                // Best effort cleanup.
                                console.warn('[SHORTCUT] Could not promote owned shortcut into source item', {
                                    shortcutId: shortcut.id,
                                    targetType: shortcut.targetType,
                                    error: promoteError?.message || String(promoteError)
                                });
                            } finally {
                                promotingShortcutIdsRef.current.delete(shortcut.id);
                            }
                            return;
                        }
                    }

                    const resolved = await buildResolvedFromSnapshot(shortcut, targetSnap);
                    resolvedMap.set(shortcut.id, resolved);
                    loadedCount += 1;
                    if (loadedCount >= shortcuts.length) {
                        setLoading(false);
                    }
                    emit();
                } catch (error) {
                    resolvedMap.set(shortcut.id, {
                        ...shortcut,
                        name: shortcut.shortcutName || shortcut.name || (shortcut.targetType === 'folder' ? 'Carpeta' : 'Asignatura'),
                        course: shortcut.shortcutCourse || null,
                        tags: Array.isArray(shortcut.shortcutTags) ? shortcut.shortcutTags : [],
                        color: shortcut.shortcutColor || 'from-slate-500 to-slate-700',
                        icon: shortcut.shortcutIcon || (shortcut.targetType === 'folder' ? 'folder' : 'book'),
                        cardStyle: shortcut.shortcutCardStyle || 'default',
                        modernFillColor: shortcut.shortcutModernFillColor || null,
                        isShortcut: true,
                        isOrphan: true,
                        hiddenInManual: shortcut.hiddenInManual === true,
                        shortcutId: shortcut.id,
                        shortcutParentId: shortcut.parentId ?? null,
                        parentId: shortcut.parentId ?? null,
                        targetData: null,
                        _error: error.message
                    });
                    loadedCount += 1;
                    if (loadedCount >= shortcuts.length) {
                        setLoading(false);
                    }
                    emit();
                }
            }, () => {
                resolvedMap.set(shortcut.id, {
                    ...shortcut,
                    name: shortcut.shortcutName || shortcut.name || (shortcut.targetType === 'folder' ? 'Carpeta' : 'Asignatura'),
                    course: shortcut.shortcutCourse || null,
                    tags: Array.isArray(shortcut.shortcutTags) ? shortcut.shortcutTags : [],
                    color: shortcut.shortcutColor || 'from-slate-500 to-slate-700',
                    icon: shortcut.shortcutIcon || (shortcut.targetType === 'folder' ? 'folder' : 'book'),
                    cardStyle: shortcut.shortcutCardStyle || 'default',
                    modernFillColor: shortcut.shortcutModernFillColor || null,
                    isShortcut: true,
                    isOrphan: true,
                    hiddenInManual: shortcut.hiddenInManual === true,
                    shortcutId: shortcut.id,
                    shortcutParentId: shortcut.parentId ?? null,
                    parentId: shortcut.parentId ?? null,
                    targetData: null,
                    _reason: 'snapshot-error'
                });
                loadedCount += 1;
                if (loadedCount >= shortcuts.length) {
                    setLoading(false);
                }
                emit();
            });

            targetUnsubscribers.push(unsub);
        });

        return () => {
            isMounted = false;
            targetUnsubscribers.forEach(unsub => unsub());
        };
    }, [shortcuts, user, currentInstitutionId, canReadHomeData]);

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
        let sourceAppearance = {};

        try {
            const targetCollection = targetType === 'folder' ? 'folders' : 'subjects';
            const targetSnapshot = await getDoc(doc(db, targetCollection, targetId));
            if (targetSnapshot.exists()) {
                sourceAppearance = buildAppearanceFromTargetData(targetType, targetSnapshot.data() || {});
            }
        } catch (_) {
            sourceAppearance = {};
        }

        const effectiveVisualOverrides = {
            ...sourceAppearance,
            ...visualOverrides
        };

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
                ...(typeof effectiveVisualOverrides.hiddenInManual === 'boolean' ? { hiddenInManual: effectiveVisualOverrides.hiddenInManual } : {}),
                ...(effectiveVisualOverrides.shortcutName ? { shortcutName: effectiveVisualOverrides.shortcutName } : {}),
                ...(effectiveVisualOverrides.shortcutCourse !== undefined ? { shortcutCourse: effectiveVisualOverrides.shortcutCourse } : {}),
                ...(Array.isArray(effectiveVisualOverrides.shortcutTags) ? { shortcutTags: effectiveVisualOverrides.shortcutTags } : {}),
                ...(effectiveVisualOverrides.shortcutColor ? { shortcutColor: effectiveVisualOverrides.shortcutColor } : {}),
                ...(effectiveVisualOverrides.shortcutIcon ? { shortcutIcon: effectiveVisualOverrides.shortcutIcon } : {}),
                ...(effectiveVisualOverrides.shortcutCardStyle ? { shortcutCardStyle: effectiveVisualOverrides.shortcutCardStyle } : {}),
                ...(effectiveVisualOverrides.shortcutModernFillColor !== undefined ? { shortcutModernFillColor: effectiveVisualOverrides.shortcutModernFillColor } : {}),
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
            hiddenInManual: typeof effectiveVisualOverrides.hiddenInManual === 'boolean' ? effectiveVisualOverrides.hiddenInManual : false,
            ...(effectiveVisualOverrides.shortcutName ? { shortcutName: effectiveVisualOverrides.shortcutName } : {}),
            ...(effectiveVisualOverrides.shortcutCourse !== undefined ? { shortcutCourse: effectiveVisualOverrides.shortcutCourse } : {}),
            ...(Array.isArray(effectiveVisualOverrides.shortcutTags) ? { shortcutTags: effectiveVisualOverrides.shortcutTags } : {}),
            ...(effectiveVisualOverrides.shortcutColor ? { shortcutColor: effectiveVisualOverrides.shortcutColor } : {}),
            ...(effectiveVisualOverrides.shortcutIcon ? { shortcutIcon: effectiveVisualOverrides.shortcutIcon } : {}),
            ...(effectiveVisualOverrides.shortcutCardStyle ? { shortcutCardStyle: effectiveVisualOverrides.shortcutCardStyle } : {}),
            ...(effectiveVisualOverrides.shortcutModernFillColor !== undefined ? { shortcutModernFillColor: effectiveVisualOverrides.shortcutModernFillColor } : {}),
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
