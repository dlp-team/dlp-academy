# 🔐 Pre-Commit Security Checklist

**Quick Reference for Preventing Credential Leaks**

🚨 **CRITICAL**: NEVER hardcode ANY API key - even old, test, or example keys.
GitGuardian will detect them. Everything must use environment variables.

## Before EVERY Commit
```bash
# 1. Scan for secrets in staged changes
npm run security:scan:staged
# Result: MUST pass (no findings)

# 2. Verify .env is protected
git check-ignore -v .env
# Result: MUST show: .gitignore:43:.env

# 3. If any matches → DO NOT COMMIT
git reset  # Unstage changes
# Then identify and remove secrets from files
```

## Before EVERY Push
```bash
# Final security scan on entire branch
npm run security:scan:branch
# Result: MUST pass (no findings)

# If secrets found: STOP and notify developer
```

## Files That MUST NEVER Be Committed
🚫 **NEVER COMMIT THESE**:
- `.env` (use `.gitignore` protection)
- `.env.local`, `.env.development`, `.env.production`
- `*serviceAccount*.json` (Firebase admin keys)
- `*credentials*.json` (any credential files)
- `phase*-lint-*.json` (build artifacts with secrets)
- `*-config-current.json` (config snapshots)

✅ **INSTEAD**:
- Store in `.env` (ignored by git)
- Reference via `import.meta.env.VITE_*` in code
- Use GitHub Actions Secrets for CI/CD

## Credential Types (CRITICAL)
| Type | Example | Risk | Action |
|------|---------|------|--------|
| Firebase API Key | `AIzaSy...` | Can read/write Firestore | ROTATE immediately |
| Service Account | Private key JSON | Full database admin access | ROTATE immediately |
| Test Passwords | `password123` | Can bypass auth | RESET immediately |
| OAuth Tokens | `github_pat_...` | API access | REVOKE immediately |

## The GitGuardian Alert Rule

🚨 **FACT**: GitGuardian flags ANY API key matching `AIza[0-9A-Za-z\-_]{35}`:
- ✅ Current keys in use
- ✅ Old/inactive keys
- ✅ Test/example keys
- ✅ Keys in comments
- ✅ Keys in documentation
- ✅ Keys anywhere in committed files

**Only way to prevent alert**: DON'T hardcode ANY key. Use environment variables exclusively.

## If You Discover a Leak
1. **DO NOT PUSH** - Stop operations
2. **Notify user immediately** with:
   - What was leaked (API key, password, etc.)
   - Which file contained it
   - When it was committed
3. **Plan rotation**:
   - Rotate compromised keys in Google Cloud
   - Redact from git history
   - Update with new credentials in `.env`

## Links
- [Copilot Instructions](./.github/copilot-instructions.md#-critical-credential-security-mandatory---no-exceptions)
- [Git Workflow Skill](./.github/skills/git-workflow/SKILL.md#-security-scan-before-every-commit-mandatory)
- [AGENTS.md](./AGENTS.md#-critical-credential-security-before-any-git-operation)
- [Incident Summary](./SECURITY_AUDIT_FINAL.md)
