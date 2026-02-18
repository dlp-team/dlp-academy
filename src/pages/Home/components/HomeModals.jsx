// src/components/home/HomeModals.jsx
import React from 'react';
import SubjectFormModal from '../../Subject/modals/SubjectFormModal'; // Check path
import FolderManager from './FolderManager';
import HomeDeleteConfirmModal from './HomeDeleteConfirmModal';

const HomeModals = ({
    subjectModalConfig, setSubjectModalConfig,
    folderModalConfig, setFolderModalConfig,
    deleteConfig, setDeleteConfig,
    handleSaveSubject,
    handleSaveFolder,
    onShare,
    onUnshare,
    handleDelete,
    onShareSubject,
    onUnshareSubject,
    currentFolder = null,
    allFolders = []
}) => {
    return (
        <>
            <SubjectFormModal 
                isOpen={subjectModalConfig.isOpen}
                isEditing={subjectModalConfig.isEditing}
                initialData={subjectModalConfig.data}
                onClose={() => setSubjectModalConfig({ ...subjectModalConfig, isOpen: false })}
                onSave={handleSaveSubject}
                onShare={onShareSubject}
                onUnshare={onUnshareSubject}
                initialTab={subjectModalConfig.initialTab || 'general'}
            />

            <FolderManager
                isOpen={folderModalConfig.isOpen}
                onClose={() => setFolderModalConfig({ ...folderModalConfig, isOpen: false })}
                onSave={handleSaveFolder}
                initialData={folderModalConfig.data}
                isEditing={folderModalConfig.isEditing}
                onShare={onShare}
                onUnshare={onUnshare}
                currentFolder={folderModalConfig.currentFolder || currentFolder}
                allFolders={allFolders}
                initialTab={folderModalConfig.initialTab || 'general'}
            />
            <HomeDeleteConfirmModal
                deleteConfig={deleteConfig}
                setDeleteConfig={setDeleteConfig}
                handleDelete={handleDelete}
            />
        </>
    );
};

export default HomeModals;