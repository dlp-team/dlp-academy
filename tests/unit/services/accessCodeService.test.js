// tests/unit/services/accessCodeService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInstitutionalAccessCodePreview, validateInstitutionalAccessCode } from '../../../src/services/accessCodeService';

const serviceMocks = vi.hoisted(() => ({
  httpsCallable: vi.fn(),
  functionsRef: { __type: 'functions' },
  callableFn: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  functions: serviceMocks.functionsRef,
}));

vi.mock('firebase/functions', async () => {
  const actual = await vi.importActual('firebase/functions');
  return {
    ...actual,
    httpsCallable: serviceMocks.httpsCallable,
  };
});

describe('accessCodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMocks.httpsCallable.mockReturnValue(serviceMocks.callableFn);
    serviceMocks.callableFn.mockResolvedValue({ data: {} });
  });

  it('calls validateInstitutionalAccessCode callable with expected payload', async () => {
    serviceMocks.callableFn.mockResolvedValue({ data: { valid: true, institutionId: 'inst-1', role: 'teacher' } });

    const result = await validateInstitutionalAccessCode({
      verificationCode: 'ABC123',
      email: 'teacher@test.com',
      userType: 'teacher',
    });

    expect(serviceMocks.httpsCallable).toHaveBeenCalledWith(serviceMocks.functionsRef, 'validateInstitutionalAccessCode');
    expect(serviceMocks.callableFn).toHaveBeenCalledWith({
      verificationCode: 'ABC123',
      email: 'teacher@test.com',
      userType: 'teacher',
    });
    expect(result).toEqual({ valid: true, institutionId: 'inst-1', role: 'teacher' });
  });

  it('calls getInstitutionalAccessCodePreview callable with expected payload', async () => {
    serviceMocks.callableFn.mockResolvedValue({ data: { code: 'A1B2C3', validUntilMs: 1741353600000 } });

    const result = await getInstitutionalAccessCodePreview({
      institutionId: 'inst-1',
      userType: 'teacher',
      intervalHours: 24,
    });

    expect(serviceMocks.httpsCallable).toHaveBeenCalledWith(serviceMocks.functionsRef, 'getInstitutionalAccessCodePreview');
    expect(serviceMocks.callableFn).toHaveBeenCalledWith({
      institutionId: 'inst-1',
      userType: 'teacher',
      intervalHours: 24,
    });
    expect(result).toEqual({ code: 'A1B2C3', validUntilMs: 1741353600000 });
  });
});
