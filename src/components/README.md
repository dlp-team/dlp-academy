# Components Architecture

This directory is organized by **responsibility**. Please follow these rules when adding new components:

## 📁 /ui
**"Dumb" & Reusable Components.**
- These components **do not** connect to Firebase.
- They **do not** have complex state (only UI state like hover/focus).
- They receive data via `props`.
- *Examples:* `Button`, `Avatar`, `Toggle`, `Card`.

## 📁 /layout
**Structural Components.**
- These define the "shell" of the application.
- They are used to wrap pages.
- *Examples:* `Header`, `Sidebar`, `Footer`.

## 📁 /modals
**Overlay Components.**
- Components that sit on top of the UI.
- They usually handle their own visibility animations but receive submission logic from parents.
- *Examples:* `EditProfileModal`, `SubjectFormModal`.

## 📁 /features (or specific feature folders like /auth, /subject, /profile)
**"Smart" & Specific Components.**
- These are built specifically for one domain of the app.
- They might contain sub-components relevant only to that feature.
- *Examples:* `UserCard` (only for Profile), `TopicGrid` (only for Subject).