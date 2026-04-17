// tests/unit/hooks/useInstitutionBranding.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useInstitutionBranding from '../../../src/hooks/useInstitutionBranding';

const mocks = vi.hoisted(() => ({
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  resolveInstitutionBranding: vi.fn(),
  buildGlobalBrandCssVariables: vi.fn(),
  GLOBAL_BRAND_DEFAULTS: { primaryBrandColor: '#6366f1' },
}));

vi.mock('firebase/firestore', () => ({
  doc: mocks.doc,
  onSnapshot: mocks.onSnapshot,
}));

vi.mock('../../../src/firebase/config', () => ({
  db: {},
}));

vi.mock('../../../src/utils/themeTokens', () => ({
  GLOBAL_BRAND_DEFAULTS: mocks.GLOBAL_BRAND_DEFAULTS,
  resolveInstitutionBranding: mocks.resolveInstitutionBranding,
  buildGlobalBrandCssVariables: mocks.buildGlobalBrandCssVariables,
}));

describe('useInstitutionBranding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.doc.mockReturnValue({ path: 'institutions/inst-1' });
    mocks.buildGlobalBrandCssVariables.mockImplementation((branding) => ({
      '--brand-primary': branding.primaryBrandColor || '#6366f1',
    }));
  });

  it('returns defaults and skips snapshot when institutionId is missing', () => {
    const { result } = renderHook(() => useInstitutionBranding({ uid: 'u-1' }));

    expect(result.current).toEqual(mocks.GLOBAL_BRAND_DEFAULTS);
    expect(mocks.onSnapshot).not.toHaveBeenCalled();
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#6366f1');
  });

  it('applies resolved branding from snapshot updates to root css vars', async () => {
    const resolvedBranding = { primaryBrandColor: '#123456' };
    mocks.resolveInstitutionBranding.mockReturnValue(resolvedBranding);

    mocks.onSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: () => true, data: () => ({ any: 'data' }) });
      return vi.fn();
    });

    const { result } = renderHook(() => useInstitutionBranding({ uid: 'u-1', institutionId: 'inst-1' }));

    await waitFor(() => expect(result.current).toEqual(resolvedBranding));
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#123456');
  });

  it('falls back to defaults when snapshot emits error', async () => {
    mocks.onSnapshot.mockImplementation((_ref, _onNext, onError) => {
      onError(new Error('snapshot-failed'));
      return vi.fn();
    });

    const { result } = renderHook(() => useInstitutionBranding({ uid: 'u-1', institutionId: 'inst-1' }));

    await waitFor(() => expect(result.current).toEqual(mocks.GLOBAL_BRAND_DEFAULTS));
  });
});
