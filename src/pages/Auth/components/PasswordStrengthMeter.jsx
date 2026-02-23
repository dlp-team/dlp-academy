// src/pages/Auth/components/PasswordStrengthMeter.jsx
import React from 'react';

const PasswordStrengthMeter = ({ strength }) => {
    const getStrengthLabel = () => {
        switch (strength) {
            case 0: return 'Muy débil';
            case 1: return 'Débil';
            case 2: return 'Media';
            case 3: return 'Fuerte';
            case 4: return 'Muy fuerte';
            default: return '';
        }
    };

    const getStrengthColor = (index) => {
        if (strength > index) {
            if (strength <= 1) return 'bg-red-500';
            if (strength === 2) return 'bg-yellow-500';
            if (strength === 3) return 'bg-blue-500';
            return 'bg-green-500';
        }
        return 'bg-gray-200';
    };

    return (
        <div className="mt-2 mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Seguridad</span>
                <span>{getStrengthLabel()}</span>
            </div>
            <div className="flex gap-1 h-1">
                {[0, 1, 2, 3].map((index) => (
                    <div 
                        key={index} 
                        className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(index)}`} 
                    />
                ))}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;