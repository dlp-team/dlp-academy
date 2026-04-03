// src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { DEFAULT_ACCESS_POLICIES, normalizeAccessPolicies } from '../../../utils/institutionPolicyUtils';

const DEFAULT_PERIOD_MODE = 'trimester';
const DEFAULT_POST_COURSE_POLICY = 'retain_all_no_join';

const DEFAULT_SETTINGS_FORM = {
  academicYearStartDate: '',
  ordinaryEndDate: '',
  extraordinaryEndDate: '',
  periodMode: DEFAULT_PERIOD_MODE,
  customPeriodLabel: '',
  postCoursePolicy: DEFAULT_POST_COURSE_POLICY,
  allowTeacherAutonomousSubjectCreation: true,
  canAssignClassesAndStudents: true,
  canDeleteSubjectsWithStudents: false,
};

const normalizePeriodMode = (value: any) => {
  if (value === 'trimester' || value === 'cuatrimester' || value === 'custom') return value;
  return DEFAULT_PERIOD_MODE;
};

const normalizePostCoursePolicy = (value: any) => {
  if (value === 'delete' || value === 'retain_all_no_join' || value === 'retain_teacher_only') return value;
  return DEFAULT_POST_COURSE_POLICY;
};

export const useInstitutionSettings = (user: any, institutionIdOverride: any = null) => {
  const effectiveInstitutionId = institutionIdOverride || user?.institutionId || null;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<any>({ type: '', text: '' });
  const [settingsForm, setSettingsForm] = useState(DEFAULT_SETTINGS_FORM);
  const [baseAccessPolicies, setBaseAccessPolicies] = useState<any>(DEFAULT_ACCESS_POLICIES);
  const [baseCourseLifecycle, setBaseCourseLifecycle] = useState<any>({});

  const fetchSettings = useCallback(async () => {
    if (!effectiveInstitutionId) return;
    setLoading(true);
    try {
      const institutionRef = doc(db, 'institutions', effectiveInstitutionId);
      const institutionSnap = await getDoc(institutionRef);
      if (!institutionSnap.exists()) {
        setSettingsForm(DEFAULT_SETTINGS_FORM);
        setBaseAccessPolicies(DEFAULT_ACCESS_POLICIES);
        setBaseCourseLifecycle({});
        return;
      }

      const institutionData = institutionSnap.data() || {};
      const academicCalendar = institutionData.academicCalendar || {};
      const periodization = academicCalendar.periodization || {};
      const normalizedPolicies = normalizeAccessPolicies(institutionData.accessPolicies);
      const teacherPolicy = normalizedPolicies?.teachers || DEFAULT_ACCESS_POLICIES.teachers;

      setBaseAccessPolicies(normalizedPolicies);
      setBaseCourseLifecycle(institutionData.courseLifecycle || {});

      setSettingsForm({
        academicYearStartDate: academicCalendar.startDate || '',
        ordinaryEndDate: academicCalendar.ordinaryEndDate || '',
        extraordinaryEndDate: academicCalendar.extraordinaryEndDate || '',
        periodMode: normalizePeriodMode(periodization.mode),
        customPeriodLabel: periodization.customLabel || '',
        postCoursePolicy: normalizePostCoursePolicy((institutionData.courseLifecycle || {}).postCoursePolicy),
        allowTeacherAutonomousSubjectCreation: teacherPolicy.allowTeacherAutonomousSubjectCreation !== false,
        canAssignClassesAndStudents: teacherPolicy.canAssignClassesAndStudents !== false,
        canDeleteSubjectsWithStudents: teacherPolicy.canDeleteSubjectsWithStudents === true,
      });
    } catch (error) {
      console.error('Error loading institution settings:', error);
      setSettingsMessage({ type: 'error', text: 'No se pudo cargar la configuración de la institución.' });
    } finally {
      setLoading(false);
    }
  }, [effectiveInstitutionId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const canSave = useMemo(() => {
    if (!settingsForm.academicYearStartDate || !settingsForm.ordinaryEndDate || !settingsForm.extraordinaryEndDate) {
      return false;
    }

    if (settingsForm.periodMode === 'custom' && !settingsForm.customPeriodLabel.trim()) {
      return false;
    }

    return true;
  }, [settingsForm]);

  const handleSaveSettings = useCallback(async () => {
    if (!effectiveInstitutionId || saving || !canSave) return;

    setSaving(true);
    setSettingsMessage({ type: '', text: '' });

    try {
      const mergedAccessPolicies = normalizeAccessPolicies(baseAccessPolicies);
      const mergedTeacherPolicy = {
        ...(mergedAccessPolicies.teachers || DEFAULT_ACCESS_POLICIES.teachers),
        allowTeacherAutonomousSubjectCreation: settingsForm.allowTeacherAutonomousSubjectCreation,
        canAssignClassesAndStudents: settingsForm.canAssignClassesAndStudents,
        canDeleteSubjectsWithStudents: settingsForm.canDeleteSubjectsWithStudents,
      };

      const nextAccessPolicies = {
        ...mergedAccessPolicies,
        teachers: mergedTeacherPolicy,
      };

      const nextCourseLifecycle = {
        ...(baseCourseLifecycle || {}),
        postCoursePolicy: normalizePostCoursePolicy(settingsForm.postCoursePolicy),
      };

      await updateDoc(doc(db, 'institutions', effectiveInstitutionId), {
        academicCalendar: {
          startDate: settingsForm.academicYearStartDate,
          ordinaryEndDate: settingsForm.ordinaryEndDate,
          extraordinaryEndDate: settingsForm.extraordinaryEndDate,
          periodization: {
            mode: normalizePeriodMode(settingsForm.periodMode),
            customLabel: settingsForm.periodMode === 'custom' ? settingsForm.customPeriodLabel.trim() : '',
          },
        },
        courseLifecycle: nextCourseLifecycle,
        accessPolicies: nextAccessPolicies,
        updatedAt: serverTimestamp(),
      });

      setBaseAccessPolicies(nextAccessPolicies);
      setBaseCourseLifecycle(nextCourseLifecycle);
      setSettingsMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
    } catch (error) {
      console.error('Error saving institution settings:', error);
      setSettingsMessage({ type: 'error', text: 'No se pudo guardar la configuración. Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  }, [baseAccessPolicies, baseCourseLifecycle, canSave, effectiveInstitutionId, saving, settingsForm]);

  return {
    loading,
    saving,
    canSave,
    settingsMessage,
    settingsForm,
    setSettingsForm,
    handleSaveSettings,
  };
};
