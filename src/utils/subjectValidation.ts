// src/utils/subjectValidation.ts
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface SubjectUniquenessParams {
    name: string;
    course: string;
    institutionId: string;
    academicYear?: string;
    classIds?: string[];
    excludeSubjectId?: string;
}

/**
 * Checks whether a subject with the same (name, course, academicYear, classIds)
 * tuple already exists within the given institution.
 *
 * Returns `true` if unique (no duplicate), `false` if a duplicate exists.
 */
export async function checkSubjectUniqueness(params: SubjectUniquenessParams): Promise<boolean> {
    const {
        name,
        course,
        institutionId,
        academicYear,
        classIds,
        excludeSubjectId,
    } = params;

    const trimmedName = (name || '').trim().toLowerCase();
    const trimmedCourse = (course || '').trim().toLowerCase();

    if (!trimmedName || !trimmedCourse || !institutionId) {
        // Can't determine uniqueness without required fields
        return true;
    }

    const subjectsRef = collection(db, 'subjects');
    const q = query(
        subjectsRef,
        where('institutionId', '==', institutionId),
    );

    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
        if (excludeSubjectId && doc.id === excludeSubjectId) {
            continue;
        }

        const data = doc.data();
        const docName = (data.name || '').trim().toLowerCase();
        const docCourse = (data.course || '').trim().toLowerCase();

        if (docName !== trimmedName || docCourse !== trimmedCourse) {
            continue;
        }

        // Compare academicYear if provided
        const trimmedYear = (academicYear || '').trim().toLowerCase();
        const docYear = (data.academicYear || '').trim().toLowerCase();
        if (trimmedYear !== docYear) {
            continue;
        }

        // Compare classIds if provided (sorted for order-independent comparison)
        const sortedInput = [...(classIds || [])].sort();
        const sortedDoc = [...(data.classIds || [])].sort();
        if (JSON.stringify(sortedInput) !== JSON.stringify(sortedDoc)) {
            continue;
        }

        // All fields match — duplicate found
        return false;
    }

    return true;
}
