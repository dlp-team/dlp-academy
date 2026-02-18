// src/pages/Subject/hooks/useTopicGridDnD.js
const useTopicGridDnD = (onReorderTopics) => {
    // 1. Prepare data when dragging starts
    const handleDragStart = (e, topicId) => {
        e.dataTransfer.setData("text/plain", topicId);
        e.dataTransfer.effectAllowed = "move";
    };

    // 2. Allow dropping
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    // 3. Handle the drop (Swap logic)
    const handleDrop = (e, targetTopicId) => {
        e.preventDefault();
        const sourceTopicId = e.dataTransfer.getData("text/plain");

        if (sourceTopicId && sourceTopicId !== targetTopicId) {
            if (onReorderTopics) {
                onReorderTopics(sourceTopicId, targetTopicId);
            }
        }
    };

    return {
        handleDragStart,
        handleDragOver,
        handleDrop
    };
};

export default useTopicGridDnD;
