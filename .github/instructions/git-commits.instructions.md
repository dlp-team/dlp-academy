# .github/instructions/git-commits.instructions.md

<!-- Git Commit Standards -->

Ensure all commits follow professional semantic versioning and atomic composition standards for multi-agent workflows.

---

## Git Commit Format (MANDATORY)

```
<type>(<scope>): <subject>

<body>

<footer>
```

---

## Type Selection

Select the commit type that best describes the change:

| Type | Use When | Example |
|------|----------|---------|
| `feat` | Adding new feature or capability | `feat(auth): add OIDC login support` |
| `fix` | Fixing a bug or regression | `fix(auth): resolve null ref in token refresh` |
| `docs` | Adding/updating documentation | `docs(workflow): add handoff protocol` |
| `style` | Formatting/whitespace (NO logic change) | `style(lint): reformat eslint config` |
| `refactor` | Reorganizing code (NO behavior change) | `refactor(utils): extract string helpers` |
| `test` | Adding tests or test fixes | `test(hooks): add useAuth unit tests` |
| `chore` | Internal work: tooling, dependencies, config | `chore(deps): upgrade firebase library` |
| `perf` | Performance improvements | `perf(queries): optimize firestore queries` |
| `ci` | CI/CD configuration | `ci(github): add test workflow` |

---

## Scope (Optional but Recommended)

Context of the change in parentheses:

- `(auth)` — Authentication module
- `(ui)` — UI components
- `(database)` — Database/Firestore
- `(workflow)` — Git/workflow automation
- `(tests)` — Testing infrastructure
- `(docs)` — Documentation
- `(api)` — API/backend
- `(multi-agent)` — Multi-agent workflow

---

## Subject Line (SUBJECT CASE)

Keep it concise and descriptive: **max 50 characters**

✅ **DO:**
- Use imperative mood: "Add", "Fix", "Update" (not "Added", "Fixed", "Updated")
- Lowercase (except proper nouns)
- No period at end
- Be specific: "Add login modal" not "Update code"

❌ **DON'T:**
- Start with uppercase (except proper nouns)
- Use past tense: "Fixed" → "Fix"
- Add period at end
- Use vague descriptions: "Update stuff" or "Misc fixes"

**Examples:**

```
✅ feat(auth): add OIDC login support
✅ fix(hooks): resolve useAuth null reference
✅ docs(workflow): add multi-agent branch handoff guide
✅ test(components): add LoginModal unit tests

❌ Added OIDC login support
❌ Fixed bug in auth
❌ Update code.
❌ stuff
```

---

## Body (DETAILED EXPLANATION)

Provide more detailed explanation after a blank line. Keep lines **≤ 72 characters**.

### The 3 Questions Rule

Answer these three questions in the body:

1. **What is now different than before?** (Describe the changes, not the code)
2. **What's the reason for the change?** (Why is this needed?)
3. **Is there anything to watch out for?** (Blockers, breaking changes, side effects)

### Example Body

```
Add OIDC-based SSO login support to address customer security requirements.

- Added LoginOverlay component with Google/Microsoft/OIDC provider buttons
- Integrated Firebase Auth OIDC configuration
- Updated useAuth hook to handle new token flow
- Added 15 unit tests; all passing (100% coverage for new code)

Watch out:
- Requires OAuth provider configuration (see setup docs)
- Changes token refresh timeout from 60s to 55s
- Coordinates with feature/pc2/database-migration (no conflicts)
```

---

## Footer (OPTIONAL, FOR SPECIAL CASES)

Use footer for:
- **Breaking changes:** `BREAKING CHANGE: Description`
- **Related issues:** `Closes #123` or `Fixes #456`
- **Co-authors:** `Co-authored-by: Name <email>`

### Example Footer

```
Closes #42

BREAKING CHANGE: Old auth endpoint is deprecated; use new OIDC endpoint

Co-authored-by: Miguel De La Peña <miguel@dlp.com>
```

---

## Complete Example Commits

### Example 1: Feature Commit

```
feat(multi-agent): add shared branch coordination via WORKING_SESSION.md

- Added WORKING_SESSION.md template for tracking active worker
- Prevents race conditions: only one Copilot codes at a time
- Updated BRANCH_STATUS.md template with new "Sharing Mode" field
- Added examples and documentation for handoff workflow
- All tests passing; no regressions

The shared branch mode allows multiple Copilots to work on the same
feature by coordinating who is actively coding. The WORKING_SESSION.md
file tracks the active worker and maintains a handoff log.

Watch out:
- Shared mode requires explicit handoff (don't both code simultaneously)
- WORKING_SESSION.md must be updated before switching workers
- Only use for pair work or 24/7 coverage (most features stay LOCKED)

Relates to: .github/skills/multi-agent-workflow/SKILL.md Section 2.5
```

### Example 2: Bug Fix Commit

```
fix(auth): resolve null reference in token refresh during logout

- Added null check in useAuth.js before accessing token.refreshAt
- Fixed race condition when logout called during token refresh
- Added regression test to prevent future null refs
- All 42 tests passing

Previously, if token refresh timer fired during logout, the ref to
refreshToken would be null, causing the app to crash. Now the hook
gracefully handles the race condition.

Watch out:
- This fixes a user-facing crash; deploy to production ASAP
- No breaking changes; backward compatible
- Related to: feature/pc1/auth-token-fix (merged)

Closes #234
```

### Example 3: Documentation Commit

```
docs(workflow): add multi-agent branch mode decision matrix

- Added BRANCH_MODE_DECISION_MATRIX.md with flowchart
- Includes 5 real-world scenarios and anti-patterns
- Links to QUICK_START.md and SKILL.md sections
- Helps Copilots decide LOCKED vs. SHARED mode

Documentation only change; no code modifications.

See: copilot/BRANCH_MODE_DECISION_MATRIX.md
```

### Example 4: Chore Commit

```
chore(deps): upgrade firebase from 9.x to 10.x

- Updated package.json firebase version
- Ran firebase migration guide; no breaking changes
- Updated firestore.rules syntax (minor changes)
- All tests passing; verified in staging

This upgrade includes performance improvements and security patches.
No code changes needed except for one firestore.rules syntax update.

Watch out:
- Firebase SDK v10 is now required for new builds
- Old rules format still compatible (just deprecated warnings)
- If deploying old code, use firebase@9.x

Related: package.json, firestore.rules
```

---

## Atomic Commits (GOLDEN RULE)

### Before Committing

Use `git add <specific-files>` to cherry-pick files into staging:

```bash
# ✅ GOOD: Atomic commits
git add src/components/LoginModal.jsx
git commit -m "feat(ui): add LoginModal component"

git add src/hooks/useAuth.js
git commit -m "feat(auth): add OIDC token handling"

git add tests/unit/LoginModal.test.js
git commit -m "test(ui): add LoginModal unit tests"

# ❌ BAD: Large patch with unrelated changes
git add .                        # NEVER do this in multi-agent work
git commit -m "Update stuff"
```

### Rule: What Belongs in One Commit

**One commit = one logical change**

| Type | Should Be 1 Commit | Should Be Multiple |
|------|---|---|
| New component + its tests | ✅ OK if both added together | If test added later |
| Bug fix + regression test | ✅ OK if both added together | If unrelated |
| Feature + docs | ❌ Separate | Feature then docs |
| Multiple unrelated fixes | ❌ Never | One commit per fix |
| Formatting + logic change | ❌ Never | Separate completely |

---

## Commit Checklist (Before `git commit`)

- [ ] Staged ONLY relevant files: `git status` shows correct files
- [ ] Type selected correctly (feat/fix/docs/etc.)
- [ ] Scope relevant to change
- [ ] Subject: Imperative, ≤50 chars, no period
- [ ] Body answers 3 questions (What? Why? Watch-outs?)
- [ ] Body lines ≤72 chars
- [ ] Tests pass: `npm run test`
- [ ] Linting passes: `npm run lint`
- [ ] No merge markers or debug code left
- [ ] Footer added if needed (breaking change, issue closure)

---

## Examples to Avoid

❌ **DON'T:**

```
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "Update components"
git commit -m "asdfasdf"
git commit -m "Merge branch 'develop' into feature/login"
git commit -m "AAHHHHH"
```

✅ **DO:**

```
git commit -m "fix(auth): resolve token refresh race condition

- Added null check in useAuth hook
- Fixed crash during logout + refresh simultaneous calls
- All tests passing

Watch out: Shipped as hotfix; test in staging first"
```

---

## Integration with Multi-Agent Workflow

### Before Creating PR

Verify all commits follow this format:

```bash
# Review commit log
git log --oneline -10

# Should show:
# feat(auth): add OIDC login
# test(auth): add OIDC tests
# docs(workflow): add handoff guide
# (clean, descriptive, semantic)

# NOT:
# fixed
# wip
# asdf
# Update code
```

### In BRANCH_STATUS.md

Verify before marking ready-for-merge:

```markdown
## Merge Readiness Checklist
- [ ] All commits follow semantic format
- [ ] Each commit is atomic (one logical change)
- [ ] Commit bodies answer 3 questions
- [ ] No WIP or placeholder commits
- [ ] Git history is clean and readable
```

---

## Tools & Automation

### Verify Commits Before Push

```bash
# Check last 5 commits
git log --oneline -5

# Check full commit message
git log -5

# Amend last commit if needed
git commit --amend  # Edit message
git push --force-with-lease origin <branch>  # Careful: only on your branch!
```

### Git Hooks (Optional)

Add a pre-commit hook to enforce format:

```bash
# .git/hooks/pre-commit
# (Custom script to validate commit format - optional, advanced)
```

---

## Reference

- **Semantic Commit Convention:** https://www.conventionalcommits.org/
- **Git Best Practices:** Your `.github/skills/git-workflow/SKILL.md`
- **Lossless Change Protocol:** `.github/skills/lossless-change/SKILL.md`
- **Multi-Agent Workflow:** `.github/skills/multi-agent-workflow/SKILL.md` Section 7.1

