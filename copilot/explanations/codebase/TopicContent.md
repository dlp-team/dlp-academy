# TopicContent.jsx Changelog

## 2026-03-08
- Updated quiz card rendering for proper light/dark mode styling.
- Quiz cards now use `bg-white` for light mode and `bg-slate-900` for dark mode, with text colors adjusted accordingly.
- Hidden quizzes section when no tests are available (returns null if totalQuizzes === 0).

---
## File Path
// src/pages/Topic/components/TopicContent.jsx

## Summary
Quiz cards visually adapt to theme, improving clarity and consistency with StudyGuide theme. Quizzes section is hidden when no tests are available.