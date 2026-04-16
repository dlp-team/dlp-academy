// src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { auth, db, functions } from '../../../firebase/config';
import {
  GLOBAL_BRAND_DEFAULTS,
  HOME_THEME_DEFAULT_COLORS,
  HOME_THEME_TOKENS,
  getEffectiveHomeThemeColors,
  normalizeHexColor,
  resolveInstitutionBranding,
} from '../../../utils/themeTokens';
import { getActiveRole } from '../../../utils/permissionUtils';

export const DEFAULT_CUSTOMIZATION_FORM = {
  institutionDisplayName: '',
  iconUrl: '',
  iconStoragePath: '',
  logoUrl: '',
  logoStoragePath: '',
  primaryBrandColor: GLOBAL_BRAND_DEFAULTS.primaryColor,
  secondaryBrandColor: GLOBAL_BRAND_DEFAULTS.secondaryColor,
  tertiaryBrandColor: GLOBAL_BRAND_DEFAULTS.tertiaryColor,
  homeThemeColors: { ...HOME_THEME_DEFAULT_COLORS },
};

const normalizeThemeSetColors = (colors: any = {}) => ({
  primary: normalizeHexColor(colors?.primary) || GLOBAL_BRAND_DEFAULTS.primaryColor,
  secondary: normalizeHexColor(colors?.secondary) || GLOBAL_BRAND_DEFAULTS.secondaryColor,
  accent: normalizeHexColor(colors?.accent) || GLOBAL_BRAND_DEFAULTS.tertiaryColor,
  cardBorder: normalizeHexColor(colors?.cardBorder) || HOME_THEME_DEFAULT_COLORS.cardBorder,
});

const normalizeSavedThemeSets = (themeSetsSource: any) => {
  const source = themeSetsSource || {};
  const entries = Array.isArray(source)
    ? source.map((entry: any) => [entry?.id, entry])
    : Object.entries(source);

  return entries
    .map(([fallbackId, entry]: any) => {
      const id = String(entry?.id || fallbackId || '').trim();
      const name = String(entry?.name || '').trim();
      if (!id || !name) return null;

      return {
        id,
        name,
        colors: normalizeThemeSetColors(entry?.colors || entry),
        createdAt: entry?.createdAt || null,
        updatedAt: entry?.updatedAt || null,
      };
    })
    .filter(Boolean)
    .sort((left: any, right: any) => String(left?.name || '').localeCompare(String(right?.name || ''), 'es', { sensitivity: 'base' }));
};

export const useCustomization = (user, institutionIdOverride = null) => {
  const effectiveInstitutionId = institutionIdOverride || user?.institutionId || null;
  const [institutionName, setInstitutionName] = useState('');
  const [customizationForm, setCustomizationForm] = useState(DEFAULT_CUSTOMIZATION_FORM);
  const [savedThemeSets, setSavedThemeSets] = useState<any[]>([]);
  const [customizationLoading, setCustomizationLoading] = useState(false);
  const [customizationSaving, setCustomizationSaving] = useState(false);
  const [customizationError, setCustomizationError] = useState('');
  const [customizationSuccess, setCustomizationSuccess] = useState('');
  const [iconUploading, setIconUploading] = useState(false);
  const [iconUploadError, setIconUploadError] = useState('');

  // Favicon effect
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

  // Fetch customization from Firestore
  useEffect(() => {
    let active = true;
    const fetchInstitutionCustomization = async () => {
      if (!effectiveInstitutionId) return;
      setCustomizationLoading(true);
      try {
        const institutionRef = doc(db, 'institutions', effectiveInstitutionId);
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
          iconStoragePath: customizationData.iconStoragePath || '',
          logoUrl: branding.logoUrl || '',
          logoStoragePath: customizationData.logoStoragePath || '',
          primaryBrandColor: branding.primaryColor || GLOBAL_BRAND_DEFAULTS.primaryColor,
          secondaryBrandColor: branding.secondaryColor || GLOBAL_BRAND_DEFAULTS.secondaryColor,
          tertiaryBrandColor: branding.tertiaryColor || GLOBAL_BRAND_DEFAULTS.tertiaryColor,
          homeThemeColors: resolvedColors,
          browserTabTitle: branding.browserTabTitle || customizationData.browserTabTitle || '',
        });
        setSavedThemeSets(normalizeSavedThemeSets(customizationData.themeSets));
      } catch (error) {
        console.error('Error loading institution customization:', error);
        if (active) setCustomizationError('No se pudo cargar la personalización de la institución.');
      } finally {
        if (active) setCustomizationLoading(false);
      }
    };
    fetchInstitutionCustomization();
    return () => { active = false; };
  }, [effectiveInstitutionId]);

  const syncAuthClaimsForStorage = async ({ force = false } = {}) => {
    const authUser = auth.currentUser;
    if (!authUser) return;

    const expectedRole = getActiveRole(user);
    const expectedInstitutionId = effectiveInstitutionId ? String(effectiveInstitutionId) : null;

    const tokenResult = await authUser.getIdTokenResult();
    const tokenRole = String(tokenResult?.claims?.role || '').trim().toLowerCase();
    const tokenInstitutionId = tokenResult?.claims?.institutionId
      ? String(tokenResult.claims.institutionId)
      : null;

    const shouldSync = force
      || tokenRole !== expectedRole
      || tokenInstitutionId !== expectedInstitutionId;

    if (!shouldSync) return;

    const syncClaims = httpsCallable(functions, 'syncCurrentUserClaims');
    await syncClaims({});
    await authUser.getIdToken(true);
  };

  const uploadBrandingAsset = async (file: any, assetName: any) => {
    if (!effectiveInstitutionId) {
      throw new Error('No se pudo resolver la institución para la subida de archivos.');
    }

    const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'png';
    const storagePath = `institutions/${effectiveInstitutionId}/branding/${assetName}.${fileExtension || 'png'}`;
    const storageRef = ref(
      getStorage(db.app),
      storagePath,
    );

    await syncAuthClaimsForStorage();

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await uploadBytes(storageRef, file, { contentType: file.type });
        return { url: await getDownloadURL(storageRef), storagePath };
      } catch (error: any) {
        const isUnauthorized = String(error?.code || '').toLowerCase() === 'storage/unauthorized'
          || String(error?.message || '').toLowerCase().includes('unauthorized');

        if (!isUnauthorized || attempt > 0) {
          throw error;
        }

        await syncAuthClaimsForStorage({ force: true });
      }
    }

    throw new Error('No se pudo completar la subida del archivo de personalización.');
  };

  const handleIconUpload = async (event: any) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !effectiveInstitutionId) return;
    if (!file.type.startsWith('image/')) {
      setIconUploadError('Selecciona una imagen válida para el icono.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setIconUploadError('El icono no puede superar 2 MB.');
      return;
    }
    setIconUploading(true);
    setIconUploadError('');
    setCustomizationError('');
    setCustomizationSuccess('');
    try {
      const { url: iconUrl, storagePath: iconStoragePath } = await uploadBrandingAsset(file, 'icon');
      await updateDoc(doc(db, 'institutions', effectiveInstitutionId), {
        'customization.iconUrl': iconUrl,
        'customization.iconStoragePath': iconStoragePath,
        updatedAt: serverTimestamp(),
      });
      setCustomizationForm(prev => ({ ...prev, iconUrl, iconStoragePath }));
      setCustomizationSuccess('Icono guardado correctamente.');
    } catch (error) {
      console.error('Error uploading institution icon:', error);
      setIconUploadError('No se pudo subir el icono. Inténtalo de nuevo.');
    } finally {
      setIconUploading(false);
    }
  };

  const handleLogoUpload = async (event: any) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !effectiveInstitutionId) return;
    if (!file.type.startsWith('image/')) {
      setIconUploadError('Selecciona una imagen válida para el logotipo.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setIconUploadError('El logotipo no puede superar 5 MB.');
      return;
    }
    setIconUploading(true);
    setIconUploadError('');
    setCustomizationError('');
    setCustomizationSuccess('');
    try {
      const { url: logoUrl, storagePath: logoStoragePath } = await uploadBrandingAsset(file, 'logo');
      await updateDoc(doc(db, 'institutions', effectiveInstitutionId), {
        'customization.logoUrl': logoUrl,
        'customization.logoStoragePath': logoStoragePath,
        updatedAt: serverTimestamp(),
      });
      setCustomizationForm(prev => ({ ...prev, logoUrl, logoStoragePath }));
      setCustomizationSuccess('Logotipo guardado correctamente.');
    } catch {
      setIconUploadError('No se pudo subir el logotipo. Inténtalo de nuevo.');
    } finally {
      setIconUploading(false);
    }
  };

  const handleIconUrlSave = async (url: any) => {
    if (!effectiveInstitutionId) return;
    const trimmedUrl = typeof url === 'string' ? url.trim() : '';
    // Delete previously uploaded file if one exists.
    const previousStoragePath = customizationForm.iconStoragePath;
    if (previousStoragePath) {
      try {
        await deleteObject(ref(getStorage(db.app), previousStoragePath));
      } catch { /* ignore deletion errors — file may already be gone */ }
    }
    try {
      await updateDoc(doc(db, 'institutions', effectiveInstitutionId), {
        'customization.iconUrl': trimmedUrl,
        'customization.iconStoragePath': '',
        updatedAt: serverTimestamp(),
      });
      setCustomizationForm(prev => ({ ...prev, iconUrl: trimmedUrl, iconStoragePath: '' }));
    } catch {
      setCustomizationError('No se pudo guardar el icono por URL. Inténtalo de nuevo.');
    }
  };

  const handleLogoUrlSave = async (url: any) => {
    if (!effectiveInstitutionId) return;
    const trimmedUrl = typeof url === 'string' ? url.trim() : '';
    // Delete previously uploaded file if one exists.
    const previousStoragePath = customizationForm.logoStoragePath;
    if (previousStoragePath) {
      try {
        await deleteObject(ref(getStorage(db.app), previousStoragePath));
      } catch { /* ignore deletion errors — file may already be gone */ }
    }
    try {
      await updateDoc(doc(db, 'institutions', effectiveInstitutionId), {
        'customization.logoUrl': trimmedUrl,
        'customization.logoStoragePath': '',
        updatedAt: serverTimestamp(),
      });
      setCustomizationForm(prev => ({ ...prev, logoUrl: trimmedUrl, logoStoragePath: '' }));
    } catch {
      setCustomizationError('No se pudo guardar el logo por URL. Inténtalo de nuevo.');
    }
  };

  const handleSaveCustomization = async (incomingFormValues: any = null) => {
    if (!effectiveInstitutionId) return;

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
          browserTabTitle: incomingFormValues.browserTabTitle ?? customizationForm.browserTabTitle ?? '',
        }
      : customizationForm;

    setCustomizationError('');
    setCustomizationSuccess('');
    setCustomizationSaving(true);

    try {
      const institutionRef = doc(db, 'institutions', effectiveInstitutionId);
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
        'customization.browserTabTitle': typeof nextCustomizationForm.browserTabTitle === 'string' ? nextCustomizationForm.browserTabTitle.trim() : '',
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

  const handleSaveThemeSet = async ({ name, colors }: any = {}) => {
    if (!effectiveInstitutionId) return null;

    const normalizedName = String(name || '').trim();
    if (!normalizedName) {
      throw new Error('El nombre del tema es obligatorio.');
    }

    const normalizedColors = normalizeThemeSetColors(colors || {});
    const themeSetId = `theme_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    setCustomizationError('');
    setCustomizationSuccess('');

    try {
      const institutionRef = doc(db, 'institutions', effectiveInstitutionId);
      await updateDoc(institutionRef, {
        [`customization.themeSets.${themeSetId}`]: {
          id: themeSetId,
          name: normalizedName,
          colors: normalizedColors,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });

      const localThemeSet = {
        id: themeSetId,
        name: normalizedName,
        colors: normalizedColors,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSavedThemeSets((previous: any[]) => (
        [...previous, localThemeSet]
          .sort((left: any, right: any) => String(left?.name || '').localeCompare(String(right?.name || ''), 'es', { sensitivity: 'base' }))
      ));
      setCustomizationSuccess(`Tema "${normalizedName}" guardado correctamente.`);
      return localThemeSet;
    } catch (error) {
      console.error('Error saving customization theme set:', error);
      setCustomizationError('No se pudo guardar el tema personalizado. Inténtalo de nuevo.');
      throw error;
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
    browserTabTitle: customizationForm.browserTabTitle || '',
  };

  return {
    institutionName,
    customizationForm,
    setCustomizationForm,
    savedThemeSets,
    customizationLoading,
    customizationSaving,
    customizationError,
    customizationSuccess,
    iconUploading,
    iconUploadError,
    handleIconUpload,
    handleLogoUpload,
    handleIconUrlSave,
    handleLogoUrlSave,
    handleSaveCustomization,
    handleSaveThemeSet,
    customizationInitialValues,
  };
};