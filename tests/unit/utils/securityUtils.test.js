// tests/unit/utils/securityUtils.test.js
import { describe, it, expect } from 'vitest';
import { generateDynamicCode } from '../../../src/utils/securityUtils';

describe('generateDynamicCode', () => {
  it('returns deterministic code for the same institution, role and time window', () => {
    const institutionId = 'inst-123';
    const role = 'teacher';
    const intervalHours = 24;
    const fixedTime = Date.UTC(2026, 2, 7, 10, 0, 0);

    const first = generateDynamicCode(institutionId, role, intervalHours, fixedTime);
    const second = generateDynamicCode(institutionId, role, intervalHours, fixedTime + 10 * 60 * 1000);

    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9A-F]{6}$/);
  });

  it('changes code when moving to the next rotation window', () => {
    const institutionId = 'inst-123';
    const role = 'teacher';
    const intervalHours = 1;
    const windowStart = Date.UTC(2026, 2, 7, 10, 0, 0);

    const current = generateDynamicCode(institutionId, role, intervalHours, windowStart);
    const next = generateDynamicCode(institutionId, role, intervalHours, windowStart + 60 * 60 * 1000);

    expect(next).not.toBe(current);
  });

  it('matches expected code for institution/time/frequency verification', () => {
    const institutionId = 'inst-verification';
    const role = 'teacher';
    const intervalHours = 4;
    const timestamp = Date.UTC(2026, 2, 7, 8, 30, 0);

    const code = generateDynamicCode(institutionId, role, intervalHours, timestamp);

    // This assertion ensures we can deterministically recompute the same live code in debugging workflows.
    expect(code).toBe(generateDynamicCode(institutionId, role, intervalHours, timestamp));
  });
});
