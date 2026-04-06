// copilot/prompts/security-audit-checklist.prompt.md
# Prompt: Security Audit Checklist

## Overview
Use this prompt to perform quick security checks on code, configurations, and deployments.

## Quick Security Checklist

### 1. **Credential Security** 🔐 (CRITICAL)
- [ ] No hardcoded API keys, tokens, or passwords in code
- [ ] No credentials in comments, docs, or examples
- [ ] No `.env*` files committed to git
- [ ] No `*serviceAccount*.json` files committed
- [ ] No `*credentials*.json` files committed
- [ ] Environment variables used: `import.meta.env.VITE_*`
- [ ] `.gitignore` includes: `.env*`, `*-credentials.json`, `*-keys.json`
- [ ] Security scan passed: `npm run security:scan:staged` ✅
- [ ] Branch scan passed: `npm run security:scan:branch` ✅

### 2. **Access Control** 🔒
- [ ] Multi-tenancy enforced (institutionId scoping)
- [ ] Permission checks before mutations
- [ ] Role-based access validated (Admin, InstitutionAdmin, Teacher, Student)
- [ ] Firestore rules enforce permissions
- [ ] Users can't access other institution's data
- [ ] Students can't access admin features

### 3. **Firebase Security**
- [ ] Firestore rules read/write permissions correct
- [ ] No public read access to sensitive collections
- [ ] Storage rules restrict file access appropriately
- [ ] Auth rules validate user identity
- [ ] Rate limiting considered (if applicable)
- [ ] Sensitive data is not logged

### 4. **Input Validation** ✔️
- [ ] User input is validated before use
- [ ] No SQL injection vectors (using parameterized queries)
- [ ] No XSS vulnerabilities (sanitize output)
- [ ] File uploads are validated (type, size)
- [ ] Array/object destructuring safely handles unknown properties

### 5. **Data Protection**
- [ ] Sensitive data (emails, passwords) not unnecessarily exposed
- [ ] PII (Personally Identifiable Information) handled carefully
- [ ] Search indexes don't expose sensitive data
- [ ] Logs don't contain sensitive information
- [ ] Backups are encrypted and access-controlled

### 6. **API Security**
- [ ] API endpoints require authentication
- [ ] API rate limiting implemented (if public)
- [ ] CORS configured properly (not overly permissive)
- [ ] HTTPS enforced in production
- [ ] No sensitive data in URL parameters

### 7. **Dependency Security**
- [ ] No known vulnerabilities: `npm audit`
- [ ] Dependencies are from trusted sources
- [ ] Lock file (`package-lock.json`) is committed
- [ ] No unused dependencies (reduce attack surface)
- [ ] Dependency versions are pinned or constrained

### 8. **Error Handling**
- [ ] Error messages don't expose system internals
- [ ] Stack traces not shown to users
- [ ] Debug info not exposed in production
- [ ] Errors logged securely (for admins only)

### 9. **Authentication & Sessions**
- [ ] Firebase Auth configured correctly
- [ ] User sessions timeout appropriately
- [ ] Tokens are securely stored (localStorage vs sessionStorage tradeoff)
- [ ] CSRF protection in place (if applicable)
- [ ] Password reset flow is secure

### 10. **Deployment Security**
- [ ] No credentials in deployment configs
- [ ] Environment variables set in hosting platform
- [ ] Secrets are not in git (use Cloud Secret Manager)
- [ ] Deployment process is restricted (not everyone can deploy)
- [ ] Rollback plan documented

## Audit Levels

### 🟢 **Green** (No issues)
All checks passed, code is security-compliant.

### 🟡 **Yellow** (Minor concerns)
Non-critical security issues, should be addressed in next sprint.

### 🔴 **Red** (Critical issues)
Security vulnerabilities, must be fixed before deployment or merge.

## Audit Output

Document with:
```
**Audit Date:** YYYY-MM-DD
**Scope:** [File/module audited]
**Level:** [Green/Yellow/Red]

Findings:
- ✅ [Positive finding]
- ⚠️ [Concern with recommendation]
- 🔴 [Critical issue requiring action]

Next Steps:
- [ ] Action item 1
- [ ] Action item 2
- [ ] Verify fixes
```

## Common Vulnerabilities to Watch For

| Vulnerability | What to Look For | Fix |
|---|---|---|
| API Key Exposure | Keys in code or console | Use env vars (`import.meta.env.VITE_*`) |
| SQL Injection | Direct SQL queries | Use parameterized queries (Firestore) |
| XSS | User input in HTML | Sanitize output, use React's default escaping |
| CORS Misconfiguration | `Access-Control-Allow-Origin: *` | Specify allowed origins explicitly |
| Missing Auth | No permission checks | Validate auth and role before action |
| Sensitive Data Logging | Passwords/tokens in logs | Remove or mask sensitive data |
| Dependency Vulnerabilities | `npm audit` warnings | Update dependencies, pin versions |
| Path Traversal | `../` in file paths | Validate and normalize paths |

---

**Use this prompt before committing, deploying, or sharing code to ensure security best practices are followed.**
