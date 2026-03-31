// src/pages/InstitutionAdminDashboard/hooks/useUsers.js
import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { getInstitutionalAccessCodePreview } from '../../../services/accessCodeService';
import { DEFAULT_ACCESS_POLICIES, normalizeAccessPolicies } from '../../../utils/institutionPolicyUtils';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { buildInstitutionScopedPersistenceKey } from '../../../utils/pagePersistence';

export const useUsers = (user, institutionIdOverride = null) => {
  const effectiveInstitutionId = institutionIdOverride || user?.institutionId || null;
  const userTypeKey = buildInstitutionScopedPersistenceKey('institution-admin-users', effectiveInstitutionId, 'user-type');
  const [userType, setUserType] = usePersistentState(userTypeKey, 'teachers');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [allowedTeachers, setAllowedTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [pendingPolicies, setPendingPolicies] = useState(null);

  const fetchData = useCallback(async () => {
    if (!effectiveInstitutionId) return;
    setLoading(true);
    try {
      if (userType === 'teachers') {
        const [teachersSnap, allowedSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('institutionId', '==', effectiveInstitutionId), where('role', '==', 'teacher'))),
          getDocs(query(collection(db, 'institution_invites'), where('institutionId', '==', effectiveInstitutionId))),
        ]);
        setTeachers(teachersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAllowedTeachers(allowedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const generalInvite = allowedSnap.docs.find(d => d.data().type === 'institutional');
        setInstitutionalCode(generalInvite ? generalInvite.id : '');
        setStudents([]);
      } else {
        const studentsSnap = await getDocs(query(collection(db, 'users'), where('institutionId', '==', effectiveInstitutionId), where('role', '==', 'student')));
        setStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTeachers([]);
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

  // Live access code polling
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

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
        const preview = await getInstitutionalAccessCodePreview({
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
    if (!effectiveInstitutionId) return;
    Promise.all([
      getDocs(query(collection(db, 'users'), where('institutionId', '==', effectiveInstitutionId), where('role', '==', 'teacher'))),
      getDocs(query(collection(db, 'users'), where('institutionId', '==', effectiveInstitutionId), where('role', '==', 'student'))),
    ]).then(([teachersSnap, studentsSnap]) => {
      setAllTeachers(teachersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user, effectiveInstitutionId]);

  const handleAddUser = async (e) => {
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

  const handleUpdateInstitutionalCode = async (newCode) => {
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

  const handleSavePolicies = (updatedPolicies) => {
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

  const handleRemoveAccess = async (docId) => {
    if (!docId) return;

    try {
      await deleteDoc(doc(db, 'institution_invites', docId));
      fetchData();
    } catch (error) {
      console.error('Error removing access', error);
    }
  };

  return {
    userType, setUserType,
    effectiveInstitutionId,
    teachers, students, allowedTeachers, allTeachers, allStudents,
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
  };
};