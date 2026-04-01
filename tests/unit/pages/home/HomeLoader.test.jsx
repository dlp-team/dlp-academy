// tests/unit/pages/home/HomeLoader.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomeLoader from '../../../../src/pages/Home/components/HomeLoader';

describe('HomeLoader', () => {
  it('renders full-page loader shell when fullPage is true', () => {
    const { container } = render(<HomeLoader fullPage />);

    expect(container.firstChild?.className || '').toContain('min-h-screen');
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders inline loader shell by default', () => {
    render(<HomeLoader />);

    const spinner = document.querySelector('svg');
    expect(spinner).not.toBeNull();
    expect(screen.queryByText(/cargando/i)).toBeNull();
  });
});
