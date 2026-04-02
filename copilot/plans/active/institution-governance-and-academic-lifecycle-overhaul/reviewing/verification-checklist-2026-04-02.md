<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/reviewing/verification-checklist-2026-04-02.md -->

# Verification Checklist - Institution Governance and Academic Lifecycle Overhaul

- [x] Phase 01 decisions documented and accepted for implementation.
- [ ] Firestore and Storage permission fixes validated with deny-path checks.
- [x] Deletion and bin-first lifecycle behavior validated for folders/subjects/courses.
- [x] Institution admin dashboard preview, pagination, and policy controls validated.
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
- 2026-04-02 (Phase 03 Slice 04):
	- Retention-window enforcement validated:
		- Home bin auto-purges expired trashed folders/subjects,
		- institution-admin lifecycle fetch purges expired trashed courses/classes,
		- retention utility tests and bin helper tests pass.
- 2026-04-02 (Phase 04 Slice 01):
	- Institution-admin users tab pagination validated:
		- cursor-based loading for teachers/students,
		- load-more controls wired with loading state,
		- full all-users fetch deferred outside organization tab.
- 2026-04-02 (Phase 04 Slice 02):
	- Exact customization preview validated with Home component reuse and isolated mock-data provider.
	- Policy-toggle enforcement matrix validated for dynamic-code + teacher creation/assignment/deletion controls.
	- No policy mismatches detected in targeted matrix runs.
- 2026-04-02 (Phase 05 Slice 01):
	- Academic-year governance baseline validated in institution-admin course/class flows:
		- strict format + default-year utility,
		- picker integration,
		- course-owned year derivation into class create/edit paths,
		- hook-level normalization and course-to-class propagation.
	- Focused tests passed for utility + create-modal behavior (7 tests).

