// src/hooks/useNotifications.js
import { useState, useEffect, useRef } from 'react';
import {
    collection, query, where, onSnapshot,
    doc, setDoc, updateDoc, writeBatch, getDocs, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActiveRole } from '../utils/permissionUtils';

const NEW_ASSIGNMENT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
const DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000;

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

export const useNotifications = (user: any) => {
    const uid = user?.uid;
    const activeRole = getActiveRole(user);
    const [notifications, setNotifications] = useState<any[]>([]);
    const existingNotificationIdsRef = useRef(new Set());

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
                setNotifications(data);
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

        let cancelled = false;
        let unsubscribeAssignments: any = null;
        let unsubscribeSubmissions: any = null;

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

                let deliveredByAssignment = new Set();

                const maybeCreateNotifications = async (assignmentDocs: any) => {
                    const existingIds = new Set(existingNotificationIdsRef.current);
                    const now = new Date();

                    for (const assignmentDoc of assignmentDocs) {
                        const assignment = assignmentDoc.data();
                        if (!assignment) continue;
                        if (!enrolledSubjectIds.has(assignment.subjectId)) continue;
                        if (assignment.visibleToStudents === false) continue;

                        const assignmentId = assignmentDoc.id;
                        const title = assignment.title || 'Nueva tarea';
                        const createdAt = toDateSafe(assignment.createdAt);
                        const dueAt = toDateSafe(assignment.dueAt);

                        if (createdAt && (now.getTime() - createdAt.getTime()) <= NEW_ASSIGNMENT_LOOKBACK_MS) {
                            const newTaskNotificationId = `assignment_new_${assignmentId}_${uid}`;
                            if (!existingIds.has(newTaskNotificationId)) {
                                await setDoc(doc(db, 'notifications', newTaskNotificationId), {
                                    userId: uid,
                                    institutionId: user.institutionId,
                                    subjectId: assignment.subjectId,
                                    topicId: assignment.topicId || null,
                                    read: false,
                                    type: 'assignment_new',
                                    title: 'Nueva tarea disponible',
                                    message: `Se ha publicado: ${title}`,
                                    createdAt: serverTimestamp()
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
                                    subjectId: assignment.subjectId,
                                    topicId: assignment.topicId || null,
                                    read: false,
                                    type: 'assignment_due_soon',
                                    title: 'Entrega en menos de 24 horas',
                                    message: `La tarea "${title}" vence pronto.`,
                                    createdAt: serverTimestamp()
                                });
                                existingIds.add(dueSoonNotificationId);
                                existingNotificationIdsRef.current.add(dueSoonNotificationId);
                            }
                        }
                    }
                };

                const submissionsQuery = query(
                    collection(db, 'topicAssignmentSubmissions'),
                    where('userId', '==', uid)
                );

                unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot: any) => {
                    deliveredByAssignment = new Set(
                        snapshot.docs
                            .map((submissionDoc) => submissionDoc.data())
                            .filter((submission) => submission?.delivered)
                            .map((submission) => submission.assignmentId)
                            .filter(Boolean)
                    );
                }, () => {
                    deliveredByAssignment = new Set();
                });

                const assignmentsQuery = query(
                    collection(db, 'topicAssignments'),
                    where('institutionId', '==', user.institutionId)
                );

                unsubscribeAssignments = onSnapshot(assignmentsQuery, (snapshot: any) => {
                    maybeCreateNotifications(snapshot.docs).catch((error: any) => {
                        console.error('Error creating assignment notifications:', error);
                    });
                }, (error: any) => {
                    console.error('Error listening assignment notifications source:', error);
                });
            } catch (error) {
                console.error('Error initializing student assignment notifications:', error);
            }
        };

        startStudentAssignmentNotifications();

        return () => {
            cancelled = true;
            if (unsubscribeAssignments) unsubscribeAssignments();
            if (unsubscribeSubmissions) unsubscribeSubmissions();
        };
    }, [uid, activeRole, user?.institutionId]);

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

    return { notifications, unreadCount, markAsRead, markAllAsRead };
};
