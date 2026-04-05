// src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx
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
import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Header from '../../../components/layout/Header';
import { getCourseDisplayLabel } from '../../../utils/courseLabelUtils';

const normalizeId = (value: any) => String(value || '').trim();

const toUniqueIds = (values: any[] = []) => Array.from(new Set(values.map(normalizeId).filter(Boolean)));

const getStudentProfileLinkedCourseIds = (student: any = {}) => toUniqueIds([
  student?.courseId,
  ...(Array.isArray(student?.courseIds) ? student.courseIds : []),
  ...(Array.isArray(student?.enrolledCourseIds) ? student.enrolledCourseIds : []),
]);

const formatDate = (timestampValue: any) => {
  try {
    if (!timestampValue) return 'N/A';
    if (typeof timestampValue.toDate === 'function') return timestampValue.toDate().toLocaleDateString();
    return new Date(timestampValue).toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

const getProfilePhotoUrl = (profile: any = {}) => {
  const candidateUrls = [
    profile?.profilePhotoUrl,
    profile?.photoURL,
    profile?.avatarUrl,
    profile?.avatarURL,
    profile?.photoUrl,
  ];

  return candidateUrls
    .map((entry) => String(entry || '').trim())
    .find(Boolean) || '';
};

const getUserInitials = (profile: any = {}) => {
  const displayName = String(profile?.displayName || '').trim();
  if (displayName) {
    const tokens = displayName.split(/\s+/).filter(Boolean);
    const initials = tokens.slice(0, 2).map((token) => token[0]?.toUpperCase() || '').join('');
    if (initials) return initials;
  }

  const email = String(profile?.email || '').trim();
  return (email[0] || '?').toUpperCase();
};

const isArchivedClass = (row: any = {}) => String(row?.status || '').trim().toLowerCase() === 'archived';

const UserDetailView = ({ user, userType }: any) => {
  const { teacherId, studentId } = useParams();
  const navigate = useNavigate();

  const [viewedUser, setViewedUser] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    classCount: 0,
    courseCount: 0,
    studentCount: 0,
    teacherCount: 0,
    subjectCount: 0,
  });
  const [relatedRows, setRelatedRows] = useState<any[]>([]);
  const [pastRelatedRows, setPastRelatedRows] = useState<any[]>([]);
  const [institutionCourses, setInstitutionCourses] = useState<any[]>([]);
  const [linkedCourseIds, setLinkedCourseIds] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isUpdatingCourseLinks, setIsUpdatingCourseLinks] = useState(false);
  const [courseLinkMessage, setCourseLinkMessage] = useState({ type: '', text: '' });
  const [profilePhotoLoadFailed, setProfilePhotoLoadFailed] = useState(false);
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
          setRelatedRows([]);
          setPastRelatedRows([]);
          return;
        }

        const fetchedUser: any = { id: viewedUserSnap.id, ...viewedUserSnap.data() };
        setViewedUser(fetchedUser);

        const allClasses = classesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        const allCourses = coursesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        const teachersById = new Map<string, any>(teachersSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() }]));
        const coursesById = new Map(allCourses.map((course) => [course.id, course]));
        setInstitutionCourses(allCourses);

        const getCourseLabelById = (courseId: any) => {
          const course = coursesById.get(courseId);
          return course ? getCourseDisplayLabel(course) : 'Sin curso';
        };

        if (userType === 'teacher') {
          const assignedClasses = allClasses.filter((cl) => cl.teacherId === userId);
          const uniqueCourseIds = new Set(assignedClasses.map((cl) => cl.courseId).filter(Boolean));
          const uniqueStudentIds = new Set();
          assignedClasses.forEach((cl: any) => (cl.studentIds || []).forEach((id) => uniqueStudentIds.add(id)));

          const assignedClassRows = assignedClasses.map((cl: any) => ({
            id: cl.id,
            name: cl.name || 'Clase sin nombre',
            courseId: cl.courseId || null,
            subtitle: getCourseLabelById(cl.courseId),
            meta: `${(cl.studentIds || []).length} alumno(s)`,
            status: cl.status || '',
          }));

          const activeAssignedClassRows = assignedClassRows.filter((row: any) => !isArchivedClass(row));
          const archivedAssignedClassRows = assignedClassRows.filter((row: any) => isArchivedClass(row));

          setMetrics({
            classCount: assignedClasses.length,
            courseCount: uniqueCourseIds.size,
            studentCount: uniqueStudentIds.size,
            teacherCount: 0,
            subjectCount: Array.isArray(fetchedUser.subjects) ? fetchedUser.subjects.length : uniqueCourseIds.size,
          });

          setRelatedRows(activeAssignedClassRows);
          setPastRelatedRows(archivedAssignedClassRows);

          setLinkedCourseIds([]);
          setSelectedCourseId('');
          setCourseLinkMessage({ type: '', text: '' });
        } else {
          const studentClasses = allClasses.filter((cl: any) => (cl.studentIds || []).includes(userId));
          const uniqueCourseIds = new Set([
            ...studentClasses.map((cl) => cl.courseId).filter(Boolean),
            ...getStudentProfileLinkedCourseIds(fetchedUser),
          ]);
          const uniqueTeacherIds = new Set(studentClasses.map((cl) => cl.teacherId).filter(Boolean));

          setMetrics({
            classCount: studentClasses.length,
            courseCount: uniqueCourseIds.size,
            studentCount: 0,
            teacherCount: uniqueTeacherIds.size,
            subjectCount: Array.isArray(fetchedUser.enrolledSubjects) ? fetchedUser.enrolledSubjects.length : uniqueCourseIds.size,
          });

          const studentClassRows = studentClasses.map((cl: any) => {
            const teacher: any = teachersById.get(cl.teacherId);
            return {
              id: cl.id,
              name: cl.name || 'Clase sin nombre',
              courseId: cl.courseId || null,
              subtitle: getCourseLabelById(cl.courseId),
              meta: teacher ? (teacher.displayName || teacher.email || 'Profesor asignado') : 'Sin profesor asignado',
              status: cl.status || '',
            };
          });

          const activeStudentClassRows = studentClassRows.filter((row: any) => !isArchivedClass(row));
          const archivedStudentClassRows = studentClassRows.filter((row: any) => isArchivedClass(row));

          setRelatedRows(activeStudentClassRows);
          setPastRelatedRows(archivedStudentClassRows);

          setLinkedCourseIds(getStudentProfileLinkedCourseIds(fetchedUser));
          setCourseLinkMessage({ type: '', text: '' });
          setSelectedCourseId('');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, user?.institutionId, userType]);

  useEffect(() => {
    setProfilePhotoLoadFailed(false);
  }, [viewedUser?.id, viewedUser?.profilePhotoUrl, viewedUser?.photoURL, viewedUser?.avatarUrl]);

  const roleBadge = useMemo(
    () => (userType === 'teacher'
      ? { label: 'Profesor', Icon: BookOpen }
      : { label: 'Alumno', Icon: GraduationCap }),
    [userType],
  );

  const profilePhotoUrl = useMemo(() => getProfilePhotoUrl(viewedUser), [viewedUser]);

  const profileInitials = useMemo(() => getUserInitials(viewedUser), [viewedUser]);

  const coursesById = useMemo(
    () => new Map(institutionCourses.map((course: any) => [course.id, course])),
    [institutionCourses],
  );

  const linkedCourses = useMemo(() => (
    linkedCourseIds.map((courseId: any) => {
      const course = coursesById.get(courseId);
      return {
        id: courseId,
        label: course ? getCourseDisplayLabel(course) : `Curso (${courseId})`,
        isArchived: !course,
      };
    })
  ), [linkedCourseIds, coursesById]);

  const availableCourses = useMemo(() => {
    const linkedSet = new Set(linkedCourseIds.map((courseId: any) => normalizeId(courseId)));
    return institutionCourses.filter((course: any) => !linkedSet.has(normalizeId(course?.id)));
  }, [institutionCourses, linkedCourseIds]);

  const syncStudentCourseLinks = async (nextCourseIds: any[] = []) => {
    if (userType !== 'student' || !viewedUser?.id || isUpdatingCourseLinks) return;

    if (normalizeId(viewedUser?.institutionId) && normalizeId(viewedUser?.institutionId) !== normalizeId(user?.institutionId)) {
      setCourseLinkMessage({
        type: 'error',
        text: 'No se pueden modificar cursos de un alumno de otra institución.',
      });
      return;
    }

    const normalizedCourseIds = toUniqueIds(nextCourseIds);
    const courseIdsFromClasses = new Set(relatedRows.map((row: any) => normalizeId(row?.courseId)).filter(Boolean));
    const mergedCourseCount = new Set([...Array.from(courseIdsFromClasses), ...normalizedCourseIds]).size;

    setIsUpdatingCourseLinks(true);
    setCourseLinkMessage({ type: '', text: '' });
    try {
      await updateDoc(doc(db, 'users', viewedUser.id), {
        courseId: normalizedCourseIds[0] || null,
        courseIds: normalizedCourseIds,
        enrolledCourseIds: normalizedCourseIds,
        updatedAt: serverTimestamp(),
      });

      setLinkedCourseIds(normalizedCourseIds);
      setViewedUser((prev: any) => ({
        ...prev,
        courseId: normalizedCourseIds[0] || null,
        courseIds: normalizedCourseIds,
        enrolledCourseIds: normalizedCourseIds,
      }));
      setMetrics((previous: any) => ({
        ...previous,
        courseCount: mergedCourseCount,
      }));
      setCourseLinkMessage({ type: 'success', text: 'Cursos actualizados correctamente.' });
    } catch (error) {
      console.error('Error updating student course links:', error);
      setCourseLinkMessage({
        type: 'error',
        text: 'No se pudieron actualizar los cursos del alumno. Inténtalo de nuevo.',
      });
    } finally {
      setIsUpdatingCourseLinks(false);
    }
  };

  const handleAddCourseLink = async () => {
    const normalizedSelectedCourseId = normalizeId(selectedCourseId);
    if (!normalizedSelectedCourseId) {
      setCourseLinkMessage({ type: 'error', text: 'Selecciona un curso para vincular.' });
      return;
    }

    const selectedCourseExists = availableCourses.some((course: any) => normalizeId(course?.id) === normalizedSelectedCourseId);
    if (!selectedCourseExists) {
      setCourseLinkMessage({ type: 'error', text: 'El curso seleccionado no está disponible para vincular.' });
      return;
    }

    await syncStudentCourseLinks([...linkedCourseIds, normalizedSelectedCourseId]);
    setSelectedCourseId('');
  };

  const handleRemoveCourseLink = async (courseIdToRemove: any) => {
    const normalizedCourseId = normalizeId(courseIdToRemove);
    if (!normalizedCourseId) return;

    await syncStudentCourseLinks(linkedCourseIds.filter((courseId: any) => normalizeId(courseId) !== normalizedCourseId));
  };

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
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                {profilePhotoUrl && !profilePhotoLoadFailed ? (
                  <img
                    src={profilePhotoUrl}
                    alt={`Foto de perfil de ${viewedUser.displayName || viewedUser.email || 'usuario'}`}
                    className="h-full w-full object-cover"
                    onError={() => setProfilePhotoLoadFailed(true)}
                  />
                ) : (
                  <span>{profileInitials}</span>
                )}
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

            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold inline-flex items-center gap-2">
              <roleBadge.Icon size={16} />
              {roleBadge.label}
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

        {userType === 'student' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vinculación de cursos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Gestiona qué cursos puede tomar este alumno en la institución.
            </p>

            <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                disabled={isUpdatingCourseLinks || availableCourses.length === 0}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecciona un curso...</option>
                {availableCourses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {getCourseDisplayLabel(course)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddCourseLink}
                disabled={isUpdatingCourseLinks || !selectedCourseId}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60"
              >
                {isUpdatingCourseLinks ? 'Guardando...' : 'Vincular curso'}
              </button>
            </div>

            {courseLinkMessage.text && (
              <p className={`mb-4 text-sm font-medium ${courseLinkMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {courseLinkMessage.text}
              </p>
            )}

            {linkedCourses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Este alumno todavía no tiene cursos vinculados manualmente.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {linkedCourses.map((course: any) => (
                  <span
                    key={course.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${course.isArchived ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}
                  >
                    {course.label}
                    <button
                      type="button"
                      onClick={() => handleRemoveCourseLink(course.id)}
                      disabled={isUpdatingCourseLinks}
                      aria-label={`Quitar ${course.label}`}
                      className="text-xs font-black hover:opacity-80 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {userType === 'teacher' ? 'Clases asignadas' : 'Clases donde está inscrito'}
          </h2>

          {relatedRows.length === 0 ? (
            <div className="text-center py-14">
              <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-gray-500">No hay clases activas relacionadas para este usuario.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relatedRows.map((row: any) => (
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

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Clases pasadas</h2>

          {pastRelatedRows.length === 0 ? (
            <div className="text-center py-14">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-gray-500">No hay clases pasadas registradas para este usuario.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastRelatedRows.map((row: any) => (
                <div
                  key={`past-${row.id}`}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{row.name}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
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
