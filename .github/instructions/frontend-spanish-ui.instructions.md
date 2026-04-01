contin---
# .github/instructions/frontend-spanish-ui.instructions.md
description: Apply UX language/style constraints for visible UI text and interface behavior in frontend files.
applyTo: "src/**/*.{js,jsx,ts,tsx,css}"
---

# Frontend UI Guardrails

Use these rules for user-visible interface work:
- All visible UI text must be in Spanish with natural grammar.
- Do not use emojis in UI; use icons.
- Do not use `alert()` for user information. Prefer contextual inline text/toast components already used by the app.
- Preserve responsive behavior for desktop and mobile.
- Keep visual style aligned with existing design patterns unless task explicitly asks for redesign.
