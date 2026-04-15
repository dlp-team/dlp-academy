// src/components/layout/Header.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Settings, Moon, Sun, LayoutDashboard } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config'; 
import useInstitutionBranding from '../../hooks/useInstitutionBranding';
import { applyThemeToDom, resolveThemeMode } from '../../utils/themeMode';
import { getActiveRole, getAssignedRoles } from '../../utils/permissionUtils';

// Import UI Helpers
import Avatar from '../ui/Avatar';
import Toggle from '../ui/Toggle';
import MailboxIcon from '../ui/MailboxIcon';
import NotificationsPanel from '../ui/NotificationsPanel';
import AppToast from '../ui/AppToast';
import { useNotifications } from '../../hooks/useNotifications';

const ACTIVE_ROLE_CHANGE_EVENT = 'dlp-active-role-change';

const ROLE_VIEW_LABELS: any = {
  admin: 'Admin Global',
  institutionadmin: 'Admin Institución',
  teacher: 'Profesor',
  student: 'Estudiante',
};

const buildEmptyToastState = () => ({
  show: false,
  id: '',
  title: '',
  message: '',
  type: 'info',
  variant: 'info',
});

const Header = ({ user }: any) => {
  const navigate = useNavigate();
  const [firestoreUser, setFirestoreUser] = useState<any>(null);

  // --- 1. THEME LOGIC (Instant) ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [themePreference, setThemePreference] = useState('system');
  const [headerThemeSliderEnabled, setHeaderThemeSliderEnabled] = useState(true);

  // --- NEW: Handle Toggle Click (Updates State + Firestore) ---
  const handleThemeToggle = async (isDark: any) => {
    // 1. Update UI immediately
    applyThemeToDom(isDark ? 'dark' : 'light', { animate: true, persist: true });
    setDarkMode(isDark);
    setThemePreference(isDark ? 'dark' : 'light');

    // 2. Update Firestore in background
    if (user?.uid) {
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                theme: isDark ? 'dark' : 'light'
            });
        } catch (error) {
            console.error("Error saving theme to Firestore:", error);
        }
    }
  };

  // --- 2. USER DATA LOGIC (Cached + Live) ---
  useEffect(() => {
    if (!user?.uid || user?.__previewLock) return;

    const cacheKey = `user_profile_${user.uid}`;
    const getUserThemePreference = (profileData: any) => profileData?.theme || profileData?.settings?.theme || 'system';
    const getHeaderThemeSliderSetting = (profileData: any) => (
      profileData?.headerThemeSliderEnabled !== undefined
        ? profileData.headerThemeSliderEnabled
        : profileData?.settings?.headerThemeSliderEnabled !== undefined
          ? profileData.settings.headerThemeSliderEnabled
          : true
    );

    const fetchUserData = async () => {
      // A. INSTANT: Load from LocalStorage
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            setFirestoreUser((prev) => prev || parsed);

            const cachedTheme = getUserThemePreference(parsed);
            setThemePreference(cachedTheme);
            setDarkMode(resolveThemeMode(cachedTheme) === 'dark');
            setHeaderThemeSliderEnabled(getHeaderThemeSliderSetting(parsed));
        }
      } catch (e) {
        console.error("Cache read error", e);
      }

      // B. BACKGROUND: Fetch fresh data from Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const freshData = userDoc.data();
          setFirestoreUser(freshData);
          localStorage.setItem(cacheKey, JSON.stringify(freshData));

          const freshTheme = getUserThemePreference(freshData);
          setThemePreference(freshTheme);
          setDarkMode(resolveThemeMode(freshTheme) === 'dark');
          setHeaderThemeSliderEnabled(getHeaderThemeSliderSetting(freshData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  useEffect(() => {
    if (themePreference !== 'system' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncModeFromSystem = (event?: MediaQueryListEvent) => {
      const nextIsDark = typeof event?.matches === 'boolean' ? event.matches : mediaQuery.matches;
      setDarkMode(nextIsDark);
    };

    syncModeFromSystem();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncModeFromSystem);
      return () => mediaQuery.removeEventListener('change', syncModeFromSystem);
    }

    mediaQuery.addListener(syncModeFromSystem);
    return () => mediaQuery.removeListener(syncModeFromSystem);
  }, [themePreference]);

  // Determine which data to show
  const userData = { ...(user || {}), ...(firestoreUser || {}) };
  const assignedRoles = getAssignedRoles(userData);
  const activeRole = getActiveRole(userData);
  const canSwitchRole = !userData?.__previewLock && assignedRoles.length > 1;
  const institutionBranding = useInstitutionBranding(userData);

  const getDisplayName = () => {
    if (userData?.displayName) return userData.displayName;
    if (userData?.email) return userData.email.split('@')[0];
    return 'Usuario';
  };

  const displayName = getDisplayName();

  // --- 3. ROLE-BASED PANEL NAVIGATION ---
  const getDashboardRoute = (role: any) => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'institutionadmin':
        return '/institution-admin-dashboard';
      case 'teacher':
        return '/teacher-dashboard';
      case 'student':
        return '/student-dashboard';
      default:
        return null;
    }
  };

  const getDashboardLabel = (role: any) => {
    switch (role) {
      case 'admin':
        return 'Panel Admin';
      case 'institutionadmin':
        return 'Panel Institución';
      case 'teacher':
        return 'Panel Profesor';
      case 'student':
        return 'Panel Estudiante';
      default:
        return null;
    }
  };

  const dashboardRoute = getDashboardRoute(activeRole);
  const dashboardLabel = getDashboardLabel(activeRole);
  const previewSafeNavigate = useCallback((path: any) => {
    if (
      userData?.__previewLock === true
      && typeof path === 'string'
      && path.startsWith('/')
      && !path.startsWith('/theme-preview')
    ) {
      navigate(`/theme-preview${path}`);
      return;
    }

    navigate(path);
  }, [navigate, userData?.__previewLock]);

  const handleRoleSwitch = (event: any) => {
    const nextRole = event?.target?.value;
    if (!userData?.uid || !nextRole || nextRole === activeRole) return;

    window.dispatchEvent(new CustomEvent(ACTIVE_ROLE_CHANGE_EVENT, {
      detail: {
        uid: userData.uid,
        activeRole: nextRole,
      },
    }));
  };

  // --- 4. NOTIFICATIONS ---
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    resolveMoveRequestFromNotification,
    isResolvingMoveRequest,
  } = useNotifications(userData);
  const [showPanel, setShowPanel] = useState(false);
  const [toast, setToast] = useState<any>(buildEmptyToastState());
  const prevCountRef = useRef<any>(null);
  const isFirstLoadRef = useRef(true);
  const notificationsTriggerRef = useRef<any>(null);
  const shownNotificationToastIdsRef = useRef<Set<string>>(new Set());

  const notificationToastStorageKey = userData?.uid
    ? `dlp-seen-notification-toasts:${userData.uid}`
    : null;

  const persistSeenNotificationToastIds = useCallback((nextIds: Set<string>) => {
    if (!notificationToastStorageKey || typeof window === 'undefined') return;

    try {
      window.sessionStorage.setItem(
        notificationToastStorageKey,
        JSON.stringify(Array.from(nextIds))
      );
    } catch (error) {
      console.error('Error persisting seen notification toast ids:', error);
    }
  }, [notificationToastStorageKey]);

  useEffect(() => {
    shownNotificationToastIdsRef.current = new Set();

    if (!notificationToastStorageKey || typeof window === 'undefined') {
      return;
    }

    try {
      const rawStoredIds = window.sessionStorage.getItem(notificationToastStorageKey);
      if (!rawStoredIds) return;

      const parsedStoredIds = JSON.parse(rawStoredIds);
      if (!Array.isArray(parsedStoredIds)) return;

      shownNotificationToastIdsRef.current = new Set(
        parsedStoredIds
          .map((entry: any) => String(entry || '').trim())
          .filter(Boolean)
      );
    } catch (error) {
      console.error('Error restoring seen notification toast ids:', error);
      shownNotificationToastIdsRef.current = new Set();
    }
  }, [notificationToastStorageKey]);

  const handleResolveMoveRequest = async (notification: any, resolution: any) => {
    try {
      await resolveMoveRequestFromNotification(notification, resolution);
      setToast({
        show: true,
        id: `shortcut-resolution-${notification?.id || Date.now()}-${resolution}`,
        title: 'Solicitud procesada',
        message: resolution === 'approved'
          ? 'Solicitud aprobada correctamente.'
          : 'Solicitud rechazada correctamente.',
        type: notification?.type || 'shortcut_move_request',
        variant: resolution === 'approved' ? 'success' : 'warning',
      });
    } catch (error) {
      console.error('Error resolving shortcut move request notification:', error);
      setToast({
        show: true,
        id: `shortcut-resolution-error-${notification?.id || Date.now()}`,
        title: 'Error al procesar',
        message: 'No se pudo procesar la solicitud de movimiento.',
        type: notification?.type || 'shortcut_move_request',
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    if (isFirstLoadRef.current) {
      prevCountRef.current = notifications.length;
      isFirstLoadRef.current = false;
      return;
    }

    if (notifications.length <= prevCountRef.current) {
      prevCountRef.current = notifications.length;
      return;
    }

    const newest = notifications.find((notification: any) => {
      const notificationId = String(notification?.id || '').trim();
      return Boolean(notificationId) && !shownNotificationToastIdsRef.current.has(notificationId);
    });

    if (!newest) {
      prevCountRef.current = notifications.length;
      return;
    }

    const newestNotificationId = String(newest?.id || '').trim();
    if (newestNotificationId) {
      const nextSeenIds = new Set(shownNotificationToastIdsRef.current);
      nextSeenIds.add(newestNotificationId);
      shownNotificationToastIdsRef.current = nextSeenIds;
      persistSeenNotificationToastIds(nextSeenIds);
    }

    const toastTimer = setTimeout(() => {
      setToast({
        show: true,
        id: newestNotificationId,
        title: newest?.title || 'Nueva notificacion',
        message: newest?.message || 'Tienes una nueva notificacion.',
        type: newest?.type || 'info',
        variant: 'info',
      });
    }, 0);

    prevCountRef.current = notifications.length;
    return () => clearTimeout(toastTimer);
  }, [notifications, persistSeenNotificationToastIds]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const previousHeaderOffset = document.body.style.getPropertyValue('--app-fixed-header-height');

    document.body.classList.add('has-fixed-header');
    document.body.style.setProperty('--app-fixed-header-height', '5rem');

    return () => {
      document.body.classList.remove('has-fixed-header');

      if (previousHeaderOffset) {
        document.body.style.setProperty('--app-fixed-header-height', previousHeaderOffset);
      } else {
        document.body.style.removeProperty('--app-fixed-header-height');
      }
    };
  }, []);

  return (
    <>
    <header className="fixed top-0 w-full h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 z-[9999] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* --- LEFT: LOGO --- */}
        <div 
            className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => previewSafeNavigate('/home')}
        >
          {institutionBranding.logoUrl ? (
            <img
              src={institutionBranding.logoUrl}
              alt={institutionBranding.institutionDisplayName || 'Institution logo'}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">   
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <h1 className="hidden sm:block text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors truncate max-w-[150px] md:max-w-xs">
            {institutionBranding.institutionDisplayName}
          </h1>
        </div>

        {/* --- RIGHT: ACTIONS & PROFILE --- */}
        <div className="flex items-center gap-2 sm:gap-4">

            {/* 1. THEME TOGGLE */}
            {headerThemeSliderEnabled && (
              <div className="hidden sm:flex items-center gap-1 sm:gap-2 px-1 sm:px-2 border-r border-gray-200 dark:border-slate-700 mr-1">
                <Sun size={14} className={`hidden sm:block transition-colors ${!darkMode ? 'text-amber-500' : 'text-gray-400'}`} />
                <Toggle
                  enabled={darkMode}
                  onChange={handleThemeToggle}
                />
                <Moon size={14} className={`hidden sm:block transition-colors ${darkMode ? 'text-indigo-400' : 'text-gray-400'}`} />
              </div>
            )}

            {/* 2. ROLE SWITCHER */}
            {canSwitchRole && (
              <label className="flex items-center gap-2 px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 max-w-[10.5rem]">
                <span className="hidden lg:inline text-xs font-medium text-gray-500 dark:text-slate-400">Vista</span>
                <select
                  aria-label="Seleccionar vista de rol"
                  value={activeRole}
                  onChange={handleRoleSwitch}
                  className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 outline-none"
                >
                  {assignedRoles.map((roleName: any) => (
                    <option key={roleName} value={roleName}>
                      {ROLE_VIEW_LABELS[roleName] || roleName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* 3. DASHBOARD BUTTON (Role-based) */}
            {dashboardRoute && (
                <button
                onClick={userData?.__previewLock ? undefined : () => previewSafeNavigate(dashboardRoute)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      userData?.__previewLock
                        ? 'text-gray-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                        : 'text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer'
                    }`}
                title={userData?.__previewLock ? 'No disponible en vista previa' : (dashboardLabel ?? undefined)}
                disabled={!!userData?.__previewLock}
                >
                    <LayoutDashboard size={18} />
                    <span className="hidden md:inline">{dashboardLabel}</span>
                </button>
            )}

            {/* 4. SETTINGS BUTTON */}
            <button 
              onClick={() => previewSafeNavigate('/settings')}
                className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-200 cursor-pointer"
                title="Configuración"
            >
                <Settings size={20} />
            </button>

            {/* 5. USER PROFILE (Clickable Area) */}
            <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => previewSafeNavigate('/profile')} 
            >
                {/* Text Info */}
                <div className="text-right hidden sm:block">
                    <h2 className="font-bold text-sm text-gray-800 dark:text-slate-200 leading-tight">
                        {displayName}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">
                        {userData?.email}
                    </p>
                </div>

                {/* AVATAR COMPONENT */}
                <Avatar 
                    photoURL={userData?.photoURL}
                    name={displayName}
                    size="w-10 h-10"
                    textSize="text-sm"
                    className="hover:scale-105 transition-transform border-none border-black-500 dark:border-white-400"
                />
            </div>

            {/* 6. MAILBOX ICON - PLACED RIGHT OF AVATAR */}
            <div ref={notificationsTriggerRef} className="border-l pl-4 border-gray-200 dark:border-slate-700 relative">
                <MailboxIcon
                    mailCount={unreadCount}
                    onClick={() => setShowPanel(prev => !prev)}
                    dark={darkMode}
                />
                {showPanel && (
                    <NotificationsPanel
                        notifications={notifications}
                        onMarkAsRead={markAsRead}
                        onMarkAllAsRead={markAllAsRead}
                      triggerRef={notificationsTriggerRef}
                      onOpenAll={() => {
                        setShowPanel(false);
                        previewSafeNavigate('/notifications');
                      }}
                      onResolveMoveRequest={handleResolveMoveRequest}
                      isResolvingMoveRequest={isResolvingMoveRequest}
                        onClose={() => setShowPanel(false)}
                    />
                )}
            </div>
        </div>

      </div>
    </header>

    <AppToast
        show={toast.show}
      title={toast.title}
        message={toast.message}
      type={toast.type}
      variant={toast.variant}
      durationMs={10000}
      onClose={() => setToast(buildEmptyToastState())}
    />
    </>
  );
};

export default Header;