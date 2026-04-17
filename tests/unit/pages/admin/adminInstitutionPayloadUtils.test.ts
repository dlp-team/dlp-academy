// tests/unit/pages/admin/adminInstitutionPayloadUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildInstitutionPayload,
  normalizeInstitutionFormInput,
} from '../../../../src/pages/AdminDashboard/utils/adminInstitutionPayloadUtils';

describe('adminInstitutionPayloadUtils', () => {
  it('normalizes institutions form input values', () => {
    const normalized = normalizeInstitutionFormInput({
      name: '  Academia Demo  ',
      domain: ' DEMO.EDU ',
      institutionAdministrators: ' one@demo.edu, two@demo.edu ',
      type: ' academy ',
      city: ' Sevilla ',
      country: ' España ',
      timezone: ' ',
      institutionalCode: ' CODE-01 ',
    });

    expect(normalized).toEqual({
      name: 'Academia Demo',
      domain: 'demo.edu',
      admins: ['one@demo.edu', 'two@demo.edu'],
      institutionType: 'academy',
      city: 'Sevilla',
      country: 'España',
      timezone: 'Europe/Madrid',
      institutionalCode: 'CODE-01',
    });
  });

  it('builds institution payload from normalized input', () => {
    const normalizedInput = {
      name: 'Colegio Norte',
      domain: 'norte.edu',
      admins: ['admin@norte.edu'],
      institutionType: 'school',
      city: 'Bilbao',
      country: 'España',
      timezone: 'Europe/Madrid',
      institutionalCode: '',
    };

    const payload = buildInstitutionPayload(normalizedInput, 'ts');

    expect(payload).toEqual({
      name: 'Colegio Norte',
      domain: 'norte.edu',
      domains: ['norte.edu'],
      institutionAdministrators: ['admin@norte.edu'],
      adminEmail: 'admin@norte.edu',
      type: 'school',
      city: 'Bilbao',
      country: 'España',
      timezone: 'Europe/Madrid',
      updatedAt: 'ts',
    });
  });
});
