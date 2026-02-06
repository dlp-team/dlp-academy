# Pages (The View Layer)

This directory contains the **Route Controllers**. Each file here corresponds to a URL route defined in `App.jsx`.

## 🚦 Responsibilities
A Page component does NOT contain heavy UI code or heavy logic. Its job is to:
1. **Receive User:** Get the current user session.
2. **Call Hooks:** Initialize the necessary hooks (e.g., `useSubjectManager`).
3. **Orchestrate:** Pass data from hooks into `Layouts` and `Components`.
4. **Manage Page State:** Handle high-level state like "Is the modal open?".

## Structure
- `Login.jsx` / `Register.jsx`: Entry points (Public).
- `Home.jsx`: Main dashboard.
- `Subject.jsx`: Detailed view of a specific subject (Dynamic Route).
- `Profile.jsx`: User settings and stats.
- `Settings.jsx`: Application configuration.