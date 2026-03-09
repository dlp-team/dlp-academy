// src/utils/keyShortcutsHandler.js
/**
 * handleKeyShortcut - Handles clipboard and undo shortcuts.
 * @param {string} action - 'copy' | 'cut' | 'paste' | 'undo'
 * @param {KeyboardEvent} e - The keyboard event.
 * @param {function} customHandler - Optional custom handler.
 */
export function handleKeyShortcut(action, e, customHandler) {
  if (customHandler) {
    // Custom handlers can return false to preserve native browser behavior.
    const shouldPreventDefault = customHandler(e);
    if (shouldPreventDefault !== false) {
      e.preventDefault();
    }
    return;
  }
  switch (action) {
    case 'copy':
      // Default: let browser handle
      break;
    case 'cut':
      // Default: let browser handle
      break;
    case 'paste':
      // Default: let browser handle
      break;
    case 'undo':
      // Default: let browser handle
      break;
    default:
      break;
  }
}
