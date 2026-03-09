// src/utils/keyShortcutsHandler.js
/**
 * handleKeyShortcut - Handles clipboard and undo shortcuts.
 * @param {string} action - 'copy' | 'cut' | 'paste' | 'undo'
 * @param {KeyboardEvent} e - The keyboard event.
 * @param {function} customHandler - Optional custom handler.
 */
export function handleKeyShortcut(action, e, customHandler) {
  // Prevent default only if custom handler is provided
  if (customHandler) {
    e.preventDefault();
    customHandler(e);
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
