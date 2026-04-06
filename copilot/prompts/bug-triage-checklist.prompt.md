// copilot/prompts/bug-triage-checklist.prompt.md
# Prompt: Bug Triage Checklist

## Overview
Use this prompt to quickly categorize, prioritize, and triage bugs for efficient resolution.

## Bug Information Gathering

### 1. **Bug Details**
- [ ] Descriptive title (what is broken?)
- [ ] Clear reproduction steps (1, 2, 3...)
- [ ] Expected behavior (what should happen?)
- [ ] Actual behavior (what actually happens?)
- [ ] Screenshots or error logs (if applicable)
- [ ] Browser/platform affected (Chrome, Firefox, mobile?)
- [ ] When was this introduced? (recent change, old issue?)

### 2. **Impact Assessment**
- [ ] User-facing or internal?
- [ ] Data loss risk? (Critical = YES)
- [ ] Security/compliance issue?
- [ ] Blocks other work?
- [ ] Affects multiple institutions or just one?
- [ ] Workaround available?

### 3. **Severity Classification**

#### 🔴 **CRITICAL** (Fix immediately)
- Data loss or corruption
- Security vulnerability
- Complete feature broken
- Blocks production workflow
- Affects > 50% of users

#### 🟠 **HIGH** (Fix this sprint)
- Major functionality broken
- Significant user impact
- Permission/access issue
- Affects specific institution or role
- Workaround exists but inconvenient

#### 🟡 **MEDIUM** (Fix next sprint)
- Minor functionality broken
- Limited user impact
- Cosmetic or UX issue
- Performance degradation
- Workaround available

#### 🟢 **LOW** (Backlog)
- Edge case bug
- One user affected
- Nice-to-have fix
- Performance micro-optimization
- Can wait indefinitely

### 4. **Resolution Complexity**

#### ⚡ **QUICK FIX** (< 1 hour)
- Simple one-file change
- Clear root cause
- Minimal testing needed

#### ⚙️ **STANDARD** (1-4 hours)
- Multi-file change
- Clear root cause
- Needs moderate testing

#### 🔧 **COMPLEX** (> 4 hours)
- Multi-component refactor
- Unclear root cause
- Extensive testing needed
- May need design review

### 5. **Root Cause Assessment**

Assess likely causes:
- [ ] Frontend logic error
- [ ] API/Firebase integration issue
- [ ] Permission/auth problem
- [ ] Data model issue
- [ ] Fire store rules issue
- [ ] Dependency/library issue
- [ ] Environment-specific (dev, staging, prod)
- [ ] Browser/compatibility issue

### 6. **Quick Fix Potential**
- [ ] Issue clearly reproducible?
- [ ] Root cause identified or likely?
- [ ] Can fix be isolated to one area?
- [ ] Tests can validate fix quickly?
- [ ] No cascade risk from fix?

## Triage Decision Tree

```
Bug Report
    ↓
Severity?
    ├─ CRITICAL → Assign immediately, drop other work
    ├─ HIGH → Include in current sprint
    ├─ MEDIUM → Add to product backlog
    └─ LOW → Archive or defer
    ↓
Complexity?
    ├─ QUICK FIX → Assign to available dev
    ├─ STANDARD → Assign to dev with context
    └─ COMPLEX → Plan work, create sub-tasks
    ↓
Action?
    ├─ Fix now (CRITICAL + QUICK)
    ├─ Schedule (HIGH or MEDIUM priority)
    ├─ Investigate further (unclear root cause)
    └─ Close as duplicate/wontfix (if applicable)
```

## Triage Output

Document with:
```
**Severity:** [CRITICAL/HIGH/MEDIUM/LOW]
**Complexity:** [QUICK/STANDARD/COMPLEX]
**Root Cause:** [Likely cause or "Needs investigation"]
**Suggested Next Step:** [Assign to dev, investigate, defer, etc.]
**Estimated Time:** [Time to fix if known]
**Blockers:** [Any dependencies or info needed]
```

## Examples

### Example 1: Critical Bug
```
Title: Users can't log in after update

Severity: 🔴 CRITICAL (blocks all users)
Complexity: ⚙️ STANDARD
Root Cause: Firebase config broken after deploy
Next Step: Assign immediately, rollback or quick fix
Est. Time: 30 minutes
```

### Example 2: Medium Bug
```
Title: Pagination doesn't work on mobile

Severity: 🟡 MEDIUM (affects mobile users)
Complexity: ⚙️ STANDARD
Root Cause: CSS breakpoint issue in list component
Next Step: Schedule for next sprint
Est. Time: 1-2 hours
```

### Example 3: Low Bug
```
Title: Typo in admin settings page

Severity: 🟢 LOW (cosmetic)
Complexity: ⚡ QUICK FIX
Root Cause: Hardcoded Spanish text (use Spanish consistently)
Next Step: Batch with other low-priority fixes
Est. Time: 5 minutes
```

---

**Use this prompt to triage bugs quickly and assign appropriate priority and effort estimates.**
