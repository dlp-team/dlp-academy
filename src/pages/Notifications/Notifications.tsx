// src/pages/Notifications/Notifications.tsx
import AnimatedPage from '../../components/layout/AnimatedPage';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  BookOpen,
  Check,
  CheckCheck,
  FolderSync,
  Loader2,
  Share2,
  Users,
  X,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import {
  getNotificationVisualClasses,
  resolveNotificationVisualKind,
} from '../../utils/notificationVisualUtils';

const ICON_BY_VISUAL_KIND: Record<string, any> = {
  info: Bell,
  share: Share2,
  assignment: Users,
  shortcut: FolderSync,
  success: Check,
  warning: Bell,
  error: X,
};

const Notifications = ({ user }: any) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    resolveMoveRequestFromNotification,
    isResolvingMoveRequest,
  } = useNotifications(user);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${diffDays}d`;
  };

  const isPendingShortcutMoveRequest = (notification: any) => {
    const type = String(notification?.type || '').trim().toLowerCase();
    const status = String(notification?.shortcutMoveRequestStatus || '').trim().toLowerCase();
    return type === 'shortcut_move_request' && status === 'pending' && Boolean(notification?.shortcutMoveRequestId);
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification?.read) {
      await markAsRead(notification.id);
    }

    if (notification?.subjectId) {
      navigate(`/home/subject/${notification.subjectId}`);
    }
  };

  const handleResolveMoveRequest = async (event: any, notification: any, resolution: any) => {
    event.stopPropagation();
    await resolveMoveRequestFromNotification(notification, resolution);
  };

  return (
    <AnimatedPage>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">Historial de notificaciones</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Consulta todas tus notificaciones recientes y gestiona su estado.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold rounded-full px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                No leídas: {unreadCount}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-700 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todo
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-center px-4">
                <BellOff className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No tienes notificaciones activas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cuando haya actividad nueva, aparecerá en esta sección.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const visualKind = resolveNotificationVisualKind({ type: notification?.type });
                const visualClasses = getNotificationVisualClasses(visualKind);
                const NotificationIcon = ICON_BY_VISUAL_KIND[visualKind] || BookOpen;

                return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-5 py-4 transition-colors hover:bg-slate-100/85 dark:hover:bg-slate-800/70 ${
                    !notification.read ? `${visualClasses.unreadBackground}` : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 mt-0.5 rounded-lg p-1.5 ${visualClasses.iconContainer}`}>
                      <NotificationIcon className={`w-4 h-4 ${visualClasses.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{notification.title}</p>
                        {!notification.read && <span className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400" />}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{formatTime(notification.createdAt)}</p>

                      {isPendingShortcutMoveRequest(notification) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={Boolean(isResolvingMoveRequest?.(notification.shortcutMoveRequestId))}
                            onClick={(event) => handleResolveMoveRequest(event, notification, 'approved')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isResolvingMoveRequest?.(notification.shortcutMoveRequestId) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Aprobar
                          </button>

                          <button
                            type="button"
                            disabled={Boolean(isResolvingMoveRequest?.(notification.shortcutMoveRequestId))}
                            onClick={(event) => handleResolveMoveRequest(event, notification, 'rejected')}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isResolvingMoveRequest?.(notification.shortcutMoveRequestId) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
    </AnimatedPage>
  );
};

export default Notifications;
