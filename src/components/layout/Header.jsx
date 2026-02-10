import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Settings, Moon, Sun, LayoutDashboard } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config'; 

// Import UI Helpers
import Avatar from '../ui/Avatar';
import Toggle from '../ui/Toggle';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [firestoreUser, setFirestoreUser] = useState(null);

  // --- 1. THEME LOGIC (Instant) ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Apply theme to DOM and LocalStorage whenever state changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // --- NEW: Handle Toggle Click (Updates State + Firestore) ---
  const handleThemeToggle = async (isDark) => {
    // 1. Update UI immediately
    setDarkMode(isDark);

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

    const fetchUserData = async () => {
      // A. INSTANT: Load from LocalStorage
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            setFirestoreUser((prev) => prev || parsed);
            
            // Sync theme from cache if available
            if (parsed.theme) {
                setDarkMode(parsed.theme === 'dark');
            }
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
          
          // Ensure header state matches database state
          if (freshData.theme) {
            setDarkMode(freshData.theme === 'dark');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  // Determine which data to show
  const userData = firestoreUser || user;

  const getDisplayName = () => {
    if (userData?.displayName) return userData.displayName;
    if (userData?.email) return userData.email.split('@')[0];
    return 'Usuario';
  };

  const displayName = getDisplayName();

  // --- 3. ROLE-BASED PANEL NAVIGATION ---
  const getDashboardRoute = () => {
    const role = userData?.role || 'student';
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'schooladmin':
        return '/school-admin-dashboard';
      case 'teacher':
        return '/teacher-dashboard';
      default:
        return null;
    }
  };

  const getDashboardLabel = () => {
    const role = userData?.role || 'student';
    switch (role) {
      case 'admin':
        return 'Panel Admin';
      case 'schooladmin':
        return 'Panel Escuela';
      case 'teacher':
        return 'Panel Profesor';
      default:
        return null;
    }
  };

  const dashboardRoute = getDashboardRoute();
  const dashboardLabel = getDashboardLabel();

  return (
    <header className="fixed top-0 w-full h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* --- LEFT: LOGO --- */}
        <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate('/home')}
        >
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
            <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
            DLP Academy
          </h1>
        </div>
        
        {/* --- RIGHT: ACTIONS & PROFILE --- */}
        <div className="flex items-center gap-4">

            {/* 1. THEME TOGGLE */}
            <div className="flex items-center gap-2 px-2 border-r border-gray-200 dark:border-slate-700 mr-1">
                <Sun size={16} className={`transition-colors ${!darkMode ? 'text-amber-500' : 'text-gray-400'}`} />
                <Toggle 
                    enabled={darkMode} 
                    onChange={handleThemeToggle} 
                />
                <Moon size={16} className={`transition-colors ${darkMode ? 'text-indigo-400' : 'text-gray-400'}`} />
            </div>

            {/* 2. DASHBOARD BUTTON (Role-based) */}
            {dashboardRoute && (
                <button 
                    onClick={() => navigate(dashboardRoute)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                    title={dashboardLabel}
                >
                    <LayoutDashboard size={18} />
                    <span className="hidden md:inline">{dashboardLabel}</span>
                </button>
            )}

            {/* 3. SETTINGS BUTTON */}
            <button 
                onClick={() => navigate('/settings')}
                className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-200 cursor-pointer"
                title="Configuración"
            >
                <Settings size={20} />
            </button>

            {/* 4. USER PROFILE (Clickable Area) */}
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
        </div>

      </div>
    </header>
  );
};

export default Header;