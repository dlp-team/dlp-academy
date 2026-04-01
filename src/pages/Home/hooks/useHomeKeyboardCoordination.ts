// src/pages/Home/hooks/useHomeKeyboardCoordination.ts
import { useHomeKeyboardShortcuts } from './useHomeKeyboardShortcuts';

type HomeKeyboardCoordinationParams = {
    user: any;
    logic: any;
};

export const useHomeKeyboardCoordination = ({ user, logic }: HomeKeyboardCoordinationParams) => {
    const { handleCardFocus, shortcutFeedback, getCardVisualState } = useHomeKeyboardShortcuts({
        user,
        logic
    });

    return {
        handleCardFocus,
        shortcutFeedback,
        getCardVisualState
    };
};
