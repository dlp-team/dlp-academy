// src/utils/institutionPreviewProtocol.ts
export const INSTITUTION_PREVIEW_MESSAGE_SOURCE = 'dlp-institution-customization';
export const INSTITUTION_PREVIEW_THEME_MESSAGE_TYPE = 'dlp-preview-theme-update';

export const isInstitutionPreviewThemeMessage = (value: any): boolean => {
  return Boolean(
    value
      && typeof value === 'object'
      && value.source === INSTITUTION_PREVIEW_MESSAGE_SOURCE
      && value.type === INSTITUTION_PREVIEW_THEME_MESSAGE_TYPE
      && typeof value.payload === 'object'
  );
};
