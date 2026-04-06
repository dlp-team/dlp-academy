<!-- copilot/COPILOT_VSCODE_DIAGNOSTICS_MATRIX_2026-04-06.md -->
# Copilot VS Code Diagnostics Matrix

## Purpose
Rapidly diagnose response-quality or efficiency regressions.

| Symptom | Most likely cause | Where to inspect | Corrective action |
|---|---|---|---|
| Copilot ignores repo rules | Instruction files not loaded or conflicting | Chat Debug View -> System prompt and Context | Check instruction discovery, reduce conflicts, restart session |
| Response becomes generic | Context pollution from mixed tasks | Session history + context meter | Start new session focused on one objective |
| Output truncated | Context window saturation | Agent Debug Logs token stats | Run `/compact` or start fresh session |
| Wrong files edited | Ambiguous retrieval scope | Prompt + attached context list | Add explicit `#file` and `#symbol` mentions |
| Excessive tool calls | Prompt too broad or tool set too wide | Agent Debug Logs tool timeline | Narrow prompt and disable unnecessary tool paths |
| Slow responses | Overloaded context or unnecessary scans | Agent Debug summary duration | Use section-targeted reads and shorter prompts |
| Instructions apply inconsistently | Incorrect `applyTo` or location mismatch | Customizations diagnostics + discovery logs | Fix `applyTo`, verify file path location |
| Repeated rework loops | Missing acceptance criteria | Original prompt and follow-up prompts | Add expected output + explicit validation checks |

## Fast Triage Sequence (under 5 minutes)
1. Open Agent Debug Logs and read summary metrics.
2. Open Chat Debug View and confirm loaded instructions and context payload.
3. Verify whether the prompt had explicit files/symbols.
4. Decide: compact current session or start a new clean session.
5. Re-run with constrained prompt and acceptance criteria.
