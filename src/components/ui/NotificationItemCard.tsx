// src/components/ui/NotificationItemCard.tsx
import React from 'react';
import { Check, Loader2, X } from 'lucide-react';
import Avatar from './Avatar';
import {
  formatNotificationRelativeTime,
  getNotificationAvatarInfo,
  getNotificationVisual,
  isPendingShortcutMoveRequest,
} from './notificationPresentation';

type NotificationItemCardProps = {
  notification: any;
  onActivate: (notification: any) => void;
  onResolveMoveRequest?: (notification: any, resolution: 'approved' | 'rejected') => Promise<void> | void;
  isResolvingMoveRequest?: (requestId: any) => boolean;
  compact?: boolean;
};

const NotificationItemCard = ({
  notification,
  onActivate,
  onResolveMoveRequest,
  isResolvingMoveRequest,
  compact = false,
}: NotificationItemCardProps) => {
  const unread = !notification?.read;
  const pendingMoveRequest = isPendingShortcutMoveRequest(notification);
  const visual = getNotificationVisual(notification);
  const Icon = visual.icon;
  const avatarInfo = getNotificationAvatarInfo(notification);

  const handleResolve = async (event: React.MouseEvent<HTMLButtonElement>, resolution: 'approved' | 'rejected') => {
    event.stopPropagation();
    if (typeof onResolveMoveRequest !== 'function') return;
    await onResolveMoveRequest(notification, resolution);
  };

  const resolving = pendingMoveRequest
    ? Boolean(isResolvingMoveRequest?.(notification?.shortcutMoveRequestId))
    : false;

  return (
    <div
      onClick={() => onActivate(notification)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onActivate(notification);
        }
      }}
      role="button"
      tabIndex={0}
      className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/70 ${
        unread ? 'bg-sky-50/50 dark:bg-sky-900/10' : ''
      }`}
      aria-label={notification?.title || 'Notificación'}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${visual.iconContainerClass}`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{notification?.title}</p>
            {unread && <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />}
          </div>

          <p className={`text-slate-600 dark:text-slate-300 ${compact ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} line-clamp-3`}>
            {notification?.message}
          </p>

          {avatarInfo && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              <Avatar
                photoURL={avatarInfo.photoURL}
                name={avatarInfo.name}
                size="w-5 h-5"
                textSize="text-[10px]"
              />
              <span className="line-clamp-1">{avatarInfo.label}: {avatarInfo.name}</span>
            </div>
          )}

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formatNotificationRelativeTime(notification?.createdAt)}
          </p>

          {pendingMoveRequest && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={resolving}
                onClick={(event) => handleResolve(event, 'approved')}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Aprobar
              </button>

              <button
                type="button"
                disabled={resolving}
                onClick={(event) => handleResolve(event, 'rejected')}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                Rechazar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItemCard;
