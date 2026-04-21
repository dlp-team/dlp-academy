// src/pages/Profile/components/BadgeChip.tsx
import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { getStyleForScore } from '../../../utils/badgeUtils';
import type { BadgeStyleConfig } from '../../../utils/badgeUtils';

interface BadgeChipProps {
  badge: {
    key: string;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    glow: string;
    textColor: string;
    auto: boolean;
  };
  earned: boolean;
  earnedAt?: any;
  compact?: boolean;
  /** If provided, overrides the static color with dynamic score-based styling */
  score?: number;
  /** Institution threshold for style computation */
  threshold?: number;
  /** If true, badge was revoked (shows grayed-out with strikethrough) */
  revoked?: boolean;
}

const BadgeChip: React.FC<BadgeChipProps> = ({
  badge,
  earned,
  earnedAt,
  compact = false,
  score,
  threshold,
  revoked = false,
}) => {
  const Icon = badge.icon;

  // Dynamic style: use score-based colors for auto-badges with a score
  let dynamicStyle: BadgeStyleConfig | null = null;
  if (earned && score != null && Number.isFinite(score) && badge.auto) {
    dynamicStyle = getStyleForScore(score, threshold);
  }

  const gradient = dynamicStyle ? dynamicStyle.gradient : badge.color;
  const glow = dynamicStyle ? dynamicStyle.glow : badge.glow;
  const isPerfect = dynamicStyle?.isPerfect ?? false;

  if (revoked) {
    return (
      <div
        className="relative flex flex-col items-center gap-1.5 group opacity-35 grayscale"
        title={`${badge.label} — Insignia perdida`}
      >
        <div
          className={`
            ${compact ? 'w-10 h-10' : 'w-14 h-14'}
            rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400
            flex items-center justify-center text-white
            shadow-lg relative
          `}
        >
          <Icon className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} opacity-50`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-red-500/60 rotate-45" />
          </div>
        </div>
        {!compact && (
          <span className="text-xs font-semibold text-center leading-tight text-gray-400 dark:text-gray-600 line-through">
            {badge.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center gap-1.5 group transition-all duration-200 ${earned ? 'opacity-100' : 'opacity-35 grayscale'}`}
      title={
        earned && dynamicStyle
          ? `${badge.description} — ${dynamicStyle.label} (${score?.toFixed(1)})`
          : badge.description
      }
    >
      <div
        className={`
          ${compact ? 'w-10 h-10' : 'w-14 h-14'}
          rounded-2xl bg-gradient-to-br ${gradient}
          flex items-center justify-center text-white
          shadow-lg ${earned ? glow : ''}
          transition-transform duration-200
          ${earned ? 'group-hover:scale-110 group-hover:shadow-xl' : ''}
          ${isPerfect ? 'ring-2 ring-yellow-400/60 animate-pulse' : ''}
        `}
      >
        {earned ? (
          <>
            <Icon className={compact ? 'w-5 h-5' : 'w-7 h-7'} />
            {isPerfect && (
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 drop-shadow" />
            )}
          </>
        ) : (
          <Lock className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
        )}
      </div>
      {!compact && (
        <>
          <span
            className={`text-xs font-semibold text-center leading-tight ${
              earned ? badge.textColor : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            {badge.label}
          </span>
          {earned && dynamicStyle && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              {dynamicStyle.label}
            </span>
          )}
          {earned && earnedAt && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 whitespace-nowrap">
              {new Date(earnedAt?.toDate ? earnedAt.toDate() : earnedAt).toLocaleDateString()}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default BadgeChip;
