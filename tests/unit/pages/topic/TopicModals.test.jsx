// tests/unit/pages/topic/TopicModals.test.jsx
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TopicModals from '../../../../src/pages/Topic/components/TopicModals';

const MockIcon = (props) => <svg data-testid="mock-icon" {...props} />;

vi.mock('../../../../src/components/ui/AppToast', () => ({
  default: () => null,
}));

vi.mock('../../../../src/components/modals/QuizModal', () => ({
  default: () => null,
}));

vi.mock('../../../../src/components/modals/CreateContentModal', () => ({
  default: () => null,
}));

vi.mock('../../../../src/pages/Topic/components/TopicConfirmDeleteModal', () => ({
  default: () => null,
}));

const buildProps = (overrides = {}) => ({
  toast: { show: false, message: '' },
  setToast: vi.fn(),
  showQuizModal: false,
  setShowQuizModal: vi.fn(),
  handleGenerateQuizSubmit: vi.fn(),
  quizFormData: {},
  setQuizFormData: vi.fn(),
  topic: { color: 'from-indigo-500 to-purple-600' },
  subject: { color: 'from-indigo-500 to-purple-600' },
  showContentModal: false,
  setShowContentModal: vi.fn(),
  handleGenerateContentSubmit: vi.fn(),
  contentFormData: {},
  setContentFormData: vi.fn(),
  isGeneratingContent: false,
  viewingFile: null,
  setViewingFile: vi.fn(),
  getFileVisuals: vi.fn(() => ({ icon: MockIcon })),
  subjectId: 'subject-1',
  topicId: 'topic-1',
  confirmDialog: { isOpen: false },
  isConfirmingAction: false,
  closeConfirmDialog: vi.fn(),
  confirmDeleteAction: vi.fn(),
  ...overrides,
});

describe('TopicModals file viewer fallback behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('shows loading feedback while embedded viewer is unresolved', () => {
    render(
      <TopicModals
        {...buildProps({
          viewingFile: { id: 'doc-1', name: 'Apuntes', url: 'https://example.com/apuntes.pdf', type: 'pdf' },
        })}
      />
    );

    expect(screen.getByText('Cargando vista previa...')).toBeTruthy();
  });

  it('shows explicit error fallback when viewer timeout expires', async () => {
    render(
      <TopicModals
        {...buildProps({
          viewingFile: { id: 'doc-1', name: 'Apuntes', url: 'https://example.com/apuntes.pdf', type: 'pdf' },
        })}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByText('No se pudo cargar la vista previa')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar visor' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Descargar archivo' })).toBeTruthy();
  });

  it('returns to loading state when retry is requested from error fallback', async () => {
    render(
      <TopicModals
        {...buildProps({
          viewingFile: { id: 'doc-1', name: 'Apuntes', url: 'https://example.com/apuntes.pdf', type: 'pdf' },
        })}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(12000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar visor' }));

    expect(screen.getByText('Cargando vista previa...')).toBeTruthy();
  });
});
