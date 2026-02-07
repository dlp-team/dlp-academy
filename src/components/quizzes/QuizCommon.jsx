// src/components/quizzes/QuizCommon.jsx
import React, { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export const RenderLatex = ({ text }) => {
    if (!text) return null;
    if (typeof text !== 'string') return text;
    const parts = text.split('$');
    return (
        <span>
            {parts.map((part, index) => (
                index % 2 === 0 ? <span key={index}>{part}</span> : <InlineMath key={index} math={part} />
            ))}
        </span>
    );
};

export const ConfettiEffect = ({ triggerKey, accentColor = '#4f46e5' }) => {
    if (!triggerKey) return null;
    
    // Simple visual confetti blocks (logic copied from original file concept)
    const pieces = useMemo(() => Array.from({ length: 40 }).map((_, i) => {
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 2;
        const bg = Math.random() > 0.5 ? accentColor : '#fbbf24'; // Accent or Amber
        return (
            <div 
                key={i}
                className="fixed top-0 w-3 h-3 rounded-full animate-ping opacity-0"
                style={{ 
                    left: `${left}%`, 
                    backgroundColor: bg,
                    animation: `fall 3s linear ${animationDelay}s forwards`
                }} 
            />
        );
    }), [triggerKey, accentColor]);

    return <div className="fixed inset-0 pointer-events-none z-50">{pieces}</div>;
};