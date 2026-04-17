// tests/unit/pages/home/HomeShortcutFeedback.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomeShortcutFeedback from '../../../../src/pages/Home/components/HomeShortcutFeedback';

describe('HomeShortcutFeedback', () => {
  it('does not render when there is no message', () => {
    const { container } = render(<HomeShortcutFeedback message="" mutedTextClass="text-slate-500" />);
    expect(container.textContent).toBe('');
  });

  it('renders feedback message when present', () => {
    render(<HomeShortcutFeedback message="Atajo aplicado" mutedTextClass="text-slate-500" />);
    expect(screen.getByText('Atajo aplicado')).not.toBeNull();
  });
});
