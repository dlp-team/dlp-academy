// src/pages/Subject/hooks/useClassMembers.js
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const useClassMembers = (subject) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!subject) return;

        const fetchMembers = async () => {
            setLoading(true);
            try {
                // Collect all unique user IDs and their roles
                const userRoles = new Map();

                // Owner / Creator
                const ownerId = subject.ownerId || subject.uid;
                if (ownerId) {
                    userRoles.set(ownerId, 'creator');
                }

                // Editors (administrators)
                if (Array.isArray(subject.editorUids)) {
                    subject.editorUids.forEach(uid => {
                        if (!userRoles.has(uid)) {
                            userRoles.set(uid, 'editor');
                        }
                    });
                }

                // Viewers (students)
                if (Array.isArray(subject.viewerUids)) {
                    subject.viewerUids.forEach(uid => {
                        if (!userRoles.has(uid)) {
                            userRoles.set(uid, 'viewer');
                        }
                    });
                }

                // Legacy: sharedWith array
                if (Array.isArray(subject.sharedWith)) {
                    subject.sharedWith.forEach(share => {
                        if (share.uid && !userRoles.has(share.uid)) {
                            userRoles.set(share.uid, share.canEdit ? 'editor' : 'viewer');
                        }
                    });
                }

                // Legacy: sharedWithUids (assume viewer)
                if (Array.isArray(subject.sharedWithUids)) {
                    subject.sharedWithUids.forEach(uid => {
                        if (!userRoles.has(uid)) {
                            userRoles.set(uid, 'viewer');
                        }
                    });
                }

                // Fetch user profiles
                const membersList = [];
                for (const [uid, role] of userRoles) {
                    try {
                        const userSnap = await getDoc(doc(db, "users", uid));
                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            membersList.push({
                                uid,
                                role,
                                name: userData.name || userData.displayName || 'Usuario',
                                email: userData.email || '',
                                photoURL: userData.photoURL || null,
                            });
                        } else {
                            membersList.push({
                                uid,
                                role,
                                name: 'Usuario eliminado',
                                email: '',
                                photoURL: null,
                            });
                        }
                    } catch (err) {
                        console.error(`Error fetching user ${uid}:`, err);
                    }
                }

                // Sort: creator first, then editors, then viewers
                const roleOrder = { creator: 0, editor: 1, viewer: 2 };
                membersList.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

                setMembers(membersList);
            } catch (error) {
                console.error("Error fetching class members:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [subject]);

    return { members, loading };
};
