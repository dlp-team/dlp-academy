export const useHomeHandlers = ({
    user,
    subjects,
    folders,
    currentFolder,
    viewMode,
    groupedContent,
    orderedFolders,
    subjectModalConfig,
    folderModalConfig,
    deleteConfig,
    setSubjectModalConfig,
    setFolderModalConfig,
    setDeleteConfig,
    setCurrentFolder,
    setViewMode,
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
    updatePreference,
    navigate,
    isDescendant
}) => {
    const handleSaveSubject = async formData => {
        const payload = {
            name: formData.name,
            course: formData.course,
            color: formData.color,
            icon: formData.icon || 'book',
            tags: formData.tags,
            cardStyle: formData.cardStyle || 'default',
            modernFillColor: formData.modernFillColor || null,
            updatedAt: new Date(),
            uid: user.uid,
            isShared: false,
            sharedWith: []
        };

        try {
            if (subjectModalConfig.isEditing) {
                await updateSubject(formData.id, payload);
            } else {
                if (currentFolder) {
                    if (currentFolder.isShared || (currentFolder.sharedWith && currentFolder.sharedWith.length > 0)) {
                        payload.isShared = true;

                        const parentShares = currentFolder.sharedWith || [];
                        const usersToShareWith = new Set(parentShares);

                        if (currentFolder.ownerId && currentFolder.ownerId !== user.uid) {
                            usersToShareWith.add(currentFolder.ownerId);
                        }

                        payload.sharedWith = Array.from(usersToShareWith);
                    }
                }

                const newSubject = await addSubject(payload);
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
        if (folderModalConfig.isEditing) {
            await updateFolder(formData.id, formData);
        } else {
            await addFolder(formData);
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
            await deleteFolder(deleteConfig.item.id);
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
            const found = folders.find(f => f.id === folder.id);
            setCurrentFolder(found || null);
            if (found) {
                localStorage.setItem('dlp_last_folderId', found.id);
            } else {
                localStorage.removeItem('dlp_last_folderId');
            }
        } else {
            setCurrentFolder(null);
            localStorage.removeItem('dlp_last_folderId');
        }
        if (viewMode === 'shared') {
            setViewMode('grid');
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

    const handleDropOnFolder = async (draggedId, targetFolderId, type) => {
        if (!draggedId || !targetFolderId) return;

        try {
            if (type === 'subject') {
                const subject = subjects.find(s => s.id === draggedId);
                if (subject && subject.folderId !== targetFolderId) {
                    await updateSubject(draggedId, { folderId: targetFolderId });
                    touchSubject(draggedId);
                }
            } else if (type === 'folder') {
                if (draggedId === targetFolderId) return;

                if (isDescendant(draggedId, targetFolderId, folders)) {
                    console.warn('🚫 BLOCKED: Circular dependency detected.');
                    return;
                }

                await updateFolder(draggedId, { folderId: targetFolderId });
            }
        } catch (error) {
            console.error('❌ Error moving item:', error);
            alert('Error moving item. Check console for details.');
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

            await updateFolder(folderToNestId, { folderId: targetFolderId });
        } catch (error) {
            console.error('❌ Error nesting folder:', error);
            alert('Error nesting folder. Check console for details.');
        }
    };

    const handleDropReorderSubject = (draggedId, fromPosition, toPosition) => {
        if (draggedId === undefined || fromPosition === toPosition) return;

        const currentSubjects = groupedContent[Object.keys(groupedContent)[0]] || [];
        const newOrder = currentSubjects.map(s => s.id);

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

        const newOrder = orderedFolders.map(f => f.id);

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
