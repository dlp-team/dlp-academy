// src/components/ui/NotificationsPanel.tsx
import React, { useEffect, useRef } from 'react';
import { CheckCheck, BellOff } from 'lucide-react';
import NotificationItemCard from './NotificationItemCard';

const NotificationsPanel = ({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onResolveMoveRequest,
    isResolvingMoveRequest,
    triggerRef,
    onOpenAll,
    onClose
}: any) => {
    const panelRef = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (e: any) => {
            const eventTarget = e?.target;
            const clickedInsidePanel = panelRef.current?.contains?.(eventTarget);
            const clickedInsideTrigger = triggerRef?.current?.contains?.(eventTarget);
            if (clickedInsidePanel || clickedInsideTrigger) return;
            onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, triggerRef]);

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        if (typeof onOpenAll === 'function') {
            onOpenAll(notification);
        }

        onClose();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 z-[10000]"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <span className="font-semibold text-sm text-gray-800 dark:text-slate-200">
                    Notificaciones
                    {unreadCount > 0 && (
                        <span className="ml-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </span>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onOpenAll?.()}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors"
                    >
                        Ver todas
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                        >
                            <CheckCheck size={13} />
                            Marcar todo
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                        <BellOff className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-slate-400">Sin notificaciones</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationItemCard
                            key={notification.id}
                            notification={notification}
                            onActivate={handleNotificationClick}
                            onResolveMoveRequest={onResolveMoveRequest}
                            isResolvingMoveRequest={isResolvingMoveRequest}
                            compact
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
