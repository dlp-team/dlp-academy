// tests/unit/pages/home/HomeBulkActionFeedback.test.jsx
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomeBulkActionFeedback from '../../../../src/pages/Home/components/HomeBulkActionFeedback';

describe('HomeBulkActionFeedback', () => {
  it('does not render when message is empty', () => {
    const { container } = render(<HomeBulkActionFeedback message="" tone="success" />);
    expect(container.textContent).toBe('');
  });

  it('renders warning tone styles for warning feedback', () => {
    render(<HomeBulkActionFeedback message="Accion parcial" tone="warning" />);

    const feedback = screen.getByText('Accion parcial');
    expect(feedback.className).toContain('text-amber-700');
    expect(feedback.className).toContain('border-amber-200');
  });

  it('falls back to success styles when tone is unknown', () => {
    render(<HomeBulkActionFeedback message="Operacion completada" tone="custom" />);

    const feedback = screen.getByText('Operacion completada');
    expect(feedback.className).toContain('text-emerald-700');
    expect(feedback.className).toContain('border-emerald-200');
  });
});
