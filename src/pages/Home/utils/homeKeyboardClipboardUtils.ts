// src/pages/Home/utils/homeKeyboardClipboardUtils.ts

const SUBJECT_METADATA_KEYS = [
    'courseId',
    'academicYear',
    'periodType',
    'periodLabel',
    'periodIndex',
    'periodStartAt',
    'periodEndAt',
    'periodExtraordinaryEndAt',
    'postCoursePolicy',
    'level',
    'grade'
];

const pickSubjectMetadata = (subject: any = {}) => (
    SUBJECT_METADATA_KEYS.reduce((accumulator: any, key: any) => {
        if (!Object.prototype.hasOwnProperty.call(subject, key)) {
            return accumulator;
        }

        const value = subject[key];
        if (value === undefined) {
            return accumulator;
        }

        accumulator[key] = value;
        return accumulator;
    }, {})
);

export const buildSubjectClonePayload = (subject, targetFolderId, user: any) => {
    if (!subject) return null;

    const subjectMetadata = pickSubjectMetadata(subject);

    return {
        name: subject.name || 'Asignatura',
        course: subject.course || 'Sin curso',
        ...subjectMetadata,
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

export const buildFolderClonePayload = (folder, targetParentId: any) => {
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
