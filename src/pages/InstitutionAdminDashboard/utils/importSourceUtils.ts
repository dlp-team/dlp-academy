// src/pages/InstitutionAdminDashboard/utils/importSourceUtils.ts
const extractGoogleSheetId = (urlPath: any) => {
  const segments = String(urlPath || '').split('/').filter(Boolean);
  const idIndex = segments.findIndex((segment) => segment === 'd');
  if (idIndex === -1 || !segments[idIndex + 1]) return '';
  return segments[idIndex + 1];
};

const extractGoogleSheetGid = (parsedUrl: URL) => {
  const gidFromSearch = String(parsedUrl.searchParams.get('gid') || '').trim();
  if (gidFromSearch) return gidFromSearch;

  const hash = String(parsedUrl.hash || '');
  const hashMatch = hash.match(/gid=(\d+)/i);
  if (hashMatch?.[1]) return hashMatch[1];
  return '0';
};

export const isGoogleSheetUrl = (value: any) => {
  try {
    const parsedUrl = new URL(String(value || '').trim());
    return parsedUrl.hostname.toLowerCase() === 'docs.google.com'
      && parsedUrl.pathname.includes('/spreadsheets/d/');
  } catch {
    return false;
  }
};

export const buildGoogleSheetCsvExportUrl = (value: any) => {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return '';

  try {
    const parsedUrl = new URL(normalizedValue);

    if (!isGoogleSheetUrl(normalizedValue)) {
      return normalizedValue;
    }

    if (parsedUrl.pathname.includes('/export')) {
      if (!parsedUrl.searchParams.get('format')) {
        parsedUrl.searchParams.set('format', 'csv');
      }
      if (!parsedUrl.searchParams.get('gid')) {
        parsedUrl.searchParams.set('gid', extractGoogleSheetGid(parsedUrl));
      }
      return parsedUrl.toString();
    }

    const sheetId = extractGoogleSheetId(parsedUrl.pathname);
    if (!sheetId) {
      return normalizedValue;
    }

    const gid = extractGoogleSheetGid(parsedUrl);
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  } catch {
    return normalizedValue;
  }
};
