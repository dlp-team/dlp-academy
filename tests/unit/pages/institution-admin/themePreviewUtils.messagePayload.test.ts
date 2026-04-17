// tests/unit/pages/institution-admin/themePreviewUtils.messagePayload.test.js
import { describe, expect, it } from 'vitest';
import { buildInstitutionPreviewThemeMessage } from '../../../../src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils';

describe('themePreviewUtils preview payload builder', () => {
  it('builds postMessage payload with theme css and normalized role', () => {
    const message = buildInstitutionPreviewThemeMessage({
      colors: {
        primary: '#123456',
        secondary: '#654321',
        accent: '#0ea5e9',
        cardBorder: '#d1d5db',
      },
      previewRole: 'teacher',
      activeToken: null,
    });

    expect(message.source).toBe('dlp-institution-customization');
    expect(message.type).toBe('dlp-preview-theme-update');
    expect(message.payload.previewRole).toBe('teacher');
    expect(message.payload.themeCss).toContain('--color-primary:#123456');
    expect(message.payload.highlightCss).toBe('');
    expect(message.payload.highlightMessage).toBe('');
  });

  it('includes highlight css and message when an active token is provided', () => {
    const message = buildInstitutionPreviewThemeMessage({
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#a855f7',
        cardBorder: '#d1d5db',
      },
      previewRole: 'student',
      activeToken: 'accent',
    });

    expect(message.payload.previewRole).toBe('student');
    expect(message.payload.activeToken).toBe('accent');
    expect(message.payload.highlightCss).toContain('@keyframes __dlp_pulse');
    expect(message.payload.highlightMessage).toContain('acento');
  });
});
