// tests/unit/pages/home/HomeSubjectModals.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SubjectModal from '../../../../src/pages/Home/modals/SubjectModal';
import EditSubjectModal from '../../../../src/pages/Home/modals/EditSubjectModal';

const DummyIcon = () => <span aria-hidden="true">I</span>;

describe('Home subject modals', () => {
  it('SubjectModal closes on backdrop click', () => {
    const onClose = vi.fn();

    render(
      <SubjectModal
        isOpen
        onClose={onClose}
        formData={{ name: '', course: '', icon: 'dummy', color: 'from-blue-400 to-blue-600' }}
        setFormData={vi.fn()}
        onSubmit={vi.fn()}
        colorOptions={[{ name: 'Azul', value: 'from-blue-400 to-blue-600' }]}
        iconOptions={[{ name: 'dummy', icon: DummyIcon }]}
        isEditing={false}
      />
    );

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('EditSubjectModal closes on backdrop click', () => {
    const onClose = vi.fn();

    render(
      <EditSubjectModal
        isOpen
        onClose={onClose}
        initialData={{
          name: 'Matematicas',
          course: '2A',
          icon: 'BookOpen',
          color: 'from-blue-400 to-blue-600',
        }}
        onSave={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('EditSubjectModal confirms before outside close when form was modified', () => {
    const onClose = vi.fn();

    render(
      <EditSubjectModal
        isOpen
        onClose={onClose}
        initialData={{
          name: 'Matematicas',
          course: '2A',
          icon: 'BookOpen',
          color: 'from-blue-400 to-blue-600',
        }}
        onSave={vi.fn()}
      />
    );

    fireEvent.change(screen.getByDisplayValue('Matematicas'), { target: { value: 'Matematicas II' } });
    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(/hay cambios sin guardar/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /salir sin guardar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
