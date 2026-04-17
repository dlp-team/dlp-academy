// tests/unit/utils/stringUtils.test.js
import { describe, expect, it } from 'vitest';
import { normalizeText } from '../../../src/utils/stringUtils';

describe('stringUtils', () => {
  it('normalizes accents, casing, and surrounding spaces', () => {
    expect(normalizeText('  ÁrBOL Ñandú  ')).toBe('arbol nandu');
  });

  it('returns empty string for nullish values', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });
});
