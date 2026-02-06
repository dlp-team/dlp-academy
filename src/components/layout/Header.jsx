// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Settings, Moon, Sun } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
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

  // --- 2. USER DATA LOGIC (Cached + Live) ---
  useEffect(() => {
    // If we don't have a user ID yet, do nothing
    if (!user?.uid) return;

    const cacheKey = `user_profile_${user.uid}`;

    const fetchUserData = async () => {
      // A. INSTANT: Load from LocalStorage if available
      // This prevents the "flash" by showing the last known state immediately
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            // Only set if we haven't fetched fresh data yet
            setFirestoreUser((prev) => prev || parsed);
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
          // Update the cache for next time
          localStorage.setItem(cacheKey, JSON.stringify(freshData));
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

  return (
    // Removed "transition-colors" to prevent background flash on load
    <header className="fixed top-0 w-full h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 z-50">
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
                    onChange={setDarkMode} 
                />
                <Moon size={16} className={`transition-colors ${darkMode ? 'text-indigo-400' : 'text-gray-400'}`} />
            </div>

            {/* 2. SETTINGS BUTTON */}
            <button 
                onClick={() => navigate('/settings')}
                className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-200 cursor-pointer"
                title="Configuración"
            >
                <Settings size={20} />
            </button>

            {/* 3. USER PROFILE (Clickable Area) */}
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