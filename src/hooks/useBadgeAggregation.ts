// src/hooks/useBadgeAggregation.ts

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  computeGradeMean,
  getActiveCourseBadges,
  ACADEMIC_EXCELLENCE_BADGE_KEY,
} from '../utils/badgeUtils';

interface UseBadgeAggregationParams {
  institutionId: string | null | undefined;
  studentId: string | null | undefined;
}

interface SubjectBadgeSummary {
  subjectId: string;
  subjectName: string;
  badges: any[];
  mean: number | null;
}

interface AggregationResult {
  subjectSummaries: SubjectBadgeSummary[];
  overallMean: number;
  loading: boolean;
  error: string;
  refresh: () => void;
}

/**
 * Hook for aggregating badges across subjects for a student.
 * Used for general (institution-wide) auto-badge computation.
 *
 * Reads all subjects the student is enrolled in, collects their
 * badge data, and computes cross-subject aggregations.
 */
export const useBadgeAggregation = ({
  institutionId,
  studentId,
}: UseBadgeAggregationParams): AggregationResult => {
  const [subjectSummaries, setSubjectSummaries] = useState<SubjectBadgeSummary[]>([]);
  const [overallMean, setOverallMean] = useState<number>(NaN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!institutionId || !studentId) {
      setSubjectSummaries([]);
      setOverallMean(NaN);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const aggregate = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch student's institutionUser doc to get badgesByCourse
        const { doc: docRef, getDoc } = await import('firebase/firestore');
        const studentDoc = await getDoc(docRef(db, 'institutionUsers', studentId));
        if (cancelled) return;

        const studentData = studentDoc.exists() ? studentDoc.data() : {};
        const badgesByCourse = studentData?.badgesByCourse || {};

        // Fetch subjects the student is enrolled in (via viewerUids or classMembers)
        const subjectsQuery = query(
          collection(db, 'subjects'),
          where('institutionId', '==', institutionId),
          where('viewerUids', 'array-contains', studentId)
        );
        const subjectsSnap = await getDocs(subjectsQuery);
        if (cancelled) return;

        const summaries: SubjectBadgeSummary[] = [];
        const means: number[] = [];

        subjectsSnap.forEach((subjectDoc) => {
          const subjectData = subjectDoc.data();
          const subjectId = subjectDoc.id;
          const subjectName = subjectData?.name || subjectData?.title || 'Sin nombre';

          const courseBadges = getActiveCourseBadges(badgesByCourse, subjectId);

          // Extract the academic excellence badge's average if it exists
          const excellenceBadge = courseBadges.find(
            (b) => b.key === ACADEMIC_EXCELLENCE_BADGE_KEY
          );
          const mean = excellenceBadge?.averageTenScale ?? null;

          if (mean != null && Number.isFinite(mean)) {
            means.push(mean);
          }

          summaries.push({
            subjectId,
            subjectName,
            badges: courseBadges,
            mean: mean != null ? mean : null,
          });
        });

        if (!cancelled) {
          setSubjectSummaries(summaries);
          setOverallMean(computeGradeMean(means));
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Error al agregar insignias.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    aggregate();
    return () => { cancelled = true; };
  }, [institutionId, studentId, refreshKey]);

  return {
    subjectSummaries,
    overallMean,
    loading,
    error,
    refresh,
  };
};
