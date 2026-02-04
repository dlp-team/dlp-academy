import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Authentication pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Main app pages
import Home from './pages/Home';
import Subject from './pages/Subject';
import Topic from './pages/Topic';
import Quizzes from './pages/Quizzes'

// Firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // ✅ Added onSnapshot
import { auth, db } from './firebase/config'; // ✅ Added db

// Protected Route wrapper component
const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👂 1. Listen for Auth AND Firestore changes
  useEffect(() => {
    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is logged in. Now connect to the DATABASE to get settings.
        const userRef = doc(db, "users", currentUser.uid);
        
        // onSnapshot listens for real-time updates from Firestore
        unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // We combine Auth info (currentUser) with Database info (userData)
            setUser({ ...currentUser, ...userData });
          } else {
            // Fallback if no document exists yet
            setUser(currentUser);
          }
          setLoading(false);
        });

      } else {
        // User is logged out
        setUser(null);
        setLoading(false);
        if (unsubscribeFirestore) unsubscribeFirestore();
      }
    });
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // 🎨 2. Theme Logic (Now listens to the REAL user.settings)
  useEffect(() => {
    const applyTheme = () => {
      // Now this works because we fetched the data from Firestore above!
      const theme = user?.settings?.theme || 'system';
      const root = window.document.documentElement;

      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
        if (user?.settings?.theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    
    return () => mediaQuery.removeEventListener('change', handleSystemChange);

  }, [user]); // Re-runs whenever Firestore sends new settings

  // Show loading screen
  if (loading) {
    return (
      // Added dark mode support to loading screen
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/home" /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/login" 
          element={user ? <Navigate to="/home" /> : <Login />} 
        />
        
        <Route 
          path="/register" 
          element={user ? <Navigate to="/home" /> : <Register />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Home user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/home/subject/:subjectId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Subject user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/home/subject/:subjectId/topic/:topicId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Topic user={user} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/quiz/:quizId" 
          element={
             <ProtectedRoute user={user} loading={loading}>
                <Quizzes user={user} />
             </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Profile user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Settings user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;