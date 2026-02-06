# Custom Hooks (The Logic Layer)

This directory contains the **business logic** and **data fetching** for the application. 

## 🧠 Philosophy
We separate logic from UI to keep components clean. A `.jsx` file should worry about *how it looks*, while a hook worries about *how it works*.

## Rules for Hooks
1. **Firebase Isolation:** All direct Firebase calls (`getDoc`, `updateDoc`, `signIn`) should live here, not in the components.
2. **State Management:** Complex `useState` and `useEffect` logic belongs here.
3. **Return Values:** Hooks should return:
   - Data objects (`user`, `subjects`)
   - Loading states (`loading`, `error`)
   - Action functions (`updateSubject`, `login`, `logout`)

## Existing Hooks
- `useLogin.js` / `useRegister.js`: Auth flows.
- `useProfile.js`: User data and stats fetching.
- `useSubjectManager.js`: Complex logic for drag-and-drop, N8N generation, and topic CRUD.
- `useSubjects.js`: General list fetching for the Home page.