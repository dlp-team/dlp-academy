// src/pages/Home/hooks/useHomeState.js
import { useEffect, useMemo, useState } from 'react';
import { normalizeText } from '../../../utils/stringUtils';
import { useShortcuts } from '../../../hooks/useShortcuts';

export const useHomeState = ({ user, searchQuery = '', subjects, folders, preferences, loadingPreferences }) => {
    // Fetch user's shortcuts
    const { resolvedShortcuts, loading: loadingShortcuts } = useShortcuts(user);
    const [viewMode, setViewMode] = useState(preferences?.viewMode || 'grid');
    const [layoutMode, setLayoutMode] = useState(preferences?.layoutMode || 'grid');
    const [cardScale, setCardScale] = useState(preferences?.cardScale || 100);
    const [selectedTags, setSelectedTags] = useState(preferences?.selectedTags || []);
    const [flippedSubjectId, setFlippedSubjectId] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [currentFolder, setCurrentFolder] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedItemType, setDraggedItemType] = useState(null);
    const [dropPosition, setDropPosition] = useState(null);

    const [manualOrder, setManualOrder] = useState({ subjects: [], folders: [] });

    const [subjectModalConfig, setSubjectModalConfig] = useState({ isOpen: false, isEditing: false, data: null });
    const [folderModalConfig, setFolderModalConfig] = useState({ isOpen: false, isEditing: false, data: null });
    const [deleteConfig, setDeleteConfig] = useState({ isOpen: false, type: null, item: null });

    const debugVisibility = (stage, payload = {}) => {
        console.info('[VISIBILITY_DEBUG][home-state]', {
            ts: new Date().toISOString(),
            stage,
            userUid: user?.uid || null,
            currentFolderId: currentFolder?.id || null,
            viewMode,
            ...payload
        });
    };

    useEffect(() => {
        if (!folders || folders.length === 0) {
            return;
        }
        const lastFolderId = localStorage.getItem('dlp_last_folderId');
        if (lastFolderId) {
            const folder = folders.find(f => f.id === lastFolderId);
            if (folder && (!currentFolder || currentFolder.id !== folder.id)) {
                setCurrentFolder(folder);
            } else if (!folder && currentFolder) {
                setCurrentFolder(null);
            }
        } else if (currentFolder) {
            setCurrentFolder(null);
        }
    }, [folders]);

    const filteredFolders = useMemo(() => {
        if (!folders) return [];

        const query = searchQuery?.trim();
        const hasQuery = Boolean(query && query.length > 0);
        const normalizedQuery = hasQuery ? normalizeText(query) : '';

        return folders.filter(folder => {
            // Show only direct children of current folder (not descendants)
            const inScope = currentFolder
                ? folder.parentId === currentFolder.id
                : !folder.parentId;

            if (!inScope) return false;
            if (!hasQuery) return true;

            return normalizeText(folder.name).includes(normalizedQuery);
        });
    }, [folders, currentFolder, searchQuery]);

    // Merge shortcuts with folders (deduplication by targetId)
    const foldersWithShortcuts = useMemo(() => {
        if (!resolvedShortcuts || resolvedShortcuts.length === 0) return filteredFolders;

        // Get folder shortcuts that match current scope
        const folderShortcuts = resolvedShortcuts.filter(s => {
            if (s.targetType !== 'folder') return false;
            
            // Check if shortcut belongs in current scope (direct children only)
            const inScope = currentFolder
                ? s.parentId === currentFolder.id
                : !s.parentId;
            
            return inScope;
        });

        const shortcutTargetIds = new Set(folderShortcuts.map(s => s.targetId));

        const directFolders = filteredFolders.filter(folder => {
            const isOwnedByCurrentUser =
                (folder?.uid && user?.uid && folder.uid === user.uid) ||
                folder?.isOwner === true ||
                (folder?.ownerId && user?.uid && folder.ownerId === user.uid);

            if (!isOwnedByCurrentUser) return false;
            if (!shortcutTargetIds.has(folder.id)) return true;
            return true;
        });

        // Deduplicate with shortcut priority for non-owners
        const seen = new Set();
        const merged = [];

        folderShortcuts.forEach(shortcut => {
            const key = `folder:${shortcut.targetId}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(shortcut);
            }
        });

        directFolders.forEach(folder => {
            const key = `folder:${folder.id}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(folder);
            }
        });

        return merged;
    }, [filteredFolders, resolvedShortcuts, currentFolder, user]);

    const filteredSubjects = useMemo(() => {
        if (!subjects) return [];

        const query = searchQuery?.trim();
        const hasQuery = Boolean(query && query.length > 0);
        const normalizedQuery = hasQuery ? normalizeText(query) : '';

        return subjects.filter(subject => {
            const inScope = currentFolder
                ? subject.folderId === currentFolder.id
                : !subject.folderId;

            if (!inScope) return false;
            if (!hasQuery) return true;

            return normalizeText(subject.name).includes(normalizedQuery);
        });
    }, [subjects, currentFolder, searchQuery]);

    // Merge shortcuts with subjects (deduplication by targetId)
    const subjectsWithShortcuts = useMemo(() => {
        if (!resolvedShortcuts || resolvedShortcuts.length === 0) return filteredSubjects;

        // Get subject shortcuts that match current scope
        const subjectShortcuts = resolvedShortcuts.filter(s => {
            if (s.targetType !== 'subject') return false;
            
            // For subjects, use shortcutParentId (where the shortcut lives - direct children only)
            const inScope = currentFolder
                ? s.shortcutParentId === currentFolder.id
                : !s.shortcutParentId;
            
            return inScope;
        });

        const shortcutTargetIds = new Set(subjectShortcuts.map(s => s.targetId));

        const directSubjects = filteredSubjects.filter(subject => {
            const isOwnedByCurrentUser =
                (subject?.uid && user?.uid && subject.uid === user.uid) ||
                subject?.isOwner === true ||
                (subject?.ownerId && user?.uid && subject.ownerId === user.uid);

            if (!isOwnedByCurrentUser) return false;
            if (!shortcutTargetIds.has(subject.id)) return true;
            return true;
        });

        // Deduplicate with shortcut priority for non-owners
        const seen = new Set();
        const merged = [];

        subjectShortcuts.forEach(shortcut => {
            const key = `subject:${shortcut.targetId}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(shortcut);
            }
        });

        directSubjects.forEach(subject => {
            const key = `subject:${subject.id}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(subject);
            }
        });

        return merged;
    }, [filteredSubjects, resolvedShortcuts, currentFolder, user]);

    useEffect(() => {
        debugVisibility('merge_result', {
            resolvedShortcutsCount: Array.isArray(resolvedShortcuts) ? resolvedShortcuts.length : 0,
            filteredSubjectsCount: Array.isArray(filteredSubjects) ? filteredSubjects.length : 0,
            subjectsWithShortcutsCount: Array.isArray(subjectsWithShortcuts) ? subjectsWithShortcuts.length : 0,
            subjectIds: Array.isArray(subjectsWithShortcuts) ? subjectsWithShortcuts.map(s => s.id || s.shortcutId) : []
        });
    }, [resolvedShortcuts, filteredSubjects, subjectsWithShortcuts, currentFolder, viewMode]);

    const filteredSubjectsByTags = useMemo(() => {
        if (selectedTags.length === 0) return subjectsWithShortcuts;
        return subjectsWithShortcuts.filter(subject => selectedTags.every(tag => subject.tags?.includes(tag)));
    }, [subjectsWithShortcuts, selectedTags]);

    const filteredFoldersByTags = useMemo(() => {
        const source = Array.isArray(foldersWithShortcuts) ? foldersWithShortcuts : folders;
        if (selectedTags.length === 0) return source;
        return source.filter(folder => selectedTags.every(tag => folder.tags?.includes(tag)));
    }, [foldersWithShortcuts, folders, selectedTags]);

    const getUnfolderedSubjects = (subjectsList = subjects) => {
        // Subjects with no folderId (or null folderId) are unfoldered
        return subjectsList.filter(s => s.folderId === null || s.folderId === undefined);
    };

    const getSubjectsInFolder = (folderId, subjectsList = subjects) => {
        // Query subjects where folderId matches
        return subjectsList.filter(s => s.folderId === folderId);
    };

    const sharedFolders = useMemo(() => {
        const source = Array.isArray(foldersWithShortcuts) ? foldersWithShortcuts : folders;
        return source.filter(f => {
            if (f?.isShortcut === true) return true;
            return !f.isOwner;
        });
    }, [foldersWithShortcuts, folders]);

    const sharedSubjects = useMemo(() => {
        const source = Array.isArray(subjectsWithShortcuts) ? subjectsWithShortcuts : subjects;
        return source.filter(s => {
            if (s?.isShortcut === true) return true;
            const inSharedFolder = sharedFolders.some(f => s.folderId === f.id);
            return inSharedFolder || (s.uid !== user.uid && s.sharedWithUids?.includes(user.uid));
        });
    }, [subjectsWithShortcuts, subjects, sharedFolders, user]);

    const applyManualOrder = (items, type) => {
        if (viewMode !== 'grid') return items;

        const orderArray = type === 'subject' ? manualOrder.subjects : manualOrder.folders;
        if (orderArray.length === 0) return items;

        const ordered = [];
        const unordered = [...items];

        orderArray.forEach(id => {
            const index = unordered.findIndex(item => item.id === id);
            if (index !== -1) {
                ordered.push(unordered[index]);
                unordered.splice(index, 1);
            }
        });

        return [...ordered, ...unordered];
    };

    const orderedFolders = useMemo(() => {
        if (activeFilter === 'subjects') return [];

        const query = searchQuery?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (!query && (viewMode !== 'grid' || currentFolder)) return [];

        const sourceFolders = Array.isArray(foldersWithShortcuts) ? foldersWithShortcuts : folders;

        let resultFolders = sourceFolders.filter(f => {
            if (f?.isShortcut === true) return true;
            if (f?.isOwner === true) return true;
            if (f?.ownerId && user?.uid && f.ownerId === user.uid) return true;
            return Boolean(f?.sharedWithUids && f.sharedWithUids.includes(user?.uid));
        });

        if (query) {
            resultFolders = resultFolders.filter(f => {
                const folderName = (f.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return folderName.includes(query);
            });
        }

        if (selectedTags.length > 0) {
            const matchingSubjectsInFolders = filteredSubjectsByTags.filter(s => {
                const folderLocation = s?.isShortcut === true
                    ? (s.shortcutParentId ?? s.folderId ?? null)
                    : (s.folderId ?? null);
                return folderLocation !== null;
            });
            const folderIdsWithMatches = new Set(
                matchingSubjectsInFolders.map(s =>
                    s?.isShortcut === true
                        ? (s.shortcutParentId ?? s.folderId ?? null)
                        : (s.folderId ?? null)
                )
            );
            resultFolders = resultFolders.filter(f => folderIdsWithMatches.has(f.id));
        }

        return applyManualOrder(resultFolders, 'folder');
    }, [foldersWithShortcuts, folders, viewMode, currentFolder, manualOrder, selectedTags, filteredSubjectsByTags, searchQuery, activeFilter, user]);

    const groupedContent = useMemo(() => {
        if (activeFilter === 'folders') return {};

        const isRelated = item => item.uid === user?.uid || (item.sharedWithUids && item.sharedWithUids.includes(user?.uid));
        const isVisibleInManual = item => !(item?.isShortcut === true && item?.hiddenInManual === true);

        const query = searchQuery?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (query) {
            const matchedSubjects = subjectsWithShortcuts.filter(s => {
                const subjectName = (s.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return subjectName.includes(query) && isRelated(s) && (viewMode !== 'grid' || isVisibleInManual(s));
            });
            return { 'Resultados de búsqueda': matchedSubjects };
        }

        if (viewMode === 'grid' && selectedTags.length > 0) {
            return { Filtradas: applyManualOrder(filteredSubjectsByTags, 'subject') };
        }
        if (viewMode === 'grid' && currentFolder) {
            const folderSubjects = subjectsWithShortcuts.filter(isVisibleInManual);
            return {
                [currentFolder.name]: applyManualOrder(folderSubjects, 'subject')
            };
        }
        if (viewMode === 'grid' && !currentFolder) {
            const unfolderedSubjects = subjectsWithShortcuts.filter(isVisibleInManual);
            return {
                Todas: applyManualOrder(unfolderedSubjects, 'subject')
            };
        }

        if (viewMode === 'shared') {
            return {};
        }

        const sourceSubjects = selectedTags.length > 0 || viewMode === 'tags' ? filteredSubjectsByTags : subjectsWithShortcuts;
        const subjectsToGroup = sourceSubjects.filter(isRelated);

        if (viewMode === 'usage') {
            const sorted = [...subjectsToGroup].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
            return { Recientes: sorted };
        }

        if (viewMode === 'courses') {
            let currentEducationLevels = {
                Primaria: ['1º', '2º', '3º', '4º', '5º', '6º'],
                ESO: ['1º', '2º', '3º', '4º'],
                Bachillerato: ['1º', '2º'],
                FP: ['Grado Medio 1', 'Grado Medio 2', 'Grado Superior 1', 'Grado Superior 2'],
                Universidad: ['1º', '2º', '3º', '4º', '5º', '6º', 'Máster', 'Doctorado']
            };
            try {
                currentEducationLevels = require('../../../utils/subjectConstants').EDUCATION_LEVELS || currentEducationLevels;
            } catch (e) {}

            function parseCourse(course) {
                if (!course || course === null || course === undefined || course === '') return { group: null, year: null };
                for (const group of Object.keys(currentEducationLevels)) {
                    for (const year of currentEducationLevels[group]) {
                        if (
                            course === `${group} ${year}` ||
                            course === `${group} ${year.replace('º', '')}` ||
                            course === `${group} ${year.replace('º', 'º')}`
                        ) {
                            return { group, year };
                        }
                    }
                }
                if (course === 'FP') return { group: 'FP', year: '' };
                if (course === 'Universidad') return { group: 'Universidad', year: '' };
                return { group: course, year: '' };
            }

            const groupMap = {};
            const noCourse = [];
            subjectsToGroup.forEach(sub => {
                const { group, year } = parseCourse(sub.course);
                if (!group && !year) {
                    noCourse.push(sub);
                } else {
                    if (!groupMap[group]) groupMap[group] = {};
                    if (!groupMap[group][year]) groupMap[group][year] = [];
                    groupMap[group][year].push(sub);
                }
            });

            const sortedGroups = {};
            Object.keys(currentEducationLevels).forEach(group => {
                currentEducationLevels[group].forEach(year => {
                    const key = `${group} ${year}`;
                    if (groupMap[group] && groupMap[group][year]) {
                        sortedGroups[key] = groupMap[group][year]
                            .slice()
                            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    }
                });
            });
            Object.keys(groupMap).forEach(group => {
                Object.keys(groupMap[group]).forEach(year => {
                    const key = year ? `${group} ${year}` : group;
                    if (!sortedGroups[key]) {
                        sortedGroups[key] = groupMap[group][year]
                            .slice()
                            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    }
                });
            });
            if (noCourse.length > 0) {
                sortedGroups['Sin Curso'] = noCourse.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            }
            return sortedGroups;
        }

        if (viewMode === 'tags') {
            const groups = {};
            subjectsToGroup.forEach(sub => {
                if (sub.tags?.length > 0) {
                    sub.tags.forEach(tag => {
                        if (!groups[tag]) groups[tag] = [];
                        if (!groups[tag].find(s => s.id === sub.id)) {
                            groups[tag].push(sub);
                        }
                    });
                } else {
                    if (!groups['Sin Etiquetas']) groups['Sin Etiquetas'] = [];
                    groups['Sin Etiquetas'].push(sub);
                }
            });
            return Object.keys(groups)
                .sort()
                .reduce((obj, key) => {
                    obj[key] = groups[key];
                    return obj;
                }, {});
        }

        return { Todas: subjectsToGroup };
    }, [subjects, subjectsWithShortcuts, filteredSubjectsByTags, viewMode, currentFolder, folders, manualOrder, activeFilter, searchQuery]);

    const { searchFolders, searchSubjects } = useMemo(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            return { searchFolders: [], searchSubjects: [] };
        }

        const query = normalizeText(searchQuery);

        const isRelated = item => {
            if (item?.isShortcut === true) return true;
            if (item.isOwner === true) return true;
            if (user?.uid && item.uid === user.uid) return true;
            if (user?.uid && item.ownerId === user.uid) return true;
            if (item.sharedWithUids && Array.isArray(item.sharedWithUids) && user?.uid) {
                return item.sharedWithUids.includes(user.uid);
            }
            return false;
        };

        const sourceFolders = Array.isArray(foldersWithShortcuts) ? foldersWithShortcuts : folders;

        const sFolders = sourceFolders.filter(f => {
            if (!isRelated(f)) return false;
            if (!normalizeText(f.name).includes(query)) return false;

            if (!currentFolder) return true;
            const location = f.shortcutParentId !== undefined ? f.shortcutParentId : f.parentId;
            return location === currentFolder.id;
        });

        const sSubjects = subjectsWithShortcuts.filter(s => {
            if (!isRelated(s)) return false;
            if (!normalizeText(s.name).includes(query)) return false;

            if (!currentFolder) return true;
            const location = s.shortcutParentId !== undefined ? s.shortcutParentId : s.folderId;
            return location === currentFolder.id;
        });

        return { searchFolders: sFolders, searchSubjects: sSubjects };
    }, [foldersWithShortcuts, folders, subjectsWithShortcuts, searchQuery, user, currentFolder]);

    useEffect(() => {
        const closeMenu = () => setActiveMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const allTags = useMemo(() => {
        const tagSet = new Set();
        subjects.forEach(s => s.tags?.forEach(t => tagSet.add(t)));
        folders.forEach(f => f.tags?.forEach(t => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }, [subjects, folders]);

    useEffect(() => {
        if (preferences && !loadingPreferences) {
            setViewMode(prev => prev || preferences.viewMode || 'grid');
            setLayoutMode(preferences.layoutMode || 'grid');
            setCardScale(preferences.cardScale || 100);
            setSelectedTags(preferences.selectedTags || []);
        }
    }, [preferences, loadingPreferences]);

    const isDragAndDropEnabled = viewMode === 'grid' && layoutMode === 'grid';

    return {
        viewMode,
        setViewMode,
        layoutMode,
        setLayoutMode,
        cardScale,
        setCardScale,
        flippedSubjectId,
        setFlippedSubjectId,
        activeMenu,
        setActiveMenu,
        collapsedGroups,
        setCollapsedGroups,
        selectedTags,
        setSelectedTags,
        currentFolder,
        setCurrentFolder,
        activeFilter,
        setActiveFilter,
        draggedItem,
        setDraggedItem,
        draggedItemType,
        setDraggedItemType,
        dropPosition,
        setDropPosition,
        manualOrder,
        setManualOrder,
        subjectModalConfig,
        setSubjectModalConfig,
        folderModalConfig,
        setFolderModalConfig,
        deleteConfig,
        setDeleteConfig,
        groupedContent,
        orderedFolders,
        allTags,
        filteredFoldersByTags,
        filteredFolders: foldersWithShortcuts,
        filteredSubjects: subjectsWithShortcuts,
        searchFolders,
        searchSubjects,
        sharedFolders,
        sharedSubjects,
        filteredSubjectsByTags,
        isDragAndDropEnabled,
        shortcuts: resolvedShortcuts || [],
        loadingShortcuts
    };
};
