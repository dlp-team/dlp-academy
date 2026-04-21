// tests/unit/pages/home/HomeLoader.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomeLoader from '../../../../src/pages/Home/components/HomeLoader';

describe('HomeLoader', () => {
  it('renders full-page loader shell when fullPage is true', () => {
    const { container } = render(<HomeLoader fullPage />);

    expect(container.firstChild?.className || '').toContain('min-h-screen');
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders inline loader shell by default', () => {
    const { container } = render(<HomeLoader />);

    expect(container.firstChild?.className || '').toContain('py-6');
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText(/cargando/i)).toBeNull();
  });
});
