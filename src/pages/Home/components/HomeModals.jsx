// src/pages/Home/components/HomeModals.jsx
import React from 'react';
import SubjectFormModal from '../../Subject/modals/SubjectFormModal'; // Check path
import FolderManager from './FolderManager';
import HomeDeleteConfirmModal from './HomeDeleteConfirmModal';
import FolderDeleteModal from '../../../components/modals/FolderDeleteModal';

const HomeModals = ({
    subjectModalConfig, setSubjectModalConfig,
    folderModalConfig, setFolderModalConfig,
    deleteConfig, setDeleteConfig,
    handleSaveSubject,
    handleSaveFolder,
    onShare,
    onUnshare,
    handleDelete,
    handleDeleteFolderAll,
    handleDeleteFolderOnly,
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
            
            {deleteConfig.type === 'folder' ? (
                <FolderDeleteModal
                    isOpen={deleteConfig.isOpen}
                    folderName={deleteConfig.item?.name || ''}
                    itemCount={(deleteConfig.item?.subjectIds?.length || 0) + (deleteConfig.item?.folderIds?.length || 0)}
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