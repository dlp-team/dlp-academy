// src/pages/Profile/hooks/useAdminProfileStats.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export interface AdminProfileStats {
  coursesCount: number;
  classesCount: number;
  teachersCount: number;
  studentsCount: number;
}

const DEFAULT_STATS: AdminProfileStats = {
  coursesCount: 0,
  classesCount: 0,
  teachersCount: 0,
  studentsCount: 0,
};

export const useAdminProfileStats = (institutionId: string | null | undefined) => {
  const [stats, setStats] = useState<AdminProfileStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!institutionId) return;

    let cancelled = false;
    setLoading(true);

    const fetchStats = async () => {
      try {
        const [coursesSnap, classesSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'courses'), where('institutionId', '==', institutionId), where('status', '!=', 'trashed'))),
          getDocs(query(collection(db, 'classes'), where('institutionId', '==', institutionId), where('status', '!=', 'trashed'))),
          getDocs(query(collection(db, 'users'), where('institutionId', '==', institutionId))),
        ]);

        if (cancelled) return;

        const users = usersSnap.docs.map((d) => d.data());
        const teachersCount = users.filter((u) => u.role === 'teacher' || (Array.isArray(u.availableRoles) && u.availableRoles.includes('teacher'))).length;
        const studentsCount = users.filter((u) => u.role === 'student' && (!Array.isArray(u.availableRoles) || !u.availableRoles.some((r: string) => r !== 'student'))).length;

        setStats({
          coursesCount: coursesSnap.size,
          classesCount: classesSnap.size,
          teachersCount,
          studentsCount,
        });
      } catch {
        // Stats fetch failure is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    return () => { cancelled = true; };
  }, [institutionId]);

  return { stats, loading };
};
