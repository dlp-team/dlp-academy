---
# .github/skills/debug-in-depth/SKILL.md
name: debug-in-depth
description: Run a structured root-cause analysis for difficult bugs, flaky tests, async race conditions, and permission issues. Use when basic fixes fail or failures are intermittent.
---

# Debug In Depth Skill

## Objective
Find root cause with deterministic evidence, not guesswork.

## Steps
1. Reproduce failure with exact command and environment.
2. Isolate failure surface (single test/spec/module first).
3. Capture evidence: stack traces, logs, failing assertions, state snapshots.
4. Classify root cause: data, timing, selector drift, permission, regression.
5. Implement minimal fix and rerun targeted checks.
6. Validate full impacted suite to avoid fix regressions.

## Output standard
- Root cause statement.
- Minimal patch summary.
- Verification evidence.
- Residual risk notes.
