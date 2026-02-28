import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
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

const TeacherStudentDetailView = ({ user }) => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [sharedClasses, setSharedClasses] = useState([]);
  const [sharedCourseCount, setSharedCourseCount] = useState(0);
  const [sharedSubjectNames, setSharedSubjectNames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid || !user?.institutionId || !studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const studentRef = doc(db, 'users', studentId);
        const teacherClassesQuery = query(
          collection(db, 'classes'),
          where('institutionId', '==', user.institutionId),
          where('teacherId', '==', user.uid),
        );

        const [studentSnap, teacherClassesSnap] = await Promise.all([
          getDoc(studentRef),
          getDocs(teacherClassesQuery),
        ]);

        if (!studentSnap.exists()) {
          setStudent(null);
          return;
        }

        const studentData = { id: studentSnap.id, ...studentSnap.data() };
        setStudent(studentData);

        const teacherClasses = teacherClassesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const filteredSharedClasses = teacherClasses.filter((cl) => (cl.studentIds || []).includes(studentId));

        const courseIds = [...new Set(filteredSharedClasses.map((cl) => cl.courseId).filter(Boolean))];
        const courseNameById = new Map();
        await Promise.all(
          courseIds.map(async (courseId) => {
            const courseSnap = await getDoc(doc(db, 'courses', courseId));
            if (courseSnap.exists()) {
              courseNameById.set(courseId, courseSnap.data().name || 'Curso');
            }
          }),
        );

        setSharedClasses(
          filteredSharedClasses.map((cl) => ({
            ...cl,
            courseName: courseNameById.get(cl.courseId) || 'Sin curso',
          })),
        );
        setSharedCourseCount(courseIds.length);

        const teacherSubjectIds = Array.isArray(user.subjects) ? user.subjects : [];
        const studentSubjectIds = Array.isArray(studentData.enrolledSubjects) ? studentData.enrolledSubjects : [];
        const sharedSubjectIds = teacherSubjectIds.filter((id) => studentSubjectIds.includes(id));

        if (sharedSubjectIds.length > 0) {
          const subjectSnaps = await Promise.all(
            sharedSubjectIds.map((id) => getDoc(doc(db, 'subjects', id))),
          );

          const names = subjectSnaps
            .filter((snap) => snap.exists())
            .map((snap) => snap.data()?.name || snap.data()?.title || snap.id);

          setSharedSubjectNames(names.length > 0 ? names : sharedSubjectIds);
        } else {
          setSharedSubjectNames([]);
        }
      } catch (error) {
        console.error('Error fetching teacher-student detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Alumno no encontrado</h2>
          <button
            onClick={() => navigate('/teacher-dashboard')}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header user={user} />

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver al Panel del Profesor</span>
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{student.displayName || 'Sin nombre'}</h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 flex-wrap">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{student.email || 'Sin email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Miembro desde {formatDate(student.createdAt)}</span>
                </div>
              </div>
              <div className="mt-3">
                {student.enabled !== false ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                    <CheckCircle2 size={16} /> Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                    <XCircle size={16} /> Inactivo
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold">
              Vista del Profesor
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">Clases compartidas</h3>
              <Users className="text-indigo-600 dark:text-indigo-400" size={22} />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{sharedClasses.length}</p>
            <p className="text-sm text-slate-500 mt-2">Solo tus clases donde este alumno está asignado</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">Cursos compartidos</h3>
              <GraduationCap className="text-blue-600 dark:text-blue-400" size={22} />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{sharedCourseCount}</p>
            <p className="text-sm text-slate-500 mt-2">Derivados de las clases compartidas</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">Asignaturas en común</h3>
              <BookOpen className="text-emerald-600 dark:text-emerald-400" size={22} />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{sharedSubjectNames.length}</p>
            <p className="text-sm text-slate-500 mt-2">Intersección entre tus asignaturas y las del alumno</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tus clases con este alumno</h2>
          {sharedClasses.length === 0 ? (
            <p className="text-slate-500">Este alumno no está en ninguna de tus clases actuales.</p>
          ) : (
            <div className="space-y-3">
              {sharedClasses.map((cl) => (
                <div key={cl.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/60 dark:bg-slate-800/30">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{cl.name || 'Clase sin nombre'}</p>
                  <p className="text-sm text-slate-500 mt-1">{cl.courseName} · {(cl.studentIds || []).length} alumno(s)</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Asignaturas en común</h2>
          {sharedSubjectNames.length === 0 ? (
            <p className="text-slate-500">No hay asignaturas en común registradas en los campos de perfil.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sharedSubjectNames.map((name, index) => (
                <span key={`${name}-${index}`} className="px-3 py-1.5 rounded-full text-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherStudentDetailView;
