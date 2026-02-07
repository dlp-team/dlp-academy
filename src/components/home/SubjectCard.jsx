// src/components/home/SubjectCard.jsx
import React from 'react';
import { useSubjectCardLogic } from '../../hooks/useSubjectCardLogic'; // Adjust path
import SubjectCardFront from './SubjectCardFront';
import SubjectCardBack from './SubjectCardBack';

const SubjectCard = (props) => {
    // 1. Initialize Logic
    const { 
        topicCount, 
        isModern, 
        fillColor, 
        scaleMultiplier, 
        handlers 
    } = useSubjectCardLogic(props);

    const { 
        subject, 
        isFlipped, 
        onFlip, 
        onSelect, 
        onSelectTopic, 
        activeMenu, 
        onToggleMenu, 
        onEdit, 
        onDelete,
        draggable = false,
        isDragging = false
    } = props;

    return (
        /* ORIGINAL RECTANGLE PROPORTIONS: w-64 h-64 makes it SQUARE
           Changed to: w-full with aspect-[16/9] to make it RECTANGLE (wider than tall) */
        <div 
            className={`group relative w-full rounded-2xl shadow-lg dark:shadow-slate-900/50 transition-all ${
                isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
            } ${
                isModern 
                    ? `bg-gradient-to-br ${subject.color} p-[3px]` 
                    : ''
            }`}
            style={{ aspectRatio: '16 / 10' }}
            draggable={draggable && !isFlipped}
            onDragStart={handlers.handleDragStart}
            onDragEnd={handlers.handleDragEnd}
            onDragOver={handlers.handleDragOver}
            onDrop={handlers.handleDrop}
        >
            
            {/* INNER CONTENT */}
            <div className={`h-full w-full rounded-xl overflow-hidden relative ${
                isModern 
                    ? 'bg-white dark:bg-slate-950' 
                    : ''
            }`}>
                
                {/* --- FRONT --- */}
                {!isFlipped && (
                    <SubjectCardFront 
                        subject={subject}
                        onSelect={onSelect}
                        onFlip={onFlip}
                        activeMenu={activeMenu}
                        onToggleMenu={onToggleMenu}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isModern={isModern}
                        fillColor={fillColor}
                        scaleMultiplier={scaleMultiplier}
                        topicCount={topicCount}
                    />
                )}

                {/* --- BACK --- */}
                {isFlipped && (
                    <SubjectCardBack 
                        subject={subject}
                        onFlip={onFlip}
                        onSelectTopic={onSelectTopic}
                        onSelect={onSelect}
                        scaleMultiplier={scaleMultiplier}
                        topicCount={topicCount}
                    />
                )}
            </div>
        </div>
    );
};

export default SubjectCard;