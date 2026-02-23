// src/pages/Subject/hooks/useSubjectPageState.js
import { useState, useMemo, useEffect } from 'react';

const useSubjectPageState = (topics) => {
    // UI State
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showEditTopicModal, setShowEditTopicModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [retryTopicData, setRetryTopicData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtered Topics
    const filteredTopics = useMemo(() => {
        if (!searchTerm) return topics;
        const term = searchTerm.toLowerCase();
        return topics.filter(topic =>
            topic.name?.toLowerCase().includes(term) ||
            topic.number?.toString().toLowerCase().includes(term)
        );
    }, [topics, searchTerm]);

    // Scroll Lock
    useEffect(() => {
        document.body.style.overflow = (showEditModal || showDeleteModal || showTopicModal || showEditTopicModal) ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showEditModal, showDeleteModal, showTopicModal, showEditTopicModal]);

    return {
        // Modal state
        showEditModal,
        setShowEditModal,
        showDeleteModal,
        setShowDeleteModal,
        showTopicModal,
        setShowTopicModal,
        showEditTopicModal,
        setShowEditTopicModal,
        editingTopic,
        setEditingTopic,
        // Form state
        retryTopicData,
        setRetryTopicData,
        isDeleting,
        setIsDeleting,
        isReordering,
        setIsReordering,
        searchTerm,
        setSearchTerm,
        // Computed
        filteredTopics
    };
};

export default useSubjectPageState;
