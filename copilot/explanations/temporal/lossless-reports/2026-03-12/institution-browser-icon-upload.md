<!-- copilot/explanations/temporal/lossless-reports/2026-03-12/institution-browser-icon-upload.md -->

# Institution Browser Icon Upload

## Requested Scope

- Add support in the institution admin dashboard to manage a browser/tab icon separately from the existing header logo.
- Store the uploaded image in Firebase Storage.
- Store the resulting URL in Firestore so the app can retrieve branding metadata from Firestore.
- Preserve the existing header logo flow.

## Preserved Behaviors

- The existing header logo remains mapped to the existing logo field and is not overwritten by the new icon flow.
- Institution customization save behavior for display name, logo, and colors remains intact.
- Existing users, organization, access-code, and policy management flows were not modified.

## Touched Files

- src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx

## Per-File Verification

### src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx

- Added a distinct icon field to the local customization state.
- Loaded the saved icon URL from Firestore customization data.
- Added a dedicated upload UI in the customization tab with Spanish text only.
- Uploaded icon files to Firebase Storage under an institution-scoped branding path.
- Saved the Storage download URL back to Firestore at customization.iconUrl.
- Updated the favicon link in the document head for immediate preview when an icon exists.
- Kept the existing logo field untouched for the app header flow.

## Validation Summary

- Code edits completed.
- Automated tests were not run in this environment because terminal execution was not available through the current tool set.
- No lint or typecheck execution was possible for the same reason.

## Risks / Follow-Up

- If global favicon behavior is handled elsewhere in the app shell, a follow-up may be needed to read customization.iconUrl outside this dashboard so the icon applies across all routes.
- If Firebase Storage rules require a different path convention, adjust the upload destination accordingly.