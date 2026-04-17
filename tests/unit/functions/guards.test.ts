// tests/unit/functions/guards.test.js
import { describe, expect, it } from 'vitest';
import { HttpsError } from 'firebase-functions/v2/https';
import {
  assertNonEmptyString,
  assertPositiveNumber,
  requireAuthUid,
  requirePreviewPermission,
} from '../../../functions/security/guards.js';

describe('functions security guards', () => {
  it('assertNonEmptyString returns normalized value and rejects empty input', () => {
    expect(assertNonEmptyString('  inst-1  ', 'institutionId')).toBe('inst-1');

    expect(() => assertNonEmptyString('', 'institutionId')).toThrow(HttpsError);
    expect(() => assertNonEmptyString('', 'institutionId')).toThrow('institutionId is required.');
  });

  it('assertPositiveNumber accepts positive numbers and rejects zero or invalid input', () => {
    expect(assertPositiveNumber('24', 'intervalHours')).toBe(24);

    expect(() => assertPositiveNumber(0, 'intervalHours')).toThrow(HttpsError);
    expect(() => assertPositiveNumber('abc', 'intervalHours')).toThrow('intervalHours must be a positive number.');
  });

  it('requireAuthUid returns uid for authenticated request and rejects unauthenticated access', () => {
    expect(requireAuthUid({ auth: { uid: 'user-1' } })).toBe('user-1');

    expect(() => requireAuthUid({ auth: null })).toThrow(HttpsError);
    expect(() => requireAuthUid({ auth: null })).toThrow('Authentication is required.');
  });

  it('requirePreviewPermission allows global admin and same-tenant institution admin only', () => {
    expect(() => requirePreviewPermission({
      userData: { role: 'admin', institutionId: 'inst-2' },
      institutionId: 'inst-1',
    })).not.toThrow();

    expect(() => requirePreviewPermission({
      userData: { role: 'institutionadmin', institutionId: 'inst-1' },
      institutionId: 'inst-1',
    })).not.toThrow();

    expect(() => requirePreviewPermission({
      userData: { role: 'institutionadmin', institutionId: 'inst-2' },
      institutionId: 'inst-1',
    })).toThrow('Not allowed to preview this code.');

    expect(() => requirePreviewPermission({
      userData: { role: 'teacher', institutionId: 'inst-1' },
      institutionId: 'inst-1',
    })).toThrow('Not allowed to preview this code.');
  });
});
