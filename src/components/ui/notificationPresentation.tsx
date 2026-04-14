// src/components/ui/notificationPresentation.tsx
import { Bell, CheckCheck, ClipboardList, Clock3, FolderSync, MessageCircle, Share2 } from 'lucide-react';

export const formatNotificationRelativeTime = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
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

export const isPendingShortcutMoveRequest = (notification: any) => {
  const type = String(notification?.type || '').trim().toLowerCase();
  const status = String(notification?.shortcutMoveRequestStatus || '').trim().toLowerCase();
  return type === 'shortcut_move_request' && status === 'pending' && Boolean(notification?.shortcutMoveRequestId);
};

export const getNotificationAvatarInfo = (notification: any) => {
  const type = String(notification?.type || '').trim().toLowerCase();

  if (type === 'subject_shared') {
    const name = String(notification?.sharedByDisplayName || notification?.sharedByEmail || '').trim();
    const photoURL = String(notification?.sharedByPhotoURL || '').trim() || null;
    return name ? { name, photoURL, label: 'Compartido por' } : null;
  }

  if (type === 'direct_message') {
    const name = String(notification?.senderDisplayName || notification?.senderEmail || '').trim();
    const photoURL = String(notification?.senderPhotoURL || '').trim() || null;
    return name ? { name, photoURL, label: 'Mensaje de' } : null;
  }

  return null;
};

export const getNotificationVisual = (notification: any) => {
  const type = String(notification?.type || '').trim().toLowerCase();

  if (isPendingShortcutMoveRequest(notification)) {
    return {
      icon: FolderSync,
      iconContainerClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    };
  }

  if (type === 'subject_shared') {
    return {
      icon: Share2,
      iconContainerClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    };
  }

  if (type === 'assignment_new' || type === 'topic_assignment_new') {
    return {
      icon: CheckCheck,
      iconContainerClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    };
  }

  if (type === 'topic_quiz_new') {
    return {
      icon: ClipboardList,
      iconContainerClass: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    };
  }

  if (type === 'assignment_due_soon') {
    return {
      icon: Clock3,
      iconContainerClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    };
  }

  if (type === 'direct_message') {
    return {
      icon: MessageCircle,
      iconContainerClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    };
  }

  return {
    icon: Bell,
    iconContainerClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
};
