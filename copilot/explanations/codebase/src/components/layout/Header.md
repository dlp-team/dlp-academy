# Header.jsx

## Purpose
- **Source file:** `src/components/layout/Header.jsx`
- **Last documented:** 2026-02-24
- **Role:** Global app header (navigation bar) with user profile, theme toggle, and dashboard shortcuts.

## High-Level Architecture

This component implements a **dual-sync strategy** for theme persistence:
1. **Instant DOM sync:** Theme toggle updates React state, which immediately modifies DOM class
2. **Background Firestore sync:** User's theme preference written to Firestore in background (fire-and-forget)
3. **Cache + Live strategy:** User profile loaded from localStorage cache (instant) + Firestore fetch (background)

## Theme Management

### Theme Initialization
```javascript
const [darkMode, setDarkMode] = useState(() => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  return false;
});
```
- Reads DOM's current 'dark' class on mount
- Respects previous session theme before Firestore loads

### `handleThemeToggle(isDark)` - Dual Sync Strategy
1. **Instant (Synchronous):** `setDarkMode(isDark)` updates React state
   - Triggers useEffect that applies/removes 'dark' class on `<html>` element
   - UI responds immediately (no network wait)
2. **Background (Async):** If `user?.uid` exists, fires background Firestore update
   - Path: `doc(db, 'users', user.uid)`
   - Update: `{ theme: isDark ? 'dark' : 'light' }`
   - Fire-and-forget: No `await` in render path

## User Profile Fetch (Cache + Live Pattern)

Uses two-phase loading:
1. **Instant (LocalStorage):** Reads `user_profile_{uid}` cache
   - User sees profile immediately on page load
   - Parses JSON and sets state
2. **Background (Firestore):** Fetches fresh data afterCache
   - Path: `doc(db, 'users', user.uid)`
   - Updates state + re-caches in localStorage
   - Syncs theme from Firestore if available

Dependency: `[user?.uid]` triggers refetch when user changes

## Firestore User Document 
```
users/{uid}
  - theme: 'light' | 'dark'
  - email, profile, role, etc.
```
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### Header
- **Type:** const arrow
- **Parameters:** `{ user }`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleThemeToggle
- **Type:** const arrow
- **Parameters:** `isDark`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### fetchUserData
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### getDisplayName
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### getDashboardRoute
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### getDashboardLabel
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 2 time(s).
  - `useEffect()` from `react` is called 2 time(s).
  - `useNavigate()` from `react-router-dom` is called 1 time(s).
  - `doc()` from `firebase/firestore` is called 2 time(s).
  - `getDoc()` from `firebase/firestore` is called 1 time(s).
  - `updateDoc()` from `firebase/firestore` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`, `useState`, `useEffect`
- `react-router-dom`: `useNavigate`
- `lucide-react`: `GraduationCap`, `Settings`, `Moon`, `Sun`, `LayoutDashboard`
- `firebase/firestore`: `doc`, `getDoc`, `updateDoc`
- `../../firebase/config`: `db`
- `../ui/Avatar`: `Avatar`
- `../ui/Toggle`: `Toggle`
- `../ui/MailboxIcon`: `MailboxIcon`

## Example
```jsx
import Header from '../components/layout/Header';

function ExampleScreen() {
  return <Header />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
