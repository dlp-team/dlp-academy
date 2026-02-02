import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Authentication pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Main app pages
import Home from './pages/Home';
import Subject from './pages/Subject';
import Topic from './pages/Topic';

// Firebase auth
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Protected Route wrapper component
const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👂 Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Usuario detectado en App:", currentUser?.email);
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Redirect to home if already logged in */}
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

        {/* Protected Routes - Main Application */}
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
          path="/profile" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Profile user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Fallback - Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;