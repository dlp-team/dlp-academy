// src/pages/Home/hooks/useHomeHandlers.js
import { canEdit, isOwner } from '../../../utils/permissionUtils';

export const useHomeHandlers = ({
    user,
    subjects,
    folders,
    filteredFolders,
    currentFolder,
    groupedContent,
    orderedFolders,
    subjectModalConfig,
    folderModalConfig,
    deleteConfig,
    setSubjectModalConfig,
    setFolderModalConfig,
    setDeleteConfig,
    setCurrentFolder,
    setCollapsedGroups,
    setManualOrder,
    setActiveFilter,
    setDraggedItem,
    setDraggedItemType,
    setDropPosition,
    touchSubject,
    updateSubject,
    addSubject,
    addSubjectToFolder,
    updateFolder,
    addFolder,
    deleteSubject,
    deleteFolder,
    deleteFolderOnly,
    deleteShortcut,
    unshareSubject,
    unshareFolder,
    updatePreference,
    navigate,
    isDescendant,
    createShortcut,
    updateShortcutAppearance,
    setShortcutHiddenInManual
}) => {
    const getFolderById = (folderId) => {
        if (!folderId) return null;
        return (folders || []).find(folder => folder?.id === folderId) || null;
    };

    const getFolderParentId = (folderEntry) => {
        if (!folderEntry) return null;
        return folderEntry.shortcutParentId ?? folderEntry.parentId ?? null;
    };

    const isInsideSharedFolderTree = (folderId) => {
        if (!folderId) return false;
        let cursorId = folderId;
        let safety = 0;
        while (cursorId && safety < 200) {
            const cursor = getFolderById(cursorId);
            if (!cursor) return false;
            if (cursor.isShared === true) return true;
            cursorId = getFolderParentId(cursor);
            safety += 1;
        }
        return false;
    };
    const handleSaveSubject = async formData => {
        const isShortcutEdit = subjectModalConfig.isEditing && Boolean(formData?.shortcutId);
        const shortcutPermission = formData?.shortcutPermissionLevel || 'viewer';
        const isShortcutEditor = shortcutPermission === 'editor' || shortcutPermission === 'owner';

        const payload = {
            name: formData.name,
            course: formData.course,
            color: formData.color,
            icon: formData.icon || 'book',
            tags: formData.tags,
            cardStyle: formData.cardStyle || 'default',
            modernFillColor: formData.modernFillColor || null,
            updatedAt: new Date()
        };

        try {
            if (subjectModalConfig.isEditing) {
                if (isShortcutEdit && updateShortcutAppearance) {
                    if (isShortcutEditor) {
                        await updateSubject(formData.id, {
                            name: formData.name,
                            course: formData.course,
                            icon: formData.icon || 'book',
                            updatedAt: new Date()
                        });
                    }

                    await updateShortcutAppearance(formData.shortcutId, {
                        tags: formData.tags,
                        color: formData.color,
                        cardStyle: formData.cardStyle || 'default',
                        modernFillColor: formData.modernFillColor || null
                    });
                } else {
                    await updateSubject(formData.id, payload);
                }
            } else {
                const createPayload = {
                    ...payload,
                    uid: user.uid,
                    isShared: false,
                    sharedWith: []
                };

                if (currentFolder) {
                    if (currentFolder.isShared || (currentFolder.sharedWith && currentFolder.sharedWith.length > 0)) {
                        createPayload.isShared = true;

                        const parentShares = currentFolder.sharedWith || [];
                        const usersToShareWith = new Set(parentShares);

                        if (currentFolder.ownerId && currentFolder.ownerId !== user.uid) {
                            usersToShareWith.add(currentFolder.ownerId);
                        }

                        createPayload.sharedWith = Array.from(usersToShareWith);
                    }
                }

                const newSubject = await addSubject(createPayload);
                const newId = typeof newSubject === 'object' ? newSubject.id : newSubject;

                if (currentFolder) {
                    await addSubjectToFolder(currentFolder.id, newId);
                }
            }

            setSubjectModalConfig({ isOpen: false, isEditing: false, data: null });
        } catch (error) {
            console.error('Error saving subject:', error);
        }
    };

    const handleSaveFolder = async formData => {
        const isShortcutEdit = folderModalConfig.isEditing && Boolean(formData?.shortcutId);
        const shortcutPermission = formData?.shortcutPermissionLevel || 'viewer';
        const isShortcutEditor = shortcutPermission === 'editor' || shortcutPermission === 'owner';
        const folderPayload = {
            name: formData?.name || '',
            description: formData?.description || '',
            color: formData?.color || 'from-amber-400 to-amber-600',
            tags: Array.isArray(formData?.tags) ? formData.tags : [],
            cardStyle: formData?.cardStyle || 'default',
            modernFillColor: formData?.modernFillColor || null,
            ...(formData?.parentId !== undefined ? { parentId: formData.parentId } : {})
        };

        if (folderModalConfig.isEditing) {
            if (isShortcutEdit && updateShortcutAppearance) {
                if (isShortcutEditor) {
                    await updateFolder(formData.id, {
                        name: formData.name,
                        description: formData.description || '',
                        updatedAt: new Date()
                    });
                }

                await updateShortcutAppearance(formData.shortcutId, {
                    tags: formData.tags,
                    color: formData.color,
                    cardStyle: formData.cardStyle || 'default',
                    modernFillColor: formData.modernFillColor || null
                });
            } else {
                await updateFolder(formData.id, folderPayload);
            }
        } else {
            await addFolder(folderPayload);
        }
        setFolderModalConfig({ isOpen: false, isEditing: false, data: null });
    };

    const handleDelete = async () => {
        if (deleteConfig.type === 'subject' && deleteConfig.item) {
            await deleteSubject(deleteConfig.item.id);
            setManualOrder(prev => ({
                ...prev,
                subjects: prev.subjects.filter(id => id !== deleteConfig.item.id)
            }));
        } else if (deleteConfig.type === 'folder' && deleteConfig.item) {
            const isFolderOwner = user?.uid ? isOwner(deleteConfig.item, user.uid) : false;
            if (!isFolderOwner) {
                setDeleteConfig({ isOpen: false, type: null, action: null, item: null });
                return;
            }
            await deleteFolder(deleteConfig.item.id);
            setManualOrder(prev => ({
                ...prev,
                folders: prev.folders.filter(id => id !== deleteConfig.item.id)
            }));
        } else if (deleteConfig.type === 'shortcut-subject' && deleteConfig.item) {
            const shortcutId = deleteConfig.item.shortcutId;
            const targetId = deleteConfig.item.targetId || deleteConfig.item.id;
            const parentFolderId = deleteConfig.item.shortcutParentId ?? deleteConfig.item.folderId ?? deleteConfig.item.parentId ?? null;
            const unshareBlocked = isInsideSharedFolderTree(parentFolderId);

            if (deleteConfig.action === 'unshare' && unshareBlocked) {
                setDeleteConfig({ isOpen: false, type: null, action: null, item: null });
                return;
            }

            if (deleteConfig.action === 'unshare' && unshareSubject && user?.email) {
                try {
                    await unshareSubject(targetId, user.email);
                } catch (error) {
                    console.error('Error unsharing shortcut subject access:', error);
                }
            }

            if (deleteConfig.action === 'hide' && shortcutId && setShortcutHiddenInManual) {
                await setShortcutHiddenInManual(shortcutId, true);
            } else if (deleteConfig.action === 'unhide' && shortcutId && setShortcutHiddenInManual) {
                await setShortcutHiddenInManual(shortcutId, false);
            } else if (deleteConfig.action !== 'unshare' && shortcutId && deleteShortcut) {
                await deleteShortcut(shortcutId);
            }
        } else if (deleteConfig.type === 'shortcut-folder' && deleteConfig.item) {
            const shortcutId = deleteConfig.item.shortcutId;
            const targetId = deleteConfig.item.targetId || deleteConfig.item.id;
            const parentFolderId = deleteConfig.item.shortcutParentId ?? deleteConfig.item.parentId ?? null;
            const unshareBlocked = isInsideSharedFolderTree(parentFolderId);

            if (deleteConfig.action === 'unshare' && unshareBlocked) {
                setDeleteConfig({ isOpen: false, type: null, action: null, item: null });
                return;
            }

            if (deleteConfig.action === 'unshare' && unshareFolder && user?.email) {
                try {
                    await unshareFolder(targetId, user.email);
                } catch (error) {
                    console.error('Error unsharing shortcut folder access:', error);
                }
            }

            if (deleteConfig.action === 'hide' && shortcutId && setShortcutHiddenInManual) {
                await setShortcutHiddenInManual(shortcutId, true);
            } else if (deleteConfig.action === 'unhide' && shortcutId && setShortcutHiddenInManual) {
                await setShortcutHiddenInManual(shortcutId, false);
            } else if (deleteConfig.action !== 'unshare' && shortcutId && deleteShortcut) {
                await deleteShortcut(shortcutId);
            }
        }
        setDeleteConfig({ isOpen: false, type: null, action: null, item: null });
    };

    const handleDeleteFolderAll = async () => {
        if (deleteConfig.item) {
            const isFolderOwner = user?.uid ? isOwner(deleteConfig.item, user.uid) : false;
            if (!isFolderOwner) {
                setDeleteConfig({ isOpen: false, type: null, item: null });
                return;
            }
            await deleteFolder(deleteConfig.item.id);
            setManualOrder(prev => ({
                ...prev,
                folders: prev.folders.filter(id => id !== deleteConfig.item.id)
            }));
        }
        setDeleteConfig({ isOpen: false, type: null, item: null });
    };

    const handleDeleteFolderOnly = async () => {
        if (deleteConfig.item) {
            const isFolderOwner = user?.uid ? isOwner(deleteConfig.item, user.uid) : false;
            if (!isFolderOwner) {
                setDeleteConfig({ isOpen: false, type: null, item: null });
                return;
            }
            await deleteFolderOnly(deleteConfig.item.id);
            setManualOrder(prev => ({
                ...prev,
                folders: prev.folders.filter(id => id !== deleteConfig.item.id)
            }));
        }
        setDeleteConfig({ isOpen: false, type: null, item: null });
    };

    const handleSelectSubject = id => {
        touchSubject(id);
        navigate(`/home/subject/${id}`);
    };

    const handleOpenFolder = folder => {
        if (folder && folder.id) {
            const mergedFolders = Array.isArray(filteredFolders) ? filteredFolders : [];
            const shortcutCandidate = mergedFolders.find(f =>
                f?.targetType === 'folder' &&
                (f.targetId === folder.id || (folder?.targetId && f.targetId === folder.targetId))
            );

            const foundInMerged = mergedFolders.find(f => f.id === folder.id);
            const foundInSource = folders.find(f => f.id === folder.id);
            const selectedFolder = shortcutCandidate || foundInMerged || foundInSource || folder;

            setCurrentFolder(selectedFolder || null);
            if (selectedFolder) {
                localStorage.setItem('dlp_last_folderId', selectedFolder.id);
            } else {
                localStorage.removeItem('dlp_last_folderId');
            }
        } else {
            setCurrentFolder(null);
            localStorage.removeItem('dlp_last_folderId');
        }
    };

    const handleShareFolder = async (folderId, email, role) => {
        setFolderModalConfig({
            isOpen: true,
            isEditing: true,
            data: folder,
            currentFolder: null,
            initialTab: 'sharing'
        });
    };

    const toggleGroup = groupName => {
        setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const handleFilterChange = filterType => {
        setActiveFilter(prev => (prev === filterType ? 'all' : filterType));
    };

    const handleDragStartSubject = (a, b) => {
        if (a && typeof a.preventDefault === 'function' && b && typeof b === 'object' && b.id) {
            setDraggedItem(b);
            setDraggedItemType('subject');
        } else if (a && typeof a === 'object' && a.id) {
            setDraggedItem(a);
            setDraggedItemType('subject');
        } else {
            setDraggedItem(null);
            setDraggedItemType(null);
        }
    };

    const handleDragStartFolder = (folder, position) => {
        setDraggedItem(folder);
        setDraggedItemType('folder');
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDraggedItemType(null);
        setDropPosition(null);
    };

    const handleDragOverSubject = (e, position) => {
        e.preventDefault();
        setDropPosition(position);
    };

    const handleDragOverFolder = (e, position) => {
        e.preventDefault();
        setDropPosition(position);
    };

    const handleDropOnFolder = async (draggedId, targetFolderId, type, parentId, ...extraArgs) => {
        console.log('[DND] handleDropOnFolder ENTRY:', {
            draggedId,
            targetFolderId,
            type,
            parentId,
            user,
            extraArgs
        });
        if (!draggedId || !targetFolderId) {
            console.log('[DND] Missing draggedId or targetFolderId:', { draggedId, targetFolderId });
            return;
        }

        try {
            console.log('[DND] handleDropOnFolder called:', { draggedId, targetFolderId, type, user });
            const subject = subjects.find(s => s.id === draggedId);
            if (!subject) {
                console.log('[DND] Subject not found:', draggedId);
                return;
            }
            const userCanEdit = canEdit(subject, user.uid);
            console.log('[DND] handleDropOnFolder permission check:', {
                subject,
                userId: user.uid,
                userCanEdit,
                type
            });
            if (type === 'subject') {
                const subject = subjects.find(s => s.id === draggedId);
                if (!subject) {
                    console.log('[DND] Subject not found:', draggedId);
                    return;
                }
                // Check if user can edit this subject (i.e., owns it or is an editor)
                const userCanEdit = canEdit(subject, user.uid);
                console.log('[DND] userCanEdit:', userCanEdit, 'subject:', subject);
                if (!userCanEdit) {
                    // Shortcuts are created only during sharing, never by drag-and-drop.
                    console.log('[DND] Non-owner cannot move source subject directly without existing shortcut context.');
                } else if (subject.folderId !== targetFolderId) {
                    // User owns or can edit - perform normal move
                    await updateSubject(draggedId, { folderId: targetFolderId });
                    touchSubject(draggedId);
                }
            } else if (type === 'folder') {
                if (draggedId === targetFolderId) {
                    console.log('[DND] Dragged folder is same as target:', draggedId);
                    return;
                }

                const folder = folders.find(f => f.id === draggedId);
                if (!folder) {
                    console.warn('[DND] updateFolder called with invalid folderId:', draggedId);
                    return;
                }

                // Check if user can edit this folder
                const userCanEdit = canEdit(folder, user.uid);

                if (!userCanEdit) {
                    // Shortcuts are created only during sharing, never by drag-and-drop.
                    console.log('[DND] Non-owner cannot move source folder directly without existing shortcut context.');
                } else {
                    // User owns or can edit - check for circular dependency and move
                    if (isDescendant(draggedId, targetFolderId, folders)) {
                        console.warn('🚫 BLOCKED: Circular dependency detected.');
                        return;
                    }
                    await updateFolder(draggedId, { parentId: targetFolderId });
                }
            }
        } catch (error) {
            console.error('❌ Error handling drop:', error);
            alert('Error processing action. Check console for details.');
        }
    };

    const handleNestFolder = async (targetFolderId, folderToNestId) => {
        if (!targetFolderId || !folderToNestId) return;
        if (targetFolderId === folderToNestId) return;

        try {
            if (isDescendant(folderToNestId, targetFolderId, folders)) {
                console.warn('🚫 BLOCKED: Circular dependency detected.');
                return;
            }

            await updateFolder(folderToNestId, { parentId: targetFolderId });
        } catch (error) {
            console.error('❌ Error nesting folder:', error);
            alert('Error nesting folder. Check console for details.');
        }
    };

    const handleDropReorderSubject = (draggedId, fromPosition, toPosition) => {
        if (draggedId === undefined || fromPosition === toPosition) return;
        const getManualKey = (item) => item?.shortcutId || item?.id;

        const currentSubjects = groupedContent[Object.keys(groupedContent)[0]] || [];
        const newOrder = currentSubjects.map(s => getManualKey(s));

        const draggedIndex = newOrder.indexOf(draggedId);
        if (draggedIndex !== -1) {
            newOrder.splice(draggedIndex, 1);
        }

        newOrder.splice(toPosition, 0, draggedId);

        setManualOrder(prev => ({
            ...prev,
            subjects: newOrder
        }));

        handleDragEnd();
    };

    const handleDropReorderFolder = (draggedId, fromPosition, toPosition) => {
        if (draggedId === undefined || fromPosition === toPosition) return;
        const getManualKey = (item) => item?.shortcutId || item?.id;

        const newOrder = orderedFolders.map(f => getManualKey(f));

        const draggedIndex = newOrder.indexOf(draggedId);
        if (draggedIndex !== -1) {
            newOrder.splice(draggedIndex, 1);
        }

        newOrder.splice(toPosition, 0, draggedId);

        setManualOrder(prev => ({
            ...prev,
            folders: newOrder
        }));

        handleDragEnd();
    };

    const handlePreferenceChange = (key, value) => {
        updatePreference(key, value);
    };

    return {
        handleSaveSubject,
        handleSaveFolder,
        handleDelete,
        handleDeleteFolderAll,
        handleDeleteFolderOnly,
        handleSelectSubject,
        handleOpenFolder,
        handleShareFolder,
        toggleGroup,
        handleFilterChange,
        handleDragStartSubject,
        handleDragStartFolder,
        handleDragEnd,
        handleDragOverSubject,
        handleDragOverFolder,
        handleDropOnFolder,
        handleNestFolder,
        handleDropReorderSubject,
        handleDropReorderFolder,
        handlePreferenceChange
    };
};
