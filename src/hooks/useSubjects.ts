// src/hooks/useSubjects.ts
import { useState, useEffect, useMemo } from 'react';
import { 
    collection, query, where, getDocs, getDoc, setDoc, updateDoc, deleteDoc, doc, onSnapshot, arrayUnion, arrayRemove, orderBy, serverTimestamp, runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateSubjectInviteCode, normalizeSubjectAccessPayload } from '../utils/subjectAccessUtils';
import { getActiveRole } from '../utils/permissionUtils';
import {
    canTeacherDeleteSubjectsWithStudents,
    canTeacherCreateSubjectsAutonomously,
    DEFAULT_ACCESS_POLICIES,
    normalizeAccessPolicies
} from '../utils/institutionPolicyUtils';
import { DEFAULT_TOPIC_CASCADE_COLLECTIONS, cascadeDeleteTopicResources } from '../utils/topicDeletionUtils';

export const useSubjects = (user: any) => {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [teacherSubjectCreationAllowed, setTeacherSubjectCreationAllowed] = useState(true);
    const currentInstitutionId = user?.institutionId || null;
    const activeRole = getActiveRole(user);
    const canReadHomeData = Boolean(activeRole && user?.displayName);
    const completedSubjectIds = useMemo(
        () => Array.from(new Set(
            (Array.isArray(user?.completedSubjects) ? user.completedSubjects : [])
                .map((subjectId: any) => String(subjectId || '').trim())
                .filter(Boolean)
        )),
        [user?.completedSubjects]
    );
    const debugShare = (stage, payload = {}) => {
        console.info('[SHARE_DEBUG][subject]', {
            ts: new Date().toISOString(),
            stage,
            actorUid: user?.uid || null,
            actorEmail: user?.email || null,
            actorInstitutionId: currentInstitutionId,
            ...payload
        });
    };

    const getInstitutionAccessPolicies = async (institutionId: any) => {
        if (!institutionId) return DEFAULT_ACCESS_POLICIES;

        try {
            const institutionSnapshot = await getDoc(doc(db, 'institutions', institutionId));
            if (!institutionSnapshot.exists()) return DEFAULT_ACCESS_POLICIES;
            return normalizeAccessPolicies(institutionSnapshot.data()?.accessPolicies);
        } catch {
            return DEFAULT_ACCESS_POLICIES;
        }
    };

    const ensureTeacherCanDeleteSubject = async (subjectData: any) => {
        if (activeRole !== 'teacher') return;

        const enrolledStudentUids = Array.isArray(subjectData?.enrolledStudentUids) ? subjectData.enrolledStudentUids : [];
        const classIds = Array.isArray(subjectData?.classIds) ? subjectData.classIds : [];
        const hasAssociatedStudents = enrolledStudentUids.length > 0 || classIds.length > 0;

        if (!hasAssociatedStudents) return;

        const policies = await getInstitutionAccessPolicies(subjectData?.institutionId || currentInstitutionId);
        if (canTeacherDeleteSubjectsWithStudents(policies)) return;

        throw new Error('No puedes eliminar una asignatura con estudiantes asociados sin autorización del administrador de la institución.');
    };

    const ensureTeacherCanCreateSubject = async (institutionId: any) => {
        if (activeRole !== 'teacher') return;

        const policies = await getInstitutionAccessPolicies(institutionId || currentInstitutionId);
        if (canTeacherCreateSubjectsAutonomously(policies)) return;

        throw new Error('La administración de tu institución desactivó la creación autónoma de asignaturas para docentes.');
    };

    useEffect(() => {
        let active = true;

        const resolveTeacherCreationPolicy = async () => {
            if (activeRole !== 'teacher') {
                if (active) setTeacherSubjectCreationAllowed(true);
                return;
            }

            const policies = await getInstitutionAccessPolicies(currentInstitutionId);
            if (!active) return;

            setTeacherSubjectCreationAllowed(canTeacherCreateSubjectsAutonomously(policies));
        };

        resolveTeacherCreationPolicy().catch(() => {
            if (active) setTeacherSubjectCreationAllowed(true);
        });

        return () => {
            active = false;
        };
    }, [user?.uid, activeRole, currentInstitutionId]);


    useEffect(() => {
        if (!user || !canReadHomeData) {
            setSubjects([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const normalizedRole = activeRole;
        const studentClassIds = Array.from(
            new Set(
                [
                    ...(Array.isArray(user?.classIds) ? user.classIds : []),
                    user?.classId
                ]
                    .map(classId => String(classId || '').trim())
                    .filter(Boolean)
            )
        );

        // 1. Query subjects created by the user (Owned)
        const ownedQuery = query(
            collection(db, "subjects"), 
            where("ownerId", "==", user.uid)
        );

        let ownedSubjects: any[] = [];
        let sharedSubjects: any[] = [];
        let classMatchedSubjects: any[] = [];
        let enrolledSubjects: any[] = [];

        const updateSubjectsState = async () => {
            const merged = [...ownedSubjects, ...sharedSubjects, ...classMatchedSubjects, ...enrolledSubjects];
            const dedupMap = new Map<any, any>();

            merged.forEach(subject => {
                const existing = dedupMap.get(subject.id);
                if (!existing || subject.isOwner === true) {
                    dedupMap.set(subject.id, subject);
                }
            });

            const tempSubjects = Array.from(dedupMap.values()).filter(subject => {
                // Filter out trashed items (soft deleted)
                if (subject?.status === 'trashed') return false;
                // Owner always sees their own subjects
                if (subject?.ownerId === user?.uid) return true;
                // For institutional subjects, check institution match
                if (!currentInstitutionId || !subject?.institutionId) return true;
                return subject.institutionId === currentInstitutionId;
            });

            setSubjects((prevSubjects) => tempSubjects.map((subject: any) => {
                const previousMatch = Array.isArray(prevSubjects)
                    ? prevSubjects.find(prevSubject => prevSubject?.id === subject?.id)
                    : null;

                if (Array.isArray(previousMatch?.topics)) {
                    return { ...subject, topics: previousMatch.topics };
                }

                return { ...subject, topics: [] };
            }));

            setLoading(false);

            // Load topics for all subjects
            const subjectsWithTopics = await Promise.all(tempSubjects.map(async (subject: any) => {
                try {
                    const topicsRef = query(
                        collection(db, "topics"),
                        where("subjectId", "==", subject.id),
                        orderBy("order", "asc")
                    );
                    const topicsSnap = await getDocs(topicsRef);
                    const topicsList = topicsSnap.docs.map(t => ({ id: t.id, ...t.data() }));
                    return { ...subject, topics: topicsList };
                } catch (e) {
                    console.warn(`Failed to load topics for subject ${subject.id}`, e);
                    return { ...subject, topics: [] };
                }
            }));

            setSubjects(subjectsWithTopics);
        };

        // Real-time listener for owned subjects
        const unsubscribeOwned = onSnapshot(ownedQuery, (snapshot: any) => {
            ownedSubjects = snapshot.docs.map(d => ({ id: d.id, ...d.data(), isOwner: true }));
            updateSubjectsState();
        }, (error: any) => {
            console.error("Error listening to owned subjects:", error);
            ownedSubjects = [];
            updateSubjectsState();
        });

        const sharedQuery = query(
            collection(db, "subjects"),
            where("sharedWithUids", "array-contains", user.uid)
        );

        const unsubscribeShared = onSnapshot(sharedQuery, (snapshot: any) => {
            const userEmail = user.email?.toLowerCase() || '';
            sharedSubjects = snapshot.docs
                .filter(d => {
                    const data = d.data() || {};
                    if (data?.ownerId === user?.uid) return false;
                    if (currentInstitutionId && data?.institutionId && data.institutionId !== currentInstitutionId) {
                        return false;
                    }

                    const byUid = Array.isArray(data.sharedWithUids) && data.sharedWithUids.includes(user.uid);
                    const bySharedWith = Array.isArray(data.sharedWith) && data.sharedWith.some(share =>
                        share?.uid === user.uid || share?.email?.toLowerCase() === userEmail
                    );

                    return byUid || bySharedWith;
                })
                .map(d => ({ id: d.id, ...d.data(), isOwner: false }));
            updateSubjectsState();
        }, (error: any) => {
            console.error("Error listening to shared subjects:", error);
            sharedSubjects = [];
            updateSubjectsState();
        });

        let unsubscribeClassMatched: any = () => {};
        if (normalizedRole === 'student' && studentClassIds.length > 0) {
            const classConstraint = studentClassIds.length === 1
                ? where('classId', '==', studentClassIds[0])
                : where('classId', 'in', studentClassIds.slice(0, 10));

            const classMatchedQuery = query(
                collection(db, 'subjects'),
                classConstraint
            );

            unsubscribeClassMatched = onSnapshot(classMatchedQuery, (snapshot: any) => {
                classMatchedSubjects = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data(), isOwner: false }))
                    .filter(subject => {
                        if (subject?.ownerId === user?.uid) return false;
                        if (currentInstitutionId && subject?.institutionId && subject.institutionId !== currentInstitutionId) {
                            return false;
                        }
                        return true;
                    });
                updateSubjectsState();
            }, () => {
                classMatchedSubjects = [];
                updateSubjectsState();
            });
        }

        let unsubscribeEnrolled: any = () => {};
        if (normalizedRole === 'student') {
            const enrolledQuery = query(
                collection(db, 'subjects'),
                where('enrolledStudentUids', 'array-contains', user.uid)
            );

            unsubscribeEnrolled = onSnapshot(enrolledQuery, (snapshot: any) => {
                enrolledSubjects = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data(), isOwner: false }))
                    .filter(subject => {
                        if (subject?.ownerId === user?.uid) return false;
                        if (currentInstitutionId && subject?.institutionId && subject.institutionId !== currentInstitutionId) {
                            return false;
                        }
                        return true;
                    });
                updateSubjectsState();
            }, () => {
                enrolledSubjects = [];
                updateSubjectsState();
            });
        }

        return () => {
            unsubscribeOwned();
            unsubscribeShared();
            unsubscribeClassMatched();
            unsubscribeEnrolled();
        };
    }, [user, currentInstitutionId, canReadHomeData, activeRole]);

    const addSubject = async (payload: any) => {
        const normalizedPayload: any = normalizeSubjectAccessPayload(payload, { requireCourse: true });
        const targetInstitutionId = normalizedPayload?.institutionId || currentInstitutionId || null;

        if (!targetInstitutionId && !user?.uid) {
            throw new Error('No se pudo resolver la institucion para crear la asignatura.');
        }

        await ensureTeacherCanCreateSubject(targetInstitutionId);

        let inviteCode = generateSubjectInviteCode();
        let createdSubjectId: any = null;

        for (let attempt = 0; attempt < 10; attempt += 1) {
            const subjectRef = doc(collection(db, 'subjects'));
            const inviteCodeKey = `${targetInstitutionId || 'global'}_${inviteCode}`;
            const inviteCodeRef = doc(db, 'subjectInviteCodes', inviteCodeKey);

            try {
                await runTransaction(db, async (transaction: any) => {
                    const inviteCodeSnapshot = await transaction.get(inviteCodeRef);
                    if (inviteCodeSnapshot.exists()) {
                        const collisionError: any = new Error('INVITE_CODE_COLLISION');
                        collisionError.code = 'invite-code-collision';
                        throw collisionError;
                    }

                    transaction.set(inviteCodeRef, {
                        inviteCode,
                        institutionId: targetInstitutionId,
                        subjectId: subjectRef.id,
                        createdBy: normalizedPayload?.ownerId || user.uid,
                        createdAt: new Date()
                    });

                    transaction.set(subjectRef, {
                        ...normalizedPayload,
                        inviteCode,
                        inviteCodeEnabled: normalizedPayload?.inviteCodeEnabled !== false,
                        inviteCodeRotationIntervalHours: Number(normalizedPayload?.inviteCodeRotationIntervalHours || 24),
                        inviteCodeLastRotatedAt: new Date(),
                        ownerId: normalizedPayload?.ownerId || user.uid,
                        institutionId: targetInstitutionId,
                        enrolledStudentUids: Array.isArray(normalizedPayload?.enrolledStudentUids)
                            ? normalizedPayload.enrolledStudentUids
                            : []
                    });
                });

                createdSubjectId = subjectRef.id;
                break;
            } catch (error: any) {
                const isCollision =
                    error?.code === 'invite-code-collision'
                    || String(error?.message || '').includes('INVITE_CODE_COLLISION');

                if (!isCollision) {
                    throw error;
                }

                inviteCode = generateSubjectInviteCode();
            }
        }

        if (!createdSubjectId) {
            throw new Error('No se pudo generar un codigo de invitacion unico. Intentalo de nuevo.');
        }

        // Return the ID explicitly to handle the folder link correctly
        return createdSubjectId;
    };

    const setSubjectCompletion = async (subjectId: any, completed = true) => {
        const normalizedSubjectId = String(subjectId || '').trim();
        if (!normalizedSubjectId) {
            throw new Error('No se pudo resolver la asignatura para actualizar su estado.');
        }

        if (!user?.uid) {
            throw new Error('Debes iniciar sesion para actualizar el estado de una asignatura.');
        }

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            completedSubjects: completed
                ? arrayUnion(normalizedSubjectId)
                : arrayRemove(normalizedSubjectId),
            updatedAt: new Date()
        });
    };

    const joinSubjectByInviteCode = async (inviteCodeInput: any) => {
        if (!user?.uid) {
            throw new Error('Debes iniciar sesion para unirte a una asignatura.');
        }

        const normalizedInviteCode = String(inviteCodeInput || '').trim().toUpperCase();
        if (!normalizedInviteCode) {
            throw new Error('Debes ingresar un codigo de invitacion valido.');
        }

        const inviteCodeKey = `${currentInstitutionId || 'global'}_${normalizedInviteCode}`;
        const inviteCodeRef = doc(db, 'subjectInviteCodes', inviteCodeKey);
        const inviteCodeSnap = await getDoc(inviteCodeRef);

        if (!inviteCodeSnap.exists()) {
            throw new Error('El codigo de invitacion no existe o no esta disponible.');
        }

        const inviteData = inviteCodeSnap.data() || {};
        const subjectId = String(inviteData.subjectId || '').trim();

        if (!subjectId) {
            throw new Error('El codigo de invitacion es invalido.');
        }

        const inviteInstitutionId = inviteData?.institutionId || null;
        if (
            currentInstitutionId
            && inviteInstitutionId
            && inviteInstitutionId !== currentInstitutionId
            && activeRole !== 'admin'
        ) {
            throw new Error('El codigo pertenece a otra institucion.');
        }

        const subjectRef = doc(db, 'subjects', subjectId);
        const subjectSnap = await getDoc(subjectRef);

        if (!subjectSnap.exists()) {
            throw new Error('La asignatura asociada al codigo no existe.');
        }

        const subjectData = subjectSnap.data() || {};
        if (subjectData?.status === 'trashed') {
            throw new Error('La asignatura asociada al codigo ya no esta disponible.');
        }

        if (subjectData?.inviteCodeEnabled === false) {
            throw new Error('El acceso por código de invitación está deshabilitado por el docente.');
        }

        const normalizedEmail = String(user?.email || '').toLowerCase().trim();
        const sharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];
        const sharedWithEntries = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
        const enrolledStudentUids = Array.isArray(subjectData.enrolledStudentUids) ? subjectData.enrolledStudentUids : [];

        const alreadyOwner = subjectData.ownerId === user.uid || subjectData.uid === user.uid;
        const alreadySharedByUid = sharedWithUids.includes(user.uid);
        const alreadySharedByEntry = sharedWithEntries.some(entry =>
            entry?.uid === user.uid || (normalizedEmail && String(entry?.email || '').toLowerCase() === normalizedEmail)
        );
        const alreadyEnrolled = enrolledStudentUids.includes(user.uid);

        if (alreadyOwner || alreadySharedByUid || alreadySharedByEntry || alreadyEnrolled) {
            return { subjectId, alreadyJoined: true };
        }

        const activeInviteCode = String(subjectData?.inviteCode || '').trim().toUpperCase();
        if (activeInviteCode && activeInviteCode !== normalizedInviteCode) {
            throw new Error('Este código ya no es válido. Solicita el código actualizado al docente.');
        }

        const rotationIntervalHours = Math.min(168, Math.max(1, Number(subjectData?.inviteCodeRotationIntervalHours || 24)));
        const lastRotationValue = subjectData?.inviteCodeLastRotatedAt || subjectData?.updatedAt || subjectData?.createdAt;
        const lastRotationDate = lastRotationValue?.toDate ? lastRotationValue.toDate() : (lastRotationValue ? new Date(lastRotationValue) : null);
        if (lastRotationDate && Number.isFinite(lastRotationDate.getTime())) {
            const nowMs = Date.now();
            const elapsedMs = nowMs - lastRotationDate.getTime();
            const maxAgeMs = rotationIntervalHours * 60 * 60 * 1000;
            if (elapsedMs > maxAgeMs) {
                throw new Error('El código de invitación expiró. Solicita el código actualizado al docente.');
            }
        }

        const shareEntry = {
            uid: user.uid,
            email: normalizedEmail,
            role: 'viewer',
            canEdit: false,
            shareOrigin: 'invite-code',
            sharedAt: new Date()
        };
        const normalizedUserRole = activeRole;

        const subjectUpdatePayload: any = {
            sharedWithUids: arrayUnion(user.uid),
            isShared: true,
            updatedAt: new Date()
        };

        if (normalizedUserRole === 'student') {
            subjectUpdatePayload.enrolledStudentUids = arrayUnion(user.uid);
        } else {
            subjectUpdatePayload.sharedWith = arrayUnion(shareEntry);
        }

        await updateDoc(subjectRef, subjectUpdatePayload);

        const shortcutId = `${user.uid}_${subjectId}_subject`;
        const shortcutRef = doc(db, 'shortcuts', shortcutId);
        await setDoc(shortcutRef, {
            ownerId: user.uid,
            parentId: null,
            targetId: subjectId,
            targetType: 'subject',
            institutionId: subjectData?.institutionId || inviteInstitutionId || currentInstitutionId || null,
            hiddenInManual: false,
            shortcutName: subjectData?.name || 'Asignatura',
            shortcutCourse: subjectData?.course || null,
            shortcutTags: Array.isArray(subjectData?.tags) ? subjectData.tags : [],
            shortcutColor: subjectData?.color || 'from-slate-500 to-slate-700',
            shortcutIcon: subjectData?.icon || 'book',
            shortcutCardStyle: subjectData?.cardStyle || 'default',
            shortcutModernFillColor: subjectData?.modernFillColor ?? subjectData?.fillColor ?? null,
            createdAt: new Date(),
            updatedAt: new Date()
        }, { merge: true });

        return { subjectId, alreadyJoined: false };
    };

    const updateSubject = async (id, payload: any) => {
        const subjectRef = doc(db, "subjects", id);
        const currentSnap = await getDoc(subjectRef);
        const currentData = currentSnap.exists() ? (currentSnap.data() || {}) : {};
        const updatePayload = { ...payload };

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'course')) {
            const courseValue = String(updatePayload.course || '').trim();
            if (!courseValue) {
                throw new Error('El curso es obligatorio para la asignatura.');
            }
            updatePayload.course = courseValue;
        }

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'courseId')) {
            const courseIdValue = String(updatePayload.courseId || '').trim();
            updatePayload.courseId = courseIdValue || null;
        }

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'academicYear')) {
            const academicYearValue = String(updatePayload.academicYear || '').trim();
            updatePayload.academicYear = academicYearValue || null;
        }

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'classIds') && !Object.prototype.hasOwnProperty.call(updatePayload, 'classId')) {
            const firstClassId = Array.isArray(updatePayload.classIds)
                ? String(updatePayload.classIds[0] || '').trim()
                : '';
            updatePayload.classId = firstClassId || null;
        }

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'classId')) {
            const classId = String(updatePayload.classId || '').trim();
            updatePayload.classId = classId || null;
        }

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'enrolledStudentUids')) {
            updatePayload.enrolledStudentUids = Array.isArray(updatePayload.enrolledStudentUids)
                ? Array.from(new Set(updatePayload.enrolledStudentUids.filter(Boolean).map(uid => String(uid).trim())))
                : [];
        }

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'inviteCode')) {
            const inviteCode = String(updatePayload.inviteCode || '').trim();
            updatePayload.inviteCode = inviteCode || generateSubjectInviteCode();
            updatePayload.inviteCodeLastRotatedAt = new Date();
        }

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'inviteCodeEnabled')) {
            updatePayload.inviteCodeEnabled = updatePayload.inviteCodeEnabled !== false;
        }

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'inviteCodeRotationIntervalHours')) {
            const parsedRotation = Number(updatePayload.inviteCodeRotationIntervalHours);
            updatePayload.inviteCodeRotationIntervalHours = Number.isFinite(parsedRotation)
                ? Math.min(168, Math.max(1, Math.floor(parsedRotation)))
                : 24;
        }

        await updateDoc(subjectRef, updatePayload);

        const didChangeInviteCode = Object.prototype.hasOwnProperty.call(updatePayload, 'inviteCode')
            && String(updatePayload.inviteCode || '').trim().length > 0;

        if (didChangeInviteCode) {
            const institutionId = updatePayload?.institutionId || currentData?.institutionId || currentInstitutionId || null;
            if (institutionId) {
                try {
                    const nextInviteCode = String(updatePayload.inviteCode).trim().toUpperCase();
                    const nextInviteCodeKey = `${institutionId}_${nextInviteCode}`;
                    await setDoc(doc(db, 'subjectInviteCodes', nextInviteCodeKey), {
                        inviteCode: nextInviteCode,
                        institutionId,
                        subjectId: id,
                        createdBy: currentData?.ownerId || user?.uid || null,
                        createdAt: new Date()
                    }, { merge: true });

                    const previousInviteCode = String(currentData?.inviteCode || '').trim().toUpperCase();
                    if (previousInviteCode && previousInviteCode !== nextInviteCode) {
                        const previousInviteCodeKey = `${institutionId}_${previousInviteCode}`;
                        await deleteDoc(doc(db, 'subjectInviteCodes', previousInviteCodeKey)).catch(() => {
                            // Best-effort cleanup for old mappings.
                        });
                    }
                } catch (inviteCodeSyncError) {
                    console.warn('Invite code mapping sync failed after subject update:', inviteCodeSyncError);
                }
            }
        }

        setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updatePayload } : s));
    };

    const deleteSubject = async (id: any) => {
        const subjectRef = doc(db, "subjects", id);
        const subjectSnap = await getDoc(subjectRef);

        if (!subjectSnap.exists()) {
            throw new Error('Subject not found');
        }

        const subjectData = subjectSnap.data() || {};
        await ensureTeacherCanDeleteSubject(subjectData);
        const sharedWithUids = Array.isArray(subjectData.sharedWithUids)
            ? subjectData.sharedWithUids.filter(uid => uid && uid !== user?.uid)
            : [];

        // Mark recipient shortcuts so they render as "eliminada" once access is revoked.
        const shortcutHintUpdates = sharedWithUids.map(targetUid => {
            const shortcutId = `${targetUid}_${id}_subject`;
            return updateDoc(doc(db, 'shortcuts', shortcutId), {
                orphanReason: 'deleted-by-owner',
                orphanedAt: serverTimestamp(),
                updatedAt: new Date()
            }).catch(() => {
                // Best effort: missing/unauthorized shortcut docs should not block trashing.
            });
        });

        await Promise.allSettled(shortcutHintUpdates);

        // Soft delete + force unshare, so recipients lose live access immediately.
        await updateDoc(subjectRef, {
            status: 'trashed',
            trashedAt: serverTimestamp(),
            isShared: false,
            sharedWith: [],
            sharedWithUids: [],
            updatedAt: new Date()
        });

        setSubjects(prev => prev.filter(s => s.id !== id));
    };

    const touchSubject = async (id: any) => {
        // Fire and forget update for "Usage" view sorting
        try {
            const subjectRef = doc(db, "subjects", id);
            await updateDoc(subjectRef, { 
                lastAccessed: new Date() 
            });
        } catch (e) {
            console.error("Error updating lastAccessed", e);
        }
    };

    const shareSubject = async (subjectId, email, role = 'viewer') => {
        try {
            const emailLower = email.toLowerCase();
            const normalizedRole = role === 'editor' ? 'editor' : 'viewer';
            debugShare('start', { subjectId, email: emailLower, role: normalizedRole });
            if (user?.email?.toLowerCase() === emailLower) {
                throw new Error("No puedes compartir contigo mismo.");
            }
            // 1. Find the user UID by email from your 'users' collection
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', emailLower));
            const querySnapshot = await getDocs(q);

            let targetUid: any = null;

            if (!querySnapshot.empty) {
                targetUid = querySnapshot.docs[0].id;
                const targetUserData = querySnapshot.docs[0].data() || {};
                const targetInstitutionId = targetUserData.institutionId || null;
                const targetRole = (targetUserData.role || '').toLowerCase();
                debugShare('user_lookup_success', { subjectId, targetUid, targetInstitutionId });
                if (targetInstitutionId && targetInstitutionId !== currentInstitutionId) {
                    throw new Error("No puedes compartir entre instituciones diferentes.");
                }
                if (targetRole === 'student') {
                    throw new Error('Los estudiantes se asignan por clases. No se permite compartir asignaturas directamente a alumnos.');
                }
            } else {
                debugShare('user_lookup_fail', { subjectId, email: emailLower });
                throw new Error("No existe ningún usuario registrado con ese correo.");
            }

            // 2. Get the current subject to check if already shared
            const subjectRef = doc(db, 'subjects', subjectId);
            const subjectSnap = await getDoc(subjectRef);

            if (!subjectSnap.exists()) {
                throw new Error("No se encontró la asignatura.");
            }

            const subjectData = subjectSnap.data() || {};

            if (subjectData.ownerId && subjectData.ownerId === targetUid) {
                throw new Error("No puedes compartir con el propietario.");
            }

            if (targetUid === user?.uid) {
                throw new Error("No puedes compartir contigo mismo.");
            }

            // Check if already shared with this user (idempotent behavior)
            const alreadyShared =
                (Array.isArray(subjectData.sharedWithUids) && subjectData.sharedWithUids.includes(targetUid)) ||
                (Array.isArray(subjectData.sharedWith) && subjectData.sharedWith.some(entry => entry.uid === targetUid));

            const currentSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
            const existingShare = currentSharedWith.find(entry => entry.uid === targetUid);

            // 3. Build share data
            const shareData = {
                email: emailLower,
                uid: targetUid,
                role: normalizedRole,
                canEdit: normalizedRole === 'editor',
                shareOrigin: 'direct',
                sharedAt: new Date()
            };

            const originalSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
            const originalSharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];
            let sourceUpdated = false;

            // 4. Update source sharing only if needed
            if (!alreadyShared) {
                try {
                    await updateDoc(subjectRef, {
                        sharedWith: arrayUnion(shareData),
                        sharedWithUids: arrayUnion(targetUid),
                        isShared: true,
                        updatedAt: new Date()
                    });
                    sourceUpdated = true;
                    debugShare('subject_source_updated_new_share', { subjectId, targetUid });
                } catch (err: any) {
                    debugShare('subject_source_update_fail', {
                        subjectId,
                        targetUid,
                        errorCode: err?.code || null,
                        errorMessage: err?.message || String(err)
                    });
                    throw err;
                }
            } else if ((existingShare?.role || 'viewer') !== normalizedRole) {
                const updatedSharedWith = currentSharedWith.map(entry =>
                    entry.uid === targetUid
                        ? {
                            ...entry,
                            role: normalizedRole,
                            canEdit: normalizedRole === 'editor'
                        }
                        : entry
                );

                await updateDoc(subjectRef, {
                    sharedWith: updatedSharedWith,
                    updatedAt: new Date()
                });
                debugShare('subject_source_updated_role', { subjectId, targetUid, role: normalizedRole });
            }

            // 5. Ensure shortcut exists for the recipient (deterministic upsert, avoids query/index/rules read issues)
            try {
                const shortcutId = `${targetUid}_${subjectId}_subject`;
                const shortcutRef = doc(db, 'shortcuts', shortcutId);
                const shortcutInstitutionId = subjectData?.institutionId || currentInstitutionId || null;
                const shortcutUpdatePayload = {
                    ownerId: targetUid,
                    targetId: subjectId,
                    targetType: 'subject',
                    institutionId: shortcutInstitutionId,
                    shortcutName: subjectData?.name || 'Asignatura',
                    shortcutCourse: subjectData?.course || null,
                    shortcutTags: Array.isArray(subjectData?.tags) ? subjectData.tags : [],
                    shortcutColor: subjectData?.color || 'from-slate-500 to-slate-700',
                    shortcutIcon: subjectData?.icon || 'book',
                    shortcutCardStyle: subjectData?.cardStyle || 'default',
                    shortcutModernFillColor: subjectData?.modernFillColor ?? subjectData?.fillColor ?? null,
                    updatedAt: new Date()
                };

                try {
                    await updateDoc(shortcutRef, shortcutUpdatePayload);
                    debugShare('shortcut_upsert_updated_existing', { subjectId, targetUid, shortcutId });
                } catch (updateShortcutError: any) {
                    const updateCode = updateShortcutError?.code || '';
                    const updateMessage = String(updateShortcutError?.message || '').toLowerCase();
                    const isNotFound =
                        updateCode === 'not-found' ||
                        updateCode === 'firestore/not-found' ||
                        updateMessage.includes('not found') ||
                        updateMessage.includes('no document');
                    const isPermissionDenied =
                        updateCode === 'permission-denied' ||
                        updateCode === 'firestore/permission-denied' ||
                        updateMessage.includes('permission') ||
                        updateMessage.includes('insufficient permissions');

                    debugShare('shortcut_update_fail', {
                        subjectId,
                        targetUid,
                        shortcutId,
                        errorCode: updateCode,
                        errorMessage: updateShortcutError?.message || String(updateShortcutError),
                        isNotFound,
                        isPermissionDenied
                    });

                    if (!isNotFound && !isPermissionDenied) {
                        throw updateShortcutError;
                    }

                    const shortcutCreatePayload = {
                        ownerId: targetUid,
                        parentId: null,
                        targetId: subjectId,
                        targetType: 'subject',
                        institutionId: shortcutInstitutionId,
                        shortcutName: subjectData?.name || 'Asignatura',
                        shortcutCourse: subjectData?.course || null,
                        shortcutTags: Array.isArray(subjectData?.tags) ? subjectData.tags : [],
                        shortcutColor: subjectData?.color || 'from-slate-500 to-slate-700',
                        shortcutIcon: subjectData?.icon || 'book',
                        shortcutCardStyle: subjectData?.cardStyle || 'default',
                        shortcutModernFillColor: subjectData?.modernFillColor ?? subjectData?.fillColor ?? null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    await setDoc(shortcutRef, shortcutCreatePayload);
                    debugShare('shortcut_upsert_created_missing', { subjectId, targetUid, shortcutId, shortcutInstitutionId });
                }
            } catch (shortcutError: any) {
                debugShare('shortcut_upsert_fail', {
                    subjectId,
                    targetUid,
                    sourceUpdated,
                    errorCode: shortcutError?.code || null,
                    errorMessage: shortcutError?.message || String(shortcutError)
                });
                if (sourceUpdated) {
                    try {
                        await updateDoc(subjectRef, {
                            sharedWith: originalSharedWith,
                            sharedWithUids: originalSharedWithUids,
                            isShared: originalSharedWithUids.length > 0,
                            updatedAt: new Date()
                        });
                    } catch (rollbackError: any) {
                        console.error('Subject share rollback failed:', rollbackError);
                    }
                    throw new Error('No se pudo crear el acceso directo. Se revirtió el compartido.');
                }
                throw shortcutError;
            }
            debugShare('success', { subjectId, targetUid, alreadyShared });
            return {
                ...shareData,
                alreadyShared,
                roleUpdated: alreadyShared && (existingShare?.role || 'viewer') !== normalizedRole
            };

        } catch (error: any) {
            debugShare('fail', {
                subjectId,
                email,
                errorCode: error?.code || null,
                errorMessage: error?.message || String(error)
            });
            throw error;
        }
    };

    const unshareSubject = async (subjectId, email: any) => {
        try {
            const emailLower = email.toLowerCase();
            
            // 1. Find the user UID for this email
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', emailLower));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.error("User not found to unshare");
                return;
            }
            const targetUid = querySnapshot.docs[0].id;

            // 2. Update the subject
            const subjectRef = doc(db, 'subjects', subjectId);
            const subjectSnap = await getDoc(subjectRef);
            if (!subjectSnap.exists()) {
                console.error("Subject not found to unshare");
                return;
            }

            const subjectData = subjectSnap.data() || {};
            const currentSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
            const currentSharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];

            const newSharedWith = currentSharedWith.filter(u =>
                u.uid !== targetUid && u.email?.toLowerCase() !== emailLower
            );
            const newSharedWithUids = currentSharedWithUids.filter(uid => uid !== targetUid);

            await updateDoc(subjectRef, {
                sharedWith: newSharedWith,
                sharedWithUids: newSharedWithUids,
                isShared: newSharedWithUids.length > 0,
                updatedAt: new Date()
            });

            return true;

        } catch (error) {
            console.error("Error unsharing subject:", error);
            throw error;
        }
    };

    const transferSubjectOwnership = async (subjectId, nextOwnerEmail: any) => {
        try {
            const normalizedEmail = String(nextOwnerEmail || '').trim().toLowerCase();
            if (!normalizedEmail) {
                throw new Error('Debes seleccionar un usuario válido para transferir la propiedad.');
            }

            if (normalizedEmail === (user?.email || '').toLowerCase()) {
                throw new Error('No puedes transferir la propiedad a tu propio usuario.');
            }

            const subjectRef = doc(db, 'subjects', subjectId);
            const subjectSnap = await getDoc(subjectRef);

            if (!subjectSnap.exists()) {
                throw new Error('No se encontró la asignatura.');
            }

            const subjectData = subjectSnap.data() || {};
            const currentOwnerUid = subjectData?.ownerId || null;

            if (!currentOwnerUid || currentOwnerUid !== user?.uid) {
                throw new Error('Solo el propietario actual puede transferir la propiedad.');
            }

            const currentSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
            const currentSharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];
            const recipientShareEntry = currentSharedWith.find(entry => (entry?.email || '').toLowerCase() === normalizedEmail);
            const nextOwnerUid = recipientShareEntry?.uid || null;

            if (!nextOwnerUid || !currentSharedWithUids.includes(nextOwnerUid)) {
                throw new Error('Solo puedes transferir la propiedad a un usuario que ya tenga acceso compartido.');
            }

            const updatedSharedWith = currentSharedWith
                .filter(entry => entry?.uid !== nextOwnerUid && (entry?.email || '').toLowerCase() !== normalizedEmail);
            const updatedSharedWithUids = currentSharedWithUids.filter(uid => uid !== nextOwnerUid);

            const currentOwnerEmail = (user?.email || subjectData?.ownerEmail || '').toLowerCase();
            const hasCurrentOwnerShare = updatedSharedWith.some(entry =>
                entry?.uid === currentOwnerUid || (entry?.email || '').toLowerCase() === currentOwnerEmail
            );

            if (!hasCurrentOwnerShare) {
                updatedSharedWith.push({
                    uid: currentOwnerUid,
                    email: currentOwnerEmail,
                    role: 'editor',
                    canEdit: true,
                    shareOrigin: 'ownership-transfer',
                    sharedAt: new Date()
                });
                if (!updatedSharedWithUids.includes(currentOwnerUid)) {
                    updatedSharedWithUids.push(currentOwnerUid);
                }
            }

            const subjectUpdatePayload = {
                ownerId: nextOwnerUid,
                ownerEmail: recipientShareEntry?.email || normalizedEmail,
                ownerName: recipientShareEntry?.displayName || recipientShareEntry?.name || '',
                sharedWith: updatedSharedWith,
                sharedWithUids: updatedSharedWithUids,
                isShared: updatedSharedWithUids.length > 0,
                updatedAt: new Date()
            };

            await updateDoc(subjectRef, subjectUpdatePayload);

            const currentOwnerShortcutId = `${currentOwnerUid}_${subjectId}_subject`;
            const currentOwnerShortcutRef = doc(db, 'shortcuts', currentOwnerShortcutId);
            await setDoc(currentOwnerShortcutRef, {
                ownerId: currentOwnerUid,
                parentId: subjectData?.folderId ?? null,
                targetId: subjectId,
                targetType: 'subject',
                institutionId: subjectData?.institutionId || currentInstitutionId || null,
                hiddenInManual: false,
                shortcutName: subjectData?.name || 'Asignatura',
                shortcutCourse: subjectData?.course || null,
                shortcutTags: Array.isArray(subjectData?.tags) ? subjectData.tags : [],
                shortcutColor: subjectData?.color || 'from-slate-500 to-slate-700',
                shortcutIcon: subjectData?.icon || 'book',
                shortcutCardStyle: subjectData?.cardStyle || 'default',
                shortcutModernFillColor: subjectData?.modernFillColor ?? subjectData?.fillColor ?? null,
                updatedAt: new Date(),
                createdAt: new Date()
            }, { merge: true });

            return {
                success: true,
                previousOwnerUid: currentOwnerUid,
                newOwnerUid: nextOwnerUid,
                newOwnerEmail: normalizedEmail
            };
        } catch (error) {
            console.error('Error transferring subject ownership:', error);
            throw error;
        }
    };

    const getTrashedSubjects = async () => {
        try {
            if (!user || !canReadHomeData) return [];
            
            const q = query(
                collection(db, "subjects"),
                where("ownerId", "==", user.uid),
                where("status", "==", "trashed")
            );
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error fetching trashed subjects:", error);
            return [];
        }
    };

    const restoreSubject = async (id: any) => {
        try {
            const subjectRef = doc(db, "subjects", id);
            await updateDoc(subjectRef, {
                status: 'active',
                restoredAt: serverTimestamp(),
                trashedAt: null
            });
        } catch (error) {
            console.error("Error restoring subject:", error);
            throw error;
        }
    };

    const permanentlyDeleteSubject = async (id: any) => {
        try {
            // Get subject details first to verify ownership and institution
            const subjectRef = doc(db, "subjects", id);
            const subjectSnap = await getDoc(subjectRef);
            
            if (!subjectSnap.exists()) {
                throw new Error('Subject not found');
            }
            
            const subjectData = subjectSnap.data();
            const isOwner = subjectData.ownerId === user?.uid;
            
            if (!isOwner) {
                throw new Error('Only the owner can permanently delete this subject');
            }

            await ensureTeacherCanDeleteSubject(subjectData);
            
            // 1. Get all topics for this subject
            const topicsQuery = query(
                collection(db, "topics"),
                where("subjectId", "==", id)
            );
            const topicsSnapshot = await getDocs(topicsQuery);
            
            // 2. For each topic, delete linked artifacts (documents/resources/quizzes/exams)
            const topicCleanupPromises: Promise<any>[] = [];
            for (const topicDoc of topicsSnapshot.docs) {
                const topicId = topicDoc.id;

                topicCleanupPromises.push(
                    cascadeDeleteTopicResources({
                        db,
                        topicId,
                        collections: DEFAULT_TOPIC_CASCADE_COLLECTIONS,
                    }).catch((err: any) => {
                        console.warn(`Failed to cascade-delete topic resources for ${topicId}:`, err);
                    })
                );
            }

            await Promise.allSettled(topicCleanupPromises);
            
            // 3. Delete all topics
            const topicDeletionPromises = topicsSnapshot.docs.map(topicDoc =>
                deleteDoc(doc(db, "topics", topicDoc.id)).catch(err => {
                    console.warn(`Failed to delete topic ${topicDoc.id}:`, err);
                })
            );
            await Promise.allSettled(topicDeletionPromises);
            
            // 4. Try to delete shortcuts (only ones owned by current user)
            try {
                const shortcutsQuery = query(
                    collection(db, "shortcuts"),
                    where("targetId", "==", id),
                    where("targetType", "==", "subject"),
                    where("ownerId", "==", user.uid)
                );
                const shortcutsSnapshot = await getDocs(shortcutsQuery);
                const shortcutDeletions = shortcutsSnapshot.docs.map(shortcutDoc =>
                    deleteDoc(doc(db, "shortcuts", shortcutDoc.id)).catch(err => {
                        console.warn(`Failed to delete shortcut ${shortcutDoc.id}:`, err);
                    })
                );
                await Promise.allSettled(shortcutDeletions);
            } catch (err) {
                console.warn('Failed to delete some shortcuts:', err);
                // Continue even if shortcuts fail
            }
            
            // 5. Finally delete the subject itself
            await deleteDoc(doc(db, "subjects", id));
            
            console.log(`Successfully deleted subject ${id} and related data`);
        } catch (error) {
            console.error("Error permanently deleting subject:", error);
            throw error;
        }
    };

    return { 
        subjects, 
        loading, 
        teacherSubjectCreationAllowed,
        completedSubjectIds,
        setSubjectCompletion,
        addSubject, 
        joinSubjectByInviteCode,
        updateSubject, 
        deleteSubject,
        touchSubject,
        shareSubject,
        unshareSubject,
        transferSubjectOwnership,
        getTrashedSubjects,
        restoreSubject,
        permanentlyDeleteSubject
    };
};