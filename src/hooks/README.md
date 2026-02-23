# Custom Hooks (The Logic Layer)

This directory contains hooks that are used across multiple features or pages.

## 🧠 Philosophy
We separate logic from UI to keep components clean. A `.jsx` file should worry about *how it looks*, while a hook worries about *how it works*.

## Guidelines
- Only keep hooks here if they are truly global and reusable (e.g., useFolders, useSubjects, useUserPreferences).
- Feature-specific hooks should live in their respective feature folders (e.g., src/pages/Home/hooks/).

## Rules for Hooks
1. **Firebase Isolation:** All direct Firebase calls (`getDoc`, `updateDoc`, `signIn`) should live here, not in the components.
2. **State Management:** Complex `useState` and `useEffect` logic belongs here.
3. **Return Values:** Hooks should return:
   - Data objects (`user`, `subjects`)
   - Loading states (`loading`, `error`)
   - Action functions (`updateSubject`, `login`, `logout`)

## Structure
- `useFolders.js`: Fetches and manages folder data.
- `useSubjects.js`: Fetches and manages subject data.
- `useUserPreferences.js`: Manages user preferences.

Update this README if you add or move hooks.