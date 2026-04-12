// tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CustomizationPreviewHeader from '../../../../src/pages/InstitutionAdminDashboard/components/customization/CustomizationPreviewHeader';

describe('CustomizationPreviewHeader', () => {
  it('shows fallback institution name and teacher context by default', () => {
    render(
      <CustomizationPreviewHeader
        institutionName=""
        previewRole="teacher"
        primaryColor="#6366f1"
      />
    );

    expect(screen.getByText('Tu Institución')).toBeTruthy();
    expect(screen.getByText(/panel docente/i)).toBeTruthy();
    expect(screen.getByText(/^inicio$/i)).toBeTruthy();
    expect(screen.getByLabelText(/avatar de vista previa/i).textContent).toBe('D');
  });

  it('renders student-specific subtitle and avatar marker', () => {
    render(
      <CustomizationPreviewHeader
        institutionName="Academia Demo"
        previewRole="student"
        primaryColor="#10b981"
      />
    );

    expect(screen.getByText('Academia Demo')).toBeTruthy();
    expect(screen.getByText(/panel estudiante/i)).toBeTruthy();
    expect(screen.getByLabelText(/avatar de vista previa/i).textContent).toBe('E');
  });

  it('renders admin-specific subtitle and avatar marker', () => {
    render(
      <CustomizationPreviewHeader
        institutionName="Academia Demo"
        previewRole="admin"
        primaryColor="#334155"
      />
    );

    expect(screen.getByText('Academia Demo')).toBeTruthy();
    expect(screen.getByText(/panel de administración/i)).toBeTruthy();
    expect(screen.getByText(/^administración$/i)).toBeTruthy();
    expect(screen.getByLabelText(/avatar de vista previa/i).textContent).toBe('A');
  });
});
