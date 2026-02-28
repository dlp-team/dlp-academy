import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from './firebase/config'; // Import db


// Authentication pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';

// Main app pages
import Home from './pages/Home/Home';
import Subject from './pages/Subject/Subject';
import Topic from './pages/Topic/Topic';
import Quizzes from './pages/Quizzes/Quizzes';
import EditQuiz from './pages/Quizzes/QuizEdit';
import StudyGuide from './pages/Content/StudyGuide';
import StudyGuideEditor from './pages/Content/StudyGuideEditor';

// Dashboard pages
import InstitutionAdminDashboard from './pages/InstitutionAdminDashboard/InstitutionAdminDashboard';
import { StudentDetailView, TeacherDetailView } from './pages/InstitutionAdminDashboard/components/UserDetailView';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard/TeacherDashboard';
import TeacherStudentDetailView from './pages/TeacherDashboard/components/TeacherStudentDetailView';

// Updated ProtectedRoute to handle Role Checks
const ProtectedRoute = ({ children, user, loading, requiredRole }) => {
  // 1. Wait for Auth & Database Fetch
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // 2. Not Logged In? -> Login
  if (!user) return <Navigate to="/login" />;

  // 3. Wrong Role? -> Home (Prevent access to Admin Dashboard)
  if (requiredRole && user.role !== requiredRole) {
    console.warn(`Access denied: User role '${user.role}' is not '${requiredRole}'`);
    return <Navigate to="/home" />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous user doc listener
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (firebaseUser) {
        // Listen to user doc in real-time so role updates (e.g. from OnboardingWizard) are reflected immediately
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeUserDoc = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              ...userData
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user data:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL
          });
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/home" />} />
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />

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
        
        {/* Quiz Routes */}
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/quiz/:quizId" 
          element={
             <ProtectedRoute user={user} loading={loading}>
                <Quizzes user={user} />
             </ProtectedRoute>
          } 
        />
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/resumen/:guideId/edit" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <StudyGuideEditor user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/home/subject/:subjectId/topic/:topicId/quiz/:quizId/edit" 
          element={
             <ProtectedRoute user={user} loading={loading}>
                <EditQuiz user={user} />
             </ProtectedRoute>
          } 
        />

        {/* User Profile & Settings */}
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
        
        {/* --- ADMIN DASHBOARD --- */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute user={user} loading={loading} requiredRole="admin">
              <AdminDashboard user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* --- INSTITUTION ADMIN DASHBOARD --- */}
        <Route 
          path="/institution-admin-dashboard" 
          element={
            <ProtectedRoute user={user} loading={loading} requiredRole="institutionadmin">
              <InstitutionAdminDashboard user={user} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/institution-admin-dashboard/teacher/:teacherId"
          element={
            <ProtectedRoute user={user} loading={loading} requiredRole="institutionadmin">
              <TeacherDetailView user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institution-admin-dashboard/student/:studentId"
          element={
            <ProtectedRoute user={user} loading={loading} requiredRole="institutionadmin">
              <StudentDetailView user={user} />
            </ProtectedRoute>
          }
        />
        
        {/* --- TEACHER DASHBOARD --- */}
        <Route 
          path="/teacher-dashboard" 
          element={
            <ProtectedRoute user={user} loading={loading} requiredRole="teacher">
              <TeacherDashboard user={user} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/teacher-dashboard/student/:studentId"
          element={
            <ProtectedRoute user={user} loading={loading} requiredRole="teacher">
              <TeacherStudentDetailView user={user} />
            </ProtectedRoute>
          }
        />

        {/* --- RUTAS DE VISUALIZACIÓN DE CONTENIDO (NUEVAS) --- */}
        
        {/* 1. Ruta para Resúmenes/Guías generadas (Coincide con FileCard) */}
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/resumen/:fileId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <StudyGuide user={user} />
            </ProtectedRoute>
          } 
        />

        {/* 2. Ruta para Recursos/Archivos subidos (Coincide con FileCard) */}
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/resource/:fileId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <StudyGuide user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Ruta legacy (por compatibilidad) */}
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/guide/:guideId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <StudyGuide user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all: Si no coincide ninguna, vuelve a Home */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;