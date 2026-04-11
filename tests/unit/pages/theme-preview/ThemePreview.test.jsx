// tests/unit/pages/theme-preview/ThemePreview.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../../../src/pages/Home/Home', () => ({
  default: ({ user }) => (
    <div data-testid="theme-preview-home-mock">
      Rol activo: {user?.activeRole || 'none'}
    </div>
  ),
}));

import ThemePreview from '../../../../src/pages/ThemePreview/ThemePreview';
import {
  INSTITUTION_PREVIEW_MESSAGE_SOURCE,
  INSTITUTION_PREVIEW_THEME_MESSAGE_TYPE,
} from '../../../../src/utils/institutionPreviewProtocol';

const renderThemePreview = (initialEntry = '/theme-preview') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/theme-preview" element={<ThemePreview />} />
      </Routes>
    </MemoryRouter>
  );
};

const dispatchPreviewMessage = ({ origin = window.location.origin, payload = {} } = {}) => {
  window.dispatchEvent(new MessageEvent('message', {
    origin,
    data: {
      source: INSTITUTION_PREVIEW_MESSAGE_SOURCE,
      type: INSTITUTION_PREVIEW_THEME_MESSAGE_TYPE,
      payload,
    },
  }));
};

describe('ThemePreview', () => {
  it('uses role query parameter for initial preview role', async () => {
    renderThemePreview('/theme-preview?role=student');

    act(() => {
      dispatchPreviewMessage({
        payload: {
          previewUser: {
            uid: 'user-preview-1',
            email: 'docente@demo.es',
            displayName: 'Docente Demo',
            institutionId: 'inst-1',
            role: 'teacher',
            activeRole: 'teacher',
            roles: ['teacher', 'student'],
          },
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-preview-home-mock')).toBeTruthy();
      expect(screen.getByText(/rol activo:\s*student/i)).toBeTruthy();
    });
  });

  it('applies postMessage payload for role and live colors', async () => {
    renderThemePreview('/theme-preview?role=teacher');
    expect(screen.getByText(/cargando vista previa/i)).toBeTruthy();

    act(() => {
      dispatchPreviewMessage({
        payload: {
          previewUser: {
            uid: 'user-preview-2',
            email: 'docente@demo.es',
            displayName: 'Docente Demo',
            institutionId: 'inst-1',
            role: 'teacher',
            activeRole: 'teacher',
            roles: ['teacher', 'student'],
          },
          previewRole: 'student',
          themeCss: ':root { --color-primary:#123456; }',
          highlightCss: '.home-page { outline: 2px solid #123456; }',
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/rol activo:\s*student/i)).toBeTruthy();
    });

    const themeTag = document.getElementById('__dlp_theme_preview_runtime_theme');
    const highlightTag = document.getElementById('__dlp_theme_preview_runtime_highlight');
    expect(themeTag?.textContent || '').toContain('--color-primary:#123456');
    expect(highlightTag?.textContent || '').toContain('outline: 2px solid #123456');
  });

  it('ignores postMessage updates from foreign origins', async () => {
    renderThemePreview('/theme-preview?role=teacher');
    expect(screen.getByText(/cargando vista previa/i)).toBeTruthy();

    act(() => {
      dispatchPreviewMessage({
        origin: 'https://example.org',
        payload: {
          previewUser: {
            uid: 'user-preview-3',
            email: 'docente@demo.es',
            displayName: 'Docente Demo',
            institutionId: 'inst-1',
          },
          previewRole: 'student',
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/cargando vista previa/i)).toBeTruthy();
      expect(screen.queryByTestId('theme-preview-home-mock')).toBeNull();
    });
  });
});
