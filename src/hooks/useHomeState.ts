// src/pages/Home/hooks/useHomeState.js
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizeText } from '../utils/stringUtils';
import { useShortcuts } from './useShortcuts';
import { getNormalizedRole, isShortcutItem, isOwnedByCurrentUser, isSharedWithCurrentUser } from '../utils/permissionUtils';
import { clearLastHomeFolderId, loadLastHomeFolderId } from '../pages/Home/utils/homePersistence';
import { EDUCATION_LEVELS } from '../utils/subjectConstants';
import { usePersistentState } from './usePersistentState';
import { buildUserScopedPersistenceKey } from '../utils/pagePersistence';
import { getAcademicYearStartYear, normalizeAcademicYear } from '../utils/academicYearLifecycleUtils';
import { isSubjectActiveInPeriodLifecycle, isSubjectVisibleByPostCoursePolicy } from '../utils/subjectPeriodLifecycleUtils';

const EMPTY_MANUAL_ORDER: { subjects: any[], folders: any[] } = { subjects: [], folders: [] };

const normalizeManualOrder = (value: any) => {
    const safeValue = value && typeof value === 'object' ? value : EMPTY_MANUAL_ORDER;
    return {
        subjects: Array.isArray(safeValue.subjects) ? safeValue.subjects.filter(Boolean) : [],
        folders: Array.isArray(safeValue.folders) ? safeValue.folders.filter(Boolean) : []
    };
};

const areManualOrdersEqual = (left, right: any) => {
    if (!left || !right) return false;
    if (left.subjects.length !== right.subjects.length) return false;
    if (left.folders.length !== right.folders.length) return false;

    for (let index = 0; index < left.subjects.length; index += 1) {
        if (left.subjects[index] !== right.subjects[index]) return false;
    }

    for (let index = 0; index < left.folders.length; index += 1) {
        if (left.folders[index] !== right.folders[index]) return false;
    }

    return true;
};

const EMPTY_COURSE_ACADEMIC_YEAR_FILTER = { startYear: '', endYear: '' };
const EMPTY_SUBJECT_PERIOD_FILTER = '';

const SUBJECT_PERIOD_TYPE_ORDER: Record<string, number> = {
    trimester: 1,
    cuatrimester: 2,
    custom: 3
};

const sortAcademicYearsDesc = (years: any[] = []) => {
    return [...years]
        .map((year) => normalizeAcademicYear(year))
        .filter(Boolean)
        .sort((left, right) => {
            const leftStart = getAcademicYearStartYear(left) || 0;
            const rightStart = getAcademicYearStartYear(right) || 0;
            return rightStart - leftStart;
        });
};

const areCourseAcademicYearFiltersEqual = (left: any, right: any) => {
    if (!left || !right) return false;
    return left.startYear === right.startYear && left.endYear === right.endYear;
};

const normalizeSubjectPeriodType = (value: any) => {
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (normalizedValue === 'trimester' || normalizedValue === 'cuatrimester' || normalizedValue === 'custom') {
        return normalizedValue;
    }

    return '';
};

const normalizeSubjectPeriodIndex = (value: any) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return null;

    const normalizedIndex = Math.trunc(numericValue);
    return normalizedIndex > 0 ? normalizedIndex : null;
};

const buildSubjectPeriodFilterValue = (periodType: any, periodIndex: any) => {
    const normalizedPeriodType = normalizeSubjectPeriodType(periodType);
    const normalizedPeriodIndex = normalizeSubjectPeriodIndex(periodIndex);
    if (!normalizedPeriodType || normalizedPeriodIndex === null) {
        return '';
    }

    return `${normalizedPeriodType}-${normalizedPeriodIndex}`;
};

const getSubjectPeriodFilterValue = (subject: any) => {
    if (!subject) return '';
    return buildSubjectPeriodFilterValue(subject?.periodType, subject?.periodIndex);
};

const buildSubjectPeriodLabel = ({ periodType, periodIndex, periodLabel }: any) => {
    const normalizedPeriodLabel = String(periodLabel || '').trim();
    if (normalizedPeriodLabel) {
        return normalizedPeriodLabel;
    }

    if (periodType === 'cuatrimester') {
        return `Cuatrimestre ${periodIndex}`;
    }

    if (periodType === 'custom') {
        return `Periodo ${periodIndex}`;
    }

    return `Trimestre ${periodIndex}`;
};

const sortSubjectPeriodOptions = (options: any[] = []) => {
    return [...options].sort((left: any, right: any) => {
        const leftTypeOrder = SUBJECT_PERIOD_TYPE_ORDER[left?.periodType] || 99;
        const rightTypeOrder = SUBJECT_PERIOD_TYPE_ORDER[right?.periodType] || 99;
        if (leftTypeOrder !== rightTypeOrder) {
            return leftTypeOrder - rightTypeOrder;
        }

        const leftPeriodIndex = normalizeSubjectPeriodIndex(left?.periodIndex) || 0;
        const rightPeriodIndex = normalizeSubjectPeriodIndex(right?.periodIndex) || 0;
        if (leftPeriodIndex !== rightPeriodIndex) {
            return leftPeriodIndex - rightPeriodIndex;
        }

        return String(left?.label || '').localeCompare(String(right?.label || ''));
    });
};

const normalizeSubjectPeriodFilter = (value: any, availableValues: any[] = []) => {
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (!normalizedValue) {
        return EMPTY_SUBJECT_PERIOD_FILTER;
    }

    if (!Array.isArray(availableValues) || availableValues.length === 0) {
        return normalizedValue;
    }

    const availableValueSet = new Set(
        availableValues
            .map((entry: any) => String(entry || '').trim().toLowerCase())
            .filter(Boolean)
    );

    return availableValueSet.has(normalizedValue)
        ? normalizedValue
        : EMPTY_SUBJECT_PERIOD_FILTER;
};

const doesSubjectMatchPeriodFilter = (subject: any, periodFilterValue: any) => {
    const normalizedFilterValue = normalizeSubjectPeriodFilter(periodFilterValue);
    if (!normalizedFilterValue) {
        return true;
    }

    return getSubjectPeriodFilterValue(subject) === normalizedFilterValue;
};

const normalizeCourseAcademicYearFilter = (value: any, availableAcademicYears: any[] = []) => {
    const safeValue = value && typeof value === 'object' ? value : EMPTY_COURSE_ACADEMIC_YEAR_FILTER;
    const availableYearsSet = new Set(sortAcademicYearsDesc(availableAcademicYears));

    const normalizedStartYear = normalizeAcademicYear(safeValue.startYear);
    const normalizedEndYear = normalizeAcademicYear(safeValue.endYear);

    const clampedStartYear = normalizedStartYear && (availableYearsSet.size === 0 || availableYearsSet.has(normalizedStartYear))
        ? normalizedStartYear
        : '';
    const clampedEndYear = normalizedEndYear && (availableYearsSet.size === 0 || availableYearsSet.has(normalizedEndYear))
        ? normalizedEndYear
        : '';

    const startValue = getAcademicYearStartYear(clampedStartYear);
    const endValue = getAcademicYearStartYear(clampedEndYear);

    if (startValue !== null && endValue !== null && startValue > endValue) {
        return {
            startYear: clampedEndYear,
            endYear: clampedStartYear
        };
    }

    return {
        startYear: clampedStartYear,
        endYear: clampedEndYear
    };
};

const isAcademicYearWithinRange = (academicYear: any, filterRange: any) => {
    if (!filterRange?.startYear && !filterRange?.endYear) return true;

    const subjectStartYear = getAcademicYearStartYear(academicYear);
    if (subjectStartYear === null) return false;

    const startValue = getAcademicYearStartYear(filterRange?.startYear);
    const endValue = getAcademicYearStartYear(filterRange?.endYear);

    const minBound = startValue === null ? Number.NEGATIVE_INFINITY : startValue;
    const maxBound = endValue === null ? Number.POSITIVE_INFINITY : endValue;
    const lowerBound = Math.min(minBound, maxBound);
    const upperBound = Math.max(minBound, maxBound);

    return subjectStartYear >= lowerBound && subjectStartYear <= upperBound;
};

export const useHomeState = ({
    user,
    searchQuery = '',
    subjects,
    folders,
    preferences,
    loadingPreferences,
    updatePreference,
    rememberOrganization = true
}: any) => {
    const collapsedGroupsKey = buildUserScopedPersistenceKey('home', user, 'collapsed-groups');
    // Fetch user's shortcuts
    const { resolvedShortcuts, loading: loadingShortcuts } = useShortcuts(user);
    const [viewMode, setViewMode] = useState<string>(preferences?.viewMode || 'grid');
    const [layoutMode, setLayoutMode] = useState<string>(preferences?.layoutMode || 'grid');
    const [cardScale, setCardScale] = useState<number>(preferences?.cardScale || 100);
    const [selectedTags, setSelectedTags] = useState<string[]>(preferences?.selectedTags || []);
    const [flippedSubjectId, setFlippedSubjectId] = useState<any>(null);
    const [activeMenu, setActiveMenu] = useState<any>(null);
    const [collapsedGroups, setCollapsedGroups] = usePersistentState(collapsedGroupsKey, {});
    const [currentFolder, setCurrentFolder] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [coursesAcademicYearFilter, setCoursesAcademicYearFilter] = useState<any>(() => normalizeCourseAcademicYearFilter(preferences?.coursesAcademicYearFilter));
    const [subjectPeriodFilter, setSubjectPeriodFilter] = useState<string>(() => normalizeSubjectPeriodFilter(preferences?.subjectPeriodFilter));
    const [showOnlyCurrentSubjects, setShowOnlyCurrentSubjects] = useState<boolean>(Boolean(preferences?.showOnlyCurrentSubjects));

    const [draggedItem, setDraggedItem] = useState<any>(null);
    const [draggedItemType, setDraggedItemType] = useState<any>(null);
    const [dropPosition, setDropPosition] = useState<any>(null);

    const [manualOrder, setManualOrder] = useState<any>(() => normalizeManualOrder(preferences?.manualOrder));
    const hasHydratedManualOrderRef = useRef<boolean>(false);

    const [subjectModalConfig, setSubjectModalConfig] = useState<any>({ isOpen: false, isEditing: false, data: null });
    const [folderModalConfig, setFolderModalConfig] = useState<any>({ isOpen: false, isEditing: false, data: null });
    const [deleteConfig, setDeleteConfig] = useState<any>({ isOpen: false, type: null, item: null });

    const isAllLevelsMode = viewMode === 'usage' || viewMode === 'courses' || viewMode === 'shared';
    const isStudentRole = getNormalizedRole(user) === 'student';

    const getSubjectParentId = (subjectEntry: any) => {
        if (!subjectEntry) return null;
        if (isShortcutItem(subjectEntry)) {
            return subjectEntry.shortcutParentId ?? subjectEntry.folderId ?? subjectEntry.parentId ?? null;
        }
        return subjectEntry.folderId ?? null;
    };

    const isRootLevelSubject = (subjectEntry) => !getSubjectParentId(subjectEntry);

    useEffect(() => {
        if (!rememberOrganization) {
            if (currentFolder) {
                setCurrentFolder(null);
            }
            clearLastHomeFolderId();
            return;
        }

        if (!folders || folders.length === 0) {
            return;
        }
        const lastFolderId = loadLastHomeFolderId();
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
    }, [folders, rememberOrganization]);

    const filteredFolders = useMemo(() => {
        if (!folders) return [];

        const query = searchQuery?.trim();
        const hasQuery = Boolean(query && query.length > 0);
        const normalizedQuery = hasQuery ? normalizeText(query) : '';

        return folders.filter(folder => {
            // In usage/courses/shared or while searching, include all levels; otherwise only current level
            const inScope = hasQuery || isAllLevelsMode
                ? true
                : currentFolder
                    ? folder.parentId === currentFolder.id
                    : !folder.parentId;

            if (!inScope) return false;
            if (!hasQuery) return true;

            return normalizeText(folder.name).includes(normalizedQuery);
        });
    }, [folders, currentFolder, searchQuery, isAllLevelsMode]);

    // Merge shortcuts with folders (deduplication by targetId)
    const foldersWithShortcuts = useMemo(() => {
        if (!resolvedShortcuts || resolvedShortcuts.length === 0) return filteredFolders;
        const hasQuery = Boolean(searchQuery?.trim());

        const isVisibleInManual = item => !(isShortcutItem(item) && item?.hiddenInManual === true);

        // Get folder shortcuts that match current scope
        const folderShortcuts = resolvedShortcuts.filter(s => {
            if (s.targetType !== 'folder') return false;

            if (viewMode === 'grid' && currentFolder?.isShared === true) {
                return false;
            }
            
            // In usage/courses/shared or while searching, include all levels; otherwise only current level
            const inScope = hasQuery || isAllLevelsMode
                ? true
                : currentFolder
                    ? s.parentId === currentFolder.id
                    : !s.parentId;
            
            return inScope;
        });

        const shortcutTargetIds = new Set(folderShortcuts.map(s => s.targetId));

        const isOwnerLike = (item: any) => {
            if (!item || !user?.uid) return false;
            if (item?.isOwner === true) return true;
            if (item?.ownerId && item.ownerId === user.uid) return true;
            return false;
        };

        const suppressNonOwnedOriginalsInCurrentContext =
            viewMode === 'grid' && currentFolder?.isShared !== true;

        const directFolders = filteredFolders.filter(folder => {
            const isRelatedToCurrentUser =
                isOwnedByCurrentUser(folder, user) ||
                isSharedWithCurrentUser(folder, user, { shortcutTreatAsSharedForNonOwner: false });

            if (!isRelatedToCurrentUser) return false;
                    if (suppressNonOwnedOriginalsInCurrentContext && !isOwnerLike(folder)) return false;
            if (!shortcutTargetIds.has(folder.id)) return true;
            return true;
        });

        // Deduplicate with shortcut priority for non-owners
        const seen = new Set<string>();
        const merged: any[] = [];

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

        if (viewMode === 'grid') {
            return merged.filter(isVisibleInManual);
        }

        return merged;
    }, [filteredFolders, resolvedShortcuts, currentFolder, user, isAllLevelsMode, viewMode, searchQuery]);

    const filteredSubjects = useMemo(() => {
        if (!subjects) return [];

        const query = searchQuery?.trim();
        const hasQuery = Boolean(query && query.length > 0);
        const normalizedQuery = hasQuery ? normalizeText(query) : '';

        return subjects.filter(subject => {
            const inScope = hasQuery || isAllLevelsMode
                ? true
                : currentFolder
                    ? subject.folderId === currentFolder.id
                    : !subject.folderId;

            if (!inScope) return false;
            if (!hasQuery) return true;

            return normalizeText(subject.name).includes(normalizedQuery);
        });
    }, [subjects, currentFolder, searchQuery, isAllLevelsMode]);

    // Merge shortcuts with subjects (deduplication by targetId)
    const subjectsWithShortcuts = useMemo(() => {
        if (!resolvedShortcuts || resolvedShortcuts.length === 0) return filteredSubjects;

        const hasQuery = Boolean(searchQuery?.trim());

        // Get subject shortcuts that match current scope
        const subjectShortcuts = resolvedShortcuts.filter(s => {
            if (s.targetType !== 'subject') return false;

            if (viewMode === 'grid' && currentFolder?.isShared === true) {
                return false;
            }
            
            // In usage/courses/shared or while searching, include all levels; otherwise only current level
            const inScope = hasQuery || isAllLevelsMode
                ? true
                : currentFolder
                    ? s.shortcutParentId === currentFolder.id
                    : !s.shortcutParentId;
            
            return inScope;
        });

        const shortcutTargetIds = new Set(subjectShortcuts.map(s => s.targetId));

        const isOwnerLike = (item: any) => {
            if (!item || !user?.uid) return false;
            if (item?.isOwner === true) return true;
            if (item?.ownerId && item.ownerId === user.uid) return true;
            if (item?.uid && item.uid === user.uid) return true;
            return false;
        };

        const suppressNonOwnedOriginalsInCurrentContext =
            viewMode === 'grid' && currentFolder?.isShared !== true;

        const directSubjects = filteredSubjects.filter(subject => {
            const isRelatedToCurrentUser =
                isOwnedByCurrentUser(subject, user) ||
                isSharedWithCurrentUser(subject, user, { shortcutTreatAsSharedForNonOwner: false });

            if (!isRelatedToCurrentUser) return false;
                    if (suppressNonOwnedOriginalsInCurrentContext && !isOwnerLike(subject)) return false;
            if (!shortcutTargetIds.has(subject.id)) return true;
            return true;
        });

        // Deduplicate with shortcut priority for non-owners
        const seen = new Set<string>();
        const merged: any[] = [];

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
    }, [filteredSubjects, resolvedShortcuts, currentFolder, user, isAllLevelsMode, searchQuery]);

    const filteredSubjectsByTags = useMemo(() => {
        if (selectedTags.length === 0) return subjectsWithShortcuts;
        return subjectsWithShortcuts.filter(subject => selectedTags.every(tag => subject.tags?.includes(tag)));
    }, [subjectsWithShortcuts, selectedTags]);

    const filteredFoldersByTags = useMemo(() => {
        const source = Array.isArray(foldersWithShortcuts) ? foldersWithShortcuts : folders;
        if (selectedTags.length === 0) return source;
        return source.filter(folder => selectedTags.every(tag => folder.tags?.includes(tag)));
    }, [foldersWithShortcuts, folders, selectedTags]);

    const sharedFolders = useMemo(() => {
        const source = Array.isArray(foldersWithShortcuts) ? foldersWithShortcuts : folders;
        return source.filter(item => !isOwnedByCurrentUser(item, user) && isSharedWithCurrentUser(item, user));
    }, [foldersWithShortcuts, folders, user?.uid, user?.email]);

    const sharedSubjects = useMemo(() => {
        const source = Array.isArray(subjectsWithShortcuts) ? subjectsWithShortcuts : subjects;
        return source.filter(item => !isOwnedByCurrentUser(item, user) && isSharedWithCurrentUser(item, user));
    }, [subjectsWithShortcuts, subjects, user?.uid, user?.email]);

    const availableCourseAcademicYears = useMemo(() => {
        const isRelated = (item: any) => {
            if (!item) return false;
            if (isShortcutItem(item)) return true;
            return isOwnedByCurrentUser(item, user) || isSharedWithCurrentUser(item, user);
        };

        const sourceSubjects = selectedTags.length > 0 || viewMode === 'tags'
            ? filteredSubjectsByTags
            : subjectsWithShortcuts;

        const years = sourceSubjects
            .filter(isRelated)
            .filter((sub: any) => {
                if (!(isStudentRole && viewMode === 'courses')) return true;
                return isRootLevelSubject(sub);
            })
            .map((subject: any) => normalizeAcademicYear(subject?.academicYear))
            .filter(Boolean);

        return sortAcademicYearsDesc(Array.from(new Set(years)));
    }, [subjectsWithShortcuts, filteredSubjectsByTags, selectedTags, viewMode, isStudentRole, user?.uid, user?.email]);

    const normalizedCoursesAcademicYearFilter = useMemo(
        () => normalizeCourseAcademicYearFilter(coursesAcademicYearFilter, availableCourseAcademicYears),
        [coursesAcademicYearFilter, availableCourseAcademicYears]
    );

    const availableSubjectPeriods = useMemo(() => {
        const isRelated = (item: any) => {
            if (!item) return false;
            if (isShortcutItem(item)) return true;
            return isOwnedByCurrentUser(item, user) || isSharedWithCurrentUser(item, user);
        };

        const sourceSubjects = selectedTags.length > 0 || viewMode === 'tags'
            ? filteredSubjectsByTags
            : subjectsWithShortcuts;

        const optionsByValue = new Map<string, any>();

        sourceSubjects
            .filter(isRelated)
            .filter((subject: any) => {
                if (!(isStudentRole && (viewMode === 'usage' || viewMode === 'courses'))) return true;
                return isRootLevelSubject(subject);
            })
            .forEach((subject: any) => {
                const periodType = normalizeSubjectPeriodType(subject?.periodType);
                const periodIndex = normalizeSubjectPeriodIndex(subject?.periodIndex);
                const value = buildSubjectPeriodFilterValue(periodType, periodIndex);
                if (!periodType || periodIndex === null || !value) {
                    return;
                }

                if (optionsByValue.has(value)) {
                    return;
                }

                optionsByValue.set(value, {
                    value,
                    label: buildSubjectPeriodLabel({
                        periodType,
                        periodIndex,
                        periodLabel: subject?.periodLabel
                    }),
                    periodType,
                    periodIndex
                });
            });

        return sortSubjectPeriodOptions(Array.from(optionsByValue.values()));
    }, [subjectsWithShortcuts, filteredSubjectsByTags, selectedTags, viewMode, isStudentRole, user?.uid, user?.email]);

    const normalizedSubjectPeriodFilter = useMemo(
        () => normalizeSubjectPeriodFilter(
            subjectPeriodFilter,
            availableSubjectPeriods.map((option: any) => option?.value)
        ),
        [subjectPeriodFilter, availableSubjectPeriods]
    );

    const applyLifecyclePolicyFilters = (subjectEntries: any[] = [], { enforceStudentRootScope = false } = {}) => {
        const shouldApplyLifecyclePolicy = viewMode === 'usage' || viewMode === 'courses';
        if (!shouldApplyLifecyclePolicy) {
            return subjectEntries;
        }

        const studentScopedEntries = (enforceStudentRootScope && isStudentRole)
            ? subjectEntries.filter((subject: any) => isRootLevelSubject(subject))
            : subjectEntries;

        const policyVisibleSubjects = studentScopedEntries.filter((subject: any) =>
            isSubjectVisibleByPostCoursePolicy({ subject, user })
        );

        const lifecycleVisibleSubjects = showOnlyCurrentSubjects
            ? policyVisibleSubjects.filter((subject: any) =>
                isSubjectActiveInPeriodLifecycle({ subject, user })
            )
            : policyVisibleSubjects;

        if (!normalizedSubjectPeriodFilter) {
            return lifecycleVisibleSubjects;
        }

        return lifecycleVisibleSubjects.filter((subject: any) =>
            doesSubjectMatchPeriodFilter(subject, normalizedSubjectPeriodFilter)
        );
    };

    const applyManualOrder = (items: any[] = [], type: any) => {
        if (viewMode !== 'grid') return items;

        const orderArray = type === 'subject' ? manualOrder.subjects : manualOrder.folders;
        if (orderArray.length === 0) return items;
        const getManualKey = (item) => item?.shortcutId || item?.id;

        const ordered: any[] = [];
        const unordered = [...items];

        orderArray.forEach(id => {
            const index = unordered.findIndex(item => getManualKey(item) === id);
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
            if (isShortcutItem(f)) return true;
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
            resultFolders = resultFolders.filter(f =>
                selectedTags.every(tag => Array.isArray(f.tags) && f.tags.includes(tag))
            );
        }

        return applyManualOrder(resultFolders, 'folder');
    }, [foldersWithShortcuts, folders, viewMode, currentFolder, manualOrder, selectedTags, searchQuery, activeFilter, user]);

    const groupedContent = useMemo(() => {
        if (activeFilter === 'folders') return {};

        const isRelated = item => {
            if (!item) return false;
            if (isShortcutItem(item)) return true;
            return isOwnedByCurrentUser(item, user) || isSharedWithCurrentUser(item, user);
        };
        const isVisibleInManual = item => !(isShortcutItem(item) && item?.hiddenInManual === true);

        const query = searchQuery?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (query) {
            const matchedSubjects = subjectsWithShortcuts.filter(s => {
                const subjectName = (s.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const studentScopeAllowed = !(isStudentRole && (viewMode === 'usage' || viewMode === 'courses')) || isRootLevelSubject(s);
                return subjectName.includes(query) && isRelated(s) && studentScopeAllowed && (viewMode !== 'grid' || isVisibleInManual(s));
            });
            const periodFilteredSearchSubjects = applyLifecyclePolicyFilters(matchedSubjects);

            return { 'Resultados de búsqueda': periodFilteredSearchSubjects };
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
        const subjectsToGroup = sourceSubjects
            .filter(isRelated)
            .filter(sub => {
                if (!(isStudentRole && (viewMode === 'usage' || viewMode === 'courses'))) return true;
                return isRootLevelSubject(sub);
            });
        const periodFilteredSubjects = applyLifecyclePolicyFilters(subjectsToGroup);

        if (viewMode === 'usage') {
            const sorted = [...periodFilteredSubjects].sort((a, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
            return { Recientes: sorted };
        }

        if (viewMode === 'courses') {
            const currentEducationLevels = EDUCATION_LEVELS || {
                Primaria: ['1º', '2º', '3º', '4º', '5º', '6º'],
                ESO: ['1º', '2º', '3º', '4º'],
                Bachillerato: ['1º', '2º'],
                FP: ['Grado Medio 1', 'Grado Medio 2', 'Grado Superior 1', 'Grado Superior 2'],
                Universidad: ['1º', '2º', '3º', '4º', '5º', '6º', 'Máster', 'Doctorado']
            };

            function parseCourse(course: any) {
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

            const subjectsInAcademicYearRange = periodFilteredSubjects.filter((sub: any) => {
                const subjectAcademicYear = normalizeAcademicYear(sub?.academicYear);
                return isAcademicYearWithinRange(subjectAcademicYear, normalizedCoursesAcademicYearFilter);
            });

            const validAcademicYears = sortAcademicYearsDesc(
                Array.from(new Set(subjectsInAcademicYearRange
                    .map((sub: any) => normalizeAcademicYear(sub?.academicYear))
                    .filter(Boolean)))
            );
            const hasMissingAcademicYearSubjects = subjectsInAcademicYearRange.some(
                (sub: any) => !normalizeAcademicYear(sub?.academicYear)
            );
            const hasMultipleAcademicYears = validAcademicYears.length > 1;
            const academicYearOrder = [
                ...validAcademicYears,
                ...(hasMissingAcademicYearSubjects ? ['Sin año académico'] : [])
            ];

            const groupMap: Record<string, Record<string, Record<string, any[]>>> = {};
            const noCourseMap: Record<string, any[]> = {};

            subjectsInAcademicYearRange.forEach((sub: any) => {
                const { group, year } = parseCourse(sub.course);
                const academicYearLabel = normalizeAcademicYear(sub?.academicYear) || 'Sin año académico';

                if (!group && !year) {
                    if (!noCourseMap[academicYearLabel]) noCourseMap[academicYearLabel] = [];
                    noCourseMap[academicYearLabel].push(sub);
                    return;
                }

                const groupKey = String(group || 'Sin Curso');
                const yearKey = String(year || '');

                if (!groupMap[groupKey]) groupMap[groupKey] = {};
                if (!groupMap[groupKey][yearKey]) groupMap[groupKey][yearKey] = {};
                if (!groupMap[groupKey][yearKey][academicYearLabel]) groupMap[groupKey][yearKey][academicYearLabel] = [];
                groupMap[groupKey][yearKey][academicYearLabel].push(sub);
            });

            const sortedGroups: Record<string, any[]> = {};
            const addBucket = (baseLabel: string, academicYearLabel: string, entries: any[] = []) => {
                if (!Array.isArray(entries) || entries.length === 0) return;

                const label = hasMultipleAcademicYears ? `${baseLabel} (${academicYearLabel})` : baseLabel;
                const sortedEntries = entries
                    .slice()
                    .sort((a, b: any) => (a.name || '').localeCompare(b.name || ''));

                if (!sortedGroups[label]) {
                    sortedGroups[label] = sortedEntries;
                    return;
                }

                sortedGroups[label] = [...sortedGroups[label], ...sortedEntries].sort((a, b: any) =>
                    (a.name || '').localeCompare(b.name || '')
                );
            };

            const addKnownBucketsForAcademicYear = (academicYearLabel: string) => {
                Object.keys(currentEducationLevels).forEach((group) => {
                    currentEducationLevels[group].forEach((year) => {
                        const bucket = groupMap[group]?.[year]?.[academicYearLabel] || [];
                        addBucket(`${group} ${year}`, academicYearLabel, bucket);
                    });
                });
            };

            const addCustomBucketsForAcademicYear = (academicYearLabel: string) => {
                Object.keys(groupMap).forEach((group) => {
                    Object.keys(groupMap[group]).forEach((year) => {
                        const knownYears = currentEducationLevels[group] || [];
                        if (knownYears.includes(year)) {
                            return;
                        }

                        const baseLabel = year ? `${group} ${year}` : group;
                        const bucket = groupMap[group]?.[year]?.[academicYearLabel] || [];
                        addBucket(baseLabel, academicYearLabel, bucket);
                    });
                });
            };

            if (hasMultipleAcademicYears) {
                academicYearOrder.forEach((academicYearLabel) => {
                    addKnownBucketsForAcademicYear(academicYearLabel);
                    addCustomBucketsForAcademicYear(academicYearLabel);
                    const noCourseEntries = noCourseMap[academicYearLabel] || [];
                    addBucket('Sin Curso', academicYearLabel, noCourseEntries);
                });
            } else {
                academicYearOrder.forEach((academicYearLabel) => {
                    addKnownBucketsForAcademicYear(academicYearLabel);
                    addCustomBucketsForAcademicYear(academicYearLabel);
                    const noCourseEntries = noCourseMap[academicYearLabel] || [];
                    addBucket('Sin Curso', academicYearLabel, noCourseEntries);
                });
            }

            return sortedGroups;
        }

        if (viewMode === 'tags') {
            const groups: Record<string, any[]> = {};
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
                .reduce((obj, key: any) => {
                    obj[key] = groups[key];
                    return obj;
                }, {});
        }

        return { Todas: subjectsToGroup };
    }, [subjects, subjectsWithShortcuts, filteredSubjectsByTags, viewMode, currentFolder, folders, manualOrder, activeFilter, searchQuery, isStudentRole, normalizedCoursesAcademicYearFilter, normalizedSubjectPeriodFilter, showOnlyCurrentSubjects, user]);

    const filteredSubjectsForCurrentView = useMemo(
        () => applyLifecyclePolicyFilters(subjectsWithShortcuts, { enforceStudentRootScope: true }),
        [subjectsWithShortcuts, viewMode, isStudentRole, showOnlyCurrentSubjects, normalizedSubjectPeriodFilter, user?.uid, user?.email]
    );

    const { searchFolders, searchSubjects } = useMemo(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            return { searchFolders: [], searchSubjects: [] };
        }

        const query = normalizeText(searchQuery);

        const isRelated = item => {
            if (isShortcutItem(item)) return true;
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

        const lifecycleScopedSearchSubjects = applyLifecyclePolicyFilters(
            sSubjects,
            { enforceStudentRootScope: true }
        );

        return { searchFolders: sFolders, searchSubjects: lifecycleScopedSearchSubjects };
    }, [foldersWithShortcuts, folders, subjectsWithShortcuts, searchQuery, user, currentFolder, viewMode, isStudentRole, showOnlyCurrentSubjects, normalizedSubjectPeriodFilter]);

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
        setCoursesAcademicYearFilter((previousFilter: any) => {
            const normalizedFilter = normalizeCourseAcademicYearFilter(previousFilter, availableCourseAcademicYears);
            return areCourseAcademicYearFiltersEqual(previousFilter, normalizedFilter)
                ? previousFilter
                : normalizedFilter;
        });
    }, [availableCourseAcademicYears]);

    useEffect(() => {
        setSubjectPeriodFilter((previousFilter: any) => {
            const normalizedFilter = normalizeSubjectPeriodFilter(
                previousFilter,
                availableSubjectPeriods.map((option: any) => option?.value)
            );
            return previousFilter === normalizedFilter ? previousFilter : normalizedFilter;
        });
    }, [availableSubjectPeriods]);

    useEffect(() => {
        if (preferences && !loadingPreferences) {
            setViewMode(prev => prev || preferences.viewMode || 'grid');
            setLayoutMode(preferences.layoutMode || 'grid');
            setCardScale(preferences.cardScale || 100);
            setSelectedTags(preferences.selectedTags || []);
            setShowOnlyCurrentSubjects(Boolean(preferences.showOnlyCurrentSubjects));
            const nextCoursesFilter = normalizeCourseAcademicYearFilter(preferences.coursesAcademicYearFilter, availableCourseAcademicYears);
            setCoursesAcademicYearFilter((previousFilter: any) => (
                areCourseAcademicYearFiltersEqual(previousFilter, nextCoursesFilter)
                    ? previousFilter
                    : nextCoursesFilter
            ));
            const nextSubjectPeriodFilter = normalizeSubjectPeriodFilter(
                preferences.subjectPeriodFilter,
                availableSubjectPeriods.map((option: any) => option?.value)
            );
            setSubjectPeriodFilter((previousFilter: any) => (
                previousFilter === nextSubjectPeriodFilter
                    ? previousFilter
                    : nextSubjectPeriodFilter
            ));
        }
    }, [preferences, loadingPreferences, availableCourseAcademicYears, availableSubjectPeriods]);

    useEffect(() => {
        if (loadingPreferences) return;

        const incomingOrder = normalizeManualOrder(preferences?.manualOrder);
        setManualOrder(prevOrder => (areManualOrdersEqual(prevOrder, incomingOrder) ? prevOrder : incomingOrder));
    }, [preferences?.manualOrder, loadingPreferences]);

    useEffect(() => {
        if (loadingPreferences) return;
        if (!user?.uid) return;

        if (!hasHydratedManualOrderRef.current) {
            hasHydratedManualOrderRef.current = true;
            return;
        }

        const persistedOrder = normalizeManualOrder(preferences?.manualOrder);
        if (areManualOrdersEqual(manualOrder, persistedOrder)) return;

        updatePreference('manualOrder', manualOrder);
    }, [manualOrder, loadingPreferences, preferences?.manualOrder, updatePreference, user?.uid]);

    const isDragAndDropEnabled = viewMode === 'grid';

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
        showOnlyCurrentSubjects,
        setShowOnlyCurrentSubjects,
        coursesAcademicYearFilter,
        setCoursesAcademicYearFilter,
        availableCourseAcademicYears,
        subjectPeriodFilter,
        setSubjectPeriodFilter,
        availableSubjectPeriods,
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
        filteredSubjects: filteredSubjectsForCurrentView,
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
