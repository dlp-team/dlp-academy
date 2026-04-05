// tests/unit/utils/coursePromotionOrderUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildDefaultCoursePromotionOrder,
  mergeCoursePromotionOrderWithCourseNames,
  normalizeCoursePromotionOrder,
} from '../../../src/utils/coursePromotionOrderUtils';

describe('coursePromotionOrderUtils', () => {
  it('builds deterministic default order using spanish academic heuristics', () => {
    const result = buildDefaultCoursePromotionOrder([
      '1º ESO',
      '2º Bachillerato',
      '1º Primaria',
      '4º ESO',
      '1º Bachillerato',
      '6º Primaria',
    ]);

    expect(result).toEqual([
      '2º Bachillerato',
      '1º Bachillerato',
      '4º ESO',
      '1º ESO',
      '6º Primaria',
      '1º Primaria',
    ]);
  });

  it('normalizes and de-duplicates promotion order entries', () => {
    const result = normalizeCoursePromotionOrder([
      ' 1º ESO ',
      '1º eso',
      '2º ESO',
      '',
      null,
      '2º ESO',
    ]);

    expect(result).toEqual(['1º ESO', '2º ESO']);
  });

  it('merges persisted order with available courses preserving configured precedence', () => {
    const result = mergeCoursePromotionOrderWithCourseNames({
      courseNames: ['3º ESO', '2º ESO', '1º ESO', '2º Bachillerato'],
      persistedOrder: ['2º Bachillerato', '2º ESO'],
    });

    expect(result).toEqual([
      '2º Bachillerato',
      '2º ESO',
      '3º ESO',
      '1º ESO',
    ]);
  });
});
