---
# .github/instructions/firebase-multitenancy.instructions.md
description: Apply multi-tenant and least-privilege safeguards for Firebase rules, functions, and data access code.
applyTo: "{firestore.rules,storage.rules,functions/**,src/firebase/**,src/utils/**}"
---

# Firebase Multi-Tenancy Safety

- Preserve institution scoping with `institutionId` for tenant-isolated data paths.
- Prefer least-privilege behavior for rules and permission checks.
- Avoid broad allow rules to satisfy tests.
- Keep collection and schema field names in English.
- Validate deny-path behavior when changing access control logic.
