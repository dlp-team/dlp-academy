// src/components/modules/FolderCard/FolderCardTab.jsx
import React from 'react';

const FolderCardTab = ({ isModern, gradientClass, scaleMultiplier, isOrphan = false }) => {
    return (
        <div 
            className={`absolute top-0 left-0 rounded-t-xl z-0 transition-all ${
                isModern 
                    ? `bg-gradient-to-br ${gradientClass}` 
                    : `bg-gradient-to-br ${gradientClass} opacity-90`
            } ${isOrphan ? 'saturate-[0.18] grayscale-[0.55] brightness-[0.92]' : ''}`}
            style={{ 
                width: '40%',
                height: `${21 * scaleMultiplier}px`,
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
            }}
        />
    );
};

export default FolderCardTab;