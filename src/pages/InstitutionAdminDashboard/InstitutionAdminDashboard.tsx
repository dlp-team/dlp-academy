// src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx
//
// ─── Refactor summary ─────────────────────────────────────────────────────────
//  • All user/invite/policy logic → hooks/useUsers.js
//  • All customization logic     → hooks/useCustomization.js
//  • Icon + Logo section         → components/customization/BrandingSection.jsx
//  • Full customization tab      → components/CustomizationTab.jsx
//  • InstitutionCustomizationView updated to accept `previewPaletteApply` prop

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, Palette, Settings2, UserPlus, Users } from 'lucide-react';

import Header from '../../components/layout/Header';
import SudoModal from '../../components/modals/SudoModal';
import ClassesCoursesSection from './components/ClassesCoursesSection';
import UsersTabContent from './components/UsersTabContent';
import AddTeacherModal from './components/AddTeacherModal';
import CustomizationTab from './components/CustomizationTab';
import SettingsTabContent from './components/SettingsTabContent';

import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { getActiveRole, hasRequiredRoleAccess } from '../../utils/permissionUtils';
import { useUsers } from './hooks/useUsers';
import { useCustomization } from './hooks/useCustomization';
import { useInstitutionSettings } from './hooks/useInstitutionSettings';
import { usePersistentState } from '../../hooks/usePersistentState';
import { buildInstitutionScopedPersistenceKey } from '../../utils/pagePersistence';

const TABS = [
  { key: 'users',         label: 'Usuarios',         icon: Users },
  { key: 'organization',  label: 'Cursos y Clases',   icon: LayoutGrid },
  { key: 'settings',      label: 'Configuración',     icon: Settings2 },
  { key: 'customization', label: 'Personalización',   icon: Palette },
];

const InstitutionAdminDashboard = ({ user }: any) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useIdleTimeout(15);

  const institutionIdFromQuery = searchParams.get('institutionId');
  const activeRole = getActiveRole(user);
  const effectiveInstitutionId = activeRole === 'admin' && institutionIdFromQuery
    ? institutionIdFromQuery
    : user?.institutionId || null;
  const activeTabKey = buildInstitutionScopedPersistenceKey('institution-admin-dashboard', effectiveInstitutionId, 'active-tab');

  const [activeTab, setActiveTab] = usePersistentState(activeTabKey, 'users');

  // ── Guard ──
  useEffect(() => {
    if (user && !hasRequiredRoleAccess(user, 'institutionadmin')) {
      console.warn('Unauthorized access attempt to Institution Admin Dashboard');
      navigate('/home');
    }
  }, [user, navigate]);

  // ── Domain logic hooks ──
  const users = useUsers(user, effectiveInstitutionId, { loadAllUsers: activeTab === 'organization' });
  const customization = useCustomization(user, effectiveInstitutionId);
  const institutionSettings = useInstitutionSettings(user, effectiveInstitutionId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      <Header user={user} />

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel de Administración</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {user?.institutionId ? `Institución ID: ${user.institutionId}` : 'Configuración de Institución'}
              {effectiveInstitutionId ? `Institución ID: ${effectiveInstitutionId}` : 'Configuración de Institución'}
            </p>
          </div>
          {activeTab === 'users' && users.userType === 'teachers' && (
            <button
              onClick={() => {
                users.setShowAddUserModal(true);
              }}
              className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-[var(--color-primary-200)] dark:shadow-[var(--color-primary-900)/0.2] transition-all active:scale-95"
            >
              <UserPlus className="w-5 h-5" /> Autorizar Profesor
            </button>
          )}
        </div>

        {/* Tab nav */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-px">
            {TABS.map(({ key, label, icon }: any) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 -mb-[2px] transition-colors ${
                activeTab === key
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {React.createElement(icon, { className: 'w-4 h-4' })} {label}
            </button>
          ))}
        </div>

        {/* ── Users tab ── */}
        {activeTab === 'users' && (
          <UsersTabContent
            userType={users.userType}
            setUserType={users.setUserType}
            institutionId={effectiveInstitutionId}
            accessPolicies={users.accessPolicies}
            onSavePolicies={users.handleSavePolicies}
            isUpdatingPolicies={users.isUpdatingPolicies}
            policyMessage={users.policyMessage}
            searchTerm={users.searchTerm}
            setSearchTerm={users.setSearchTerm}
            loading={users.loading}
            teachers={users.teachers}
            students={users.students}
            canLoadMoreUsers={users.canLoadMoreUsers}
            isLoadingMoreUsers={users.isLoadingMoreUsers}
            onLoadMoreUsers={users.handleLoadMoreUsers}
            allowedTeachers={users.allowedTeachers}
            onNavigateTeacher={(id) => navigate(`/institution-admin-dashboard/teacher/${id}`)}
            onNavigateStudent={(id) => navigate(`/institution-admin-dashboard/student/${id}`)}
            onRemoveAccess={users.handleRemoveAccess}
            institutionalCode={users.institutionalCode}
            onUpdateInstitutionalCode={users.handleUpdateInstitutionalCode}
            isUpdatingCode={users.isUpdatingCode}
            codeUpdateSuccess={users.codeUpdateSuccess}
            codeUpdateError={users.codeUpdateError}
            liveAccessCode={users.liveAccessCode}
            liveCodeLoading={users.liveCodeLoading}
            liveCodeError={users.liveCodeError}
            institutionCourses={users.institutionCourses}
            onBulkLinkStudentsCsv={users.handleBulkLinkStudentsCsv}
          />
        )}

        {/* ── Organization tab ── */}
        {activeTab === 'organization' && (
          <ClassesCoursesSection
            user={user}
            institutionId={effectiveInstitutionId}
            allStudents={users.allStudents}
            allTeachers={users.allTeachers}
          />
        )}

        {/* ── Settings tab ── */}
        {activeTab === 'settings' && (
          <SettingsTabContent
            loading={institutionSettings.loading}
            saving={institutionSettings.saving}
            canSave={institutionSettings.canSave}
            settingsForm={institutionSettings.settingsForm}
            setSettingsForm={institutionSettings.setSettingsForm}
            settingsMessage={institutionSettings.settingsMessage}
            onSave={institutionSettings.handleSaveSettings}
          />
        )}

        {/* ── Customization tab ── */}
        {activeTab === 'customization' && (
          <CustomizationTab
            customizationLoading={customization.customizationLoading}
            customizationSaving={customization.customizationSaving}
            customizationError={customization.customizationError}
            customizationSuccess={customization.customizationSuccess}
            customizationForm={customization.customizationForm}
            institutionName={customization.institutionName}
            iconUploading={customization.iconUploading}
            iconUploadError={customization.iconUploadError}
            customizationInitialValues={customization.customizationInitialValues}
            onIconUpload={customization.handleIconUpload}
            onLogoUpload={customization.handleLogoUpload}
            onLogoUrlSave={customization.handleLogoUrlSave}
            onSaveCustomization={customization.handleSaveCustomization}
          />
        )}
      </main>

      {/* ── Add teacher modal ── */}
      {users.showAddUserModal && (
        <AddTeacherModal
          isSubmitting={users.isSubmitting}
          newUserEmail={users.newUserEmail}
          onEmailChange={users.setNewUserEmail}
          onClose={() => users.setShowAddUserModal(false)}
          onSubmit={users.handleAddUser}
          addError={users.addError}
          addSuccess={users.addSuccess}
        />
      )}

      {/* ── Sudo confirmation modal ── */}
      <SudoModal
        isOpen={users.showSudoModal}
        onClose={() => users.setShowSudoModal(false)}
        onConfirm={users.handleConfirmSavePolicies}
        actionName="guardar las políticas de acceso"
      />
    </div>
  );
};

export default InstitutionAdminDashboard;