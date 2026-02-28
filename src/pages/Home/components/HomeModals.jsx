// src/pages/Home/components/HomeModals.jsx
import React from 'react';
import SubjectFormModal from '../../Subject/modals/SubjectFormModal'; // Check path
import FolderManager from './FolderManager';
import HomeDeleteConfirmModal from './HomeDeleteConfirmModal';
import FolderDeleteModal from '../../../components/modals/FolderDeleteModal';

const HomeModals = ({
    user,
    subjectModalConfig, setSubjectModalConfig,
    folderModalConfig, setFolderModalConfig,
    deleteConfig, setDeleteConfig,
    handleSaveSubject,
    handleSaveFolder,
    onShare,
    onUnshare,
    onDeleteShortcut,
    handleDelete,
    handleDeleteFolderAll,
    handleDeleteFolderOnly,
    onShareSubject,
    onUnshareSubject,
    currentFolder = null,
    allFolders = [],
    subjects = []
}) => {
    // Calculate subject count in folder dynamically from subjects array
    const getSubjectCountInFolder = (folderId) => {
        return subjects.filter(s => s.folderId === folderId).length;
    };
    return (
        <>
            <SubjectFormModal 
                isOpen={subjectModalConfig.isOpen}
                isEditing={subjectModalConfig.isEditing}
                initialData={subjectModalConfig.data}
                user={user}
                allFolders={allFolders}
                onClose={() => setSubjectModalConfig({ ...subjectModalConfig, isOpen: false })}
                onSave={handleSaveSubject}
                onShare={onShareSubject}
                onUnshare={onUnshareSubject}
                onDeleteShortcut={onDeleteShortcut}
                initialTab={subjectModalConfig.initialTab || 'general'}
            />

            <FolderManager
                isOpen={folderModalConfig.isOpen}
                onClose={() => setFolderModalConfig({ ...folderModalConfig, isOpen: false })}
                onSave={handleSaveFolder}
                initialData={folderModalConfig.data}
                isEditing={folderModalConfig.isEditing}
                user={user}
                onShare={onShare}
                onUnshare={onUnshare}
                onDeleteShortcut={onDeleteShortcut}
                currentFolder={folderModalConfig.currentFolder || currentFolder}
                allFolders={allFolders}
                initialTab={folderModalConfig.initialTab || 'general'}
            />
            
            {deleteConfig.type === 'folder' ? (
                <FolderDeleteModal
                    isOpen={deleteConfig.isOpen}
                    folderName={deleteConfig.item?.name || ''}
                    itemCount={getSubjectCountInFolder(deleteConfig.item?.id)}
                    onClose={() => setDeleteConfig({ isOpen: false, type: null, item: null })}
                    onDeleteAll={handleDeleteFolderAll}
                    onDeleteFolderOnly={handleDeleteFolderOnly}
                />
            ) : (
                <HomeDeleteConfirmModal
                    deleteConfig={deleteConfig}
                    setDeleteConfig={setDeleteConfig}
                    handleDelete={handleDelete}
                />
            )}
        </>
    );
};

export default HomeModals;