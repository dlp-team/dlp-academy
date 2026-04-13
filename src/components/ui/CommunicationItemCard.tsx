// src/components/ui/CommunicationItemCard.tsx
import React from 'react';
import Avatar from './Avatar';

type CommunicationActorInfo = {
  name: string;
  photoURL?: string | null;
  label: string;
};

type CommunicationItemCardProps = {
  title?: string;
  message?: string;
  timestampLabel?: string;
  unread?: boolean;
  icon: React.ComponentType<any>;
  iconContainerClass: string;
  actor?: CommunicationActorInfo | null;
  compact?: boolean;
  ariaLabel?: string;
  onActivate?: () => void;
  actions?: React.ReactNode;
  containerClassName?: string;
  showActorAsLeading?: boolean;
  showActorMeta?: boolean;
};

const CommunicationItemCard = ({
  title,
  message,
  timestampLabel,
  unread = false,
  icon: Icon,
  iconContainerClass,
  actor,
  compact = false,
  ariaLabel,
  onActivate,
  actions,
  containerClassName = '',
  showActorAsLeading = false,
  showActorMeta = true,
}: CommunicationItemCardProps) => {
  const isInteractive = typeof onActivate === 'function';
  const shouldRenderActorAsLeading = showActorAsLeading && Boolean(actor?.name);

  return (
    <div
      onClick={isInteractive ? onActivate : undefined}
      onKeyDown={isInteractive
        ? (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onActivate?.();
            }
          }
        : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={`w-full text-left px-4 py-3 transition-colors ${
        isInteractive ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/70 cursor-pointer' : ''
      } ${unread ? 'bg-sky-50/50 dark:bg-sky-900/10' : ''} ${containerClassName}`}
      aria-label={ariaLabel || title || 'Elemento'}
    >
      <div className="flex items-start gap-3">
        {shouldRenderActorAsLeading ? (
          <Avatar
            photoURL={actor?.photoURL}
            name={actor?.name}
            size="w-8 h-8"
            textSize="text-[11px]"
            className="mt-0.5 border-0"
          />
        ) : (
          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconContainerClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{title}</p>
            {unread && <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />}
          </div>

          {message && (
            <p className={`text-slate-600 dark:text-slate-300 ${compact ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} line-clamp-3`}>
              {message}
            </p>
          )}

          {showActorMeta && actor?.name && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              <Avatar
                photoURL={actor.photoURL}
                name={actor.name}
                size="w-5 h-5"
                textSize="text-[10px]"
              />
              <span className="line-clamp-1">{actor.label}: {actor.name}</span>
            </div>
          )}

          {timestampLabel && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{timestampLabel}</p>
          )}

          {actions && <div className="mt-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default CommunicationItemCard;
