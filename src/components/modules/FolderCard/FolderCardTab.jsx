// src/components/modules/FolderCard/FolderCardTab.jsx
import React from 'react';

const FolderCardTab = ({ isModern, gradientClass, scaleMultiplier, isOrphan = false }) => {
    return (
        <div 
            className={`absolute top-0 left-0 rounded-t-xl z-0 transition-all ${
                isModern 
                    ? `bg-gradient-to-br ${gradientClass}` 
                    : `bg-gradient-to-br ${gradientClass} opacity-90`
            } ${isOrphan ? 'saturate-50 brightness-95' : ''}`}
            style={{ 
                width: '40%',
                height: `${21 * scaleMultiplier}px`,
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
            }}
        >
            {/* Inner shadow for depth */}
            <div className="absolute inset-0 bg-black/10 rounded-t-xl"></div>
        </div>
    );
};

export default FolderCardTab;