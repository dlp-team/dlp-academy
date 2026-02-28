import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Header from '../../../components/layout/Header';

const formatDate = (timestampValue) => {
  try {
    if (!timestampValue) return 'N/A';
    if (typeof timestampValue.toDate === 'function') return timestampValue.toDate().toLocaleDateString();
    return new Date(timestampValue).toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

const UserDetailView = ({ user, userType }) => {
  const { teacherId, studentId } = useParams();
  const navigate = useNavigate();

  const [viewedUser, setViewedUser] = useState(null);
  const [metrics, setMetrics] = useState({
    classCount: 0,
    courseCount: 0,
    studentCount: 0,
    teacherCount: 0,
    subjectCount: 0,
  });
  const [relatedRows, setRelatedRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = userType === 'teacher' ? teacherId : studentId;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId || !user?.institutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const userRef = doc(db, 'users', userId);
        const classesQuery = query(collection(db, 'classes'), where('institutionId', '==', user.institutionId));
        const coursesQuery = query(collection(db, 'courses'), where('institutionId', '==', user.institutionId));
        const teachersQuery = query(
          collection(db, 'users'),
          where('institutionId', '==', user.institutionId),
          where('role', '==', 'teacher'),
        );

        const [viewedUserSnap, classesSnap, coursesSnap, teachersSnap] = await Promise.all([
          getDoc(userRef),
          getDocs(classesQuery),
          getDocs(coursesQuery),
          getDocs(teachersQuery),
        ]);

        if (!viewedUserSnap.exists()) {
          setViewedUser(null);
          return;
        }

        const fetchedUser = { id: viewedUserSnap.id, ...viewedUserSnap.data() };
        setViewedUser(fetchedUser);

        const allClasses = classesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const allCourses = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const teachersById = new Map(teachersSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() }]));
        const coursesById = new Map(allCourses.map((course) => [course.id, course]));

        if (userType === 'teacher') {
          const assignedClasses = allClasses.filter((cl) => cl.teacherId === userId);
          const uniqueCourseIds = new Set(assignedClasses.map((cl) => cl.courseId).filter(Boolean));
          const uniqueStudentIds = new Set();
          assignedClasses.forEach((cl) => (cl.studentIds || []).forEach((id) => uniqueStudentIds.add(id)));

          setMetrics({
            classCount: assignedClasses.length,
            courseCount: uniqueCourseIds.size,
            studentCount: uniqueStudentIds.size,
            teacherCount: 0,
            subjectCount: Array.isArray(fetchedUser.subjects) ? fetchedUser.subjects.length : uniqueCourseIds.size,
          });

          setRelatedRows(
            assignedClasses.map((cl) => ({
              id: cl.id,
              name: cl.name || 'Clase sin nombre',
              subtitle: coursesById.get(cl.courseId)?.name || 'Sin curso',
              meta: `${(cl.studentIds || []).length} alumno(s)`,
            })),
          );
        } else {
          const studentClasses = allClasses.filter((cl) => (cl.studentIds || []).includes(userId));
          const uniqueCourseIds = new Set(studentClasses.map((cl) => cl.courseId).filter(Boolean));
          const uniqueTeacherIds = new Set(studentClasses.map((cl) => cl.teacherId).filter(Boolean));

          setMetrics({
            classCount: studentClasses.length,
            courseCount: uniqueCourseIds.size,
            studentCount: 0,
            teacherCount: uniqueTeacherIds.size,
            subjectCount: Array.isArray(fetchedUser.enrolledSubjects) ? fetchedUser.enrolledSubjects.length : uniqueCourseIds.size,
          });

          setRelatedRows(
            studentClasses.map((cl) => {
              const teacher = teachersById.get(cl.teacherId);
              return {
                id: cl.id,
                name: cl.name || 'Clase sin nombre',
                subtitle: coursesById.get(cl.courseId)?.name || 'Sin curso',
                meta: teacher ? (teacher.displayName || teacher.email || 'Profesor asignado') : 'Sin profesor asignado',
              };
            }),
          );
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, user?.institutionId, userType]);

  const roleBadgeLabel = useMemo(
    () => (userType === 'teacher' ? '👨‍🏫 Profesor' : '👨‍🎓 Alumno'),
    [userType],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!viewedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Usuario no encontrado</h2>
          <button
            onClick={() => navigate('/institution-admin-dashboard')}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header user={user} />

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/institution-admin-dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver al Panel</span>
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {viewedUser.displayName?.[0] || viewedUser.email?.[0] || '?'}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{viewedUser.displayName || 'Sin nombre'}</h1>
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{viewedUser.email || 'Sin email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Miembro desde {formatDate(viewedUser.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-3">
                  {viewedUser.enabled !== false ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                      <CheckCircle2 size={16} /> Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                      <XCircle size={16} /> Deshabilitado
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold">
              {roleBadgeLabel}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {userType === 'teacher' ? 'Asignaturas/Curso' : 'Asignaturas inscritas'}
              </h3>
              <BookOpen className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.subjectCount}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {userType === 'teacher' ? 'Relacionadas con sus clases' : 'Activas en la institución'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {userType === 'teacher' ? 'Alumnos únicos' : 'Profesores asignados'}
              </h3>
              <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {userType === 'teacher' ? metrics.studentCount : metrics.teacherCount}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {userType === 'teacher' ? 'En todas sus clases' : 'Con clases compartidas'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad</h3>
              <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatDate(viewedUser.lastLogin)}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Último acceso</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {userType === 'teacher' ? 'Clases asignadas' : 'Clases donde está inscrito'}
          </h2>

          {relatedRows.length === 0 ? (
            <div className="text-center py-14">
              <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-gray-500">No hay datos de clases relacionadas para este usuario.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relatedRows.map((row) => (
                <div
                  key={row.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{row.name}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">
                      {row.meta}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{row.subtitle}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export const TeacherDetailView = ({ user }) => <UserDetailView user={user} userType="teacher" />;
export const StudentDetailView = ({ user }) => <UserDetailView user={user} userType="student" />;

export default UserDetailView;
