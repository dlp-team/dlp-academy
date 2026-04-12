// src/components/layout/Header.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Settings, Moon, Sun, LayoutDashboard, MessageCircle } from 'lucide-react';
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
    if (!user?.uid) return;

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
  const canSwitchRole = assignedRoles.length > 1;
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
    markAsRead,
    resolveMoveRequestFromNotification,
    isResolvingMoveRequest,
  } = useNotifications(userData);

  const messageNotifications = useMemo(
    () => notifications.filter((notification: any) => String(notification?.type || '').trim().toLowerCase() === 'direct_message'),
    [notifications]
  );

  const generalNotifications = useMemo(
    () => notifications.filter((notification: any) => String(notification?.type || '').trim().toLowerCase() !== 'direct_message'),
    [notifications]
  );

  const messageUnreadCount = useMemo(
    () => messageNotifications.filter((notification: any) => !notification?.read).length,
    [messageNotifications]
  );

  const generalUnreadCount = useMemo(
    () => generalNotifications.filter((notification: any) => !notification?.read).length,
    [generalNotifications]
  );
  const [showPanel, setShowPanel] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const prevCountRef = useRef<any>(null);
  const isFirstLoadRef = useRef(true);
  const notificationsTriggerRef = useRef<any>(null);

  const handleResolveMoveRequest = async (notification: any, resolution: any) => {
    try {
      await resolveMoveRequestFromNotification(notification, resolution);
      setToast({
        show: true,
        message: resolution === 'approved'
          ? 'Solicitud aprobada correctamente.'
          : 'Solicitud rechazada correctamente.',
      });
    } catch (error) {
      console.error('Error resolving shortcut move request notification:', error);
      setToast({
        show: true,
        message: 'No se pudo procesar la solicitud de movimiento.',
      });
    }
  };

  const handleMarkAllGeneralAsRead = async () => {
    const unreadGeneral = generalNotifications.filter((notification: any) => !notification?.read);
    if (unreadGeneral.length === 0) return;
    await Promise.all(unreadGeneral.map((notification: any) => markAsRead(notification.id)));
  };

  useEffect(() => {
    if (isFirstLoadRef.current) {
      prevCountRef.current = generalNotifications.length;
      isFirstLoadRef.current = false;
      return;
    }

    if (generalNotifications.length <= prevCountRef.current) {
      prevCountRef.current = generalNotifications.length;
      return;
    }

    const newest = generalNotifications[0];
    const toastTimer = setTimeout(() => {
      setToast({ show: true, message: newest?.message || '¡Un tema tiene contenido listo!' });
    }, 0);

    prevCountRef.current = generalNotifications.length;
    return () => clearTimeout(toastTimer);
  }, [generalNotifications]);

  return (
    <>
    <header className="fixed top-0 w-full h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 z-[9999] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* --- LEFT: LOGO --- */}
        <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate('/home')}
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
                    onClick={() => navigate(dashboardRoute)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                title={dashboardLabel ?? undefined}
                >
                    <LayoutDashboard size={18} />
                    <span className="hidden md:inline">{dashboardLabel}</span>
                </button>
            )}

            {/* 4. SETTINGS BUTTON */}
            <button
                onClick={() => navigate('/messages')}
                className="relative p-2.5 text-gray-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-full transition-all duration-200 cursor-pointer"
                title="Mensajes"
                aria-label="Abrir mensajes"
            >
                <MessageCircle size={20} />
                {messageUnreadCount > 0 && (
                  <span className="absolute -left-0.5 -top-0.5 inline-flex min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                    {messageUnreadCount > 99 ? '99+' : messageUnreadCount}
                  </span>
                )}
            </button>

            {/* 4. SETTINGS BUTTON */}
            <button 
                onClick={() => navigate('/settings')}
                className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-200 cursor-pointer"
                title="Configuración"
            >
                <Settings size={20} />
            </button>

            {/* 5. USER PROFILE (Clickable Area) */}
            <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/profile')} 
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
                  mailCount={generalUnreadCount}
                    onClick={() => setShowPanel(prev => !prev)}
                    dark={darkMode}
                />
                {showPanel && (
                    <NotificationsPanel
                    notifications={generalNotifications}
                        onMarkAsRead={markAsRead}
                    onMarkAllAsRead={handleMarkAllGeneralAsRead}
                      triggerRef={notificationsTriggerRef}
                      onOpenAll={() => {
                        setShowPanel(false);
                        navigate('/notifications');
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
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
    />
    </>
  );
};

export default Header;