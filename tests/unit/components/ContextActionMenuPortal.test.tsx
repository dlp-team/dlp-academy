// tests/unit/components/ContextActionMenuPortal.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ContextActionMenuPortal from '../../../src/components/modules/shared/ContextActionMenuPortal';

describe('ContextActionMenuPortal', () => {
  it('renders nothing when closed', () => {
    render(
      <ContextActionMenuPortal
        isOpen={false}
        menuClassName="test-menu"
      >
        <button type="button">Accion</button>
      </ContextActionMenuPortal>
    );

    expect(screen.queryByRole('button', { name: /accion/i })).toBeNull();
  });

  it('renders menu content when open', () => {
    render(
      <ContextActionMenuPortal
        isOpen={true}
        menuClassName="test-menu"
      >
        <button type="button">Accion</button>
      </ContextActionMenuPortal>
    );

    expect(screen.getByRole('button', { name: /accion/i })).toBeTruthy();
  });

  it('calls onRequestClose when close layer is clicked', () => {
    const onRequestClose = vi.fn();

    render(
      <ContextActionMenuPortal
        isOpen={true}
        menuClassName="test-menu"
        showCloseLayer={true}
        closeLayerTop={120}
        onRequestClose={onRequestClose}
      >
        <button type="button">Accion</button>
      </ContextActionMenuPortal>
    );

    fireEvent.click(screen.getByTestId('context-action-menu-close-layer'));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
