// copilot/prompts/migration-readiness-checklist.prompt.md
# Prompt: Migration Readiness Checklist

## Overview
Use this prompt to assess migration readiness before creating a detailed plan in the create-plan skill.

## Pre-Migration Assessment

### 1. **Migration Scope** 📋
- [ ] Migration objective clearly defined
- [ ] Current state documented (what exists now?)
- [ ] Target state documented (what should be?)
- [ ] Scope boundaries defined (what's included/excluded?)
- [ ] Data volume estimated (how much data to migrate?)
- [ ] Timeline estimated (how long will this take?)
- [ ] Impact on users assessed (will services be down?)

### 2. **Dependencies & Blockers** 🚧
- [ ] All prerequisites identified
- [ ] No circular dependencies
- [ ] External systems documented (APIs, databases, services)
- [ ] Third-party integrations assessed
- [ ] Known blockers listed with mitigation plans
- [ ] Team availability confirmed
- [ ] Infrastructure capacity verified

### 3. **Data Consistency** 🔄
- [ ] Current data validated (quality check)
- [ ] Data mapping defined (old field → new field)
- [ ] Transformations documented (how to convert data)
- [ ] Data loss risk assessed (will any data be lost?)
- [ ] Validation rules for transformed data defined
- [ ] Duplicate detection strategy planned
- [ ] Orphaned data handling decided

### 4. **Backward Compatibility** 🔙
- [ ] Breaking changes identified
- [ ] Deprecation plan (if gradual rollout needed)
- [ ] Old system support timeline (how long to keep old system?)
- [ ] Parallel run period planned (old + new systems running together)
- [ ] Rollback strategy documented (how to revert if issues)
- [ ] Version management in place

### 5. **Testing Strategy** ✅
- [ ] Unit tests written for migration logic
- [ ] Integration tests for data transformations
- [ ] Data validation tests (sample data checked)
- [ ] E2E tests for critical workflows
- [ ] Performance tests (migration speed acceptable?)
- [ ] Rollback tests (can we revert successfully?)
- [ ] Dry-run plan (test on copy of production data)

### 6. **Communication Plan** 📢
- [ ] Stakeholders notified (users, teams, management)
- [ ] Downtime window communicated (if applicable)
- [ ] Success criteria explained (how to verify success)
- [ ] Support plan documented (who to contact if issues)
- [ ] Runbook created (step-by-step instructions)
- [ ] Escalation contacts identified

### 7. **Monitoring & Observability** 📊
- [ ] Logging strategy for migration process
- [ ] Progress tracking (how many records processed, success rate)
- [ ] Error handling & reporting (how to detect issues)
- [ ] Performance monitoring (is migration slow?)
- [ ] Redis/cache invalidation planned (if applicable)
- [ ] Alerts configured (notify on errors/slowness)
- [ ] Metrics collected before/after for comparison

### 8. **Security & Compliance** 🔒
- [ ] Data moved securely (encryption, secure channels)
- [ ] Access controls enforced (who can access migrated data)
- [ ] Compliance checked (GDPR, CCPA, local regulations)
- [ ] PII handling correct (sensitive data protected)
- [ ] Audit trail maintained (log who did what)
- [ ] Multi-tenancy preserved (data isolation maintained)

### 9. **Infrastructure & Resources** 💻
- [ ] Database capacity sufficient
- [ ] Compute resources available (temporary high resource usage)
- [ ] Storage space available
- [ ] Network bandwidth adequate
- [ ] Temporary storage for backups available
- [ ] Scripts/tools prepared (migration scripts ready)

### 10. **Rollback & Recovery** 🔄
- [ ] Rollback plan documented and tested
- [ ] Backups created (full backup before migration)
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined
- [ ] Disaster recovery scenario planned
- [ ] Team trained on rollback procedure

## Migration Readiness Matrix

| Aspect | Status | Risk | Notes |
|--------|--------|------|-------|
| Scope | ✅ Clear / ⚠️ Fuzzy / ❌ Unclear | Low/Medium/High | |
| Data Consistency | ✅ Validated / ⚠️ Partial / ❌ Unknown | Low/Medium/High | |
| Testing | ✅ Complete / ⚠️ Partial / ❌ None | Low/Medium/High | |
| Rollback | ✅ Planned / ⚠️ Partial / ❌ None | Low/Medium/High | |

## Migration Risk Assessment

### 🟢 **Green** (Low Risk)
- Scope clearly defined
- Data thoroughly validated
- Comprehensive tests
- Proven rollback strategy
- Team prepared

### 🟡 **Yellow** (Medium Risk)
- Scope mostly clear
- Data validation in progress
- Good test coverage
- Rollback plan documented
- Team partially trained

### 🔴 **Red** (High Risk)
- Scope unclear or large
- Data validation incomplete
- Limited test coverage
- Rollback not tested
- Team unprepared

## Readiness Output

```
Migration: [Name of migration]
Status: 🟢 Ready / 🟡 Conditionally Ready / 🔴 Not Ready

Risk Level: [Low/Medium/High]

Readiness Score: [X/10]

Green Items (Ready):
- ✅ Well-defined scope
- ✅ Data validated
- ✅ Tests written

Yellow Items (Caution):
- ⚠️ Rollback plan not tested yet
- ⚠️ Team training incomplete

Red Items (Must Address):
- 🔴 Data mapping not finalized

Recommended Next Steps:
1. Address red items before proceeding
2. Complete yellow-item mitigations
3. Create detailed migration plan using create-plan skill
4. Schedule dry-run
5. Execute migration

Go/No-Go Decision: [GO / NO-GO / CONDITIONAL]
```

## Pre-Migration Checklist (Final)

- [ ] All tests passing
- [ ] Dry-run completed successfully
- [ ] Backups verified
- [ ] Rollback tested
- [ ] Communication sent
- [ ] Team present and trained
- [ ] Monitoring active
- [ ] Go/No-Go meeting held
- [ ] Final approvals obtained
- [ ] Migration runbook ready

---

**Use this prompt to assess migration readiness BEFORE creating a detailed plan with the create-plan skill.**
