# Topic Feature Module

This folder contains all components, hooks, and logic specific to the Topic page.

## Structure
- `Topic.jsx`: Entry point for the Topic page.
- `components/`: Topic-only presentational components (TopicHeader, TopicTabs, etc.)
- `hooks/`: Topic-specific hooks (useTopicLogic, etc.)
- `modals/`: Topic-specific modals (if any)

## Notes
- Use only for Topic-specific logic. Reusable UI should go in `src/components/ui/` or `src/components/shared/`.
- Update this README if you add new major features or refactor the Topic module.
