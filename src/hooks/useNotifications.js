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

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setNotifications(data);
        });

        return () => unsubscribe();
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
