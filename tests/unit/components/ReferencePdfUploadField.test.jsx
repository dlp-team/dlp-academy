// tests/unit/components/ReferencePdfUploadField.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ReferencePdfUploadField from '../../../src/components/modals/shared/ReferencePdfUploadField';

describe('ReferencePdfUploadField', () => {
  it('renders empty upload state text when no file is selected', () => {
    render(
      <ReferencePdfUploadField
        uploadId="upload-empty"
        file={null}
        onFileSelect={() => {}}
        onRemoveFile={() => {}}
        label="Material de Referencia"
        labelHint="(opcional)"
        emptyTitle="Subir un PDF de referencia"
        emptyDescription="Descripcion"
      />
    );

    expect(screen.getByText(/material de referencia/i)).toBeTruthy();
    expect(screen.getByText(/subir un pdf de referencia/i)).toBeTruthy();
  });

  it('calls onFileSelect when a file is selected', () => {
    const onFileSelect = vi.fn();

    render(
      <ReferencePdfUploadField
        uploadId="upload-change"
        file={null}
        onFileSelect={onFileSelect}
        onRemoveFile={() => {}}
        label="Material de Referencia"
        emptyTitle="Subir"
        emptyDescription="Descripcion"
      />
    );

    const input = screen.getByTestId('reference-pdf-upload-input');
    const file = new File(['pdf'], 'referencia.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledTimes(1);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('renders selected file and calls onRemoveFile', () => {
    const onRemoveFile = vi.fn();
    const file = new File(['pdf'], 'adjunto.pdf', { type: 'application/pdf' });

    render(
      <ReferencePdfUploadField
        uploadId="upload-selected"
        file={file}
        onFileSelect={() => {}}
        onRemoveFile={onRemoveFile}
        label="Material de Referencia"
        emptyTitle="Subir"
        emptyDescription="Descripcion"
      />
    );

    expect(screen.getByText('adjunto.pdf')).toBeTruthy();
    fireEvent.click(screen.getByTestId('reference-pdf-remove-button'));

    expect(onRemoveFile).toHaveBeenCalledTimes(1);
  });

  it('disables input and remove button when disabled is true', () => {
    const file = new File(['pdf'], 'adjunto.pdf', { type: 'application/pdf' });

    render(
      <ReferencePdfUploadField
        uploadId="upload-disabled"
        file={file}
        onFileSelect={() => {}}
        onRemoveFile={() => {}}
        disabled={true}
        label="Material de Referencia"
        emptyTitle="Subir"
        emptyDescription="Descripcion"
      />
    );

    expect(screen.getByTestId('reference-pdf-upload-input').hasAttribute('disabled')).toBe(true);
    expect(screen.getByTestId('reference-pdf-remove-button').hasAttribute('disabled')).toBe(true);
  });
});
