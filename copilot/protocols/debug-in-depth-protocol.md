# Debug In Depth Protocol

## Purpose
This protocol provides a systematic approach for debugging complex async flows in React/Firebase apps (or similar environments) where the source of failure is unclear. It is especially useful for permission, data, or logic errors that are hard to isolate.

## Steps

1. **Instrument Every Step**
   - Add `alert()` and `console.log()` statements before and after every major async operation (queries, updates, conditionals, etc).
   - Use clear, numbered messages (e.g., `[DEBUG] Step 1: ...`, `[DEBUG] Step 2: ...`).

2. **Expose All Data**
   - Log all relevant variables, query snapshots, and payloads at each step.
   - Show key data in alerts if console is not visible to the user.

3. **Branch Checks**
   - For every conditional (e.g., `if (alreadyShared)`), log/alert which branch is taken and why.

4. **Error Handling**
   - Wrap each async operation in a try/catch.
   - In the catch, log and alert the error message and any relevant context.

5. **Stop at Failure**
   - The last alert or log before an error pinpoints the failing step.
   - Use this to focus investigation and remove unnecessary debug code once resolved.

## Example
```js
alert('[DEBUG] Step 1: Fetching user');
const userSnap = await getDocs(...);
console.log('[DEBUG] userSnap:', userSnap);
if (!userSnap.empty) {
  alert('[DEBUG] Step 2: User found');
} else {
  alert('[DEBUG] Step 2: User not found');
}
```

## When to Use
- Permission errors (e.g., Firestore rules)
- Async race conditions
- Data not appearing as expected
- Complex flows with multiple branches

## When to Remove
- As soon as the bug is found and fixed, remove all debug alerts/logs to keep code clean.

---
This protocol is designed for maximum visibility and rapid isolation of bugs in complex, async, or permission-sensitive code paths.