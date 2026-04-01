// tests/unit/pages/admin/adminEmailUtils.test.js
import { describe, expect, it } from 'vitest';
import { parseCsvEmails } from '../../../../src/pages/AdminDashboard/utils/adminEmailUtils';

describe('parseCsvEmails', () => {
  it('normalizes casing and whitespace', () => {
    expect(parseCsvEmails(' A@Demo.EDU, b@test.com ')).toEqual(['a@demo.edu', 'b@test.com']);
  });

  it('drops empty entries', () => {
    expect(parseCsvEmails('a@test.com, , ,b@test.com,,')).toEqual(['a@test.com', 'b@test.com']);
  });
});
