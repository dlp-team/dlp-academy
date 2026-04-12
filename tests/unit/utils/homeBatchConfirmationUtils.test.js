// tests/unit/utils/homeBatchConfirmationUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildBatchConfirmationPreview,
  getBatchEntryDisplayName,
} from '../../../src/pages/Home/utils/homeBatchConfirmationUtils';

describe('homeBatchConfirmationUtils', () => {
  it('returns all names when batch size is 5 or fewer', () => {
    const preview = buildBatchConfirmationPreview([
      { type: 'subject', item: { name: 'A' } },
      { type: 'folder', item: { name: 'B' } },
      { type: 'subject', item: { name: 'C' } },
    ]);

    expect(preview).toEqual({
      totalCount: 3,
      previewNames: ['A', 'B', 'C'],
      overflowCount: 0,
    });
  });

  it('returns first five names and overflow marker count for larger batches', () => {
    const preview = buildBatchConfirmationPreview([
      { type: 'subject', item: { name: 'Uno' } },
      { type: 'subject', item: { name: 'Dos' } },
      { type: 'folder', item: { name: 'Tres' } },
      { type: 'folder', item: { name: 'Cuatro' } },
      { type: 'subject', item: { name: 'Cinco' } },
      { type: 'subject', item: { name: 'Seis' } },
      { type: 'folder', item: { name: 'Siete' } },
    ]);

    expect(preview.totalCount).toBe(7);
    expect(preview.previewNames).toEqual(['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco']);
    expect(preview.overflowCount).toBe(2);
  });

  it('uses type fallback names when entries lack display names', () => {
    const fallbackSubject = getBatchEntryDisplayName({ type: 'subject', item: {} });
    const fallbackFolder = getBatchEntryDisplayName({ type: 'folder', item: {} });

    expect(fallbackSubject).toBe('Asignatura sin nombre');
    expect(fallbackFolder).toBe('Carpeta sin nombre');
  });
});
