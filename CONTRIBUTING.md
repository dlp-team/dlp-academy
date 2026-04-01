# Contributing

## Scope
This repository contains DLP Academy, a multi-tenant learning platform powered by React + Firebase.

## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Start local development:
```bash
npm run dev
```
3. Run lint:
```bash
npm run lint
```
4. Run unit tests:
```bash
npm run test
```
5. Run Firestore rules tests:
```bash
npm run test:rules
```

## Branch and Commit Rules
1. Never commit directly to `main` from agent/autopilot workflows.
2. Use feature or hotfix branches.
3. Use commit format:
```text
<type>(<scope>): <subject>
```
Examples: `feat(admin): add pagination state utility`, `test(content): add guide navigation coverage`.

## Code Change Expectations
1. Keep changes lossless and scoped.
2. Preserve existing behavior unless explicitly requested.
3. Add tests for each new utility/component.
4. Validate touched areas with targeted tests first, then impacted suites.
5. Update docs in `copilot/explanations/codebase/` and create a temporal lossless report for code changes.

## Multi-Tenancy and Security
1. Preserve institution isolation with `institutionId`.
2. Avoid broad allow rules in Firestore security rules.
3. Validate deny paths when changing access control logic.
4. Keep collection and field names in English.

## UI and Content Rules
1. Visible UI text must remain in Spanish.
2. Do not use browser `alert()` for user feedback.
3. Use icons instead of emojis for interface elements.

## Pull Request Checklist
- [ ] Scope is minimal and lossless.
- [ ] `npm run lint` has no errors.
- [ ] Targeted tests and impacted suites pass.
- [ ] Documentation and changelogs are updated.
- [ ] No debug logs or temporary code are left behind.
