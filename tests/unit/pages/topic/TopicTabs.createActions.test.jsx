// tests/unit/pages/topic/TopicTabs.createActions.test.jsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TopicTabs from '../../../../src/pages/Topic/components/TopicTabs';
import { getActiveRole } from '../../../../src/utils/permissionUtils';

vi.mock('../../../../src/utils/permissionUtils', () => ({
  getActiveRole: vi.fn(),
}));

const buildProps = (overrides = {}) => ({
  activeTab: 'materials',
  setActiveTab: vi.fn(),
  topic: {
    pdfs: [],
    uploads: [],
    quizzes: [],
    exams: [],
    assignments: [],
  },
  handleCreateCustomStudyGuide: vi.fn(),
  handleCreateCustomExam: vi.fn(),
  handleCreateCustomQuiz: vi.fn(),
  permissions: {
    canEdit: true,
    isViewer: false,
  },
  user: {
    uid: 'teacher-1',
  },
  ...overrides,
});

describe('TopicTabs create actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveRole.mockReturnValue('teacher');
  });

  it('shows materials create actions and triggers study guide handler', () => {
    const props = buildProps();

    render(<TopicTabs {...props} />);

    fireEvent.click(screen.getByLabelText('Crear guía o examen'));
    fireEvent.click(screen.getByRole('button', { name: 'Crear guía de estudio' }));

    expect(props.handleCreateCustomStudyGuide).toHaveBeenCalledTimes(1);
    expect(props.handleCreateCustomExam).not.toHaveBeenCalled();
  });

  it('triggers exam create handler from materials menu', () => {
    const props = buildProps();

    render(<TopicTabs {...props} />);

    fireEvent.click(screen.getByLabelText('Crear guía o examen'));
    fireEvent.click(screen.getByRole('button', { name: 'Crear examen' }));

    expect(props.handleCreateCustomExam).toHaveBeenCalledTimes(1);
    expect(props.handleCreateCustomStudyGuide).not.toHaveBeenCalled();
  });

  it('keeps quiz create control behavior on quizzes tab', () => {
    const props = buildProps({ activeTab: 'quizzes' });

    render(<TopicTabs {...props} />);

    fireEvent.click(screen.getByTitle('Crear test'));

    expect(props.handleCreateCustomQuiz).toHaveBeenCalledTimes(1);
  });

  it('hides create controls when user cannot edit', () => {
    const props = buildProps({
      permissions: {
        canEdit: false,
        isViewer: false,
      },
    });

    render(<TopicTabs {...props} />);

    expect(screen.queryByLabelText('Crear guía o examen')).toBeNull();
    expect(screen.queryByTitle('Crear test')).toBeNull();
    expect(screen.queryByTitle('Crear tarea')).toBeNull();
  });

  it('keeps teacher create controls when explicit role is teacher', () => {
    getActiveRole.mockReturnValue('student');
    const props = buildProps({
      user: {
        uid: 'teacher-1',
        role: 'teacher',
      },
    });

    render(<TopicTabs {...props} />);

    expect(screen.queryByLabelText('Crear guía o examen')).not.toBeNull();
  });
});
