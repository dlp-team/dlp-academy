// src/components/ui/SubjectIcon.jsx
import React from 'react';
import { ICON_MAP } from '../../utils/subjectConstants';
import { BookOpen } from 'lucide-react';

const SubjectIcon = ({ iconName, className = "w-6 h-6", ...props }) => {
    const IconComponent = ICON_MAP[iconName] || BookOpen;
    return <IconComponent className={className} {...props} />;
};


export const getIconColor = (gradientString) => {
    if (!gradientString) return 'text-gray-900';
    // Finds 'to-blue-600' and converts it to 'text-blue-600'
    const toColor = gradientString.split(' ').find(c => c.startsWith('to-'));
    // Fallback to 'from-' if 'to-' is missing, or default color
    return toColor ? toColor.replace('to-', 'text-') : 'text-gray-900';
};

export default SubjectIcon;