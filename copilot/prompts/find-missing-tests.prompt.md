// copilot/prompts/find-missing-tests.prompt.md
# Prompt: Find Missing Tests for All Features

## Objective
Conduct a comprehensive audit of all features present in the web application. Identify any test cases that are missing for each feature, excluding those already listed in tests/todo-tests.md. Remove duplicates and produce a final actionable checklist of tests to be created.

## Steps
1. Enumerate all features and modules in the web app (components, hooks, pages, services, utils).
2. For each feature, check for existing tests (unit, e2e, integration).
3. Compare against the current checklist in tests/todo-tests.md.
4. Remove any duplicate or already listed test cases.
5. List all missing tests for uncovered features, edge cases, and integration scenarios.
6. Output a final checklist of actionable tests to be implemented.

## Output
- A deduplicated, actionable checklist of missing tests for all web features.
- Each test should specify the feature/module, scenario, and type (unit/e2e/integration).

## Constraints
- Do not include tests already present in tests/todo-tests.md.
- Focus on coverage gaps, edge cases, and integration flows.
- Use web app structure and documentation to ensure completeness.

---

**Use this prompt to guide a deep search for missing tests and to drive implementation of all uncovered scenarios.**
