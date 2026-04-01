# DLP Academy

DLP Academy is a multi-tenant Learning Management and Study Organization platform.

## Stack
- Frontend: React 18 + Vite + TypeScript
- Backend: Firebase (Firestore, Auth, Storage, Functions)
- Testing: Vitest + Testing Library + Firestore Rules tests

## Quick Start
1. Install dependencies:
```bash
npm install
```
2. Run development server:
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
5. Run rules tests:
```bash
npm run test:rules
```

## Project Docs
- Architecture: `copilot/explanations/codebase/ARCHITECTURE.md`
- Firestore schema: `copilot/explanations/codebase/FIRESTORE_SCHEMA.md`
- Multi-tenancy model: `copilot/explanations/codebase/MULTI_TENANCY.md`
- Contribution guide: `CONTRIBUTING.md`

## Development Rules
- Keep visible UI copy in Spanish.
- Preserve institution-level tenant isolation with `institutionId`.
- Follow least-privilege patterns for Firestore access.
- Keep changes lossless and covered by deterministic tests.
