# Header.tsx

## Purpose
- **Source file:** `src/components/layout/Header.tsx`
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

## Changelog
### 2026-04-12
- Added fixed-header presence marker lifecycle on `document.body` (`has-fixed-header`) while `Header` is mounted.
- This marker is consumed by global scrollbar CSS so the app-level overlay scrollbar starts below the fixed header and does not render over it.

### 2026-04-09
- Added notification-toast deduplication keyed by notification id so the same notification card toast is not replayed repeatedly.
- Persisted seen toast ids in session storage per user (`dlp-seen-notification-toasts:<uid>`).
- Upgraded toast payload contract to include title/type/variant and wired 10-second auto-dismiss behavior through `AppToast`.

### 2026-04-07
- Added user preference support for header theme slider visibility (`headerThemeSliderEnabled`) with safe default fallback.
- Updated header theme state logic to resolve `system` preference correctly and keep icon/toggle state aligned with OS theme changes.
- Removed implicit theme write side effect tied only to local boolean changes to prevent system-mode drift.

### 2026-04-04
- Added notification trigger boundary ref (`notificationsTriggerRef`) and passed it to notification panel as `triggerRef`.
- Wired panel `Ver todas` action (`onOpenAll`) to close dropdown and navigate to `/notifications`.
- This avoids bell toggle race conditions when outside-click listeners and trigger clicks fire in the same interaction.

### 2026-04-02
- Added active-role selector in header actions for dual-role users.
- Dashboard shortcut route and label now resolve from active role context instead of raw `user.role`.
- Header now emits shell-level active-role change event (`dlp-active-role-change`) consumed by `App.tsx` role-context synchronization.
- Merged `user` + Firestore profile snapshots before rendering so active role metadata from app shell is preserved.
- Wired notification panel owner actions for shortcut move requests (`approve` / `reject`) through `useNotifications` resolution API.
- Added toast feedback for resolution outcomes (success and failure) after action execution.
