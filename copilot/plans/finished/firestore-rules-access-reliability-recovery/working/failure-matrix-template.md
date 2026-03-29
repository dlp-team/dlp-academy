# Failure Matrix Template

| ID | Role | Action | Resource Path | Expected | Actual | Error Message | Rule Section Candidate | Repro Test | Status |
|---|---|---|---|---|---|---|---|---|---|
| FR-001 | teacher/editor | drag-drop subject | /subjects/{id} update folderId | allow | deny | permission-denied | subjects.update | e2e:home-sharing-roles | OPEN |
