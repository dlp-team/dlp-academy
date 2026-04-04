// tests/unit/pages/institution-admin/importSourceUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildGoogleSheetCsvExportUrl,
  isGoogleSheetUrl,
} from '../../../../src/pages/InstitutionAdminDashboard/utils/importSourceUtils';

describe('importSourceUtils', () => {
  it('detects Google Sheets edit URLs', () => {
    expect(isGoogleSheetUrl('https://docs.google.com/spreadsheets/d/abc123/edit#gid=0')).toBe(true);
    expect(isGoogleSheetUrl('https://example.com/report.csv')).toBe(false);
  });

  it('converts Google Sheets edit URL into CSV export URL', () => {
    const result = buildGoogleSheetCsvExportUrl('https://docs.google.com/spreadsheets/d/abc123/edit#gid=987654321');
    expect(result).toBe('https://docs.google.com/spreadsheets/d/abc123/export?format=csv&gid=987654321');
  });

  it('keeps non Google Sheets URL unchanged', () => {
    const sourceUrl = 'https://example.com/uploads/students.csv';
    expect(buildGoogleSheetCsvExportUrl(sourceUrl)).toBe(sourceUrl);
  });

  it('normalizes existing Google export URL to include required params', () => {
    const result = buildGoogleSheetCsvExportUrl('https://docs.google.com/spreadsheets/d/abc123/export?gid=10');
    expect(result).toContain('format=csv');
    expect(result).toContain('gid=10');
  });
});
