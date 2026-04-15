// src/App.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from './firebase/config'; // Import db


// Authentication pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import OnboardingWizard from './pages/Onboarding/components/OnboardingWizard';
import AdminPasswordWizard from './pages/Auth/components/AdminPasswordWizard';
import Settings from './pages/Settings/Settings';
import Notifications from './pages/Notifications/Notifications';

// Main app pages
import Home from './pages/Home/Home';
import Subject from './pages/Subject/Subject';
import Topic from './pages/Topic/Topic';
import Quizzes from './pages/Quizzes/Quizzes';
import EditQuiz from './pages/Quizzes/QuizEdit';
import QuizReviewPage from './pages/Quizzes/QuizReviewPage';
import QuizRepaso from './pages/Quizzes/QuizRepaso';
import StudyGuide from './pages/Content/StudyGuide';
import StudyGuideEditor from './pages/Content/StudyGuideEditor';
import Formula from './pages/Content/Formula';
import Exam from './pages/Content/Exam';

// Dashboard pages
import InstitutionAdminDashboard from './pages/InstitutionAdminDashboard/InstitutionAdminDashboard';
import { StudentDetailView, TeacherDetailView } from './pages/InstitutionAdminDashboard/components/UserDetailView';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import TeacherStudentDetailView from './pages/TeacherDashboard/components/TeacherStudentDetailView';
import ThemePreview from './pages/ThemePreview/ThemePreview';
import { getActiveRole, getAssignedRoles, hasRequiredRoleAccess } from './utils/permissionUtils';
import { applyThemeToDom } from './utils/themeMode';
import { isInstitutionPreviewThemeMessage } from './utils/institutionPreviewProtocol';

const ACTIVE_ROLE_STORAGE_KEY_PREFIX = 'dlp_active_role_';
const ACTIVE_ROLE_CHANGE_EVENT = 'dlp-active-role-change';
const THEME_PREVIEW_SESSION_KEY = 'dlp_theme_preview_active';
const VALID_ROLES = new Set(['student', 'teacher', 'institutionadmin', 'admin']);
const GLOBAL_SCROLLBAR_OPTIONS = {
  scrollbars: {
    theme: 'os-theme-dlp',
    autoHide: 'scroll',
    autoHideDelay: 140,
    clickScroll: true,
    dragScroll: true,
  },
} as const;

const buildActiveRoleStorageKey = (uid: any) => {
  if (!uid) return null;
  return `${ACTIVE_ROLE_STORAGE_KEY_PREFIX}${uid}`;
};

const readStoredActiveRole = (uid: any) => {
  if (typeof window === 'undefined') return null;
  const storageKey = buildActiveRoleStorageKey(uid);
  if (!storageKey) return null;
  const storedRole = window.localStorage.getItem(storageKey);
  if (!storedRole || typeof storedRole !== 'string') return null;
  const normalizedRole = storedRole.trim().toLowerCase();
  return VALID_ROLES.has(normalizedRole) ? normalizedRole : null;
};

const writeStoredActiveRole = (uid: any, role: any) => {
  if (typeof window === 'undefined') return;
  const storageKey = buildActiveRoleStorageKey(uid);
  if (!storageKey || typeof role !== 'string') return;
  window.localStorage.setItem(storageKey, role);
};

const withActiveRoleContext = (rawUser: any) => {
  if (!rawUser) return rawUser;

  const assignedRoles = getAssignedRoles(rawUser);
  const preferredActiveRole = readStoredActiveRole(rawUser.uid) || rawUser?.activeRole || null;
  const activeRole = getActiveRole({ ...rawUser, activeRole: preferredActiveRole });

  if (rawUser?.uid) {
    writeStoredActiveRole(rawUser.uid, activeRole);
  }

  return {
    ...rawUser,
    availableRoles: assignedRoles,
    activeRole,
  };
};

// src/App.tsx
interface AppUser {
  uid: string;
  email: string | null;
  photoURL: string | null;
  displayName: string;
  role?: string;
  institutionId?: string | null;
  [key: string]: any;
}

const HomePage: any = Home;
const SubjectPage: any = Subject;
const TopicPage: any = Topic;
const QuizzesPage: any = Quizzes;
const EditQuizPage: any = EditQuiz;
const QuizReviewPageAny: any = QuizReviewPage;
const QuizRepasoPage: any = QuizRepaso;
const StudyGuidePage: any = StudyGuide;
const StudyGuideEditorPage: any = StudyGuideEditor;
const FormulaPage: any = Formula;
const ExamPage: any = Exam;
const ProfilePage: any = Profile;
const SettingsPage: any = Settings;
const NotificationsPage: any = Notifications;
const AdminDashboardPage: any = AdminDashboard;
const InstitutionAdminDashboardPage: any = InstitutionAdminDashboard;
const TeacherDetailViewPage: any = TeacherDetailView;
const StudentDetailViewPage: any = StudentDetailView;
const TeacherDashboardPage: any = TeacherDashboard;
const TeacherStudentDetailViewPage: any = TeacherStudentDetailView;
const StudentDashboardPage: any = StudentDashboard;
const ThemePreviewPage: any = ThemePreview;

const ThemePreviewEscapeGuard = () => {
  const location = useLocation();

  if (typeof window === 'undefined') return null;

  const isIframe = window.self !== window.top;
  if (!isIframe) return null;

  let previewSessionActive = false;
  try {
    previewSessionActive = window.sessionStorage.getItem(THEME_PREVIEW_SESSION_KEY) === '1';
  } catch {
    previewSessionActive = false;
  }

  if (!previewSessionActive) return null;
  if (location.pathname.startsWith('/theme-preview')) return null;

  const redirectPath = `/theme-preview${location.pathname}${location.search || ''}`;
  return <Navigate to={redirectPath} replace />;
};

// Updated ProtectedRoute to handle Role Checks
interface ProtectedRouteProps {
  children: ReactNode;
  user: any;
  loading: boolean;
  requiredRole?: string;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  user,
  loading,
  requiredRole,
  allowedRoles,
}) => {
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

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const activeRole = getActiveRole(user);
    const normalizedAllowedRoles = allowedRoles.map((role) => String(role || '').trim().toLowerCase());
    if (!normalizedAllowedRoles.includes(activeRole)) {
      console.warn(`Access denied: active role '${activeRole}' not in [${normalizedAllowedRoles.join(', ')}]`);
      return <Navigate to="/home" />;
    }
  }

  // 3. Wrong Role? -> Home (Prevent access to Admin Dashboard)
  if (requiredRole && !hasRequiredRoleAccess(user, requiredRole)) {
    const activeRole = getActiveRole(user);
    console.warn(`Access denied: active role '${activeRole}' cannot access '${requiredRole}'`);
    return <Navigate to="/home" />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const selectedTheme = user?.theme || user?.settings?.theme || localStorage.getItem('theme') || 'system';
    applyThemeToDom(selectedTheme, { animate: false, persist: true });

    if (selectedTheme !== 'system' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      applyThemeToDom('system', { animate: false, persist: false });
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, [user?.theme, user?.settings?.theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const upsertStyleTag = (id: string, cssText: string) => {
      let styleTag = document.getElementById(id) as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = id;
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = cssText || '';
    };

    upsertStyleTag(
      '__dlp_preview_highlight_hint_base',
      `
body[data-dlp-preview-highlight]::after {
  content: attr(data-dlp-preview-highlight);
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2147483647;
  max-width: min(380px, calc(100vw - 24px));
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(129, 140, 248, 0.45);
  background: rgba(15, 23, 42, 0.86);
  color: #e2e8f0;
  font-size: 12px;
  line-height: 1.35;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.35);
  pointer-events: none;
}
`
    );

    const handlePreviewThemeMessage = (event: MessageEvent) => {
      if (!event || event.origin !== window.location.origin) return;

      const message = event.data;
      if (!isInstitutionPreviewThemeMessage(message)) return;

      const payload = message.payload || {};
      if (typeof payload.themeCss === 'string') {
        upsertStyleTag('__dlp_preview_theme_runtime', payload.themeCss);
      }
      if (typeof payload.highlightCss === 'string') {
        upsertStyleTag('__dlp_preview_highlight_runtime', payload.highlightCss);
      }

      const highlightMessage = typeof payload.highlightMessage === 'string'
        ? payload.highlightMessage.trim()
        : '';

      if (highlightMessage) {
        document.body.setAttribute('data-dlp-preview-highlight', highlightMessage);
      } else {
        document.body.removeAttribute('data-dlp-preview-highlight');
      }

      const previewRole = typeof payload.previewRole === 'string'
        ? payload.previewRole.trim().toLowerCase()
        : '';

      if (user?.uid && (previewRole === 'teacher' || previewRole === 'student')) {
        window.dispatchEvent(new CustomEvent(ACTIVE_ROLE_CHANGE_EVENT, {
          detail: {
            uid: user.uid,
            activeRole: previewRole,
          },
        }));
      }
    };

    window.addEventListener('message', handlePreviewThemeMessage as EventListener);

    return () => {
      window.removeEventListener('message', handlePreviewThemeMessage as EventListener);
      document.body.removeAttribute('data-dlp-preview-highlight');
    };
  }, [user?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const applyActiveRole = (uid: any, requestedRole: any) => {
      setUser((previousUser) => {
        if (!previousUser || !uid || previousUser.uid !== uid) return previousUser;

        const nextActiveRole = getActiveRole({
          ...previousUser,
          activeRole: requestedRole,
        });

        if (nextActiveRole === previousUser.activeRole) return previousUser;

        writeStoredActiveRole(previousUser.uid, nextActiveRole);

        return {
          ...previousUser,
          availableRoles: getAssignedRoles(previousUser),
          activeRole: nextActiveRole,
        };
      });
    };

    const handleRoleChangeEvent = (event: Event) => {
      const roleEvent = event as CustomEvent<{ uid?: string; activeRole?: string }>;
      applyActiveRole(roleEvent?.detail?.uid, roleEvent?.detail?.activeRole);
    };

    const handleStorageEvent = (event: StorageEvent) => {
      setUser((previousUser) => {
        if (!previousUser) return previousUser;

        const expectedStorageKey = buildActiveRoleStorageKey(previousUser.uid);
        if (!expectedStorageKey || event.key !== expectedStorageKey || !event.newValue) {
          return previousUser;
        }

        const nextActiveRole = getActiveRole({
          ...previousUser,
          activeRole: event.newValue,
        });

        if (nextActiveRole === previousUser.activeRole) return previousUser;

        return {
          ...previousUser,
          availableRoles: getAssignedRoles(previousUser),
          activeRole: nextActiveRole,
        };
      });
    };

    window.addEventListener(ACTIVE_ROLE_CHANGE_EVENT, handleRoleChangeEvent as EventListener);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(ACTIVE_ROLE_CHANGE_EVENT, handleRoleChangeEvent as EventListener);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous user doc listener
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (firebaseUser) {
        const baseUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          displayName: firebaseUser.displayName || ''
        };

        const userDocRef = doc(db, 'users', firebaseUser.uid);

        (async () => {
          try {
            const initialSnap = await getDoc(userDocRef);

            if (!initialSnap.exists()) {
              // Bootstrap missing users/{uid} so next reads and onboarding are deterministic.
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL || '',
                displayName: firebaseUser.displayName || (firebaseUser.email || '').split('@')[0] || '',
                role: 'student',
                institutionId: null,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                settings: {
                  theme: 'system',
                  language: 'es',
                  viewMode: 'grid'
                }
              }, { merge: true });
            }
          } catch (error) {
            // If profile read is denied, avoid opening a realtime listener that will spam uncaught watch errors.
            if ((error as any)?.code === 'permission-denied') {
              console.error('Permission denied reading users doc on auth bootstrap:', error);
              setUser(withActiveRoleContext(baseUser));
              setLoading(false);
              return;
            }
          }

          // Listen to user doc in real-time so role updates (e.g. from OnboardingWizard) are reflected immediately
          unsubscribeUserDoc = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const mergedUser = {
                ...baseUser,
                ...userData
              };
              setUser(withActiveRoleContext(mergedUser));
            } else {
              setUser(withActiveRoleContext(baseUser));
            }
            setLoading(false);
          }, (error: any) => {
            console.error("Error listening to user data:", error);
            setUser(withActiveRoleContext(baseUser));
            setLoading(false);
          });
        })();
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
    <OverlayScrollbarsComponent
      defer
      className="app-global-scrollbar"
      options={GLOBAL_SCROLLBAR_OPTIONS}
    >
      <BrowserRouter>

        <ThemePreviewEscapeGuard />

        {user && <OnboardingWizard user={user} />}
        {user && <AdminPasswordWizard user={user} />}

        <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/home" />} />
        <Route path="/theme-preview/*" element={<ThemePreviewPage />} />
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />

        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <HomePage user={user} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/home/subject/:subjectId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <SubjectPage user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/home/subject/:subjectId/topic/:topicId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <TopicPage user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Quiz Routes */}
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/quiz/:quizId" 
          element={
             <ProtectedRoute user={user} loading={loading}>
                 <QuizzesPage user={user} />
             </ProtectedRoute>
          } 
        />
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/resumen/:guideId/edit" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <StudyGuideEditorPage user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/home/subject/:subjectId/topic/:topicId/quiz/:quizId/edit" 
          element={
             <ProtectedRoute user={user} loading={loading}>
                 <EditQuizPage user={user} />
             </ProtectedRoute>
          } 
        />

          <Route
           path="/home/subject/:subjectId/topic/:topicId/quiz/:quizId/review"
           element={
             <ProtectedRoute user={user} loading={loading}>
               <QuizReviewPageAny user={user} />
             </ProtectedRoute>
           }
          />

          <Route
           path="/home/subject/:subjectId/topic/:topicId/quizzes/repaso"
           element={
             <ProtectedRoute user={user} loading={loading}>
               <QuizRepasoPage user={user} />
             </ProtectedRoute>
           }
          />

        {/* User Profile & Settings */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <ProfilePage user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <SettingsPage user={user} />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <NotificationsPage user={user} />
            </ProtectedRoute>
          }
        />
        
        {/* --- ADMIN DASHBOARD --- */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute
              user={user}
              loading={loading}
              requiredRole="admin"
              allowedRoles={['admin']}
            >
              <AdminDashboardPage user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* --- INSTITUTION ADMIN DASHBOARD --- */}
        <Route 
          path="/institution-admin-dashboard" 
          element={
            <ProtectedRoute
              user={user}
              loading={loading}
              requiredRole="institutionadmin"
              allowedRoles={['institutionadmin', 'admin']}
            >
              <InstitutionAdminDashboardPage user={user} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/institution-admin-dashboard/teacher/:teacherId"
          element={
            <ProtectedRoute
              user={user}
              loading={loading}
              requiredRole="institutionadmin"
              allowedRoles={['institutionadmin', 'admin']}
            >
              <TeacherDetailViewPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institution-admin-dashboard/student/:studentId"
          element={
            <ProtectedRoute
              user={user}
              loading={loading}
              requiredRole="institutionadmin"
              allowedRoles={['institutionadmin', 'admin']}
            >
              <StudentDetailViewPage user={user} />
            </ProtectedRoute>
          }
        />
        
        {/* --- TEACHER DASHBOARD --- */}
        <Route 
          path="/teacher-dashboard" 
          element={
            <ProtectedRoute
              user={user}
              loading={loading}
              requiredRole="teacher"
              allowedRoles={['teacher']}
            >
              <TeacherDashboardPage user={user} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/teacher-dashboard/student/:studentId"
          element={
            <ProtectedRoute
              user={user}
              loading={loading}
              requiredRole="teacher"
              allowedRoles={['teacher']}
            >
              <TeacherStudentDetailViewPage user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute
              user={user}
              loading={loading}
              requiredRole="student"
              allowedRoles={['student']}
            >
              <StudentDashboardPage user={user} />
            </ProtectedRoute>
          }
        />

        {/* --- RUTAS DE VISUALIZACIÓN DE CONTENIDO (NUEVAS) --- */}
        
        {/* 1. Ruta para Resúmenes/Guías generadas (Coincide con FileCard) */}
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/resumen/:fileId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <StudyGuidePage user={user} />
            </ProtectedRoute>
          } 
        />

        {/* 2. Ruta para Recursos/Archivos subidos (Coincide con FileCard) */}
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/resource/:fileId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <StudyGuidePage user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Ruta legacy (por compatibilidad) */}
        <Route 
          path="/home/subject/:subjectId/topic/:topicId/guide/:guideId" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <StudyGuidePage user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para Fórmulas (nueva) */}
        <Route
          path="/home/subject/:subjectId/topic/:topicId/formulas/:fileId"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <FormulaPage user={user} />
            </ProtectedRoute>
          }
        />

        {/* Ruta para Exámenes de Prueba */}
        <Route
          path="/home/subject/:subjectId/topic/:topicId/exam/:examId"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <ExamPage user={user} />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: Si no coincide ninguna, vuelve a Home */}
        <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
    </OverlayScrollbarsComponent>
  );
}

export default App;