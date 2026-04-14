// src/pages/Notifications/Notifications.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOff, CheckCheck } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItemCard from '../../components/ui/NotificationItemCard';

const Notifications = ({ user }: any) => {
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    resolveMoveRequestFromNotification,
    isResolvingMoveRequest,
  } = useNotifications(user);

  const generalNotifications = useMemo(
    () => notifications.filter((notification: any) => String(notification?.type || '').trim().toLowerCase() !== 'direct_message'),
    [notifications]
  );

  const unreadCount = useMemo(
    () => generalNotifications.filter((notification: any) => !notification?.read).length,
    [generalNotifications]
  );

  const markAllGeneralAsRead = async () => {
    const unreadGeneral = generalNotifications.filter((notification: any) => !notification?.read);
    if (unreadGeneral.length === 0) return;
    await Promise.all(unreadGeneral.map((notification: any) => markAsRead(notification.id)));
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification?.read) {
      await markAsRead(notification.id);
    }

    const explicitRoute = String(notification?.route || '').trim();
    const subjectId = String(notification?.subjectId || '').trim();
    const topicId = String(notification?.topicId || '').trim();

    if (explicitRoute) {
      navigate(explicitRoute);
      return;
    }

    if (subjectId && topicId) {
      navigate(`/home/subject/${subjectId}/topic/${topicId}`);
      return;
    }

    if (subjectId) {
      navigate(`/home/subject/${subjectId}`);
    }
  };

  const handleResolveMoveRequest = async (notification: any, resolution: any) => {
    await resolveMoveRequestFromNotification(notification, resolution);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      <Header user={user} />

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
                  onClick={markAllGeneralAsRead}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-700 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todo
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {generalNotifications.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-center px-4">
                <BellOff className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No tienes notificaciones activas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cuando haya actividad nueva, aparecerá en esta sección.
                </p>
              </div>
            ) : (
              generalNotifications.map((notification) => (
                <NotificationItemCard
                  key={notification.id}
                  notification={notification}
                  onActivate={handleNotificationClick}
                  onResolveMoveRequest={handleResolveMoveRequest}
                  isResolvingMoveRequest={isResolvingMoveRequest}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Notifications;
