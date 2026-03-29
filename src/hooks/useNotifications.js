// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import {
    collection, query, where, orderBy, onSnapshot,
    doc, updateDoc, writeBatch, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useNotifications = (uid) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!uid) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', uid),
            orderBy('createdAt', 'desc')
        );

        let unsubscribeFallback = null;

        const attachFallbackListener = () => {
            const fallbackQ = query(
                collection(db, 'notifications'),
                where('userId', '==', uid)
            );

            unsubscribeFallback = onSnapshot(
                fallbackQ,
                (snapshot) => {
                    const data = snapshot.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .sort((a, b) => {
                            const aMs = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                            const bMs = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                            return bMs - aMs;
                        });
                    setNotifications(data);
                },
                (fallbackError) => {
                    console.error('Error listening to notifications (fallback):', fallbackError);
                    setNotifications([]);
                }
            );
        };

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setNotifications(data);
            },
            (error) => {
                console.error('Error listening to notifications:', error);

                if (error?.code === 'failed-precondition') {
                    attachFallbackListener();
                    return;
                }

                setNotifications([]);
            }
        );

        return () => {
            unsubscribe();
            if (typeof unsubscribeFallback === 'function') {
                unsubscribeFallback();
            }
        };
    }, [uid]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (notificationId) => {
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
