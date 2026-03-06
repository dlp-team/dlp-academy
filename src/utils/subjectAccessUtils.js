// src/utils/subjectAccessUtils.js
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const classCache = new Map();
const ROLE_RANK = {
    student: 0,
    teacher: 1,
    institutionadmin: 2,
    admin: 3
};

const sanitizeString = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

const uniqueStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return Array.from(
        new Set(
            value
                .map(item => sanitizeString(item))
                .filter(Boolean)
        )
    );
};

const getNormalizedRole = (userOrRole) => {
    const rawRole = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
    const normalized = typeof rawRole === 'string' ? rawRole.trim().toLowerCase() : 'student';
    return Object.prototype.hasOwnProperty.call(ROLE_RANK, normalized) ? normalized : 'student';
};

const deriveClassId = (payload = {}) => {
    const directClassId = sanitizeString(payload.classId);
    if (directClassId) return directClassId;

    const classIds = uniqueStringArray(payload.classIds);
    return classIds[0] || null;
};

export const generateSubjectInviteCode = (length = 8) => {
    let code = '';
    for (let index = 0; index < length; index += 1) {
        const randomIndex = Math.floor(Math.random() * INVITE_CODE_ALPHABET.length);
        code += INVITE_CODE_ALPHABET[randomIndex];
    }
    return code;
};

export const normalizeSubjectAccessPayload = (payload = {}, { requireCourse = true } = {}) => {
    const course = sanitizeString(payload.course);
    if (requireCourse && !course) {
        throw new Error('El curso es obligatorio para crear la asignatura.');
    }

    const classId = deriveClassId(payload);
    const classIds = uniqueStringArray(payload.classIds);
    const normalizedClassIds = classId
        ? Array.from(new Set([classId, ...classIds]))
        : classIds;

    const inviteCode = sanitizeString(payload.inviteCode) || generateSubjectInviteCode();

    return {
        ...payload,
        ...(course ? { course } : {}),
        classId,
        classIds: normalizedClassIds,
        enrolledStudentUids: uniqueStringArray(payload.enrolledStudentUids),
        inviteCode
    };
};

const getClassData = async (classId) => {
    if (!classId) return null;
    if (classCache.has(classId)) return classCache.get(classId);

    const loadPromise = getDoc(doc(db, 'classes', classId))
        .then((snap) => (snap.exists() ? { id: snap.id, ...snap.data() } : null))
        .catch(() => null);

    classCache.set(classId, loadPromise);
    return loadPromise;
};

const isSharedWithUser = (subject = {}, user = {}) => {
    const uid = user?.uid || null;
    const email = sanitizeString(user?.email).toLowerCase();

    if (uid && Array.isArray(subject.sharedWithUids) && subject.sharedWithUids.includes(uid)) {
        return true;
    }

    if (!Array.isArray(subject.sharedWith)) return false;

    return subject.sharedWith.some((entry) => {
        const entryUid = sanitizeString(entry?.uid);
        const entryEmail = sanitizeString(entry?.email).toLowerCase();
        return (uid && entryUid === uid) || (email && entryEmail === email);
    });
};

export const canUserAccessSubject = async ({ subject, user }) => {
    if (!subject || !user?.uid) return false;

    const role = getNormalizedRole(user);
    const userInstitutionId = sanitizeString(user?.institutionId);
    const subjectInstitutionId = sanitizeString(subject?.institutionId);

    if (
        subjectInstitutionId
        && userInstitutionId
        && role !== 'admin'
        && subjectInstitutionId !== userInstitutionId
    ) {
        return false;
    }

    if (role === 'admin' || role === 'institutionadmin') {
        return true;
    }

    if (subject.ownerId === user.uid || subject.uid === user.uid) {
        return true;
    }

    if (isSharedWithUser(subject, user)) {
        return true;
    }

    const classId = deriveClassId(subject);
    const enrolledStudentUids = uniqueStringArray(subject.enrolledStudentUids);
    const hasClassOrEnrollmentGate = Boolean(classId) || enrolledStudentUids.length > 0;

    // Backward compatibility for legacy subjects while migration is in progress.
    if (!hasClassOrEnrollmentGate) {
        return true;
    }

    if (role === 'teacher') {
        if (!classId) return false;
        const classData = await getClassData(classId);
        if (!classData) return false;

        const teacherId = sanitizeString(classData.teacherId);
        const coTeacherIds = uniqueStringArray(classData.coTeacherIds);
        return teacherId === user.uid || coTeacherIds.includes(user.uid);
    }

    if (role === 'student') {
        if (enrolledStudentUids.includes(user.uid)) {
            return true;
        }

        if (!classId) return false;

        const classData = await getClassData(classId);
        if (!classData) return false;

        const classStudentIds = uniqueStringArray(classData.studentIds);
        return classStudentIds.includes(user.uid);
    }

    return false;
};
