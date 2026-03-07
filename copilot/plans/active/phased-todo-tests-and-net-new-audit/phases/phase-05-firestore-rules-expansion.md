<!-- copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-05-firestore-rules-expansion.md -->
# Phase 05 - Firestore Rules Expansion

- [ ] `tests/rules/firestore.rules.test.js` - coverage for `institution_invites` create/read/update/delete boundaries (`rules/integration`)
- [ ] `tests/rules/firestore.rules.test.js` - coverage for `folders/topics/resources/quizzes` institution + role enforcement (`rules/integration`)
- [ ] `tests/rules/firestore.rules.test.js` - deny writes when `institutionId` missing/mismatched on non-admin users (`rules/integration`)
