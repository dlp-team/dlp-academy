// src/utils/notificationVisualUtils.ts
export type NotificationVisualKind =
  | 'info'
  | 'share'
  | 'assignment'
  | 'shortcut'
  | 'success'
  | 'warning'
  | 'error';

const VALID_NOTIFICATION_VISUAL_KINDS: NotificationVisualKind[] = [
  'info',
  'share',
  'assignment',
  'shortcut',
  'success',
  'warning',
  'error',
];

const normalizeToken = (value: any) => String(value || '').trim().toLowerCase();

const isNotificationVisualKind = (value: any): value is NotificationVisualKind =>
  VALID_NOTIFICATION_VISUAL_KINDS.includes(value as NotificationVisualKind);

export const resolveNotificationVisualKind = ({
  type,
  variant,
}: {
  type?: any;
  variant?: any;
} = {}): NotificationVisualKind => {
  const normalizedVariant = normalizeToken(variant);
  if (isNotificationVisualKind(normalizedVariant)) {
    return normalizedVariant;
  }

  const normalizedType = normalizeToken(type);
  if (!normalizedType) {
    return 'info';
  }

  if (normalizedType === 'shortcut_move_request' || normalizedType.startsWith('shortcut_move_request_')) {
    return 'shortcut';
  }

  if (normalizedType === 'subject_shared' || normalizedType === 'folder_shared') {
    return 'share';
  }

  if (normalizedType.startsWith('subject_assigned') || normalizedType.startsWith('assignment_')) {
    return 'assignment';
  }

  if (normalizedType.includes('approved') || normalizedType.includes('success')) {
    return 'success';
  }

  if (normalizedType.includes('warning')) {
    return 'warning';
  }

  if (normalizedType.includes('rejected') || normalizedType.includes('error') || normalizedType.includes('failed')) {
    return 'error';
  }

  return 'info';
};

type NotificationVisualClassSet = {
  iconContainer: string;
  iconColor: string;
  unreadBackground: string;
  toastSurface: string;
  toastBorder: string;
};

const NOTIFICATION_VISUAL_CLASSES: Record<NotificationVisualKind, NotificationVisualClassSet> = {
  info: {
    iconContainer: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-300',
    unreadBackground: 'bg-slate-100/80 dark:bg-slate-800/60',
    toastSurface: 'bg-white/96 dark:bg-slate-900/96',
    toastBorder: 'border-slate-200 dark:border-slate-700',
  },
  share: {
    iconContainer: 'bg-sky-100 dark:bg-sky-900/40',
    iconColor: 'text-sky-700 dark:text-sky-300',
    unreadBackground: 'bg-sky-50/80 dark:bg-sky-900/20',
    toastSurface: 'bg-white/96 dark:bg-slate-900/96',
    toastBorder: 'border-sky-200 dark:border-sky-800/70',
  },
  assignment: {
    iconContainer: 'bg-emerald-100 dark:bg-emerald-900/35',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    unreadBackground: 'bg-emerald-50/80 dark:bg-emerald-900/20',
    toastSurface: 'bg-white/96 dark:bg-slate-900/96',
    toastBorder: 'border-emerald-200 dark:border-emerald-800/70',
  },
  shortcut: {
    iconContainer: 'bg-amber-100 dark:bg-amber-900/35',
    iconColor: 'text-amber-700 dark:text-amber-300',
    unreadBackground: 'bg-amber-50/80 dark:bg-amber-900/20',
    toastSurface: 'bg-white/96 dark:bg-slate-900/96',
    toastBorder: 'border-amber-200 dark:border-amber-800/70',
  },
  success: {
    iconContainer: 'bg-emerald-100 dark:bg-emerald-900/35',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    unreadBackground: 'bg-emerald-50/80 dark:bg-emerald-900/20',
    toastSurface: 'bg-white/96 dark:bg-slate-900/96',
    toastBorder: 'border-emerald-200 dark:border-emerald-800/70',
  },
  warning: {
    iconContainer: 'bg-amber-100 dark:bg-amber-900/35',
    iconColor: 'text-amber-700 dark:text-amber-300',
    unreadBackground: 'bg-amber-50/80 dark:bg-amber-900/20',
    toastSurface: 'bg-white/96 dark:bg-slate-900/96',
    toastBorder: 'border-amber-200 dark:border-amber-800/70',
  },
  error: {
    iconContainer: 'bg-rose-100 dark:bg-rose-900/35',
    iconColor: 'text-rose-700 dark:text-rose-300',
    unreadBackground: 'bg-rose-50/80 dark:bg-rose-900/20',
    toastSurface: 'bg-white/96 dark:bg-slate-900/96',
    toastBorder: 'border-rose-200 dark:border-rose-800/70',
  },
};

export const getNotificationVisualClasses = (kind: NotificationVisualKind): NotificationVisualClassSet =>
  NOTIFICATION_VISUAL_CLASSES[kind] || NOTIFICATION_VISUAL_CLASSES.info;
