// src/components/modules/QuizEngine/useConfetti.js
import { useCallback, useState } from 'react';

const CONFETTI_RESET_DELAY_MS = 2500;

export const useConfetti = () => {
    const [confettiTrigger, setConfettiTrigger] = useState(0);

    const triggerConfetti = useCallback(() => {
        setConfettiTrigger((prev) => prev + 1);
        setTimeout(() => setConfettiTrigger(0), CONFETTI_RESET_DELAY_MS);
    }, []);

    return { confettiTrigger, triggerConfetti };
};
