// src/pages/AdminDashboard/utils/adminInstitutionInviteQueryUtils.ts
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const loadInstitutionAdminInvites = async (institutionId: string) => {
    const invitesQuery = query(
        collection(db, 'institution_invites'),
        where('institutionId', '==', institutionId),
        where('role', '==', 'institutionadmin')
    );

    const invitesSnapshot = await getDocs(invitesQuery);
    const existingInvites: Array<{ id: string; email: string }> = [];

    invitesSnapshot.forEach((snapshotDoc: any) => {
        existingInvites.push({
            id: snapshotDoc.id,
            email: snapshotDoc.data().email,
        });
    });

    return existingInvites;
};
