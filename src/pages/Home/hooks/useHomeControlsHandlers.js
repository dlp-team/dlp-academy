import { useCallback } from 'react';

export const HOME_VIEW_MODES = [
    { id: 'grid', label: 'Manual' },
    { id: 'usage', label: 'Uso' },
    { id: 'courses', label: 'Cursos' },
    { id: 'shared', label: 'Compartido' }
];

const useHomeControlsHandlers = ({
    setViewMode,
    setSelectedTags,
    setCollapsedGroups,
    setCurrentFolder,
    setLayoutMode,
    setCardScale,
    onPreferenceChange
}) => {
    const handleViewModeChange = useCallback((mode) => {
        setViewMode(mode);
        setSelectedTags([]);
        setCollapsedGroups({});
        setCurrentFolder(null);
        if (onPreferenceChange) {
            onPreferenceChange('viewMode', mode);
        }
    }, [setViewMode, setSelectedTags, setCollapsedGroups, setCurrentFolder, onPreferenceChange]);

    const handleLayoutModeChange = useCallback((mode) => {
        setLayoutMode(mode);
        if (onPreferenceChange) {
            onPreferenceChange('layoutMode', mode);
        }
    }, [setLayoutMode, onPreferenceChange]);

    const handleCardScaleChange = useCallback((scale) => {
        setCardScale(scale);
        if (onPreferenceChange) {
            onPreferenceChange('cardScale', scale);
        }
    }, [setCardScale, onPreferenceChange]);

    const handleTagsChange = useCallback((tags) => {
        setSelectedTags(tags);
        if (onPreferenceChange) {
            onPreferenceChange('selectedTags', tags);
        }
    }, [setSelectedTags, onPreferenceChange]);

    return {
        handleViewModeChange,
        handleLayoutModeChange,
        handleCardScaleChange,
        handleTagsChange
    };
};

export default useHomeControlsHandlers;