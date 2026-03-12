<!-- copilot/plans/active/dashboard-persistence-branding-and-subject-policy/working/notes.md -->
# Working Notes

- `useCustomization` currently uploads to `institutions/{institutionId}/branding/*` but `firebase.json` has no storage rules entry and repo has no `storage.rules` file.
- `useUsers` already stores institution policies in `institutions.accessPolicies`.
- `SubjectFormModal` hardcodes direct class assignment to institution admin/admin.
- `useSubjects.permanentlyDeleteSubject` only checks ownership today, not enrolled students/policy.
- Home already persists last view/folder, but not collapsed groups/shared sections.
- AdminDashboard, InstitutionAdminDashboard, TeacherDashboard, and Topic tabs currently reset on reload.
