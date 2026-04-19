// src/components/modules/GeneralBadgesPanel.tsx
import React from 'react';
import { Globe, Award, TrendingUp } from 'lucide-react';
import { getStyleForScore, getDefaultBadgeThreshold } from '../../utils/badgeUtils';

interface GeneralBadgesPanelProps {
  /** Overall mean across all subjects */
  overallMean: number;
  /** Institution threshold */
  threshold?: number;
  /** Any general badges the student has earned */
  generalBadges?: any[];
  /** Whether data is loading */
  loading?: boolean;
}

const GeneralBadgesPanel: React.FC<GeneralBadgesPanelProps> = ({
  overallMean,
  threshold,
  generalBadges = [],
  loading = false,
}) => {
  const effectiveThreshold = threshold ?? getDefaultBadgeThreshold();
  const eligible = Number.isFinite(overallMean) && overallMean >= effectiveThreshold;
  const style = eligible ? getStyleForScore(overallMean, effectiveThreshold) : null;

  if (loading) {
    return (
      <div className="animate-pulse h-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5" />
        Insignias generales
      </h4>

      {/* Overall academic badge */}
      <div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
          eligible
            ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50 opacity-60'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
            style
              ? `bg-gradient-to-br ${style.gradient} ${style.glow}`
              : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          {eligible ? (
            <Award className="w-7 h-7" />
          ) : (
            <Award className="w-7 h-7 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
            Excelencia académica general
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {Number.isFinite(overallMean) && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Media global: {overallMean.toFixed(1)}
              </span>
            )}
            {style && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                {style.label}
              </span>
            )}
            {!eligible && Number.isFinite(overallMean) && (
              <span className="text-[10px] text-gray-400">
                Necesitas {effectiveThreshold.toFixed(1)} para obtener esta insignia
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Additional general badges */}
      {generalBadges.length > 0 && (
        <div className="space-y-1.5">
          {generalBadges.map((badge: any, idx: number) => (
            <div
              key={badge.id || idx}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center text-white">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {badge.name || 'Insignia general'}
              </span>
              <span className="text-[10px] text-gray-400 ml-auto">automática</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeneralBadgesPanel;
