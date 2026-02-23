# Modules Components

This folder contains domain-specific, reusable components that are used across multiple features or pages but are not fully generic UI components.

- More specialized than UI components, but not tied to a single feature.
- No direct data fetching or business logic.
- Receives data and handlers via props.

**Examples:** SubjectCard, FolderCard, ListViewItem, TopicCard, etc.

If a component is reused in several places but is not atomic UI, it belongs here.

Update this README if you add or reorganize components in this folder.