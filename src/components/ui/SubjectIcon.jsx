// src/components/ui/SubjectIcon.jsx
import React from 'react';
import { ICON_MAP } from '../../utils/subjectConstants';
import { BookOpen } from 'lucide-react';

const SubjectIcon = ({ iconName, className = "w-6 h-6", ...props }) => {
    const IconComponent = ICON_MAP[iconName] || BookOpen;
    return <IconComponent className={className} {...props} />;
};



export default SubjectIcon;