// src/components/ui/NotificationItemCard.tsx
import React from 'react';
import { Check, Loader2, X } from 'lucide-react';
import CommunicationItemCard from './CommunicationItemCard';
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

  const actions = pendingMoveRequest ? (
    <div className="flex flex-wrap items-center gap-2">
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
  ) : null;

  return (
    <CommunicationItemCard
      title={notification?.title}
      message={notification?.message}
      timestampLabel={formatNotificationRelativeTime(notification?.createdAt)}
      unread={unread}
      icon={Icon}
      iconContainerClass={visual.iconContainerClass}
      actor={avatarInfo}
      compact={compact}
      ariaLabel={notification?.title || 'Notificación'}
      onActivate={() => onActivate(notification)}
      actions={actions}
    />
  );
};

export default NotificationItemCard;
