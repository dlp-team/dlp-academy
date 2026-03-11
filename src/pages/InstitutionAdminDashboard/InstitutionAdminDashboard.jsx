// src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ImagePlus,
  LayoutGrid,
  Loader2,
  Palette,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { db } from '../../firebase/config';
import Header from '../../components/layout/Header';
import SudoModal from '../../components/modals/SudoModal';
import InstitutionCustomizationView from './components/InstitutionCustomizationView';
import ClassesCoursesSection from './components/ClassesCoursesSection';
import UsersTabContent from './components/UsersTabContent';
import AddTeacherModal from './components/AddTeacherModal';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { hasRequiredRoleAccess } from '../../utils/permissionUtils';
import { getInstitutionalAccessCodePreview } from '../../services/accessCodeService';
import {
  GLOBAL_BRAND_DEFAULTS,
  HOME_THEME_DEFAULT_COLORS,
  HOME_THEME_TOKENS,
  getEffectiveHomeThemeColors,
  normalizeHexColor,
  resolveInstitutionBranding,
} from '../../utils/themeTokens';

const DEFAULT_CUSTOMIZATION_FORM = {
  institutionDisplayName: '',
  iconUrl: '',
  logoUrl: '',
  primaryBrandColor: GLOBAL_BRAND_DEFAULTS.primaryColor,
  secondaryBrandColor: GLOBAL_BRAND_DEFAULTS.secondaryColor,
  tertiaryBrandColor: GLOBAL_BRAND_DEFAULTS.tertiaryColor,
  homeThemeColors: { ...HOME_THEME_DEFAULT_COLORS },
};

const TABS = [
  { key: 'users', label: 'Usuarios', icon: Users },
  { key: 'organization', label: 'Cursos y Clases', icon: LayoutGrid },
  { key: 'customization', label: 'Personalización', icon: Palette },
];

// Move handleIconUpload definition above the component
const InstitutionAdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  useIdleTimeout(15);

  const [activeTab, setActiveTab] = useState('users');
  const [userType, setUserType] = useState('teachers');

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

  const [institutionName, setInstitutionName] = useState('');
  const [customizationForm, setCustomizationForm] = useState(DEFAULT_CUSTOMIZATION_FORM);
  const [customizationLoading, setCustomizationLoading] = useState(false);
  const [customizationSaving, setCustomizationSaving] = useState(false);
  const [customizationError, setCustomizationError] = useState('');
  const [customizationSuccess, setCustomizationSuccess] = useState('');
  const [iconUploading, setIconUploading] = useState(false);
  const [iconUploadError, setIconUploadError] = useState('');

  const [institutionalCode, setInstitutionalCode] = useState('');
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const [liveAccessCode, setLiveAccessCode] = useState('');
  const [liveCodeLoading, setLiveCodeLoading] = useState(false);
  const [liveCodeError, setLiveCodeError] = useState('');

  const [accessPolicies, setAccessPolicies] = useState({
    teachers: { requireDomain: false, allowedDomains: '', requireCode: true, rotationIntervalHours: 24 },
    students: { requireDomain: false, allowedDomains: '', requireCode: true, rotationIntervalHours: 1 }
  });
  const [isUpdatingPolicies, setIsUpdatingPolicies] = useState(false);
  const [policyMessage, setPolicyMessage] = useState({ type: '', text: '' });
  const [showSudoModal, setShowSudoModal] = useState(false);
  const [pendingPolicies, setPendingPolicies] = useState(null);
  const [codeUpdateSuccess, setCodeUpdateSuccess] = useState('');
  const [codeUpdateError, setCodeUpdateError] = useState('');

  useEffect(() => {
    if (user && !hasRequiredRoleAccess(user, 'institutionadmin')) {
      console.warn('Unauthorized access attempt to Institution Admin Dashboard');
      navigate('/home');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user?.institutionId) return;
    setLoading(true);
    try {
      if (userType === 'teachers') {
        const [teachersSnap, allowedSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('institutionId', '==', user.institutionId), where('role', '==', 'teacher'))),
          getDocs(query(collection(db, 'institution_invites'), where('institutionId', '==', user.institutionId))),
        ]);
        setTeachers(teachersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAllowedTeachers(allowedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const generalInvite = allowedSnap.docs.find(d => d.data().type === 'institutional');
        setInstitutionalCode(generalInvite ? generalInvite.id : '');
        setStudents([]);
      } else {
        const studentsSnap = await getDocs(query(collection(db, 'users'), where('institutionId', '==', user.institutionId), where('role', '==', 'student')));
        setStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTeachers([]);
        setAllowedTeachers([]);
      }
      const instDoc = await getDoc(doc(db, 'institutions', user.institutionId));
      if (instDoc.exists() && instDoc.data().accessPolicies) {
        // Merge with defaults in case some fields are missing
        setAccessPolicies(prev => ({
          ...prev,
          ...instDoc.data().accessPolicies
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, userType]);

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const refreshLiveCode = async () => {
      if (!user?.institutionId) return;

      const policy = accessPolicies?.[userType] || { requireCode: true, rotationIntervalHours: 24 };
      if (policy.requireCode === false) {
        if (!cancelled) {
          setLiveAccessCode('');
          setLiveCodeError('');
        }
        return;
      }

      setLiveCodeLoading(true);
      setLiveCodeError('');
      try {
        const preview = await getInstitutionalAccessCodePreview({
          institutionId: user.institutionId,
          userType: userType === 'students' ? 'student' : 'teacher',
          intervalHours: Number(policy.rotationIntervalHours || 24),
        });

        if (!cancelled) {
          setLiveAccessCode(preview?.code || '------');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error getting live access code preview:', error);
          setLiveAccessCode('------');
          setLiveCodeError('No se pudo obtener el código en este momento.');
        }
      } finally {
        if (!cancelled) {
          setLiveCodeLoading(false);
        }
      }
    };

    refreshLiveCode();
    intervalId = setInterval(refreshLiveCode, 30000);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.institutionId, userType, accessPolicies]);

  useEffect(() => {
    let active = true;

    const fetchInstitutionCustomization = async () => {
      if (!user?.institutionId) return;
      setCustomizationLoading(true);
      try {
        const institutionRef = doc(db, 'institutions', user.institutionId);
        const institutionSnap = await getDoc(institutionRef);

        if (!active || !institutionSnap.exists()) return;

        const institutionData = institutionSnap.data() || {};
        const customizationData = institutionData.customization || {};
        const branding = resolveInstitutionBranding(institutionData);
        const resolvedColors = getEffectiveHomeThemeColors(
          customizationData.homeThemeColors || customizationData.home?.colors || null,
        );

        setInstitutionName(institutionData.name || '');
        setCustomizationForm({
          institutionDisplayName: branding.institutionDisplayName || institutionData.name || '',
          iconUrl: customizationData.iconUrl || '',
          logoUrl: branding.logoUrl || '',
          primaryBrandColor: branding.primaryColor || GLOBAL_BRAND_DEFAULTS.primaryColor,
          secondaryBrandColor: branding.secondaryColor || GLOBAL_BRAND_DEFAULTS.secondaryColor,
          tertiaryBrandColor: branding.tertiaryColor || GLOBAL_BRAND_DEFAULTS.tertiaryColor,
          homeThemeColors: resolvedColors,
        });
      } catch (error) {
        console.error('Error loading institution customization:', error);
        if (active) {
          setCustomizationError('No se pudo cargar la personalización de la institución.');
        }
      } finally {
        if (active) setCustomizationLoading(false);
      }
    };

    fetchInstitutionCustomization();

    return () => {
      active = false;
    };
  }, [user?.institutionId]);

  useEffect(() => {
    const iconUrl = customizationForm.iconUrl?.trim();
    if (!iconUrl) return;

    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.setAttribute('rel', 'icon');
      document.head.appendChild(faviconLink);
    }

    faviconLink.setAttribute('href', iconUrl);
  }, [customizationForm.iconUrl]);

  useEffect(() => {
    if (!user?.institutionId) return;
    Promise.all([
      getDocs(query(collection(db, 'users'), where('institutionId', '==', user.institutionId), where('role', '==', 'teacher'))),
      getDocs(query(collection(db, 'users'), where('institutionId', '==', user.institutionId), where('role', '==', 'student'))),
    ]).then(([teachersSnap, studentsSnap]) => {
      setAllTeachers(teachersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    const normalizedEmail = newUserEmail.toLowerCase().trim();
    if (!normalizedEmail) return;

    setIsSubmitting(true);
    setAddError('');
    setAddSuccess('');

    try {
      // 1. FIRST CHECK: Is the teacher already fully registered in the platform?
      const usersRef = collection(db, 'users');
      const qUser = query(
        usersRef, 
        where('email', '==', normalizedEmail),
        where('institutionId', '==', user.institutionId)
      );
      const existingUserSnap = await getDocs(qUser);

      if (!existingUserSnap.empty) {
        setAddError('Este profesor ya está registrado y activo en tu institución.');
        setIsSubmitting(false);
        return;
      }

      // 2. SECOND CHECK: Is there already a pending invite for this email?
      const invitesRef = collection(db, 'institution_invites');
      const qInvite = query(
        invitesRef, 
        where('email', '==', normalizedEmail),
        where('institutionId', '==', user.institutionId)
      );
      const existingInviteSnap = await getDocs(qInvite);

      if (!existingInviteSnap.empty) {
        setAddError('Este profesor ya tiene una invitación pendiente.');
        setIsSubmitting(false);
        return;
      }

      // 3. CREATE INVITE: If they aren't registered and don't have an invite, create one.
      await addDoc(collection(db, 'institution_invites'), {
        email: normalizedEmail,
        institutionId: user.institutionId,
        role: 'teacher', 
        type: 'direct',  
        createdAt: serverTimestamp()
      });

      setAddSuccess('Profesor invitado correctamente. Puede copiar el código de acceso en la tabla.');
      setNewUserEmail('');
      
      // Close modal after a short delay so they can read the success message
      setTimeout(() => {
        setShowAddUserModal(false);
      }, 2000);
      
      // Reload the table data
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
      const invitesRef = collection(db, 'institution_invites');
      const q = query(
        invitesRef,
        where('institutionId', '==', user.institutionId),
        where('type', '==', 'institutional')
      );
      const snap = await getDocs(q);
      
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();

      const newCodeRef = doc(db, 'institution_invites', finalCode);
      await setDoc(newCodeRef, {
        institutionId: user.institutionId,
        role: 'teacher',
        type: 'institutional',
        createdAt: serverTimestamp()
      });

      setInstitutionalCode(finalCode);
      fetchData(); 
      
      // NEW: In-app success message
      setCodeUpdateSuccess('Código actualizado con éxito.');
      setTimeout(() => setCodeUpdateSuccess(''), 4000); // Clear after 4s

    } catch (error) {
      console.error('Error updating code:', error);
      // NEW: In-app error message
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
      await updateDoc(doc(db, 'institutions', user.institutionId), {
        accessPolicies: pendingPolicies
      });
      setAccessPolicies(pendingPolicies);
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
    if (!window.confirm('¿Seguro que quieres eliminar el acceso a este profesor?')) return;
    try {
      await deleteDoc(doc(db, 'institution_invites', docId));
      fetchData();
    } catch (error) {
      console.error('Error removing access', error);
    }
  };

  // ...existing code...
  const handleIconUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !user?.institutionId) return;

    if (!file.type.startsWith('image/')) {
      setIconUploadError('Selecciona una imagen válida para el icono.');
      return;
    }

    setIconUploading(true);
    setIconUploadError('');
    setCustomizationError('');
    setCustomizationSuccess('');

    try {
      const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'png';
      const storageRef = ref(getStorage(db.app), `institutions/${user.institutionId}/branding/icon.${fileExtension || 'png'}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const iconUrl = await getDownloadURL(storageRef);

      const nextCustomizationForm = {
        ...customizationForm,
        iconUrl,
      };

      await updateDoc(doc(db, 'institutions', user.institutionId), {
        'customization.iconUrl': iconUrl,
        updatedAt: serverTimestamp(),
      });

      setCustomizationForm(nextCustomizationForm);
      setCustomizationSuccess('Icono guardado correctamente.');
    } catch (error) {
      console.error('Error uploading institution icon:', error);
      setIconUploadError('No se pudo subir el icono. Inténtalo de nuevo.');
    } finally {
      setIconUploading(false);
    }
  };
  // ...existing code...
  const handleSaveCustomization = async (incomingFormValues = null) => {
    if (!user?.institutionId) return;

    const nextCustomizationForm = incomingFormValues
      ? {
        institutionDisplayName: incomingFormValues.institutionName || '',
        iconUrl: customizationForm.iconUrl || '',
        logoUrl: incomingFormValues.logoUrl || '',
        primaryBrandColor: incomingFormValues.primary || GLOBAL_BRAND_DEFAULTS.primaryColor,
        secondaryBrandColor: incomingFormValues.secondary || GLOBAL_BRAND_DEFAULTS.secondaryColor,
        tertiaryBrandColor: incomingFormValues.accent || GLOBAL_BRAND_DEFAULTS.tertiaryColor,
        homeThemeColors: getEffectiveHomeThemeColors({
          primary: incomingFormValues.primary,
          secondary: incomingFormValues.secondary,
          accent: incomingFormValues.accent,
          mutedText: HOME_THEME_DEFAULT_COLORS.mutedText,
          cardBorder: incomingFormValues.cardBorder,
          cardBackground: HOME_THEME_DEFAULT_COLORS.cardBackground,
        }),
      }
      : customizationForm;

    setCustomizationError('');
    setCustomizationSuccess('');
    setCustomizationSaving(true);

    try {
      const institutionRef = doc(db, 'institutions', user.institutionId);
      const resolvedColors = getEffectiveHomeThemeColors(nextCustomizationForm.homeThemeColors);
      const normalizedPrimaryBrandColor = normalizeHexColor(nextCustomizationForm.primaryBrandColor) || GLOBAL_BRAND_DEFAULTS.primaryColor;
      const normalizedSecondaryBrandColor = normalizeHexColor(nextCustomizationForm.secondaryBrandColor) || GLOBAL_BRAND_DEFAULTS.secondaryColor;
      const normalizedTertiaryBrandColor = normalizeHexColor(nextCustomizationForm.tertiaryBrandColor) || GLOBAL_BRAND_DEFAULTS.tertiaryColor;

      await updateDoc(institutionRef, {
        'customization.institutionDisplayName': nextCustomizationForm.institutionDisplayName.trim() || institutionName || '',
        'customization.iconUrl': nextCustomizationForm.iconUrl.trim(),
        'customization.logoUrl': nextCustomizationForm.logoUrl.trim(),
        'customization.primaryBrandColor': normalizedPrimaryBrandColor,
        'customization.secondaryBrandColor': normalizedSecondaryBrandColor,
        'customization.tertiaryBrandColor': normalizedTertiaryBrandColor,
        'customization.brand.primaryColor': normalizedPrimaryBrandColor,
        'customization.brand.secondaryColor': normalizedSecondaryBrandColor,
        'customization.brand.tertiaryColor': normalizedTertiaryBrandColor,
        'customization.homeThemeColors': resolvedColors,
        'customization.home.colors': resolvedColors,
        'customization.homeThemeTokens': HOME_THEME_TOKENS,
        'customization.home.tokens': HOME_THEME_TOKENS,
        updatedAt: serverTimestamp(),
      });


    const handleIconUpload = async (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file || !user?.institutionId) return;

      if (!file.type.startsWith('image/')) {
        setIconUploadError('Selecciona una imagen válida para el icono.');
        return;
      }

      setIconUploading(true);
      setIconUploadError('');
      setCustomizationError('');
      setCustomizationSuccess('');

      try {
        const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'png';
        const storageRef = ref(getStorage(db.app), `institutions/${user.institutionId}/branding/icon.${fileExtension || 'png'}`);
        await uploadBytes(storageRef, file, { contentType: file.type });
        const iconUrl = await getDownloadURL(storageRef);

        const nextCustomizationForm = {
          ...customizationForm,
          iconUrl,
        };

        await updateDoc(doc(db, 'institutions', user.institutionId), {
          'customization.iconUrl': iconUrl,
          updatedAt: serverTimestamp(),
        });

        setCustomizationForm({
          ...customizationForm,
          iconUrl,
        });
        setCustomizationSuccess('Icono guardado correctamente.');
      } catch (error) {
        console.error('Error uploading institution icon:', error);
        setIconUploadError('No se pudo subir el icono. Inténtalo de nuevo.');
      } finally {
        setIconUploading(false);
      }
    };
      setCustomizationForm(nextCustomizationForm);
      setCustomizationSuccess('Personalización guardada correctamente.');
    } catch (error) {
      iconUrl: customizationForm.iconUrl || '',
      console.error('Error saving customization:', error);
      setCustomizationError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      throw error;
    } finally {
      setCustomizationSaving(false);
    }
  };

  const customizationInitialValues = {
    institutionName: customizationForm.institutionDisplayName || institutionName || '',
    logoUrl: customizationForm.logoUrl || '',
    primary: customizationForm.primaryBrandColor || customizationForm.homeThemeColors?.primary || HOME_THEME_DEFAULT_COLORS.primary,
    secondary: customizationForm.secondaryBrandColor || customizationForm.homeThemeColors?.secondary || GLOBAL_BRAND_DEFAULTS.secondaryColor,
    accent: customizationForm.tertiaryBrandColor || customizationForm.homeThemeColors?.accent || GLOBAL_BRAND_DEFAULTS.tertiaryColor,
    mutedText: HOME_THEME_DEFAULT_COLORS.mutedText,
    cardBorder: customizationForm.homeThemeColors?.cardBorder || HOME_THEME_DEFAULT_COLORS.cardBorder,
    cardBackground: HOME_THEME_DEFAULT_COLORS.cardBackground,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      <Header user={user} />

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel de Administración</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {user?.institutionId ? `Institución ID: ${user.institutionId}` : 'Configuración de Institución'}
            </p>
          </div>
          {activeTab === 'users' && userType === 'teachers' && (
            <button
              onClick={() => {
                setAddError('');
                setAddSuccess('');
                setShowAddUserModal(true);
              }}
              className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-[var(--color-primary-200)] dark:shadow-[var(--color-primary-900)/0.2] transition-all active:scale-95"
            >
              <UserPlus className="w-5 h-5" /> Autorizar Profesor
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 -mb-px transition-colors ${
                activeTab === key
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <UsersTabContent
            userType={userType}
            setUserType={setUserType}
            institutionId={user.institutionId}
            accessPolicies={accessPolicies}
            onSavePolicies={handleSavePolicies}
            isUpdatingPolicies={isUpdatingPolicies}
            policyMessage={policyMessage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
            teachers={teachers}
            students={students}
            allowedTeachers={allowedTeachers}
            onNavigateTeacher={(id) => navigate(`/institution-admin-dashboard/teacher/${id}`)}
            onNavigateStudent={(id) => navigate(`/institution-admin-dashboard/student/${id}`)}
            onRemoveAccess={handleRemoveAccess}
            institutionalCode={institutionalCode}
            onUpdateInstitutionalCode={handleUpdateInstitutionalCode}
            isUpdatingCode={isUpdatingCode}
            codeUpdateSuccess={codeUpdateSuccess}
            codeUpdateError={codeUpdateError}
            liveAccessCode={liveAccessCode}
            liveCodeLoading={liveCodeLoading}
            liveCodeError={liveCodeError}
          />
        )}

        {activeTab === 'organization' && (
          <ClassesCoursesSection user={user} allStudents={allStudents} allTeachers={allTeachers} />
        )}

        {activeTab === 'customization' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {customizationLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
            ) : (
              <div className="space-y-4">
                {customizationError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {customizationError}
                  </div>
                )}
                {customizationSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 text-sm rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {customizationSuccess}
                  </div>
                )}

                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Icono del navegador</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Este icono se guarda por separado del logo del encabezado y se usa junto al nombre de la pestaña.
                      </p>
                    </div>

                    <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer">
                      {iconUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {iconUploading ? 'Subiendo icono...' : 'Subir icono'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/x-icon,image/webp"
                        className="hidden"
                        onChange={handleIconUpload}
                        disabled={iconUploading}
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 overflow-hidden">
                      {customizationForm.iconUrl ? (
                        <img
                          src={customizationForm.iconUrl}
                          alt="Vista previa del icono institucional"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Sin icono</span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                      <p>Logo del encabezado actual: se mantiene en el campo de logo existente.</p>
                      <p>Icono actual: {customizationForm.iconUrl ? 'Configurado y listo para la pestaña del navegador.' : 'Todavía no configurado.'}</p>
                      {iconUploadError && <p className="text-red-600 dark:text-red-300">{iconUploadError}</p>}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-32 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 overflow-hidden">
                      {customizationForm.logoUrl ? (
                        <img
                          src={customizationForm.logoUrl}
                          alt="Vista previa del logo institucional"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Sin logo</span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                      <p>Logo actual: {customizationForm.logoUrl ? 'Configurado y listo para el encabezado.' : 'Todavía no configurado.'}</p>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!user?.institutionId) return;
                          const url = e.target.logoUrlInput.value.trim();
                          if (!url) return;
                          try {
                            await updateDoc(doc(db, 'institutions', user.institutionId), {
                              'customization.logoUrl': url,
                              updatedAt: serverTimestamp(),
                            });
                            setCustomizationForm({ ...customizationForm, logoUrl: url });
                          } catch (error) {
                            setCustomizationError('No se pudo guardar el logo por URL. Inténtalo de nuevo.');
                          }
                        }}
                        className="flex items-center gap-2 mt-2"
                      >
                        <input
                          name="logoUrlInput"
                          type="text"
                          placeholder="URL del logotipo"
                          defaultValue={customizationForm.logoUrl}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-sm w-64"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm font-medium"
                        >Guardar URL</button>
                      </form>
                      <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer mt-2">
                        {iconUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                        {iconUploading ? 'Subiendo logotipo...' : 'Subir logotipo'}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/x-icon,image/webp"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            event.target.value = '';
                            if (!file || !user?.institutionId) return;
                            if (!file.type.startsWith('image/')) {
                              setIconUploadError('Selecciona una imagen válida para el logotipo.');
                              return;
                            }
                            setIconUploading(true);
                            setIconUploadError('');
                            setCustomizationError('');
                            setCustomizationSuccess('');
                            try {
                              const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'png';
                              const storageRef = ref(getStorage(db.app), `institutions/${user.institutionId}/branding/logo.${fileExtension || 'png'}`);
                              await uploadBytes(storageRef, file, { contentType: file.type });
                              const logoUrl = await getDownloadURL(storageRef);
                              await updateDoc(doc(db, 'institutions', user.institutionId), {
                                'customization.logoUrl': logoUrl,
                                updatedAt: serverTimestamp(),
                              });
                              setCustomizationForm({ ...customizationForm, logoUrl });
                              setCustomizationSuccess('Logotipo guardado correctamente.');
                            } catch (error) {
                              setIconUploadError('No se pudo subir el logotipo. Inténtalo de nuevo.');
                            } finally {
                              setIconUploading(false);
                            }
                          }}
                          disabled={iconUploading}
                        />
                      </label>
                      {iconUploadError && <p className="text-red-600 dark:text-red-300 mt-2">{iconUploadError}</p>}
                    </div>
                  </div>
                </section>

                <div className="h-[calc(100vh-13rem)] min-h-[720px]">
                  <InstitutionCustomizationView
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    initialValues={customizationInitialValues}
                    onSave={handleSaveCustomization}
                  />
                </div>

                {customizationSaving && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Guardando personalización...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {showAddUserModal && (
        <AddTeacherModal
          isSubmitting={isSubmitting}
          newUserEmail={newUserEmail}
          onEmailChange={setNewUserEmail}
          onClose={() => setShowAddUserModal(false)}
          onSubmit={handleAddUser}
          addError={addError}
          addSuccess={addSuccess}
        />
      )}

      <SudoModal
        isOpen={showSudoModal}
        onClose={() => {
          setShowSudoModal(false);
          setPendingPolicies(null);
        }}
        onConfirm={handleConfirmSavePolicies}
        actionName="guardar las políticas de acceso"
      />
    </div>
  );
};

export default InstitutionAdminDashboard;
