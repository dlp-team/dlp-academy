// tests/unit/components/BinSelectionOverlay.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BinSelectionOverlay from '../../../src/pages/Home/components/bin/BinSelectionOverlay';

vi.mock('../../../src/pages/Home/components/bin/BinSelectionPanel', () => ({
  default: ({ subject, onClose, onRestore, onDeleteConfirm }) => (
    <div data-testid="bin-selection-panel">
      <span>{subject?.name || 'Sin nombre'}</span>
      <button onClick={onClose}>Cerrar panel</button>
      <button onClick={() => onRestore(subject?.id)}>Restaurar</button>
      <button onClick={() => onDeleteConfirm(subject?.id)}>Eliminar</button>
    </div>
  ),
}));

describe('BinSelectionOverlay', () => {
  it('returns null when selected card ref is missing', () => {
    const { container } = render(
      <BinSelectionOverlay
        subject={{ id: 'subject-1', name: 'Historia' }}
        selectedCardRef={{ current: null }}
        actionLoading={null}
        onClose={vi.fn()}
        onShowDescription={vi.fn()}
        onRestore={vi.fn()}
        onDeleteConfirm={vi.fn()}
      >
        <div>Tarjeta</div>
      </BinSelectionOverlay>
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders backdrop, selected card clone and side panel, and closes on backdrop click', () => {
    const onClose = vi.fn();
    const selectedCardRef = {
      current: {
        getBoundingClientRect: () => ({
          top: 100,
          left: 120,
          right: 360,
          bottom: 240,
          width: 240,
          height: 140,
        }),
      },
    };

    const { container } = render(
      <BinSelectionOverlay
        subject={{ id: 'subject-1', name: 'Historia' }}
        selectedCardRef={selectedCardRef}
        actionLoading={null}
        onClose={onClose}
        onShowDescription={vi.fn()}
        onRestore={vi.fn()}
        onDeleteConfirm={vi.fn()}
      >
        <div data-testid="selected-card-clone">Tarjeta clonada</div>
      </BinSelectionOverlay>
    );

    expect(screen.getByTestId('selected-card-clone')).toBeTruthy();
    expect(screen.getByTestId('bin-selection-panel')).toBeTruthy();

    const backdrop = container.querySelector('.fixed.inset-0.z-40');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clamps panel top position when selected card is near bottom viewport edge', () => {
    const selectedCardRef = {
      current: {
        getBoundingClientRect: () => ({
          top: 900,
          left: 80,
          right: 300,
          bottom: 1040,
          width: 220,
          height: 140,
        }),
      },
    };

    const { container } = render(
      <BinSelectionOverlay
        subject={{ id: 'subject-9', name: 'Quimica' }}
        selectedCardRef={selectedCardRef}
        actionLoading={null}
        onClose={vi.fn()}
        onShowDescription={vi.fn()}
        onRestore={vi.fn()}
        onDeleteConfirm={vi.fn()}
      >
        <div>Tarjeta</div>
      </BinSelectionOverlay>
    );

    const panelWrapper = container.querySelector('.fixed.z-50.animate-in');
    expect(panelWrapper).toBeTruthy();

    const top = Number.parseFloat(panelWrapper.style.top || '0');
    expect(Number.isFinite(top)).toBe(true);
    expect(top).toBeLessThanOrEqual(window.innerHeight - 320);
  });
});
