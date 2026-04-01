// tests/unit/pages/admin/adminConfirmDialogTextUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildInstitutionConfirmDialogText,
  buildUserConfirmDialogText,
} from '../../../../src/pages/AdminDashboard/utils/adminConfirmDialogTextUtils';

describe('buildInstitutionConfirmDialogText', () => {
  it('builds toggle copy for enabled institution', () => {
    const text = buildInstitutionConfirmDialogText({
      action: 'toggle',
      institution: { name: 'Colegio Norte', enabled: true },
    });

    expect(text.title).toBe('Deshabilitar institución');
    expect(text.description).toContain('deshabilitará "Colegio Norte"');
    expect(text.confirmLabel).toBe('Deshabilitar institución');
  });

  it('builds delete copy and fallback name', () => {
    const text = buildInstitutionConfirmDialogText({ action: 'delete', institution: null });

    expect(text.title).toBe('Eliminar institución');
    expect(text.description).toContain('esta institución');
    expect(text.confirmLabel).toBe('Eliminar institución');
  });
});

describe('buildUserConfirmDialogText', () => {
  const roleLabels = {
    admin: 'Admin Global',
    teacher: 'Profesor',
  };

  it('builds role-change copy', () => {
    const text = buildUserConfirmDialogText(
      {
        action: 'role',
        newRole: 'teacher',
        user: { email: 'docente@demo.edu', enabled: true },
      },
      roleLabels
    );

    expect(text.title).toBe('Cambiar rol de usuario');
    expect(text.description).toContain('docente@demo.edu');
    expect(text.description).toContain('Profesor');
    expect(text.confirmLabel).toBe('Cambiar rol');
  });

  it('builds toggle copy with display-name fallback', () => {
    const text = buildUserConfirmDialogText(
      {
        action: 'toggle',
        user: { email: '', displayName: 'Usuario Demo', enabled: false },
      },
      roleLabels
    );

    expect(text.title).toBe('Habilitar usuario');
    expect(text.description).toContain('habilitará "Usuario Demo"');
    expect(text.confirmLabel).toBe('Habilitar usuario');
  });
});
