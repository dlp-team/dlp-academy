// tests/unit/components/ModalGradientSubmitButton.test.jsx
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModalGradientSubmitButton from '../../../src/components/modals/shared/ModalGradientSubmitButton';

describe('ModalGradientSubmitButton', () => {
  it('renders label, icon, and form binding in normal state', () => {
    render(
      <ModalGradientSubmitButton
        form="sample-form"
        gradientClass="from-indigo-600 to-violet-700"
        label="Generar Test"
        icon={<span data-testid="button-icon">I</span>}
      />
    );

    expect(screen.getByText('Generar Test')).toBeTruthy();
    expect(screen.getByTestId('button-icon')).toBeTruthy();
    expect(screen.getByTestId('modal-gradient-submit-button').getAttribute('form')).toBe('sample-form');
  });

  it('renders loading state and disables interaction when isLoading is true', () => {
    render(
      <ModalGradientSubmitButton
        form="sample-form"
        gradientClass="from-indigo-600 to-violet-700"
        label="Generar"
        isLoading={true}
        loadingLabel="Generando..."
      />
    );

    const button = screen.getByTestId('modal-gradient-submit-button');
    expect(screen.getByText('Generando...')).toBeTruthy();
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('disables button when disabled prop is true', () => {
    render(
      <ModalGradientSubmitButton
        form="sample-form"
        gradientClass="from-indigo-600 to-violet-700"
        label="Guardar"
        disabled={true}
      />
    );

    expect(screen.getByTestId('modal-gradient-submit-button').hasAttribute('disabled')).toBe(true);
  });
});
