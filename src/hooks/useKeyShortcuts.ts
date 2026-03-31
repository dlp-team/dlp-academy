// src/hooks/useKeyShortcuts.js
import { useEffect } from 'react';
import { handleKeyShortcut } from '../utils/keyShortcutsHandler';

/**
 * useKeyShortcuts - Hook for handling Ctrl+C/X/V/Z keyboard shortcuts globally or in a specific context.
 * @param {Object} options - Optional context and handlers.
 * @param {function} options.onCopy - Custom copy handler.
 * @param {function} options.onCut - Custom cut handler.
 * @param {function} options.onPaste - Custom paste handler.
 * @param {function} options.onUndo - Custom undo handler.
 */
export function useKeyShortcuts({ onCopy, onCut, onPaste, onUndo }: any = {}) {
  useEffect(() => {
    function keydownListener(e: any) {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        switch (key) {
          case 'c':
            handleKeyShortcut('copy', e, onCopy);
            break;
          case 'x':
            handleKeyShortcut('cut', e, onCut);
            break;
          case 'v':
            handleKeyShortcut('paste', e, onPaste);
            break;
          case 'z':
            handleKeyShortcut('undo', e, onUndo);
            break;
          default:
            break;
        }
      }
    }
    window.addEventListener('keydown', keydownListener);
    return () => {
      window.removeEventListener('keydown', keydownListener);
    };
  }, [onCopy, onCut, onPaste, onUndo]);
}
