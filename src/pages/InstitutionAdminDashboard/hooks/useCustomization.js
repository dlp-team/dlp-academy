// src/pages/InstitutionAdminDashboard/hooks/useCustomization.js
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { db } from '../../../firebase/config';
import {
  GLOBAL_BRAND_DEFAULTS,
  HOME_THEME_DEFAULT_COLORS,
  HOME_THEME_TOKENS,
  getEffectiveHomeThemeColors,
  normalizeHexColor,
  resolveInstitutionBranding,
} from '../../../utils/themeTokens';

export const DEFAULT_CUSTOMIZATION_FORM = {
  institutionDisplayName: '',
  iconUrl: '',
  logoUrl: '',
  primaryBrandColor: GLOBAL_BRAND_DEFAULTS.primaryColor,
  secondaryBrandColor: GLOBAL_BRAND_DEFAULTS.secondaryColor,
  tertiaryBrandColor: GLOBAL_BRAND_DEFAULTS.tertiaryColor,
  homeThemeColors: { ...HOME_THEME_DEFAULT_COLORS },
};

export const useCustomization = (user, institutionIdOverride = null) => {
  const effectiveInstitutionId = institutionIdOverride || user?.institutionId || null;
  const [institutionName, setInstitutionName] = useState('');
  const [customizationForm, setCustomizationForm] = useState(DEFAULT_CUSTOMIZATION_FORM);
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
          logoUrl: branding.logoUrl || '',
          primaryBrandColor: branding.primaryColor || GLOBAL_BRAND_DEFAULTS.primaryColor,
          secondaryBrandColor: branding.secondaryColor || GLOBAL_BRAND_DEFAULTS.secondaryColor,
          tertiaryBrandColor: branding.tertiaryColor || GLOBAL_BRAND_DEFAULTS.tertiaryColor,
          homeThemeColors: resolvedColors,
        });
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

  const handleIconUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !effectiveInstitutionId) return;
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
      const storageRef = ref(getStorage(db.app), `institutions/${effectiveInstitutionId}/branding/icon.${fileExtension || 'png'}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const iconUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'institutions', effectiveInstitutionId), {
        'customization.iconUrl': iconUrl,
        updatedAt: serverTimestamp(),
      });
      setCustomizationForm(prev => ({ ...prev, iconUrl }));
      setCustomizationSuccess('Icono guardado correctamente.');
    } catch (error) {
      console.error('Error uploading institution icon:', error);
      setIconUploadError('No se pudo subir el icono. Inténtalo de nuevo.');
    } finally {
      setIconUploading(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !effectiveInstitutionId) return;
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
      const storageRef = ref(getStorage(db.app), `institutions/${effectiveInstitutionId}/branding/logo.${fileExtension || 'png'}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const logoUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'institutions', effectiveInstitutionId), {
        'customization.logoUrl': logoUrl,
        updatedAt: serverTimestamp(),
      });
      setCustomizationForm(prev => ({ ...prev, logoUrl }));
      setCustomizationSuccess('Logotipo guardado correctamente.');
    } catch {
      setIconUploadError('No se pudo subir el logotipo. Inténtalo de nuevo.');
    } finally {
      setIconUploading(false);
    }
  };

  const handleLogoUrlSave = async (url) => {
    if (!url || !effectiveInstitutionId) return;
    try {
      await updateDoc(doc(db, 'institutions', effectiveInstitutionId), {
        'customization.logoUrl': url,
        updatedAt: serverTimestamp(),
      });
      setCustomizationForm(prev => ({ ...prev, logoUrl: url }));
    } catch {
      setCustomizationError('No se pudo guardar el logo por URL. Inténtalo de nuevo.');
    }
  };

  const handleSaveCustomization = async (incomingFormValues = null) => {
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

  return {
    institutionName,
    customizationForm,
    setCustomizationForm,
    customizationLoading,
    customizationSaving,
    customizationError,
    customizationSuccess,
    iconUploading,
    iconUploadError,
    handleIconUpload,
    handleLogoUpload,
    handleLogoUrlSave,
    handleSaveCustomization,
    customizationInitialValues,
  };
};