// src/pages/Home/utils/homeKeyboardClipboardUtils.js

export const buildSubjectClonePayload = (subject, targetFolderId, user) => {
    if (!subject) return null;

    return {
        name: subject.name || 'Asignatura',
        course: subject.course || 'Sin curso',
        color: subject.color || 'from-slate-500 to-slate-700',
        icon: subject.icon || 'book',
        tags: Array.isArray(subject.tags) ? subject.tags : [],
        classId: null,
        classIds: [],
        enrolledStudentUids: [],
        cardStyle: subject.cardStyle || 'default',
        modernFillColor: subject.modernFillColor || null,
        folderId: targetFolderId || null,
        ownerId: user?.uid || null,
        institutionId: subject.institutionId || user?.institutionId || null,
        isShared: false,
        sharedWith: [],
        sharedWithUids: [],
        editorUids: [],
        viewerUids: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

export const buildFolderClonePayload = (folder, targetParentId) => {
    if (!folder) return null;

    return {
        name: folder.name || 'Carpeta',
        color: folder.color || 'from-amber-400 to-amber-600',
        tags: Array.isArray(folder.tags) ? folder.tags : [],
        cardStyle: folder.cardStyle || 'default',
        modernFillColor: folder.modernFillColor || null,
        parentId: targetParentId || null
    };
};
