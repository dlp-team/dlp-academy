const HOME_LAST_VIEW_KEY = 'dlp_last_viewMode';
const HOME_LAST_FOLDER_KEY = 'dlp_last_folderId';

export const loadLastHomeViewMode = () => {
    try {
        return localStorage.getItem(HOME_LAST_VIEW_KEY);
    } catch {
        return null;
    }
};

export const saveLastHomeViewMode = (mode) => {
    if (!mode) return;
    try {
        localStorage.setItem(HOME_LAST_VIEW_KEY, mode);
    } catch {
        return undefined;
    }
};

export const loadLastHomeFolderId = () => {
    try {
        return localStorage.getItem(HOME_LAST_FOLDER_KEY);
    } catch {
        return null;
    }
};

export const saveLastHomeFolderId = (folderId) => {
    if (!folderId) return;
    try {
        localStorage.setItem(HOME_LAST_FOLDER_KEY, folderId);
    } catch {
        return undefined;
    }
};

export const clearLastHomeFolderId = () => {
    try {
        localStorage.removeItem(HOME_LAST_FOLDER_KEY);
    } catch {
        return undefined;
    }
};

export const clearHomePersistence = () => {
    try {
        localStorage.removeItem(HOME_LAST_VIEW_KEY);
        localStorage.removeItem(HOME_LAST_FOLDER_KEY);
    } catch {
        return undefined;
    }
};
