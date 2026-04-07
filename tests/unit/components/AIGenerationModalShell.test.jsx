// tests/unit/components/AIGenerationModalShell.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AIGenerationModalShell from '../../../src/components/modals/shared/AIGenerationModalShell';

describe('AIGenerationModalShell', () => {
  it('renders nothing when shouldRender is false', () => {
    render(
      <AIGenerationModalShell
        shouldRender={false}
        isVisible={false}
        onRequestClose={() => {}}
      >
        <p>Contenido modal</p>
      </AIGenerationModalShell>
    );

    expect(screen.queryByText('Contenido modal')).toBeNull();
  });

  it('renders dialog content when shouldRender is true', () => {
    render(
      <AIGenerationModalShell
        shouldRender={true}
        isVisible={true}
        onRequestClose={() => {}}
      >
        <p>Contenido modal</p>
      </AIGenerationModalShell>
    );

    expect(screen.getByText('Contenido modal')).toBeTruthy();
    expect(screen.getByTestId('ai-generation-modal-shell-dialog').className).toContain('opacity-100');
  });

  it('calls onRequestClose when backdrop is clicked', () => {
    const onRequestClose = vi.fn();

    render(
      <AIGenerationModalShell
        shouldRender={true}
        isVisible={true}
        onRequestClose={onRequestClose}
      >
        <p>Contenido modal</p>
      </AIGenerationModalShell>
    );

    fireEvent.click(screen.getByTestId('ai-generation-modal-shell-backdrop'));

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside dialog content', () => {
    const onRequestClose = vi.fn();

    render(
      <AIGenerationModalShell
        shouldRender={true}
        isVisible={true}
        onRequestClose={onRequestClose}
      >
        <button type="button">Accion interna</button>
      </AIGenerationModalShell>
    );

    fireEvent.click(screen.getByRole('button', { name: /accion interna/i }));

    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
