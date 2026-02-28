# Lossless Review Report Template

- Timestamp: <YYYY-MM-DD HH:mm local>
- Task: <short task title>
- Request summary: <exact user request>

## 1) Requested scope
- <item 1>
- <item 2>

## 2) Out-of-scope preserved
- <behavior/property explicitly kept>
- <behavior/property explicitly kept>

## 3) Touched files
- <relative/path/fileA>
- <relative/path/fileB>

## 4) Per-file verification (required)
### File: <relative/path/fileA>
- Why touched: <reason>
- Reviewed items:
  - <symbol/branch/prop/handler> -> <verification performed>
  - <symbol/branch/prop/handler> -> <verification performed>
- Result: ✅ preserved / ⚠️ adjusted intentionally

### File: <relative/path/fileB>
- Why touched: <reason>
- Reviewed items:
  - <symbol/branch/prop/handler> -> <verification performed>
  - <symbol/branch/prop/handler> -> <verification performed>
- Result: ✅ preserved / ⚠️ adjusted intentionally

## 5) Risk checks
- Potential risk: <risk>
- Mitigation check: <what was tested/verified>
- Outcome: <result>

## 6) Validation summary
- Diagnostics: <get_errors result>
- Runtime checks: <manual/targeted checks>

## 7) Cleanup metadata
- Keep until: <timestamp + 48h>
- Cleanup candidate after: <date/time>
- Note: cleanup requires explicit user confirmation.
