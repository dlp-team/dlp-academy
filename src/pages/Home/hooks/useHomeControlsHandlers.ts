// src/pages/Home/hooks/useHomeControlsHandlers.js
import { useCallback } from 'react';

export const HOME_VIEW_MODES = [
    { id: 'grid', label: 'Manual' },
    { id: 'usage', label: 'Uso' },
    { id: 'courses', label: 'Cursos' },
    { id: 'shared', label: 'Compartido' },
    { id: 'bin', label: 'Papelera' }
];

const useHomeControlsHandlers = ({
    setViewMode,
    setSelectedTags,
    setShowOnlyCurrentSubjects,
    setCoursesAcademicYearFilter,
    setSubjectPeriodFilter,
    setCollapsedGroups,
    setCurrentFolder,
    setLayoutMode,
    setCardScale,
    onPreferenceChange
}: any) => {
    const handleViewModeChange = useCallback((mode: any) => {
        setViewMode(mode);
        setSelectedTags([]);
        setCollapsedGroups({});
        setCurrentFolder(null);
        if (onPreferenceChange) {
            onPreferenceChange('viewMode', mode);
        }
    }, [setViewMode, setSelectedTags, setCollapsedGroups, setCurrentFolder, onPreferenceChange]);

    const handleLayoutModeChange = useCallback((mode: any) => {
        setLayoutMode(mode);
        if (onPreferenceChange) {
            onPreferenceChange('layoutMode', mode);
        }
    }, [setLayoutMode, onPreferenceChange]);

    const handleCardScaleChange = useCallback((scale: any) => {
        setCardScale(scale);
        if (onPreferenceChange) {
            onPreferenceChange('cardScale', scale);
        }
    }, [setCardScale, onPreferenceChange]);

    const handleTagsChange = useCallback((tags: any) => {
        setSelectedTags(tags);
        if (onPreferenceChange) {
            onPreferenceChange('selectedTags', tags);
        }
    }, [setSelectedTags, onPreferenceChange]);

    const handleCoursesAcademicYearFilterChange = useCallback((nextFilter: any) => {
        setCoursesAcademicYearFilter(nextFilter);
        if (onPreferenceChange) {
            onPreferenceChange('coursesAcademicYearFilter', nextFilter);
        }
    }, [setCoursesAcademicYearFilter, onPreferenceChange]);

    const handleSubjectPeriodFilterChange = useCallback((nextValue: string) => {
        setSubjectPeriodFilter(nextValue);
        if (onPreferenceChange) {
            onPreferenceChange('subjectPeriodFilter', nextValue);
        }
    }, [setSubjectPeriodFilter, onPreferenceChange]);

    const handleShowOnlyCurrentSubjectsChange = useCallback((enabled: boolean) => {
        setShowOnlyCurrentSubjects(enabled);
        if (onPreferenceChange) {
            onPreferenceChange('showOnlyCurrentSubjects', enabled);
        }
    }, [setShowOnlyCurrentSubjects, onPreferenceChange]);

    return {
        handleViewModeChange,
        handleLayoutModeChange,
        handleCardScaleChange,
        handleTagsChange,
        handleCoursesAcademicYearFilterChange,
        handleSubjectPeriodFilterChange,
        handleShowOnlyCurrentSubjectsChange
    };
};

export default useHomeControlsHandlers;