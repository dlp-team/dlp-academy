// src/components/modules/SubjectBadgesPanel.tsx
import React from 'react';
import { BookOpen, Award } from 'lucide-react';
import { ICON_OPTIONS } from './BadgeTemplateForm';
import { getStyleForScore, getDefaultBadgeThreshold, ACADEMIC_EXCELLENCE_BADGE_KEY } from '../../utils/badgeUtils';

interface SubjectBadgesPanelProps {
  /** Array of subject summaries with badges */
  subjectSummaries: Array<{
    subjectId: string;
    subjectName: string;
    badges: any[];
    mean: number | null;
  }>;
  /** Institution threshold for auto-badge styling */
  threshold?: number;
  /** Whether data is loading */
  loading?: boolean;
}

const SubjectBadgesPanel: React.FC<SubjectBadgesPanelProps> = ({
  subjectSummaries,
  threshold,
  loading = false,
}) => {
  const effectiveThreshold = threshold ?? getDefaultBadgeThreshold();

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!subjectSummaries || subjectSummaries.length === 0) {
    return (
      <div className="text-center py-6">
        <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No hay insignias de asignaturas disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" />
        Insignias por asignatura
      </h4>

      {subjectSummaries.map((summary) => {
        const { subjectId, subjectName, badges, mean } = summary;
        const hasExcellence = badges.some((b) => b.key === ACADEMIC_EXCELLENCE_BADGE_KEY);
        const style = mean != null && Number.isFinite(mean) && mean >= effectiveThreshold
          ? getStyleForScore(mean, effectiveThreshold)
          : null;

        return (
          <div
            key={subjectId}
            className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Subject icon with dynamic badge color if earned */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
                  style
                    ? `bg-gradient-to-br ${style.gradient} ${style.glow}`
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                }`}
              >
                {hasExcellence ? (
                  <Award className="w-5 h-5" />
                ) : (
                  <BookOpen className="w-5 h-5" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {subjectName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {mean != null && Number.isFinite(mean) && (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Media: {mean.toFixed(1)}
                    </span>
                  )}
                  {style && (
                    <span className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400">
                      {style.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Badge count */}
            <div className="flex items-center gap-2">
              {badges.length > 0 && (
                <div className="flex -space-x-1">
                  {badges.slice(0, 3).map((badge: any, idx: number) => {
                    const iconOpt = ICON_OPTIONS.find((i) => i.key === badge.iconKey);
                    const Icon = iconOpt?.icon || Award;
                    return (
                      <div
                        key={`${badge.key}-${idx}`}
                        className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white border border-white dark:border-gray-800"
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                    );
                  })}
                  {badges.length > 3 && (
                    <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-white dark:border-gray-800">
                      +{badges.length - 3}
                    </div>
                  )}
                </div>
              )}
              <span className="text-xs text-gray-400">{badges.length}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubjectBadgesPanel;
