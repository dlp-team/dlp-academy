# Modal Components

This folder contains overlay/modal components shared across features.

- Modals sit on top of the UI and handle their own visibility/animation.
- Submission logic and data is passed in via props.
- If a modal is only used by one feature, consider colocating it with that feature.

**Examples:** EditProfileModal, SubjectFormModal, DeleteModal, FolderTreeModal, etc.

If a modal is used in multiple places, it belongs here.