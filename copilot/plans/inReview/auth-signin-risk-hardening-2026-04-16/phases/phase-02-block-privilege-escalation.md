# Phase 02 - Block Privilege Escalation at Profile Creation and Claim Sync

## Objective
Ensure users cannot self-assign elevated role/institution through create paths or claim-sync callables.

## Tasks
- Restrict users create rules to safe bootstrap fields.
- Explicitly deny role/institution privileged values in self-create path.
- Gate or remove unsafe custom-claim sync path from end users.
- Add deny-path rules/function tests for escalation attempts.

## Exit Criteria
- Self-create cannot set role to admin/institutionadmin.
- Claim sync cannot elevate user privileges from client-controlled profile data.
- Test coverage exists for both allow and deny paths.
