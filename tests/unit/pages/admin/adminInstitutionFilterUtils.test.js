// tests/unit/pages/admin/adminInstitutionFilterUtils.test.js
import { describe, expect, it } from 'vitest';
import { filterInstitutions } from '../../../../src/pages/AdminDashboard/utils/adminInstitutionFilterUtils';

const institutions = [
  { id: 'i1', name: 'Institucion Uno', city: 'Madrid', adminEmail: 'admin1@demo.edu', type: 'school', enabled: true },
  { id: 'i2', name: 'Institucion Dos', city: 'Sevilla', adminEmail: 'admin2@demo.edu', type: 'academy', enabled: false },
  { id: 'i3', name: 'Universidad Tres', city: 'Valencia', adminEmail: 'admin3@demo.edu', type: 'university', enabled: true },
];

describe('filterInstitutions', () => {
  it('filters by status and type', () => {
    const result = filterInstitutions(institutions, '', 'disabled', 'academy');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i2');
  });

  it('filters by text search across name/city/email', () => {
    expect(filterInstitutions(institutions, 'valencia', 'all', 'all')).toHaveLength(1);
    expect(filterInstitutions(institutions, 'admin1@demo.edu', 'all', 'all')).toHaveLength(1);
  });
});
