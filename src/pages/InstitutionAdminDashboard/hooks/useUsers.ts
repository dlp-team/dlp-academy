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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../../firebase/config';
import { getInstitutionalAccessCodePreview, rotateInstitutionalAccessCodeNow } from '../../../services/accessCodeService';
import { DEFAULT_ACCESS_POLICIES, normalizeAccessPolicies } from '../../../utils/institutionPolicyUtils';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { buildInstitutionScopedPersistenceKey } from '../../../utils/pagePersistence';
import { buildGoogleSheetCsvExportUrl } from '../utils/importSourceUtils';
import { evaluateUserDeletionGuard, USER_DELETION_GUARD_CODES } from '../utils/userDeletionGuard';

const USERS_PAGE_SIZE = 25;

const normalizeId = (value: any) => String(value || '').trim();

const toUniqueIds = (values: any[] = []) => Array.from(new Set(values.map(normalizeId).filter(Boolean)));

const normalizeCsvHeaderKey = (value: any) => String(value || '').trim().toLowerCase();

const sanitizeUploadFileName = (fileName: any) => String(fileName || 'import.csv')
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  || 'import.csv';

const isClassActive = (cls: any = {}) => String(cls?.status || '').trim().toLowerCase() !== 'archived';

const resolveExpectedDeletionRole = (selectedUserType: any = 'teachers') => (
  String(selectedUserType || '').trim().toLowerCase() === 'students' ? 'student' : 'teacher'
);

const parseCsvLine = (line: any) => {
  const cells: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < String(line || '').length; index += 1) {
    const character = line[index];
    if (character === '"') {
      const nextCharacter = line[index + 1];
      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === ',' && !insideQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
};

const parseCsvWithHeader = (csvInput: any) => {
  const rawLines = String(csvInput || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rawLines.length === 0) {
    return {
      headerCells: [],
      headerIndexByKey: new Map(),
      rows: [],
    };
  }

  const headerCells = parseCsvLine(rawLines[0]);
  const headerIndexByKey = new Map<any, any>();
  headerCells.forEach((headerCell, index) => {
    const normalizedKey = normalizeCsvHeaderKey(headerCell);
    if (normalizedKey && !headerIndexByKey.has(normalizedKey)) {
      headerIndexByKey.set(normalizedKey, index);
    }
  });

  const rows = rawLines.slice(1).map((line, index) => ({
    lineNumber: index + 2,
    values: parseCsvLine(line),
  }));

  return {
    headerCells,
    headerIndexByKey,
    rows,
  };
};

const resolveImportCsvText = async (importPayload: any) => {
  const inlineFileText = String(importPayload?.fileText || '');
  if (inlineFileText.trim()) {
    return inlineFileText;
  }

  const sourceType = String(importPayload?.sourceType || '').trim().toLowerCase();
  const sourceUrl = String(importPayload?.sourceUrl || '').trim();
  if (sourceType !== 'google-sheet' || !sourceUrl) {
    return '';
  }

  const csvUrl = buildGoogleSheetCsvExportUrl(sourceUrl);
  const response = await fetch(csvUrl, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(`GOOGLE_SHEET_FETCH_FAILED_${response.status}`);
  }

  return response.text();
};

const getMappedCsvValue = (row: any, headerIndexByKey: any, preferredColumnName: any) => {
  const normalizedKey = normalizeCsvHeaderKey(preferredColumnName);
  if (!normalizedKey) return '';
  if (!headerIndexByKey.has(normalizedKey)) return '';
  const columnIndex = headerIndexByKey.get(normalizedKey);
  return String(row?.values?.[columnIndex] || '').trim();
};

const getStudentIdentifierValues = (student: any = {}) => {
  const primaryIdentifier = String(student?.studentIdentifier || student?.identifier || student?.institutionStudentId || '').trim();
  const identifierList = Array.isArray(student?.studentIdentifiers)
    ? student.studentIdentifiers.map((value: any) => String(value || '').trim())
    : [];

  return toUniqueIds([primaryIdentifier, ...identifierList]);
};

const getCourseMatchValues = (course: any = {}) => toUniqueIds([
  course?.id,
  course?.name,
  course?.identifier,
  course?.code,
  course?.courseCode,
]);

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
  const [isRotatingLiveCode, setIsRotatingLiveCode] = useState(false);
  const [codeRotationMessage, setCodeRotationMessage] = useState({ type: '', text: '' });
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
          codeVersion: Number(policy.codeVersion || 0),
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

  const handleRotateLiveCode = async () => {
    if (!effectiveInstitutionId || isRotatingLiveCode) return;

    const role = userType === 'students' ? 'student' : 'teacher';
    const policyKey = role === 'student' ? 'students' : 'teachers';
    const policy = accessPolicies?.[policyKey] || { requireCode: true, codeVersion: 0 };

    if (policy.requireCode === false) {
      setCodeRotationMessage({ type: 'error', text: 'El código está desactivado. Actívalo antes de regenerarlo.' });
      return;
    }

    setIsRotatingLiveCode(true);
    setCodeRotationMessage({ type: '', text: '' });

    try {
      const rotationResult: any = await rotateInstitutionalAccessCodeNow({
        institutionId: effectiveInstitutionId,
        userType: role,
      });

      const nextCodeVersion = Number(rotationResult?.codeVersion || Number(policy.codeVersion || 0) + 1);

      setAccessPolicies((previous: any) => ({
        ...previous,
        [policyKey]: {
          ...(previous?.[policyKey] || {}),
          codeVersion: nextCodeVersion,
        },
      }));

      if (rotationResult?.code) {
        setLiveAccessCode(rotationResult.code);
      }

      setCodeRotationMessage({ type: 'success', text: 'Código regenerado correctamente.' });
      setTimeout(() => {
        setCodeRotationMessage((previous) => (previous.type ? { type: '', text: '' } : previous));
      }, 4000);
    } catch (error) {
      console.error('Error rotating live access code:', error);
      setCodeRotationMessage({ type: 'error', text: 'No se pudo regenerar el código en este momento.' });
    } finally {
      setIsRotatingLiveCode(false);
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

  const hasActiveClassAssignments = useCallback(async ({ targetUserId, targetRole }: any) => {
    const normalizedTargetUserId = normalizeId(targetUserId);
    const normalizedRole = String(targetRole || '').trim().toLowerCase();

    if (!normalizedTargetUserId || !effectiveInstitutionId) return false;

    if (normalizedRole === 'teacher') {
      const teacherClassesSnap = await getDocs(
        query(
          collection(db, 'classes'),
          where('institutionId', '==', effectiveInstitutionId),
          where('teacherId', '==', normalizedTargetUserId),
        ),
      );

      return teacherClassesSnap.docs.some((classDoc: any) => isClassActive(classDoc.data()));
    }

    if (normalizedRole === 'student') {
      const classesSnap = await getDocs(
        query(collection(db, 'classes'), where('institutionId', '==', effectiveInstitutionId)),
      );

      return classesSnap.docs.some((classDoc: any) => {
        const classData: any = classDoc.data();
        return Array.isArray(classData?.studentIds)
          && classData.studentIds.includes(normalizedTargetUserId)
          && isClassActive(classData);
      });
    }

    return false;
  }, [effectiveInstitutionId]);

  const handleDeleteUser = useCallback(async ({ userId: rawTargetUserId, userRole }: any = {}) => {
    const normalizedTargetUserId = normalizeId(rawTargetUserId);
    if (!normalizedTargetUserId) {
      throw new Error(USER_DELETION_GUARD_CODES.MISSING_ID);
    }

    if (!effectiveInstitutionId) {
      throw new Error(USER_DELETION_GUARD_CODES.MISSING_INSTITUTION);
    }

    const expectedRoleCandidate = String(userRole || '').trim().toLowerCase();
    const expectedRole = ['teacher', 'student'].includes(expectedRoleCandidate)
      ? expectedRoleCandidate
      : resolveExpectedDeletionRole(userType);

    const targetUserRef = doc(db, 'users', normalizedTargetUserId);
    const targetUserSnap = await getDoc(targetUserRef);

    if (!targetUserSnap.exists()) {
      throw new Error(USER_DELETION_GUARD_CODES.NOT_FOUND);
    }

    const targetUser: any = { id: targetUserSnap.id, ...(targetUserSnap.data() as any) };
    const activeClassAssignments = await hasActiveClassAssignments({
      targetUserId: normalizedTargetUserId,
      targetRole: targetUser?.role,
    });

    const deletionGuardCode = evaluateUserDeletionGuard({
      targetUser,
      effectiveInstitutionId,
      expectedRole,
      requesterUid: user?.uid,
      hasActiveClasses: activeClassAssignments,
    });

    if (deletionGuardCode !== USER_DELETION_GUARD_CODES.ALLOWED) {
      throw new Error(deletionGuardCode);
    }

    await deleteDoc(targetUserRef);

    const removeDeletedUserFromList = (previous: any[]) => (
      previous.filter((entry: any) => entry.id !== normalizedTargetUserId)
    );

    setTeachers(removeDeletedUserFromList);
    setStudents(removeDeletedUserFromList);
    setAllTeachers(removeDeletedUserFromList);
    setAllStudents(removeDeletedUserFromList);

    await fetchData();

    return {
      deletedUserId: normalizedTargetUserId,
      role: expectedRole,
    };
  }, [effectiveInstitutionId, fetchData, hasActiveClassAssignments, user?.uid, userType]);

  const uploadUsersImportFile = useCallback(async (file: any, workflowType: any = 'students') => {
    if (!effectiveInstitutionId) {
      throw new Error('MISSING_INSTITUTION');
    }

    const safeFileName = sanitizeUploadFileName(file?.name);
    const uploadPath = `institutions/${effectiveInstitutionId}/imports/${String(workflowType || 'students')}/${Date.now()}-${safeFileName}`;
    const importStorageRef = ref(storage, uploadPath);

    await uploadBytes(importStorageRef, file, {
      contentType: file?.type || 'text/csv',
    });

    const downloadUrl = await getDownloadURL(importStorageRef);
    return {
      name: file?.name || safeFileName,
      storagePath: uploadPath,
      downloadUrl,
      mimeType: file?.type || 'text/csv',
      size: Number(file?.size || 0),
      uploadedAt: new Date().toISOString(),
    };
  }, [effectiveInstitutionId]);

  const runStudentsCsvImportCore = useCallback(async (importPayload: any, options: any = {}) => {
    if (!effectiveInstitutionId) {
      throw new Error('MISSING_INSTITUTION');
    }

    const {
      mapping = {},
    } = importPayload || {};

    const {
      requireCourseColumn = false,
    } = options || {};

    const csvText = await resolveImportCsvText(importPayload);
    const parsedCsv = parseCsvWithHeader(csvText);
    const { headerIndexByKey, rows } = parsedCsv;

    if (rows.length === 0) {
      return {
        processedRows: 0,
        linkedRows: 0,
        linkedStudents: 0,
        updatedStudents: 0,
        invalidRows: [],
        skippedRows: [],
        missingStudents: [],
        missingCourses: [],
      };
    }

    const normalizedEmailColumn = normalizeCsvHeaderKey(mapping?.emailColumn);
    const normalizedIdentifierColumn = normalizeCsvHeaderKey(mapping?.identifierColumn);
    const normalizedNameColumn = normalizeCsvHeaderKey(mapping?.nameColumn);
    const normalizedCourseColumn = normalizeCsvHeaderKey(mapping?.courseColumn);

    if (!normalizedEmailColumn && !normalizedIdentifierColumn) {
      throw new Error('MISSING_STUDENT_MATCH_COLUMN');
    }

    if (requireCourseColumn && !normalizedCourseColumn) {
      throw new Error('MISSING_COURSE_COLUMN');
    }

    const [studentsSnap, coursesSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('institutionId', '==', effectiveInstitutionId), where('role', '==', 'student'))),
      getDocs(query(collection(db, 'courses'), where('institutionId', '==', effectiveInstitutionId))),
    ]);

    const studentDocs = studentsSnap.docs.map((studentDoc: any) => ({ id: studentDoc.id, ...studentDoc.data() }));
    const studentsByEmail = new Map<any, any>();
    const studentsByIdentifier = new Map<any, any>();

    studentDocs.forEach((student: any) => {
      const studentEmail = String(student?.email || '').trim().toLowerCase();
      if (studentEmail && !studentsByEmail.has(studentEmail)) {
        studentsByEmail.set(studentEmail, student);
      }

      getStudentIdentifierValues(student).forEach((identifier: any) => {
        const normalizedIdentifier = normalizeCsvHeaderKey(identifier);
        if (normalizedIdentifier && !studentsByIdentifier.has(normalizedIdentifier)) {
          studentsByIdentifier.set(normalizedIdentifier, student);
        }
      });
    });

    const institutionCourses = coursesSnap.docs
      .map((courseDoc: any) => ({ id: courseDoc.id, ...courseDoc.data() }))
      .filter((course: any) => course?.status !== 'trashed');

    const courseIdByLookup = new Map<any, any>();
    institutionCourses.forEach((course: any) => {
      getCourseMatchValues(course).forEach((candidateValue: any) => {
        const normalizedCandidate = normalizeCsvHeaderKey(candidateValue);
        if (normalizedCandidate && !courseIdByLookup.has(normalizedCandidate)) {
          courseIdByLookup.set(normalizedCandidate, course.id);
        }
      });
    });

    const missingStudents = new Set<any>();
    const missingCourses = new Set<any>();
    const invalidRows: any[] = [];
    const skippedRows: any[] = [];
    const linkedStudentIds = new Set<any>();
    const updatesByStudentId = new Map<any, any>();
    let linkedRows = 0;

    rows.forEach((row: any) => {
      const rowEmail = getMappedCsvValue(row, headerIndexByKey, normalizedEmailColumn).toLowerCase();
      const rowIdentifier = normalizeId(getMappedCsvValue(row, headerIndexByKey, normalizedIdentifierColumn));
      const rowName = getMappedCsvValue(row, headerIndexByKey, normalizedNameColumn);
      const rowCourse = getMappedCsvValue(row, headerIndexByKey, normalizedCourseColumn);

      const hasStudentMatchValue = Boolean(rowEmail) || Boolean(rowIdentifier);
      const hasCourseValue = Boolean(rowCourse);

      if (!hasStudentMatchValue || (requireCourseColumn && !hasCourseValue)) {
        invalidRows.push(row.lineNumber);
        return;
      }

      const student = rowEmail
        ? studentsByEmail.get(rowEmail)
        : studentsByIdentifier.get(normalizeCsvHeaderKey(rowIdentifier));

      if (!student) {
        missingStudents.add(rowEmail || rowIdentifier || `line-${row.lineNumber}`);
        return;
      }

      const existingPatch = updatesByStudentId.get(student.id) || {};
      let hasRowChanges = false;

      if (rowIdentifier) {
        const existingIdentifiers = toUniqueIds([
          ...getStudentIdentifierValues(student),
          existingPatch?.studentIdentifier,
          ...(Array.isArray(existingPatch?.studentIdentifiers) ? existingPatch.studentIdentifiers : []),
        ]);

        if (!existingIdentifiers.includes(rowIdentifier)) {
          if (!existingPatch?.studentIdentifier && !String(student?.studentIdentifier || '').trim()) {
            existingPatch.studentIdentifier = rowIdentifier;
          } else {
            existingPatch.studentIdentifiers = toUniqueIds([...existingIdentifiers, rowIdentifier]);
          }
          hasRowChanges = true;
        }
      }

      if (rowName && !String(existingPatch?.displayName || student?.displayName || '').trim()) {
        existingPatch.displayName = rowName;
        hasRowChanges = true;
      }

      if (rowCourse) {
        const resolvedCourseId = courseIdByLookup.get(normalizeCsvHeaderKey(rowCourse));
        if (!resolvedCourseId) {
          missingCourses.add(rowCourse);
        } else {
          const baselineCourseIds = Array.isArray(existingPatch?.courseIds)
            ? existingPatch.courseIds
            : getStudentProfileCourseIds(student);
          const nextCourseIds = toUniqueIds([...baselineCourseIds, resolvedCourseId]);
          const didCourseIdsChange = nextCourseIds.join('|') !== baselineCourseIds.join('|');

          existingPatch.courseId = nextCourseIds[0] || null;
          existingPatch.courseIds = nextCourseIds;
          existingPatch.enrolledCourseIds = nextCourseIds;

          if (didCourseIdsChange) {
            linkedRows += 1;
            linkedStudentIds.add(student.id);
            hasRowChanges = true;
          }
        }
      }

      if (hasRowChanges) {
        updatesByStudentId.set(student.id, existingPatch);
      } else {
        skippedRows.push(row.lineNumber);
      }
    });

    const updateEntries = Array.from(updatesByStudentId.entries()).filter(([, patch]) => Object.keys(patch || {}).length > 0);

    await Promise.all(
      updateEntries.map(([studentId, patch]) => (
        updateDoc(doc(db, 'users', studentId), {
          ...patch,
          updatedAt: serverTimestamp(),
        })
      ))
    );

    if (updateEntries.length > 0) {
      await fetchData();
    }

    return {
      processedRows: rows.length,
      linkedRows,
      linkedStudents: linkedStudentIds.size,
      updatedStudents: updateEntries.length,
      invalidRows,
      skippedRows,
      missingStudents: Array.from(missingStudents),
      missingCourses: Array.from(missingCourses),
    };
  }, [effectiveInstitutionId, fetchData]);

  const runManualStudentsCsvImport = useCallback(async (importPayload: any) => (
    runStudentsCsvImportCore(importPayload, { requireCourseColumn: false })
  ), [runStudentsCsvImportCore]);

  const runManualCourseLinkCsvImport = useCallback(async (importPayload: any) => (
    runStudentsCsvImportCore(importPayload, { requireCourseColumn: true })
  ), [runStudentsCsvImportCore]);

  const triggerUsersImportN8n = useCallback(async (importPayload: any) => {
    const webhookUrl = String(import.meta.env.VITE_N8N_CSV_IMPORT_WEBHOOK || '').trim();
    if (!webhookUrl) {
      throw new Error('MISSING_WEBHOOK_URL');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        institutionId: effectiveInstitutionId,
        workflowType: importPayload?.workflowType,
        mapping: importPayload?.mapping || {},
        sourceType: importPayload?.sourceType || 'file',
        sourceUrl: importPayload?.sourceUrl || '',
        file: importPayload?.uploadedFile || null,
        source: 'institution-admin-users',
      }),
    });

    if (!response.ok) {
      throw new Error(`N8N_IMPORT_FAILED_${response.status}`);
    }

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    return {
      queued: true,
      message: (payload as any)?.message || 'Proceso enviado a n8n para ejecución asíncrona.',
      processedRows: (payload as any)?.processedRows,
      linkedRows: (payload as any)?.linkedRows,
      linkedStudents: (payload as any)?.linkedStudents,
      updatedStudents: (payload as any)?.updatedStudents,
      invalidRows: Array.isArray((payload as any)?.invalidRows) ? (payload as any).invalidRows : [],
      skippedRows: Array.isArray((payload as any)?.skippedRows) ? (payload as any).skippedRows : [],
      missingStudents: Array.isArray((payload as any)?.missingStudents) ? (payload as any).missingStudents : [],
      missingCourses: Array.isArray((payload as any)?.missingCourses) ? (payload as any).missingCourses : [],
      warnings: Array.isArray((payload as any)?.warnings) ? (payload as any).warnings : [],
      recommendations: Array.isArray((payload as any)?.recommendations) ? (payload as any).recommendations : [],
      detectedColumns: Array.isArray((payload as any)?.detectedColumns) ? (payload as any).detectedColumns : [],
      aiMapping: (payload as any)?.aiMapping || null,
    };
  }, [effectiveInstitutionId]);

  const handleBulkLinkStudentsCsv = useCallback(async (csvInput: any) => (
    runManualCourseLinkCsvImport({
      fileText: csvInput,
      mapping: {
        emailColumn: 'email',
        identifierColumn: '',
        nameColumn: '',
        courseColumn: 'courseId',
      },
    })
  ), [runManualCourseLinkCsvImport]);

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
    isRotatingLiveCode, codeRotationMessage,
    codeUpdateSuccess, codeUpdateError,
    accessPolicies, isUpdatingPolicies, policyMessage,
    showSudoModal, setShowSudoModal,
    pendingPolicies,
    handleAddUser,
    handleUpdateInstitutionalCode,
    handleRotateLiveCode,
    handleSavePolicies,
    handleConfirmSavePolicies,
    handleRemoveAccess,
    handleDeleteUser,
    handleLoadMoreUsers,
    uploadUsersImportFile,
    runManualStudentsCsvImport,
    runManualCourseLinkCsvImport,
    triggerUsersImportN8n,
    handleBulkLinkStudentsCsv,
  };
};