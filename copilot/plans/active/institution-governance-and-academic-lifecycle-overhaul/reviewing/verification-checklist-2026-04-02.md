<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/reviewing/verification-checklist-2026-04-02.md -->

# Verification Checklist - Institution Governance and Academic Lifecycle Overhaul

- [x] Phase 01 decisions documented and accepted for implementation.
- [ ] Firestore and Storage permission fixes validated with deny-path checks.
- [x] Deletion and bin-first lifecycle behavior validated for folders/subjects/courses.
- [ ] Institution admin dashboard preview, pagination, and policy controls validated.
- [ ] Academic year format, picker, filters, and lifecycle transitions validated.
- [ ] Selection mode, bin sorting, animation fix, and admin navigation validated.
- [ ] Dual-role switching validated without permission regressions.
- [x] `get_errors` clear for touched files.
- [x] Required tests pass for impacted areas.
- [x] Lossless reports created for each implementation slice.
- [x] Codebase explanation docs updated and synced.

## Progress Notes
- 2026-04-02 (Phase 03 Slice 01):
	- Folder trash-first lifecycle core validated (hook + bin typed UI + tests).
	- Folder drilldown to nested trashed subject items validated in bin UI.
- 2026-04-02 (Phase 03 Slice 02):
	- Nested subfolder-specific actions validated:
		- drilldown supports nested folder navigation,
		- nested folder restore/delete now scoped to selected subtree only,
		- root folder restore/delete still applies to full root tree.
- 2026-04-02 (Phase 03 Slice 03):
	- Institution-admin course/class lifecycle validated:
		- soft-delete routes items to paper bin,
		- bin supports restore + permanent delete actions,
		- permanent delete requires exact typed-name confirmation.
	- Remaining validation item for this phase: retention-window (15-day) execution path evidence.

