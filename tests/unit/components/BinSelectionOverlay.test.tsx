// tests/unit/components/BinSelectionOverlay.test.jsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BinSelectionOverlay from '../../../src/pages/Home/components/bin/BinSelectionOverlay';

vi.mock('../../../src/pages/Home/components/bin/BinSelectionPanel', () => ({
  default: ({ item, itemType, onClose, onRestore, onDeleteConfirm }) => (
    <div data-testid="bin-selection-panel">
      <span>{item?.name || 'Sin nombre'}</span>
      <button onClick={onClose}>Cerrar panel</button>
      <button onClick={() => onRestore(item?.id, itemType)}>Restaurar</button>
      <button onClick={() => onDeleteConfirm(item?.id, itemType)}>Eliminar</button>
    </div>
  ),
}));

describe('BinSelectionOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  it('returns null when selected card ref is missing', () => {
    const { container } = render(
      <BinSelectionOverlay
        item={{ id: 'subject-1', name: 'Historia' }}
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

  it('renders backdrop, selected card clone and side panel immediately, and closes on backdrop click', () => {
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

    render(
      <BinSelectionOverlay
        item={{ id: 'subject-1', name: 'Historia' }}
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
    const backdrop = screen.getByTestId('bin-selection-overlay-backdrop');
    expect(backdrop.className).not.toContain('backdrop-blur');
    expect(backdrop.className).toContain('bg-transparent');

    expect(screen.getByTestId('bin-selection-panel')).toBeTruthy();
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

    render(
      <BinSelectionOverlay
        item={{ id: 'subject-9', name: 'Quimica' }}
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

    const panelWrapper = screen.getByTestId('bin-selection-overlay-panel');
    expect(panelWrapper).toBeTruthy();

    const top = Number.parseFloat(panelWrapper.style.top || '0');
    expect(Number.isFinite(top)).toBe(true);
    expect(top).toBeLessThanOrEqual(window.innerHeight - 320);
  });
});
