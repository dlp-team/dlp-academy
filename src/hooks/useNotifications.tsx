// src/hooks/useNotifications.tsx
import { useState, useEffect, useRef } from 'react';
import {
    collection, query, where, onSnapshot,
    doc, setDoc, updateDoc, writeBatch, getDocs, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActiveRole } from '../utils/permissionUtils';
import { resolveShortcutMoveRequest } from '../services/shortcutMoveRequestService';
import { isNotificationExpired } from '../utils/notificationRetentionUtils';

const NEW_ASSIGNMENT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
const DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000;
const SUBJECT_QUERY_CHUNK_SIZE = 10;

const toDateSafe = (value: any) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const dateKey = (date: any) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

const chunkArray = (values: any[] = [], chunkSize = SUBJECT_QUERY_CHUNK_SIZE) => {
    if (!Array.isArray(values) || values.length === 0) return [];

    const normalizedChunkSize = Number.isFinite(Number(chunkSize)) && Number(chunkSize) > 0
        ? Math.floor(Number(chunkSize))
        : SUBJECT_QUERY_CHUNK_SIZE;

    const chunks = [];
    for (let index = 0; index < values.length; index += normalizedChunkSize) {
        chunks.push(values.slice(index, index + normalizedChunkSize));
    }

    return chunks;
};

const buildTopicRoute = (subjectId: any, topicId: any) => {
    const normalizedSubjectId = String(subjectId || '').trim();
    const normalizedTopicId = String(topicId || '').trim();

    if (!normalizedSubjectId) return '';
    if (!normalizedTopicId) return `/home/subject/${normalizedSubjectId}`;
    return `/home/subject/${normalizedSubjectId}/topic/${normalizedTopicId}`;
};

const buildResourceRoute = ({ subjectId, topicId, resourceId, resourceType }: any) => {
    const normalizedSubjectId = String(subjectId || '').trim();
    const normalizedTopicId = String(topicId || '').trim();
    const normalizedResourceId = String(resourceId || '').trim();
    const normalizedResourceType = String(resourceType || '').trim().toLowerCase();

    if (!normalizedSubjectId || !normalizedTopicId || !normalizedResourceId) {
        return buildTopicRoute(normalizedSubjectId, normalizedTopicId);
    }

    if (normalizedResourceType === 'resumen' || normalizedResourceType === 'summary') {
        return `/home/subject/${normalizedSubjectId}/topic/${normalizedTopicId}/resumen/${normalizedResourceId}`;
    }

    return `/home/subject/${normalizedSubjectId}/topic/${normalizedTopicId}/resource/${normalizedResourceId}`;
};

const isNewContentNotificationEnabled = (user: any) => {
    const fromSettings = user?.settings?.notifications?.newContent;
    if (typeof fromSettings === 'boolean') return fromSettings;

    const fromRootNotifications = user?.notifications?.newContent;
    if (typeof fromRootNotifications === 'boolean') return fromRootNotifications;

    return true;
};

export const useNotifications = (user: any) => {
    const uid = user?.uid;
    const activeRole = getActiveRole(user);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [resolvingMoveRequestIds, setResolvingMoveRequestIds] = useState<any>({});
    const existingNotificationIdsRef = useRef(new Set());
    const cleanupInFlightIdsRef = useRef(new Set());

    useEffect(() => {
        if (!uid) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', uid)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot: any) => {
                const data = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .sort((a, b: any) => {
                        const aMs = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                        const bMs = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                        return bMs - aMs;
                    });

                const activeNotifications: any[] = [];
                const expiredNotificationIds: string[] = [];

                data.forEach((notification) => {
                    if (isNotificationExpired(notification)) {
                        expiredNotificationIds.push(String(notification.id || '').trim());
                        return;
                    }
                    activeNotifications.push(notification);
                });

                setNotifications(activeNotifications);

                const cleanupIds = Array.from(new Set(expiredNotificationIds.filter(Boolean))).filter((notificationId) => {
                    if (cleanupInFlightIdsRef.current.has(notificationId)) {
                        return false;
                    }
                    cleanupInFlightIdsRef.current.add(notificationId);
                    return true;
                });

                if (cleanupIds.length > 0) {
                    const cleanupBatch = writeBatch(db);
                    cleanupIds.forEach((notificationId) => {
                        cleanupBatch.delete(doc(db, 'notifications', notificationId));
                    });

                    cleanupBatch.commit().catch((error: any) => {
                        console.error('Error cleaning up expired notifications:', error);
                    }).finally(() => {
                        cleanupIds.forEach((notificationId) => {
                            cleanupInFlightIdsRef.current.delete(notificationId);
                        });
                    });
                }
            },
            (error: any) => {
                console.error('Error listening to notifications:', error);
                setNotifications([]);
            }
        );

        return () => unsubscribe();
    }, [uid]);

    useEffect(() => {
        existingNotificationIdsRef.current = new Set(notifications.map((notification) => notification.id));
    }, [notifications]);

    useEffect(() => {
        if (!uid || activeRole !== 'student' || !user?.institutionId) return undefined;

        const newContentNotificationsEnabled = isNewContentNotificationEnabled(user);
        let cancelled = false;
        const unsubscribeCallbacks: any[] = [];

        const registerUnsubscribe = (callback: any) => {
            if (typeof callback === 'function') {
                unsubscribeCallbacks.push(callback);
            }
        };

        const startStudentAssignmentNotifications = async () => {
            try {
                const subjectSnapshot = await getDocs(
                    query(
                        collection(db, 'subjects'),
                        where('enrolledStudentUids', 'array-contains', uid)
                    )
                );

                if (cancelled) return;

                const enrolledSubjectIds = new Set(subjectSnapshot.docs.map((subjectDoc) => subjectDoc.id));
                if (enrolledSubjectIds.size === 0) return;

                const subjectIdChunks = chunkArray(Array.from(enrolledSubjectIds), SUBJECT_QUERY_CHUNK_SIZE);
                if (subjectIdChunks.length === 0) return;

                let deliveredByAssignment = new Set();

                const maybeCreateAssignmentNotifications = async (assignmentDocs: any) => {
                    const existingIds = new Set(existingNotificationIdsRef.current);
                    const now = new Date();

                    for (const assignmentDoc of assignmentDocs) {
                        const assignment = assignmentDoc.data() || {};
                        const assignmentSubjectId = String(assignment.subjectId || '').trim();
                        if (!assignmentSubjectId || !enrolledSubjectIds.has(assignmentSubjectId)) continue;
                        if (assignment.visibleToStudents === false) continue;

                        const assignmentId = String(assignmentDoc.id || '').trim();
                        if (!assignmentId) continue;

                        const assignmentTopicId = String(assignment.topicId || '').trim() || null;
                        const route = buildTopicRoute(assignmentSubjectId, assignmentTopicId);
                        const title = assignment.title || 'Nueva tarea';
                        const createdAt = toDateSafe(assignment.createdAt || assignment.updatedAt);
                        const dueAt = toDateSafe(assignment.dueAt);

                        if (
                            newContentNotificationsEnabled
                            && createdAt
                            && (now.getTime() - createdAt.getTime()) <= NEW_ASSIGNMENT_LOOKBACK_MS
                        ) {
                            const newTaskNotificationId = `assignment_new_${assignmentId}_${uid}`;
                            if (!existingIds.has(newTaskNotificationId)) {
                                await setDoc(doc(db, 'notifications', newTaskNotificationId), {
                                    userId: uid,
                                    institutionId: user.institutionId,
                                    subjectId: assignmentSubjectId,
                                    topicId: assignmentTopicId,
                                    route: route || null,
                                    read: false,
                                    type: 'assignment_new',
                                    title: 'Nueva tarea disponible',
                                    message: `Se ha publicado: ${title}`,
                                    contentType: 'assignment',
                                    createdAt: serverTimestamp(),
                                });
                                existingIds.add(newTaskNotificationId);
                                existingNotificationIdsRef.current.add(newTaskNotificationId);
                            }
                        }

                        const dueWindowMs = dueAt ? dueAt.getTime() - now.getTime() : null;
                        if (
                            dueWindowMs !== null
                            && dueWindowMs > 0
                            && dueWindowMs <= DUE_SOON_WINDOW_MS
                            && !deliveredByAssignment.has(assignmentId)
                        ) {
                            const dueSoonNotificationId = `assignment_due_24h_${assignmentId}_${uid}_${dateKey(now)}`;
                            if (!existingIds.has(dueSoonNotificationId)) {
                                await setDoc(doc(db, 'notifications', dueSoonNotificationId), {
                                    userId: uid,
                                    institutionId: user.institutionId,
                                    subjectId: assignmentSubjectId,
                                    topicId: assignmentTopicId,
                                    route: route || null,
                                    read: false,
                                    type: 'assignment_due_soon',
                                    title: 'Entrega en menos de 24 horas',
                                    message: `La tarea "${title}" vence pronto.`,
                                    contentType: 'assignment',
                                    createdAt: serverTimestamp(),
                                });
                                existingIds.add(dueSoonNotificationId);
                                existingNotificationIdsRef.current.add(dueSoonNotificationId);
                            }
                        }
                    }
                };

                const maybeCreateQuizNotifications = async (quizDocs: any) => {
                    if (!newContentNotificationsEnabled) return;

                    const existingIds = new Set(existingNotificationIdsRef.current);
                    const now = new Date();

                    for (const quizDoc of quizDocs) {
                        const quiz = quizDoc.data() || {};
                        const quizSubjectId = String(quiz.subjectId || '').trim();
                        if (!quizSubjectId || !enrolledSubjectIds.has(quizSubjectId)) continue;
                        if (quiz.visibleToStudents === false) continue;

                        const createdAt = toDateSafe(quiz.createdAt || quiz.generatedAt || quiz.updatedAt);
                        if (!createdAt || (now.getTime() - createdAt.getTime()) > NEW_ASSIGNMENT_LOOKBACK_MS) {
                            continue;
                        }

                        const quizId = String(quizDoc.id || '').trim();
                        if (!quizId) continue;

                        const quizTopicId = String(quiz.topicId || '').trim() || null;
                        const quizTitle = String(quiz.title || quiz.name || 'Nuevo test').trim() || 'Nuevo test';
                        const notificationId = `topic_quiz_new_${quizId}_${uid}`;

                        if (existingIds.has(notificationId)) continue;

                        await setDoc(doc(db, 'notifications', notificationId), {
                            userId: uid,
                            institutionId: user.institutionId,
                            subjectId: quizSubjectId,
                            topicId: quizTopicId,
                            route: buildTopicRoute(quizSubjectId, quizTopicId) || null,
                            read: false,
                            type: 'topic_quiz_new',
                            title: 'Nuevo test disponible',
                            message: `Se ha publicado: ${quizTitle}`,
                            contentType: 'quiz',
                            createdAt: serverTimestamp(),
                        });

                        existingIds.add(notificationId);
                        existingNotificationIdsRef.current.add(notificationId);
                    }
                };

                const maybeCreateMaterialNotifications = async (materialDocs: any, collectionName: string) => {
                    if (!newContentNotificationsEnabled) return;

                    const existingIds = new Set(existingNotificationIdsRef.current);
                    const now = new Date();

                    for (const materialDoc of materialDocs) {
                        const material = materialDoc.data() || {};
                        const materialSubjectId = String(material.subjectId || '').trim();
                        if (!materialSubjectId || !enrolledSubjectIds.has(materialSubjectId)) continue;
                        if (material.visibleToStudents === false) continue;

                        const createdAt = toDateSafe(material.createdAt || material.uploadedAt || material.updatedAt);
                        if (!createdAt || (now.getTime() - createdAt.getTime()) > NEW_ASSIGNMENT_LOOKBACK_MS) {
                            continue;
                        }

                        const materialId = String(materialDoc.id || '').trim();
                        if (!materialId) continue;

                        const materialTopicId = String(material.topicId || '').trim() || null;
                        const materialTitle = String(
                            material.name
                            || material.title
                            || (collectionName === 'resumen' ? 'Nuevo resumen' : 'Nuevo material')
                        ).trim() || 'Nuevo material';
                        const notificationId = `topic_material_new_${collectionName}_${materialId}_${uid}`;

                        if (existingIds.has(notificationId)) continue;

                        await setDoc(doc(db, 'notifications', notificationId), {
                            userId: uid,
                            institutionId: user.institutionId,
                            subjectId: materialSubjectId,
                            topicId: materialTopicId,
                            route: buildResourceRoute({
                                subjectId: materialSubjectId,
                                topicId: materialTopicId,
                                resourceId: materialId,
                                resourceType: collectionName,
                            }) || null,
                            read: false,
                            type: 'topic_material_new',
                            title: collectionName === 'resumen' ? 'Nuevo resumen disponible' : 'Nuevo material disponible',
                            message: `Se ha publicado: ${materialTitle}`,
                            contentType: collectionName,
                            createdAt: serverTimestamp(),
                        });

                        existingIds.add(notificationId);
                        existingNotificationIdsRef.current.add(notificationId);
                    }
                };

                const submissionsQuery = query(
                    collection(db, 'topicAssignmentSubmissions'),
                    where('userId', '==', uid)
                );

                registerUnsubscribe(onSnapshot(submissionsQuery, (snapshot: any) => {
                    deliveredByAssignment = new Set(
                        snapshot.docs
                            .map((submissionDoc) => submissionDoc.data())
                            .filter((submission) => submission?.delivered)
                            .map((submission) => submission.assignmentId)
                            .filter(Boolean)
                    );
                }, () => {
                    deliveredByAssignment = new Set();
                }));

                subjectIdChunks.forEach((subjectIdChunk: any[]) => {
                    const assignmentsQuery = query(
                        collection(db, 'topicAssignments'),
                        where('subjectId', 'in', subjectIdChunk)
                    );

                    registerUnsubscribe(onSnapshot(assignmentsQuery, (snapshot: any) => {
                        maybeCreateAssignmentNotifications(snapshot.docs).catch((error: any) => {
                            console.error('Error creating assignment notifications:', error);
                        });
                    }, (error: any) => {
                        console.error('Error listening assignment notifications source:', error);
                    }));

                    if (!newContentNotificationsEnabled) {
                        return;
                    }

                    const quizzesQuery = query(
                        collection(db, 'quizzes'),
                        where('subjectId', 'in', subjectIdChunk)
                    );

                    registerUnsubscribe(onSnapshot(quizzesQuery, (snapshot: any) => {
                        maybeCreateQuizNotifications(snapshot.docs).catch((error: any) => {
                            console.error('Error creating quiz notifications:', error);
                        });
                    }, (error: any) => {
                        console.error('Error listening quiz notifications source:', error);
                    }));

                    const documentsQuery = query(
                        collection(db, 'documents'),
                        where('subjectId', 'in', subjectIdChunk)
                    );

                    registerUnsubscribe(onSnapshot(documentsQuery, (snapshot: any) => {
                        maybeCreateMaterialNotifications(snapshot.docs, 'documents').catch((error: any) => {
                            console.error('Error creating material notifications from documents:', error);
                        });
                    }, (error: any) => {
                        console.error('Error listening document notifications source:', error);
                    }));

                    const summariesQuery = query(
                        collection(db, 'resumen'),
                        where('subjectId', 'in', subjectIdChunk)
                    );

                    registerUnsubscribe(onSnapshot(summariesQuery, (snapshot: any) => {
                        maybeCreateMaterialNotifications(snapshot.docs, 'resumen').catch((error: any) => {
                            console.error('Error creating material notifications from resumen:', error);
                        });
                    }, (error: any) => {
                        console.error('Error listening summary notifications source:', error);
                    }));
                });
            } catch (error) {
                console.error('Error initializing student assignment notifications:', error);
            }
        };

        startStudentAssignmentNotifications();

        return () => {
            cancelled = true;
            unsubscribeCallbacks.forEach((callback) => {
                try {
                    callback();
                } catch (error) {
                    console.error('Error unsubscribing student notification listener:', error);
                }
            });
        };
    }, [
        uid,
        activeRole,
        user?.institutionId,
        user?.notifications?.newContent,
        user?.settings?.notifications?.newContent,
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (notificationId: any) => {
        await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length === 0) return;
        const batch = writeBatch(db);
        unread.forEach(n => {
            batch.update(doc(db, 'notifications', n.id), { read: true });
        });
        await batch.commit();
    };

    const setMoveRequestResolvingState = (requestId: any, isResolving: any) => {
        const normalizedRequestId = String(requestId || '').trim();
        if (!normalizedRequestId) return;
        setResolvingMoveRequestIds((prev: any) => {
            const next = { ...(prev || {}) };
            if (isResolving) {
                next[normalizedRequestId] = true;
            } else {
                delete next[normalizedRequestId];
            }
            return next;
        });
    };

    const resolveMoveRequestFromNotification = async (notification: any, resolution: any) => {
        const requestId = String(notification?.shortcutMoveRequestId || '').trim();
        const notificationId = String(notification?.id || '').trim();
        if (!requestId || !notificationId) {
            throw new Error('Missing shortcut move request notification metadata.');
        }

        setMoveRequestResolvingState(requestId, true);

        try {
            await resolveShortcutMoveRequest({ requestId, resolution });
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true,
                shortcutMoveRequestStatus: resolution,
                resolvedAt: serverTimestamp()
            });
        } finally {
            setMoveRequestResolvingState(requestId, false);
        }
    };

    const isResolvingMoveRequest = (requestId: any) => {
        const normalizedRequestId = String(requestId || '').trim();
        return Boolean(normalizedRequestId && resolvingMoveRequestIds?.[normalizedRequestId]);
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        resolveMoveRequestFromNotification,
        isResolvingMoveRequest
    };
};
