// src/pages/InstitutionAdminDashboard/hooks/useUsers.ts
import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { getInstitutionalAccessCodePreview } from '../../../services/accessCodeService';
import { DEFAULT_ACCESS_POLICIES, normalizeAccessPolicies } from '../../../utils/institutionPolicyUtils';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { buildInstitutionScopedPersistenceKey } from '../../../utils/pagePersistence';

const USERS_PAGE_SIZE = 25;

const normalizeId = (value: any) => String(value || '').trim();

const toUniqueIds = (values: any[] = []) => Array.from(new Set(values.map(normalizeId).filter(Boolean)));

const getStudentProfileCourseIds = (student: any = {}) => toUniqueIds([
  student?.courseId,
  ...(Array.isArray(student?.courseIds) ? student.courseIds : []),
  ...(Array.isArray(student?.enrolledCourseIds) ? student.enrolledCourseIds : []),
]);

export const useUsers = (user, institutionIdOverride = null, options: any = {}) => {
  const shouldLoadAllUsers = options?.loadAllUsers === true;
  const effectiveInstitutionId = institutionIdOverride || user?.institutionId || null;
  const userTypeKey = buildInstitutionScopedPersistenceKey('institution-admin-users', effectiveInstitutionId, 'user-type');
  const [userType, setUserType] = usePersistentState(userTypeKey, 'teachers');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allowedTeachers, setAllowedTeachers] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [institutionCourses, setInstitutionCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);
  const [teacherPagination, setTeacherPagination] = useState<{ lastVisible: any; hasMore: boolean }>({ lastVisible: null, hasMore: false });
  const [studentPagination, setStudentPagination] = useState<{ lastVisible: any; hasMore: boolean }>({ lastVisible: null, hasMore: false });
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const [institutionalCode, setInstitutionalCode] = useState('');
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const [liveAccessCode, setLiveAccessCode] = useState('');
  const [liveCodeLoading, setLiveCodeLoading] = useState(false);
  const [liveCodeError, setLiveCodeError] = useState('');
  const [codeUpdateSuccess, setCodeUpdateSuccess] = useState('');
  const [codeUpdateError, setCodeUpdateError] = useState('');

  const [accessPolicies, setAccessPolicies] = useState(DEFAULT_ACCESS_POLICIES);
  const [isUpdatingPolicies, setIsUpdatingPolicies] = useState(false);
  const [policyMessage, setPolicyMessage] = useState({ type: '', text: '' });
  const [showSudoModal, setShowSudoModal] = useState(false);
  const [pendingPolicies, setPendingPolicies] = useState<any>(null);

  const buildInstitutionRoleUsersQuery = (role: any, cursor: any = null) => {
    const queryConstraints: any[] = [
      where('institutionId', '==', effectiveInstitutionId),
      where('role', '==', role),
      limit(USERS_PAGE_SIZE),
    ];

    if (cursor) {
      queryConstraints.push(startAfter(cursor));
    }

    return query(collection(db, 'users'), ...queryConstraints);
  };

  const fetchData = useCallback(async () => {
    if (!effectiveInstitutionId) return;
    setLoading(true);
    setIsLoadingMoreUsers(false);
    try {
      if (userType === 'teachers') {
        const [teachersSnap, allowedSnap] = await Promise.all([
          getDocs(buildInstitutionRoleUsersQuery('teacher')),
          getDocs(query(collection(db, 'institution_invites'), where('institutionId', '==', effectiveInstitutionId))),
        ]);

        const teacherDocs = teachersSnap.docs;
        setTeachers(teacherDocs.map(d => ({ id: d.id, ...d.data() })));
        setTeacherPagination({
          lastVisible: teacherDocs.length > 0 ? teacherDocs[teacherDocs.length - 1] : null,
          hasMore: teacherDocs.length === USERS_PAGE_SIZE,
        });

        setAllowedTeachers(allowedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const generalInvite = allowedSnap.docs.find(d => d.data().type === 'institutional');
        setInstitutionalCode(generalInvite ? generalInvite.id : '');
        setStudents([]);
        setInstitutionCourses([]);
        setStudentPagination({ lastVisible: null, hasMore: false });
      } else {
        const [studentsSnap, coursesSnap] = await Promise.all([
          getDocs(buildInstitutionRoleUsersQuery('student')),
          getDocs(query(collection(db, 'courses'), where('institutionId', '==', effectiveInstitutionId))),
        ]);
        const studentDocs = studentsSnap.docs;
        const courseDocs = coursesSnap.docs.map((courseDoc: any) => ({ id: courseDoc.id, ...courseDoc.data() }));

        setStudents(studentDocs.map(d => ({ id: d.id, ...d.data() })));
        setStudentPagination({
          lastVisible: studentDocs.length > 0 ? studentDocs[studentDocs.length - 1] : null,
          hasMore: studentDocs.length === USERS_PAGE_SIZE,
        });
        setInstitutionCourses(courseDocs.filter((course: any) => course?.status !== 'trashed'));

        setTeachers([]);
        setTeacherPagination({ lastVisible: null, hasMore: false });
        setAllowedTeachers([]);
      }
      const instDoc = await getDoc(doc(db, 'institutions', effectiveInstitutionId));
      if (instDoc.exists()) {
        setAccessPolicies(normalizeAccessPolicies(instDoc.data().accessPolicies));
      } else {
        setAccessPolicies(DEFAULT_ACCESS_POLICIES);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [effectiveInstitutionId, userType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLoadMoreUsers = async () => {
    if (!effectiveInstitutionId || isLoadingMoreUsers || loading) return;

    const loadingTeachers = userType === 'teachers';
    const currentPagination = loadingTeachers ? teacherPagination : studentPagination;
    if (!currentPagination?.hasMore || !currentPagination?.lastVisible) return;

    setIsLoadingMoreUsers(true);
    try {
      const nextPageSnap = await getDocs(
        buildInstitutionRoleUsersQuery(loadingTeachers ? 'teacher' : 'student', currentPagination.lastVisible)
      );
      const nextDocs = nextPageSnap.docs;
      const mappedUsers = nextDocs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

      if (loadingTeachers) {
        setTeachers((prev: any[]) => [...prev, ...mappedUsers]);
        setTeacherPagination({
          lastVisible: nextDocs.length > 0 ? nextDocs[nextDocs.length - 1] : currentPagination.lastVisible,
          hasMore: nextDocs.length === USERS_PAGE_SIZE,
        });
      } else {
        setStudents((prev: any[]) => [...prev, ...mappedUsers]);
        setStudentPagination({
          lastVisible: nextDocs.length > 0 ? nextDocs[nextDocs.length - 1] : currentPagination.lastVisible,
          hasMore: nextDocs.length === USERS_PAGE_SIZE,
        });
      }
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setIsLoadingMoreUsers(false);
    }
  };

  // Live access code polling
  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const refreshLiveCode = async () => {
      if (!effectiveInstitutionId) return;
      const policy = accessPolicies?.[userType] || { requireCode: true, rotationIntervalHours: 24 };
      if (policy.requireCode === false) {
        if (!cancelled) { setLiveAccessCode(''); setLiveCodeError(''); }
        return;
      }
      setLiveCodeLoading(true);
      setLiveCodeError('');
      try {
        const preview: any = await getInstitutionalAccessCodePreview({
          institutionId: effectiveInstitutionId,
          userType: userType === 'students' ? 'student' : 'teacher',
          intervalHours: Number(policy.rotationIntervalHours || 24),
        });
        if (!cancelled) setLiveAccessCode(preview?.code || '------');
      } catch {
        if (!cancelled) { setLiveAccessCode('------'); setLiveCodeError('No se pudo obtener el código en este momento.'); }
      } finally {
        if (!cancelled) setLiveCodeLoading(false);
      }
    };

    refreshLiveCode();
    intervalId = setInterval(refreshLiveCode, 30000);
    return () => { cancelled = true; if (intervalId) clearInterval(intervalId); };
  }, [effectiveInstitutionId, userType, accessPolicies]);

  // Fetch all teachers/students for org view
  useEffect(() => {
    if (!effectiveInstitutionId || !shouldLoadAllUsers) {
      setAllTeachers([]);
      setAllStudents([]);
      return;
    }

    Promise.all([
      getDocs(query(collection(db, 'users'), where('institutionId', '==', effectiveInstitutionId), where('role', '==', 'teacher'))),
      getDocs(query(collection(db, 'users'), where('institutionId', '==', effectiveInstitutionId), where('role', '==', 'student'))),
    ]).then(([teachersSnap, studentsSnap]: any) => {
      setAllTeachers(teachersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [effectiveInstitutionId, shouldLoadAllUsers]);

  const handleAddUser = async (e: any) => {
    e.preventDefault();
    const normalizedEmail = newUserEmail.toLowerCase().trim();
    if (!normalizedEmail) return;
    setIsSubmitting(true);
    setAddError('');
    setAddSuccess('');
    try {
      const qUser = query(collection(db, 'users'), where('email', '==', normalizedEmail), where('institutionId', '==', effectiveInstitutionId));
      const existingUserSnap = await getDocs(qUser);
      if (!existingUserSnap.empty) {
        setAddError('Este profesor ya está registrado y activo en tu institución.');
        return;
      }
      const qInvite = query(collection(db, 'institution_invites'), where('email', '==', normalizedEmail), where('institutionId', '==', effectiveInstitutionId));
      const existingInviteSnap = await getDocs(qInvite);
      if (!existingInviteSnap.empty) {
        setAddError('Este profesor ya tiene una invitación pendiente.');
        return;
      }
      await addDoc(collection(db, 'institution_invites'), {
        email: normalizedEmail,
        institutionId: effectiveInstitutionId,
        role: 'teacher',
        type: 'direct',
        createdAt: serverTimestamp(),
      });
      setAddSuccess('Profesor invitado correctamente. Puede copiar el código de acceso en la tabla.');
      setNewUserEmail('');
      setTimeout(() => setShowAddUserModal(false), 2000);
      fetchData();
    } catch (error) {
      console.error('Error adding user:', error);
      setAddError('Ocurrió un error al invitar al profesor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInstitutionalCode = async (newCode: any) => {
    if (!newCode.trim()) return;
    const finalCode = newCode.trim().toUpperCase();
    setIsUpdatingCode(true);
    setCodeUpdateSuccess('');
    setCodeUpdateError('');
    try {
      const q = query(collection(db, 'institution_invites'), where('institutionId', '==', effectiveInstitutionId), where('type', '==', 'institutional'));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await setDoc(doc(db, 'institution_invites', finalCode), {
        institutionId: effectiveInstitutionId,
        role: 'teacher',
        type: 'institutional',
        createdAt: serverTimestamp(),
      });
      setInstitutionalCode(finalCode);
      fetchData();
      setCodeUpdateSuccess('Código actualizado con éxito.');
      setTimeout(() => setCodeUpdateSuccess(''), 4000);
    } catch (error) {
      console.error('Error updating code:', error);
      setCodeUpdateError('Este código ya está en uso. Intenta con otro.');
      setTimeout(() => setCodeUpdateError(''), 5000);
    } finally {
      setIsUpdatingCode(false);
    }
  };

  const handleSavePolicies = (updatedPolicies: any) => {
    setPendingPolicies(updatedPolicies);
    setPolicyMessage({ type: '', text: '' });
    setShowSudoModal(true);
  };

  const handleConfirmSavePolicies = async () => {
    if (!pendingPolicies) return;
    setIsUpdatingPolicies(true);
    setPolicyMessage({ type: '', text: '' });
    try {
      const normalizedPolicies = normalizeAccessPolicies(pendingPolicies);
      await updateDoc(doc(db, 'institutions', effectiveInstitutionId), { accessPolicies: normalizedPolicies });
      setAccessPolicies(normalizedPolicies);
      setPendingPolicies(null);
      setPolicyMessage({ type: 'success', text: 'Políticas de acceso actualizadas correctamente.' });
      setTimeout(() => setPolicyMessage({ type: '', text: '' }), 4000);
    } catch (error) {
      console.error('Error saving policies:', error);
      setPolicyMessage({ type: 'error', text: 'Error al guardar las políticas.' });
    } finally {
      setIsUpdatingPolicies(false);
    }
  };

  const handleRemoveAccess = async (docId: any) => {
    if (!docId) return;

    try {
      await deleteDoc(doc(db, 'institution_invites', docId));
      fetchData();
    } catch (error) {
      console.error('Error removing access', error);
    }
  };

  const handleBulkLinkStudentsCsv = useCallback(async (csvInput: any) => {
    const rawLines = String(csvInput || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (rawLines.length === 0) {
      return {
        totalRows: 0,
        linkedStudents: 0,
        linkedRows: 0,
        invalidRows: [],
        missingStudents: [],
        missingCourses: [],
      };
    }

    const hasHeader = /email/i.test(rawLines[0]) && /course/i.test(rawLines[0]);
    const contentRows = hasHeader ? rawLines.slice(1) : rawLines;
    const rows = contentRows.map((line, index) => {
      const [emailValue = '', courseIdValue = ''] = line.split(',');
      return {
        lineNumber: (hasHeader ? 2 : 1) + index,
        email: emailValue.trim().toLowerCase(),
        courseId: normalizeId(courseIdValue),
      };
    });

    const invalidRows = rows.filter((row) => !row.email || !row.email.includes('@') || !row.courseId);
    const validRows = rows.filter((row) => !invalidRows.includes(row));

    const [studentsSnap, coursesSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('institutionId', '==', effectiveInstitutionId), where('role', '==', 'student'))),
      getDocs(query(collection(db, 'courses'), where('institutionId', '==', effectiveInstitutionId))),
    ]);

    const studentsByEmail = new Map(
      studentsSnap.docs.map((studentDoc: any) => {
        const studentData = { id: studentDoc.id, ...studentDoc.data() };
        return [String(studentData?.email || '').trim().toLowerCase(), studentData];
      })
    );

    const validCourseIdSet = new Set(
      coursesSnap.docs
        .map((courseDoc: any) => ({ id: courseDoc.id, ...courseDoc.data() }))
        .filter((course: any) => course?.status !== 'trashed')
        .map((course: any) => normalizeId(course.id))
        .filter(Boolean)
    );

    const missingStudents = new Set<any>();
    const missingCourses = new Set<any>();
    const nextCourseIdsByStudentId = new Map<any, any>();
    const linkedRows = { count: 0 };

    validRows.forEach((row) => {
      const student = studentsByEmail.get(row.email);

      if (!student) {
        missingStudents.add(row.email);
        return;
      }

      if (!validCourseIdSet.has(row.courseId)) {
        missingCourses.add(row.courseId);
        return;
      }

      const existingCourseIds = nextCourseIdsByStudentId.get(student.id)
        || getStudentProfileCourseIds(student);
      const nextCourseIds = toUniqueIds([...existingCourseIds, row.courseId]);
      nextCourseIdsByStudentId.set(student.id, nextCourseIds);
      linkedRows.count += 1;
    });

    const updates = Array.from(nextCourseIdsByStudentId.entries());

    await Promise.all(
      updates.map(([studentId, nextCourseIds]) => (
        updateDoc(doc(db, 'users', studentId), {
          courseId: nextCourseIds[0] || null,
          courseIds: nextCourseIds,
          enrolledCourseIds: nextCourseIds,
          updatedAt: serverTimestamp(),
        })
      ))
    );

    if (updates.length > 0) {
      await fetchData();
    }

    return {
      totalRows: rows.length,
      linkedStudents: updates.length,
      linkedRows: linkedRows.count,
      invalidRows: invalidRows.map((row) => row.lineNumber),
      missingStudents: Array.from(missingStudents),
      missingCourses: Array.from(missingCourses),
    };
  }, [effectiveInstitutionId, fetchData]);

  return {
    userType, setUserType,
    effectiveInstitutionId,
    teachers, students, allowedTeachers, allTeachers, allStudents,
    institutionCourses,
    canLoadMoreUsers: userType === 'teachers' ? teacherPagination.hasMore : studentPagination.hasMore,
    isLoadingMoreUsers,
    loading, searchTerm, setSearchTerm,
    showAddUserModal, setShowAddUserModal,
    newUserEmail, setNewUserEmail,
    isSubmitting, addError, addSuccess,
    institutionalCode, isUpdatingCode,
    liveAccessCode, liveCodeLoading, liveCodeError,
    codeUpdateSuccess, codeUpdateError,
    accessPolicies, isUpdatingPolicies, policyMessage,
    showSudoModal, setShowSudoModal,
    pendingPolicies,
    handleAddUser,
    handleUpdateInstitutionalCode,
    handleSavePolicies,
    handleConfirmSavePolicies,
    handleRemoveAccess,
    handleLoadMoreUsers,
    handleBulkLinkStudentsCsv,
  };
};