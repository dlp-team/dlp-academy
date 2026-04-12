// tests/unit/pages/home/HomeShareConfirmModals.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomeShareConfirmModals from '../../../../src/pages/Home/components/HomeShareConfirmModals';

const buildShareConfirm = (overrides = {}) => ({
  open: true,
  type: null,
  subjectId: 'subject-1',
  folder: { id: 'folder-1', name: 'Carpeta Compartida' },
  onConfirm: vi.fn(),
  onMergeConfirm: null,
  batchPreview: null,
  ...overrides,
});

const buildUnshareConfirm = (overrides = {}) => ({
  open: false,
  subjectId: null,
  folder: null,
  onConfirm: vi.fn(),
  onPreserveConfirm: null,
  batchPreview: null,
  ...overrides,
});

describe('HomeShareConfirmModals', () => {
  it('renders preview names and overflow marker for share batch confirmations', () => {
    render(
      <HomeShareConfirmModals
        shareConfirm={buildShareConfirm({
          batchPreview: {
            totalCount: 7,
            previewNames: ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco'],
            overflowCount: 2,
          },
        })}
        setShareConfirm={vi.fn()}
        unshareConfirm={buildUnshareConfirm()}
        setUnshareConfirm={vi.fn()}
        subjects={[{ id: 'subject-1', name: 'Matematicas' }]}
      />
    );

    expect(screen.getByText('Elementos afectados (7):')).toBeTruthy();
    expect(screen.getByText('Uno')).toBeTruthy();
    expect(screen.getByText('Cinco')).toBeTruthy();
    expect(screen.getByText('... y 2 más.')).toBeTruthy();
  });

  it('does not render batch preview block for single-item confirmation', () => {
    render(
      <HomeShareConfirmModals
        shareConfirm={buildShareConfirm({
          batchPreview: {
            totalCount: 1,
            previewNames: ['Solo'],
            overflowCount: 0,
          },
        })}
        setShareConfirm={vi.fn()}
        unshareConfirm={buildUnshareConfirm()}
        setUnshareConfirm={vi.fn()}
        subjects={[{ id: 'subject-1', name: 'Matematicas' }]}
      />
    );

    expect(screen.queryByText(/Elementos afectados/i)).toBeNull();
    expect(screen.queryByText('Solo')).toBeNull();
  });

  it('resets confirmation state including batch preview when canceled', () => {
    const onCancel = vi.fn();
    const setShareConfirm = vi.fn();

    render(
      <HomeShareConfirmModals
        shareConfirm={buildShareConfirm({
          onCancel,
          batchPreview: {
            totalCount: 3,
            previewNames: ['Uno', 'Dos', 'Tres'],
            overflowCount: 0,
          },
        })}
        setShareConfirm={setShareConfirm}
        unshareConfirm={buildUnshareConfirm()}
        setUnshareConfirm={vi.fn()}
        subjects={[{ id: 'subject-1', name: 'Matematicas' }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(setShareConfirm).toHaveBeenCalledWith({
      open: false,
      type: null,
      subjectId: null,
      folder: null,
      onConfirm: null,
      onMergeConfirm: null,
      batchPreview: null,
    });
  });
});
