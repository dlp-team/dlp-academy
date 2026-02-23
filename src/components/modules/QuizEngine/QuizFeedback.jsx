// src/components/modules/QuizEngine/QuizFeedback.jsx
import React, { useMemo, useState, useCallback } from 'react';
import { CONFETTI_COUNT, CONFETTI_DURATION } from './QuizCommon';

const ConfettiEffect = React.memo(({ triggerKey, accentColor = '#4f46e5' }) => {
    const pieces = useMemo(() => {
        if (!triggerKey) return [];
        
        return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
            const angle = Math.random() * 360;
            const velocity = 100 + Math.random() * 150;
            const tx = Math.cos(angle * Math.PI / 180) * velocity;
            const ty = (Math.sin(angle * Math.PI / 180) * velocity) - 100;
            
            const colors = ['#FBBF24', '#F59E0B', accentColor, '#EC4899', '#8B5CF6'];
            
            return {
                id: i,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 10 + 4,
                tx: `${tx}px`,
                ty: `${ty}px`,
                rot: `${Math.random() * 720}deg`,
                delay: `${Math.random() * 0.2}s`,
                duration: `${1 + Math.random() * 0.8}s`
            };
        });
    }, [triggerKey, accentColor]);

    if (!triggerKey) return null;

    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
                {pieces.map(piece => (
                    <div 
                        key={piece.id} 
                        className="absolute rounded-full animate-burst shadow-lg"
                        style={{
                            backgroundColor: piece.color,
                            width: piece.size,
                            height: piece.size,
                            '--tx': piece.tx,
                            '--ty': piece.ty,
                            '--rot': piece.rot,
                            animationDuration: piece.duration,
                            animationDelay: piece.delay,
                            left: '50%',
                            top: '40%'
                        }}
                    />
                ))}
            </div>
            <style>{`
                @keyframes burst {
                    0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(0); opacity: 0; }
                }
                .animate-burst { animation: burst cubic-bezier(0.25, 1, 0.5, 1) forwards; }
            `}</style>
        </>
    );
});
ConfettiEffect.displayName = 'ConfettiEffect';

export const useConfetti = () => {
    const [confettiTrigger, setConfettiTrigger] = useState(0);

    const triggerConfetti = useCallback(() => {
        setConfettiTrigger(prev => prev + 1);
        setTimeout(() => setConfettiTrigger(0), CONFETTI_DURATION);
    }, []);

    return { confettiTrigger, triggerConfetti };
};

export default ConfettiEffect;