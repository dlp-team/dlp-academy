import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
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
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../../components/layout/Header';
import InstitutionCustomizationView from './components/InstitutionCustomizationView';
import ClassesCoursesSection from './components/ClassesCoursesSection';
import UsersTabContent from './components/UsersTabContent';
import AddTeacherModal from './components/AddTeacherModal';
import { hasRequiredRoleAccess } from '../../utils/permissionUtils';
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

const InstitutionAdminDashboard = ({ user }) => {
  const navigate = useNavigate();

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
          getDocs(query(collection(db, 'allowed_teachers'), where('institutionId', '==', user.institutionId))),
        ]);
        setTeachers(teachersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAllowedTeachers(allowedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setStudents([]);
      } else {
        const studentsSnap = await getDocs(query(collection(db, 'users'), where('institutionId', '==', user.institutionId), where('role', '==', 'student')));
        setStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTeachers([]);
        setAllowedTeachers([]);
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
    setAddError('');
    setAddSuccess('');
    setIsSubmitting(true);

    if (!newUserEmail.includes('@')) {
      setAddError('Por favor introduce un email válido.');
      setIsSubmitting(false);
      return;
    }

    try {
      const checkSnap = await getDocs(
        query(collection(db, 'allowed_teachers'), where('email', '==', newUserEmail), where('institutionId', '==', user.institutionId)),
      );
      if (!checkSnap.empty) {
        setAddError('Este email ya está en la lista de profesores autorizados.');
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'allowed_teachers'), {
        email: newUserEmail.toLowerCase().trim(),
        institutionId: user.institutionId,
        addedBy: user.uid,
        createdAt: serverTimestamp(),
        enabled: true,
      });

      setAddSuccess(`Acceso concedido a ${newUserEmail}`);
      setNewUserEmail('');
      fetchData();
    } catch (error) {
      console.error(error);
      setAddError('Error al guardar en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAccess = async (docId) => {
    if (!window.confirm('¿Seguro que quieres eliminar el acceso a este profesor?')) return;
    try {
      await deleteDoc(doc(db, 'allowed_teachers', docId));
      fetchData();
    } catch (error) {
      console.error('Error removing access', error);
    }
  };

  const handleSaveCustomization = async (incomingFormValues = null) => {
    if (!user?.institutionId) return;

    const nextCustomizationForm = incomingFormValues
      ? {
        institutionDisplayName: incomingFormValues.institutionName || '',
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

      setCustomizationForm(nextCustomizationForm);
      setCustomizationSuccess('Personalización guardada correctamente.');
    } catch (error) {
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
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
            teachers={teachers}
            students={students}
            allowedTeachers={allowedTeachers}
            onNavigateTeacher={(id) => navigate(`/institution-admin-dashboard/teacher/${id}`)}
            onNavigateStudent={(id) => navigate(`/institution-admin-dashboard/student/${id}`)}
            onRemoveAccess={handleRemoveAccess}
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
    </div>
  );
};

export default InstitutionAdminDashboard;
