// tests/unit/pages/theme-preview/ThemePreview.test.jsx
import React from 'react';
import { describe, expect, it } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

    await waitFor(() => {
      expect(screen.getByText(/panel estudiante/i)).toBeTruthy();
    });
  });

  it('applies postMessage payload for role and live colors', async () => {
    renderThemePreview('/theme-preview?role=teacher');
    expect(screen.getByText(/panel docente/i)).toBeTruthy();

    act(() => {
      dispatchPreviewMessage({
        payload: {
          previewRole: 'student',
          activeToken: 'primary',
          colors: {
            primary: '#123456',
            secondary: '#8b5cf6',
            accent: '#a855f7',
            cardBorder: '#d1d5db',
          },
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/panel estudiante/i)).toBeTruthy();
    });

    const avatar = screen.getByLabelText(/avatar de vista previa/i);
    expect(String(avatar.style.backgroundColor).replace(/\s+/g, '')).toContain('18,52,86');
  });

  it('ignores postMessage updates from foreign origins', async () => {
    renderThemePreview('/theme-preview?role=teacher');
    expect(screen.getByText(/panel docente/i)).toBeTruthy();

    act(() => {
      dispatchPreviewMessage({
        origin: 'https://example.org',
        payload: {
          previewRole: 'student',
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/panel docente/i)).toBeTruthy();
    });
  });
});
