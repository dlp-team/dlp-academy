// src/pages/InstitutionAdminDashboard/components/CustomizationTab.jsx
//
// Self-contained tab content for the Personalización tab.
// Wires BrandingSection (icon/logo + palette extraction) with
// InstitutionCustomizationView (color editor + live iframe preview).
//
// The palette suggestion flow:
//   1. User uploads/sets an image in BrandingSection.
//   2. BrandingSection extracts dominant colors client-side.
//   3. User clicks a swatch → onPaletteApply fires with { token, color }.
//   4. CustomizationTab stores that in `previewPaletteApply` state.
//   5. InstitutionCustomizationView reads that prop and injects it into the
//      live preview form — WITHOUT saving to Firestore.
//   6. The admin can then press "Guardar cambios" when satisfied.

import React, { useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import BrandingSection from './customization/BrandingSection';
import InstitutionCustomizationView from './InstitutionCustomizationView';

const CustomizationTab = ({
  customizationLoading,
  customizationSaving,
  customizationError,
  customizationSuccess,
  customizationForm,
  institutionName,
  iconUploading,
  iconUploadError,
  customizationInitialValues,
  onIconUpload,
  onLogoUpload,
  onLogoUrlSave,
  onSaveCustomization,
}) => {
  // Holds the last swatch the user clicked in BrandingSection.
  // Passed to InstitutionCustomizationView as a prop so it can apply the
  // colour to the live preview without saving immediately.
  const [previewPaletteApply, setPreviewPaletteApply] = useState(null);

  const handlePaletteApply = ({ token, color }) => {
    // Each click creates a new object reference so the useEffect inside
    // InstitutionCustomizationView always fires even if the same color is
    // re-applied.
    setPreviewPaletteApply({ token, color, _ts: Date.now() });
  };

  if (customizationLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
      {/* Global status banners */}
      {customizationError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" /> {customizationError}
        </div>
      )}
      {customizationSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {customizationSuccess}
        </div>
      )}

      {/* ── Icon + Logo cards with palette extraction ── */}
      <BrandingSection
        customizationForm={customizationForm}
        institutionName={institutionName}
        iconUploading={iconUploading}
        iconUploadError={iconUploadError}
        onIconUpload={onIconUpload}
        onLogoUpload={onLogoUpload}
        onLogoUrlSave={onLogoUrlSave}
        onPaletteApply={handlePaletteApply}
      />

      {/* ── Color editor + live iframe preview ── */}
      <div className="h-[calc(100vh-13rem)] min-h-[720px]">
        <InstitutionCustomizationView
          className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          initialValues={customizationInitialValues}
          onSave={onSaveCustomization}
          previewPaletteApply={previewPaletteApply}
        />
      </div>

      {customizationSaving && (
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Guardando personalización…
        </div>
      )}
    </div>
  );
};

export default CustomizationTab;