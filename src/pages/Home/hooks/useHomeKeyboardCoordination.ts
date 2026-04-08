// src/pages/Home/hooks/useHomeKeyboardCoordination.ts
import { useHomeKeyboardShortcuts } from './useHomeKeyboardShortcuts';

type HomeKeyboardCoordinationParams = {
    user: any;
    logic: any;
};

export const useHomeKeyboardCoordination = ({ user, logic }: HomeKeyboardCoordinationParams) => {
    const {
        handleCardFocus,
        shortcutFeedback,
        getCardVisualState,
        registerUndoAction,
        undoToast,
        undoLatestActionFromToast,
        clearUndoToast
    } = useHomeKeyboardShortcuts({
        user,
        logic
    });

    return {
        handleCardFocus,
        shortcutFeedback,
        getCardVisualState,
        registerUndoAction,
        shortcutUndoToast: undoToast,
        undoLatestShortcutAction: undoLatestActionFromToast,
        clearShortcutUndoToast: clearUndoToast
    };
};
