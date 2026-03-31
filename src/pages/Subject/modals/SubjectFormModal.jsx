// src/pages/Subject/modals/SubjectFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Users, Trash2, Share2, Loader2, CheckCircle, AlertCircle, RotateCcw, Copy } from 'lucide-react';
import { MODERN_FILL_COLORS } from '../../../utils/subjectConstants';
import { addDoc, collection, getDocs, query, where, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { OVERLAY_TOP_OFFSET_STYLE } from '../../../utils/layoutConstants';

// Sub-components
import BasicInfoFields from './subject-form/BasicInfoFields';
import TagManager from './subject-form/TagManager';
import AppearanceSection from './subject-form/AppearanceSection';
import StyleSelector from './subject-form/StyleSelector';
import { getNormalizedRole, getPermissionLevel } from '../../../utils/permissionUtils';
import { canTeacherAssignClassesAndStudents, DEFAULT_ACCESS_POLICIES, normalizeAccessPolicies } from '../../../utils/institutionPolicyUtils';

const SubjectFormModal = ({ isOpen, onClose, onSave, initialData, isEditing, onShare, onUnshare, onTransferOwnership, onDeleteShortcut, user, allFolders = [], initialTab = 'general', studentShortcutTagOnlyMode = false }) => {
    const [formData, setFormData] = useState({ 
        name: '', level: '', grade: '', course: '', 
        color: 'from-blue-400 to-blue-600', icon: 'book', tags: [],
        cardStyle: 'default', modernFillColor: MODERN_FILL_COLORS[0].value
    });
    const [activeTab, setActiveTab] = useState('general');
    const [shareEmail, setShareEmail] = useState('');
    const [shareRole, setShareRole] = useState('viewer');
    const [shareQueue, setShareQueue] = useState([]);
    const [sharedList, setSharedList] = useState([]);
    const [shareSearch, setShareSearch] = useState('');
    const [institutionEmails, setInstitutionEmails] = useState([]);
    const [shareSuggestionsOpen, setShareSuggestionsOpen] = useState(false);
    const [ownerEmailResolved, setOwnerEmailResolved] = useState('');
    const [pendingShareAction, setPendingShareAction] = useState(null);
    const [showSelfUnshareConfirm, setShowSelfUnshareConfirm] = useState(false);
    const [showDiscardPendingConfirm, setShowDiscardPendingConfirm] = useState(false);
    const [pendingPermissionChanges, setPendingPermissionChanges] = useState({});
    const [pendingUnshares, setPendingUnshares] = useState([]);
    const [shareLoading, setShareLoading] = useState(false);
    const [shareError, setShareError] = useState('');
    const [shareSuccess, setShareSuccess] = useState('');
    const [availableClasses, setAvailableClasses] = useState([]);
    const [institutionAccessPolicies, setInstitutionAccessPolicies] = useState(DEFAULT_ACCESS_POLICIES);
    const [classesLoading, setClassesLoading] = useState(false);
    const [selectedClassIds, setSelectedClassIds] = useState([]);
    const [classesActionLoading, setClassesActionLoading] = useState(false);
    const [classesActionError, setClassesActionError] = useState('');
    const [classesActionSuccess, setClassesActionSuccess] = useState('');
    const [classesLoadError, setClassesLoadError] = useState('');
    const [inviteCodeCopyStatus, setInviteCodeCopyStatus] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [availableCourses, setAvailableCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [coursesLoadError, setCoursesLoadError] = useState('');
    const [institutionEmailsLoadError, setInstitutionEmailsLoadError] = useState('');
    const [ownerEmailResolveError, setOwnerEmailResolveError] = useState('');
    const [institutionPolicyLoadError, setInstitutionPolicyLoadError] = useState('');
    const subjectNameInputRef = React.useRef(null);
    const subjectCourseSelectRef = React.useRef(null);

    const isShortcutEditing = isEditing && formData?.isShortcut === true;
    const isTagOnlyShortcutEdit = studentShortcutTagOnlyMode && isShortcutEditing;
    const currentRole = getNormalizedRole(user);
    const canAccessClassesTab = isEditing && (currentRole === 'teacher' || currentRole === 'institutionadmin' || currentRole === 'admin');
    const canDirectAssignClasses = currentRole === 'institutionadmin'
        || currentRole === 'admin'
        || (currentRole === 'teacher' && canTeacherAssignClassesAndStudents(institutionAccessPolicies));
    const shortcutPermissionLevel = formData?.shortcutPermissionLevel || 'viewer';
    const isShortcutEditor = shortcutPermissionLevel === 'editor' || shortcutPermissionLevel === 'owner';
    const canManageSharing = !isTagOnlyShortcutEdit && (!isShortcutEditing || isShortcutEditor);
    const canModifyClassAssignments = canAccessClassesTab && canManageSharing;
    const canEditOriginalFields = !isShortcutEditing || isShortcutEditor;
    const isOwnerManager = isShortcutEditing
        ? shortcutPermissionLevel === 'owner'
        : Boolean((initialData?.ownerId || formData?.ownerId) && user?.uid && (initialData?.ownerId || formData?.ownerId) === user.uid);

    const getFolderParentId = (folderEntry) => {
        if (!folderEntry) return null;
        return folderEntry.shortcutParentId ?? folderEntry.parentId ?? null;
    };

    const isInsideSharedFolderTree = (folderId) => {
        if (!folderId || !Array.isArray(allFolders)) return false;
        let cursorId = folderId;
        let safety = 0;
        while (cursorId && safety < 200) {
            const cursor = allFolders.find(folder => folder?.id === cursorId);
            if (!cursor) return false;
            if (cursor.isShared === true) return true;
            cursorId = getFolderParentId(cursor);
            safety += 1;
        }
        return false;
    };

    const subjectParentFolderId = formData?.shortcutParentId ?? formData?.folderId ?? initialData?.shortcutParentId ?? initialData?.folderId ?? null;
    const unshareBlockedInSharedFolder = isInsideSharedFolderTree(subjectParentFolderId);
    const canTransferOwnership = Boolean(
        isOwnerManager &&
        canManageSharing &&
        !unshareBlockedInSharedFolder &&
        !isShortcutEditing
    );

    // 1. Initialize Logic
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setShareEmail('');
            setShareError('');
            setShareSuccess('');
            setValidationErrors({});
            setShareRole('viewer');
            setShareQueue([]);
            setShareSearch('');
            setShareSuggestionsOpen(false);
            setOwnerEmailResolved('');
            setPendingShareAction(null);
            setShowSelfUnshareConfirm(false);
            setShowDiscardPendingConfirm(false);
            setPendingPermissionChanges({});
            setPendingUnshares([]);
            setClassesActionError('');
            setClassesActionSuccess('');
            setClassesLoadError('');
            setCoursesLoadError('');
            setInstitutionEmailsLoadError('');
            setOwnerEmailResolveError('');
            setInstitutionPolicyLoadError('');
            if (isEditing && initialData) {
                const fallbackCourse = (initialData.level && initialData.grade)
                    ? `${initialData.grade} ${initialData.level}`
                    : '';
                setFormData({
                    id: initialData.id,
                    ownerId: initialData.ownerId,
                    inviteCode: initialData.inviteCode || '',
                    shortcutId: initialData.shortcutId || null,
                    isShortcut: initialData.isShortcut === true,
                    shortcutPermissionLevel: initialData.isShortcut
                        ? getPermissionLevel(initialData, user?.uid)
                        : 'owner',
                    name: initialData.name || '',
                    course: initialData.course || fallbackCourse,
                    level: initialData.level || '',
                    grade: initialData.grade || '',
                    color: initialData.color || 'from-blue-400 to-blue-600',
                    icon: initialData.icon || 'book',
                    tags: initialData.tags || [],
                    classIds: Array.isArray(initialData.classIds) ? initialData.classIds : [],
                    cardStyle: initialData.cardStyle || 'default',
                    modernFillColor: initialData.fillColor || initialData.modernFillColor || MODERN_FILL_COLORS[0].value
                });
                setSelectedClassIds(Array.isArray(initialData.classIds) ? initialData.classIds : []);
                // Load shared list
                setSharedList(initialData.sharedWith || []);
            } else {
                // When creating new subject, pre-fill course, level, and grade if provided
                const prefilledLevel = initialData?.level || '';
                const prefilledGrade = initialData?.grade || '';
                const fallbackCourse = (prefilledLevel && prefilledGrade)
                    ? `${prefilledGrade} ${prefilledLevel}`
                    : '';
                
                setFormData({ 
                    inviteCode: '',
                    shortcutId: null,
                    isShortcut: false,
                    shortcutPermissionLevel: 'owner',
                    name: '',
                    level: prefilledLevel,
                    grade: prefilledGrade,
                    course: initialData?.course || fallbackCourse,
                    color: 'from-blue-400 to-blue-600',
                    icon: 'book',
                    tags: [],
                    classIds: [],
                    cardStyle: 'default',
                    modernFillColor: MODERN_FILL_COLORS[0].value
                });
                setSelectedClassIds([]);
                setSharedList([]);
            }
        }
    }, [isOpen, isEditing, initialData, initialTab, user?.uid]);

    useEffect(() => {
        let active = true;

        const loadInstitutionPolicies = async () => {
            const institutionId = user?.institutionId || initialData?.institutionId || '';
            if (!institutionId) {
                if (active) {
                    setInstitutionAccessPolicies(DEFAULT_ACCESS_POLICIES);
                    setInstitutionPolicyLoadError('');
                }
                return;
            }

            try {
                setInstitutionPolicyLoadError('');
                const institutionSnapshot = await getDoc(doc(db, 'institutions', institutionId));
                if (!active) return;
                if (!institutionSnapshot.exists()) {
                    setInstitutionAccessPolicies(DEFAULT_ACCESS_POLICIES);
                    setInstitutionPolicyLoadError('');
                    return;
                }

                setInstitutionAccessPolicies(normalizeAccessPolicies(institutionSnapshot.data()?.accessPolicies));
                setInstitutionPolicyLoadError('');
            } catch (error) {
                if (active) {
                    setInstitutionAccessPolicies(DEFAULT_ACCESS_POLICIES);
                    if (error?.code === 'permission-denied') {
                        setInstitutionPolicyLoadError('No tienes permiso para cargar las políticas de acceso de esta institución.');
                    } else {
                        setInstitutionPolicyLoadError('No se pudieron cargar las políticas de acceso. Intentalo de nuevo.');
                    }
                }
            }
        };

        loadInstitutionPolicies();

        const loadCourses = async () => {
            const institutionId = user?.institutionId || initialData?.institutionId || '';
            if (!isOpen || !institutionId) {
                if (active) {
                    setAvailableCourses([]);
                    setCoursesLoadError('');
                    setCoursesLoading(false);
                }
                return;
            }

            setCoursesLoading(true);
            setCoursesLoadError('');
            try {
                const coursesRef = collection(db, 'courses');
                const coursesQuery = query(coursesRef, where('institutionId', '==', institutionId));
                const coursesSnapshot = await getDocs(coursesQuery);

                if (!active) return;

                const loadedCourses = coursesSnapshot.docs
                    .map((courseDoc) => ({
                        id: courseDoc.id,
                        ...courseDoc.data()
                    }))
                    .filter((course) => String(course?.name || '').trim().length > 0)
                    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es', { sensitivity: 'base' }));

                setAvailableCourses(loadedCourses);
                setCoursesLoadError('');
            } catch (error) {
                if (active) {
                    setAvailableCourses([]);
                    if (error?.code === 'permission-denied') {
                        setCoursesLoadError('No tienes permiso para cargar los cursos de esta institución.');
                    } else {
                        setCoursesLoadError('No se pudieron cargar los cursos disponibles. Intentalo de nuevo.');
                    }
                }
            } finally {
                if (active) {
                    setCoursesLoading(false);
                }
            }
        };

        loadCourses();
        return () => {
            active = false;
        };
    }, [isOpen, user?.institutionId, initialData?.institutionId]);

    const handleCopyInviteCode = async () => {
        const code = String(formData?.inviteCode || initialData?.inviteCode || '').trim();
        if (!code) {
            setInviteCodeCopyStatus('No hay código disponible.');
            return;
        }

        try {
            await navigator.clipboard.writeText(code);
            setInviteCodeCopyStatus('Código copiado.');
        } catch {
            setInviteCodeCopyStatus('No se pudo copiar el código.');
        }

        setTimeout(() => setInviteCodeCopyStatus(''), 2000);
    };

    useEffect(() => {
        let active = true;

        const resolveOwnerEmail = async () => {
            if (!isOpen || !isEditing || !initialData?.ownerId) {
                if (active) {
                    setOwnerEmailResolved('');
                    setOwnerEmailResolveError('');
                }
                return;
            }

            if (initialData?.ownerEmail) {
                if (active) {
                    setOwnerEmailResolved(initialData.ownerEmail);
                    setOwnerEmailResolveError('');
                }
                return;
            }

            try {
                setOwnerEmailResolveError('');
                const ownerDoc = await getDoc(doc(db, 'users', initialData.ownerId));
                const ownerEmailFromDoc = ownerDoc.exists() ? (ownerDoc.data()?.email || '') : '';
                if (ownerEmailFromDoc) {
                    if (active) {
                        setOwnerEmailResolved(ownerEmailFromDoc);
                        setOwnerEmailResolveError('');
                    }
                    return;
                }

                const usersRef = collection(db, 'users');
                const ownerQuery = query(usersRef, where('uid', '==', initialData.ownerId));
                const ownerSnapshot = await getDocs(ownerQuery);
                const ownerEmailFromQuery = ownerSnapshot.docs[0]?.data()?.email || '';
                if (active) {
                    setOwnerEmailResolved(ownerEmailFromQuery);
                    setOwnerEmailResolveError('');
                }
            } catch (error) {
                if (active) {
                    setOwnerEmailResolved('');
                    if (error?.code === 'permission-denied') {
                        setOwnerEmailResolveError('No tienes permiso para resolver el correo del propietario de esta asignatura.');
                    } else {
                        setOwnerEmailResolveError('No se pudo resolver el correo del propietario. Intentalo de nuevo.');
                    }
                }
            }
        };

        resolveOwnerEmail();
        return () => { active = false; };
    }, [isOpen, isEditing, initialData?.ownerId, initialData?.ownerEmail]);

    useEffect(() => {
        let active = true;

        const loadInstitutionEmails = async () => {
            if (!isOpen || !user?.institutionId) {
                if (active) {
                    setInstitutionEmails([]);
                    setInstitutionEmailsLoadError('');
                }
                return;
            }

            try {
                setInstitutionEmailsLoadError('');
                const usersRef = collection(db, 'users');
                const usersQuery = query(usersRef, where('institutionId', '==', user.institutionId));
                const usersSnapshot = await getDocs(usersQuery);

                if (!active) return;

                const uniqueEmails = Array.from(new Set(
                    usersSnapshot.docs
                        .map(docSnap => (docSnap.data()?.email || '').toLowerCase().trim())
                        .filter(Boolean)
                ));

                setInstitutionEmails(uniqueEmails);
                setInstitutionEmailsLoadError('');
            } catch (error) {
                if (active) {
                    setInstitutionEmails([]);
                    if (error?.code === 'permission-denied') {
                        setInstitutionEmailsLoadError('No tienes permiso para cargar sugerencias de usuarios de la institución.');
                    } else {
                        setInstitutionEmailsLoadError('No se pudieron cargar las sugerencias de usuarios. Intentalo de nuevo.');
                    }
                }
            }
        };

        loadInstitutionEmails();
        return () => { active = false; };
    }, [isOpen, user?.institutionId]);

    useEffect(() => {
        if (isTagOnlyShortcutEdit && activeTab === 'sharing') {
            setActiveTab('general');
        }
    }, [isTagOnlyShortcutEdit, activeTab]);

    useEffect(() => {
        let active = true;

        const loadClasses = async () => {
            if (!isOpen || !canAccessClassesTab || !user?.institutionId) {
                if (active) {
                    setAvailableClasses([]);
                    setClassesLoadError('');
                    setClassesLoading(false);
                }
                return;
            }

            setClassesLoading(true);
            setClassesLoadError('');
            try {
                const classesRef = collection(db, 'classes');
                const baseConstraints = [where('institutionId', '==', user.institutionId)];
                if (currentRole === 'teacher') {
                    baseConstraints.push(where('teacherId', '==', user.uid));
                }
                const classesQuery = query(classesRef, ...baseConstraints);
                const classesSnap = await getDocs(classesQuery);

                if (!active) return;
                const loaded = classesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setAvailableClasses(loaded);
                setClassesLoadError('');
            } catch (error) {
                if (active) {
                    setAvailableClasses([]);
                    if (error?.code === 'permission-denied') {
                        setClassesLoadError('No tienes permiso para cargar las clases disponibles de esta asignatura.');
                    } else {
                        setClassesLoadError('No se pudieron cargar las clases disponibles. Intentalo de nuevo.');
                    }
                }
            } finally {
                if (active) {
                    setClassesLoading(false);
                }
            }
        };

        loadClasses();
        return () => {
            active = false;
        };
    }, [isOpen, canAccessClassesTab, user?.institutionId, user?.uid, currentRole]);

    const toggleClassSelection = (classId) => {
        setSelectedClassIds((prev) => (
            prev.includes(classId)
                ? prev.filter((id) => id !== classId)
                : [...prev, classId]
        ));
    };

    const handleSaveClassAssignments = () => {
        if (!canModifyClassAssignments || !canDirectAssignClasses) return;
        onSave({
            ...formData,
            classIds: selectedClassIds
        });
        setClassesActionSuccess('Clases actualizadas correctamente.');
        setTimeout(() => setClassesActionSuccess(''), 2500);
    };

    const handleRequestClassAssignments = async () => {
        if (!canModifyClassAssignments || canDirectAssignClasses || !isEditing || !formData?.id || !user?.institutionId || !user?.uid) return;

        setClassesActionLoading(true);
        setClassesActionError('');
        setClassesActionSuccess('');
        try {
            const existingClassIds = Array.isArray(formData.classIds) ? formData.classIds : [];
            const requestClassIds = selectedClassIds.filter((id) => !existingClassIds.includes(id));

            if (requestClassIds.length === 0) {
                setClassesActionError('Selecciona al menos una clase nueva para solicitar.');
                setClassesActionLoading(false);
                return;
            }

            await Promise.all(requestClassIds.map((classId) => addDoc(collection(db, 'subject_class_requests'), {
                subjectId: formData.id,
                subjectName: formData.name || initialData?.name || 'Asignatura',
                classId,
                teacherId: user.uid,
                institutionId: user.institutionId,
                status: 'pending',
                requestedByRole: currentRole,
                requestedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })));

            setClassesActionSuccess('Solicitud enviada a administración de institución.');
            setTimeout(() => setClassesActionSuccess(''), 3500);
        } catch (error) {
            if (error?.code === 'permission-denied') {
                setClassesActionError('No tienes permiso para solicitar la asignación de clases de esta asignatura.');
            } else {
                setClassesActionError(error?.message || 'No se pudo enviar la solicitud de clases.');
            }
        } finally {
            setClassesActionLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (activeTab !== 'general') return;

        if (!isTagOnlyShortcutEdit && canEditOriginalFields) {
            const nextErrors = {};
            const hasName = String(formData?.name || '').trim().length > 0;
            const hasCourse = String(formData?.course || '').trim().length > 0;

            if (!hasName) {
                nextErrors.name = 'Campo obligatorio.';
            }

            if (!hasCourse) {
                nextErrors.course = 'Campo obligatorio.';
            }

            if (Object.keys(nextErrors).length > 0) {
                setValidationErrors(nextErrors);
                setActiveTab('general');

                if (nextErrors.name && subjectNameInputRef.current) {
                    subjectNameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    subjectNameInputRef.current.focus();
                } else if (subjectCourseSelectRef.current) {
                    subjectCourseSelectRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    subjectCourseSelectRef.current.focus();
                }

                return;
            }
        }

        onSave(formData);
    };

    const validateShareCandidate = (email) => {
        if (!email) return 'Por favor ingresa un correo electrónico.';

        const ownerEmail = (initialData?.ownerEmail || (formData?.ownerId === user?.uid ? user?.email : '') || '').toLowerCase();
        const currentUserEmail = (user?.email || '').toLowerCase();

        if (email === ownerEmail) return 'No puedes compartir con el propietario.';
        if (email === currentUserEmail) return 'No puedes compartir contigo mismo.';

        const alreadyShared = sharedList.some(entry => (entry?.email || '').toLowerCase() === email);
        if (alreadyShared) return 'Ese usuario ya tiene acceso.';

        const alreadyQueued = shareQueue.some(entry => entry.email === email);
        if (alreadyQueued) return 'Ese usuario ya está en la lista de espera.';

        return '';
    };

    const handleAddToShareQueue = () => {
        const email = shareEmail.trim().toLowerCase();
        const validationError = validateShareCandidate(email);
        if (validationError) {
            setShareError(validationError);
            return;
        }

        setShareQueue(prev => [...prev, { email, role: shareRole }]);
        setShareEmail('');
        setShareSuggestionsOpen(false);
        setShareError('');
        setShareSuccess('');
    };

    const handleRemoveFromShareQueue = (emailToRemove) => {
        setShareQueue(prev => prev.filter(entry => entry.email !== emailToRemove));
    };

    const handleUnshareAction = (emailToRemove) => {
        const normalizedEmailToRemove = (emailToRemove || '').toLowerCase();
        if (unshareBlockedInSharedFolder) {
            setShareError('No se puede quitar acceso a elementos dentro de carpetas compartidas.');
            return;
        }
        const ownerEmail = (initialData?.ownerEmail || (formData?.ownerId === user?.uid ? user?.email : '') || '').toLowerCase();
        if (ownerEmail && normalizedEmailToRemove === ownerEmail) {
            setShareError('No puedes quitar al propietario.');
            return;
        }
        setPendingUnshares(prev => (
            prev.includes(normalizedEmailToRemove)
                ? prev.filter(email => email !== normalizedEmailToRemove)
                : [...prev, normalizedEmailToRemove]
        ));
        setPendingPermissionChanges(prev => {
            if (!prev[normalizedEmailToRemove]) return prev;
            const next = { ...prev };
            delete next[normalizedEmailToRemove];
            return next;
        });
        setShareError('');
        setShareSuccess('');
    };

    const handleUpdatePermission = (emailToUpdate, nextRole) => {
        if (!isOwnerManager) return;
        const normalizedEmailToUpdate = (emailToUpdate || '').toLowerCase();
        const ownerEmail = (initialData?.ownerEmail || (formData?.ownerId === user?.uid ? user?.email : '') || '').toLowerCase();
        if (ownerEmail && normalizedEmailToUpdate === ownerEmail) {
            setShareError('No puedes cambiar permisos del propietario.');
            return;
        }
        const currentEntry = sharedList.find(entry => (entry.email || '').toLowerCase() === normalizedEmailToUpdate);
        const baseCurrentRole = currentEntry?.role || 'viewer';
        const stagedCurrentRole = pendingPermissionChanges[normalizedEmailToUpdate] || baseCurrentRole;
        if (stagedCurrentRole === nextRole) return;

        setPendingPermissionChanges(prev => {
            const next = { ...prev };
            if (nextRole === baseCurrentRole) {
                delete next[normalizedEmailToUpdate];
            } else {
                next[normalizedEmailToUpdate] = nextRole;
            }
            return next;
        });
        setPendingUnshares(prev => prev.filter(email => email !== normalizedEmailToUpdate));
        setShareError('');
        setShareSuccess('');
    };

    const stagedPermissionEntries = Object.entries(pendingPermissionChanges).filter(([email, nextRole]) => {
        const currentEntry = sharedList.find(entry => (entry.email || '').toLowerCase() === (email || '').toLowerCase());
        const currentRole = currentEntry?.role || 'viewer';
        return currentRole !== nextRole && !pendingUnshares.includes(email);
    });

    const hasPendingSharingChanges =
        shareQueue.length > 0 ||
        pendingUnshares.length > 0 ||
        stagedPermissionEntries.length > 0;

    const hasUnsavedSharingChanges =
        hasPendingSharingChanges ||
        showSelfUnshareConfirm;

    const handleBackdropCloseRequest = () => {
        if (pendingShareAction?.type === 'apply-all') {
            return;
        }

        if (hasUnsavedSharingChanges) {
            setShowDiscardPendingConfirm(true);
            return;
        }

        onClose();
    };

    const discardPendingAndClose = () => {
        setShareQueue([]);
        setPendingPermissionChanges({});
        setPendingUnshares([]);
        setPendingShareAction(null);
        setShowSelfUnshareConfirm(false);
        setShowDiscardPendingConfirm(false);
        setShareError('');
        setShareSuccess('');
        onClose();
    };

    const handleApplySharingChanges = () => {
        if (!hasPendingSharingChanges) {
            setShareError('No hay cambios pendientes para aplicar.');
            return;
        }

        setPendingShareAction({ type: 'apply-all' });
    };

    const requestRemoveMyShortcutAccess = () => {
        if (!formData?.shortcutId || !user?.email) return;
        setShowSelfUnshareConfirm(true);
        setShareError('');
        setShareSuccess('');
    };

    const requestTransferOwnership = (emailToTransfer) => {
        if (!canTransferOwnership) return;
        if (!onTransferOwnership) {
            setShareError('La transferencia de propiedad no está disponible en este momento.');
            return;
        }
        if (hasPendingSharingChanges) {
            setShareError('Aplica o descarta los cambios pendientes antes de transferir la propiedad.');
            return;
        }
        const normalizedEmail = (emailToTransfer || '').toLowerCase();
        if (!normalizedEmail) return;
        setPendingShareAction({ type: 'transfer-ownership', email: normalizedEmail });
        setShareError('');
        setShareSuccess('');
    };

    const confirmRemoveMyShortcutAccess = async () => {
        if (!formData?.shortcutId || !user?.email) return;

        setShareLoading(true);
        try {
            await onUnshare(formData.id, user.email);
        } catch (error) {
            setShareLoading(false);
            if (error?.code === 'permission-denied') {
                setShareError('No tienes permiso para eliminar tu acceso a esta asignatura.');
            } else {
                setShareError(error?.message || 'No se pudo eliminar tu acceso.');
            }
            return;
        }

        try {
            await onDeleteShortcut(formData.shortcutId);
        } catch (error) {
            setShareLoading(false);
            if (error?.code === 'permission-denied') {
                setShareError('No tienes permiso para eliminar tu acceso directo de esta asignatura.');
            } else {
                setShareError(error?.message || 'No se pudo eliminar tu acceso directo.');
            }
            return;
        }

        setShowSelfUnshareConfirm(false);
        setShareLoading(false);
        onClose();
    };

    const confirmPendingShareAction = async () => {
        if (!pendingShareAction) return;

        if (pendingShareAction.type === 'transfer-ownership') {
            try {
                setShareLoading(true);
                setShareError('');
                setShareSuccess('');
                await onTransferOwnership(formData.id, pendingShareAction.email);
                setPendingShareAction(null);
                setShareSuccess(`Propiedad transferida a ${pendingShareAction.email}.`);
                setTimeout(() => setShareSuccess(''), 4000);
                setShareLoading(false);
                onClose();
            } catch (error) {
                setShareLoading(false);
                if (error?.code === 'permission-denied') {
                    setShareError('No tienes permiso para transferir la propiedad de esta asignatura.');
                } else {
                    setShareError(error?.message || 'No se pudo transferir la propiedad.');
                }
            }
            return;
        }

        if (pendingShareAction.type !== 'apply-all') {
            setPendingShareAction(null);
            return;
        }

        setShareLoading(true);
        setShareError('');
        setShareSuccess('');

        const failures = [];
        let localSharedList = [...sharedList];

        for (const entry of shareQueue) {
            try {
                const result = await onShare(formData.id, entry.email, entry.role);
                const updatedEntry = {
                    email: entry.email,
                    uid: result?.uid,
                    role: entry.role,
                    canEdit: entry.role === 'editor',
                    sharedAt: result?.sharedAt || new Date()
                };
                const existingIndex = localSharedList.findIndex(u => (u.email || '').toLowerCase() === entry.email);
                if (existingIndex >= 0) {
                    localSharedList[existingIndex] = { ...localSharedList[existingIndex], ...updatedEntry };
                } else {
                    localSharedList.push(updatedEntry);
                }
            } catch (error) {
                if (error?.code === 'permission-denied') {
                    failures.push(`No tienes permiso para compartir con ${entry.email}`);
                } else {
                    failures.push(`No se pudo compartir con ${entry.email}`);
                }
            }
        }

        for (const [email, nextRole] of stagedPermissionEntries) {
            try {
                await onShare(formData.id, email, nextRole);
                localSharedList = localSharedList.map(entry =>
                    (entry.email || '').toLowerCase() === (email || '').toLowerCase()
                        ? { ...entry, role: nextRole, canEdit: nextRole === 'editor' }
                        : entry
                );
            } catch (error) {
                if (error?.code === 'permission-denied') {
                    failures.push(`No tienes permiso para actualizar permiso de ${email}`);
                } else {
                    failures.push(`No se pudo actualizar permiso de ${email}`);
                }
            }
        }

        for (const email of pendingUnshares) {
            try {
                await onUnshare(formData.id, email);
                localSharedList = localSharedList.filter(entry => (entry.email || '').toLowerCase() !== (email || '').toLowerCase());
            } catch (error) {
                if (error?.code === 'permission-denied') {
                    failures.push(`No tienes permiso para quitar acceso a ${email}`);
                } else {
                    failures.push(`No se pudo quitar acceso a ${email}`);
                }
            }
        }

        setSharedList(localSharedList);
        setShareQueue([]);
        setPendingPermissionChanges({});
        setPendingUnshares([]);
        setPendingShareAction(null);

        if (failures.length > 0) {
            const preview = failures.slice(0, 3).join('. ');
            const overflow = failures.length > 3 ? ` y ${failures.length - 3} más` : '';
            setShareError(`${preview}${overflow}.`);
        } else if (hasPendingSharingChanges) {
            setShareSuccess('Cambios de accesibilidad aplicados correctamente.');
            setTimeout(() => setShareSuccess(''), 4000);
        }

        setShareLoading(false);
    };

    const getAvatarText = (email = '') => {
        const normalized = String(email || '').trim();
        if (!normalized) return '?';
        return normalized.charAt(0).toUpperCase();
    };

    const getAvatarUrl = (entry) => {
        return entry?.photoURL
            || '';
    };

    const getDisplayName = (entry) => {
        const explicitName = entry?.displayName || entry?.name || entry?.fullName || entry?.userName || '';
        if (explicitName) return explicitName;

        const email = String(entry?.email || '').trim();
        if (!email.includes('@')) return email || 'Usuario';
        const localPart = email.split('@')[0];
        return localPart
            .replace(/[._-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const ownerEmailRaw = initialData?.ownerEmail || ownerEmailResolved || (formData?.ownerId === user?.uid ? user?.email : '') || '';
    const ownerAvatar = initialData?.ownerPhotoURL || initialData?.ownerPhotoUrl || initialData?.ownerAvatar || (formData?.ownerId === user?.uid ? (user?.photoURL || user?.avatarUrl || '') : '');
    const ownerDisplayName = initialData?.ownerName || initialData?.ownerDisplayName || (formData?.ownerId === user?.uid ? (user?.displayName || user?.name || '') : '');
    const ownerEmailNormalized = ownerEmailRaw.toLowerCase();
    const ownerEntry = ownerEmailRaw
        ? [{ email: ownerEmailRaw, role: 'owner', isOwnerEntry: true, photoURL: ownerAvatar, displayName: ownerDisplayName }]
        : [];
    const sharedWithoutOwner = sharedList.filter(share => (share.email || '').toLowerCase() !== ownerEmailNormalized);
    const allSharedEntries = [...ownerEntry, ...sharedWithoutOwner];

    const normalizedShareSearch = shareSearch.trim().toLowerCase();
    const showShareSearch = allSharedEntries.length > 5;
    const displayedSharedList = showShareSearch
        ? allSharedEntries.filter(share => (share.email || '').toLowerCase().includes(normalizedShareSearch))
        : allSharedEntries;

    const normalizedTypedEmail = shareEmail.trim().toLowerCase();
    const currentUserEmail = (user?.email || '').toLowerCase();
    const currentDomain = currentUserEmail.includes('@') ? currentUserEmail.split('@')[1] : '';
    const sharedEmailSet = new Set(sharedWithoutOwner.map(entry => (entry.email || '').toLowerCase()));
    const queuedEmailSet = new Set((shareQueue || []).map(entry => (entry?.email || '').toLowerCase()));

    const suggestedEmails = normalizedTypedEmail
        ? institutionEmails
            .filter(email =>
                email.includes(normalizedTypedEmail) &&
                email !== currentUserEmail &&
                email !== ownerEmailNormalized &&
                !sharedEmailSet.has(email) &&
                !queuedEmailSet.has(email)
            )
            .sort((a, b) => {
                const aSameDomain = currentDomain && a.endsWith(`@${currentDomain}`) ? 1 : 0;
                const bSameDomain = currentDomain && b.endsWith(`@${currentDomain}`) ? 1 : 0;
                if (aSameDomain !== bSameDomain) return bSameDomain - aSameDomain;

                const aStarts = a.startsWith(normalizedTypedEmail) ? 1 : 0;
                const bStarts = b.startsWith(normalizedTypedEmail) ? 1 : 0;
                if (aStarts !== bStarts) return bStarts - aStarts;

                return a.localeCompare(b);
            })
            .slice(0, 6)
        : [];

    const shouldShowShareSuggestions = shareSuggestionsOpen && suggestedEmails.length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto" style={OVERLAY_TOP_OFFSET_STYLE}>
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" onClick={handleBackdropCloseRequest} />
                <div className="relative transform overflow-hidden bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[calc(100vh-10rem)] shadow-xl text-left animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800 transition-colors">
                    
                    {/* Header */}
                    <div className="relative px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center transition-colors overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-r ${formData.color || 'from-blue-400 to-blue-600'} opacity-15 dark:opacity-20`} />
                        <h3 className="relative text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
                        <button onClick={onClose} className="relative p-1 hover:bg-gray-200/80 dark:hover:bg-slate-700/80 rounded-full text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Tabs */}
                    {isEditing && (
                        <div className="px-6 pt-4 border-b border-gray-100 dark:border-slate-800 flex overflow-x-auto gap-2">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`px-4 py-2 rounded-t-xl font-medium transition-colors ${
                                    activeTab === 'general'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                                }`}
                            >
                                General
                            </button>
                            {!isTagOnlyShortcutEdit && (
                                <button
                                    onClick={() => setActiveTab('sharing')}
                                    className={`px-4 py-2 rounded-t-xl font-medium transition-colors flex items-center gap-2 ${
                                        activeTab === 'sharing'
                                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Share2 size={16} /> Compartir
                                </button>
                            )}
                            {canAccessClassesTab && (
                                <button
                                    onClick={() => setActiveTab('classes')}
                                    className={`px-4 py-2 rounded-t-xl font-medium transition-colors ${
                                        activeTab === 'classes'
                                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Clases
                                </button>
                            )}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="p-6 pb-20 space-y-5 max-h-[calc(100vh-15rem)] overflow-y-auto clean-scrollbar">
                        
                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <>
                                {isTagOnlyShortcutEdit ? (
                                    <TagManager formData={formData} setFormData={setFormData} />
                                ) : (
                                    <>
                                        {coursesLoadError && (
                                            <div className="mb-3 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                                {coursesLoadError}
                                            </div>
                                        )}
                                        {canEditOriginalFields && (
                                            <BasicInfoFields
                                                formData={formData}
                                                setFormData={setFormData}
                                                validationErrors={validationErrors}
                                                setValidationErrors={setValidationErrors}
                                                nameInputRef={subjectNameInputRef}
                                                courseSelectRef={subjectCourseSelectRef}
                                                availableCourses={availableCourses}
                                                coursesLoading={coursesLoading}
                                            />
                                        )}
                                        <TagManager formData={formData} setFormData={setFormData} />
                                        <AppearanceSection
                                            formData={formData}
                                            setFormData={setFormData}
                                            hideIconSelector={!canEditOriginalFields}
                                        />
                                        <StyleSelector formData={formData} setFormData={setFormData} />
                                    </>
                                )}
                            </>
                        )}

                        {/* Sharing Tab */}
                        {activeTab === 'sharing' && (
                            <div className="space-y-4">
                                {ownerEmailResolveError && (
                                    <div className="rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                        {ownerEmailResolveError}
                                    </div>
                                )}
                                {canManageSharing && (
                                    <div>
                                        {institutionEmailsLoadError && (
                                            <div className="mb-3 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                                {institutionEmailsLoadError}
                                            </div>
                                        )}
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Compartir con
                                        </label>
                                        <div className="relative">
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={shareEmail}
                                                    onChange={(e) => {
                                                        setShareEmail(e.target.value);
                                                        setShareError('');
                                                        setShareSuggestionsOpen(true);
                                                    }}
                                                    onFocus={() => setShareSuggestionsOpen(true)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddToShareQueue();
                                                        }
                                                    }}
                                                    placeholder="usuario@ejemplo.com"
                                                    disabled={shareLoading}
                                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors disabled:opacity-60"
                                                />
                                                <select
                                                    value={shareRole}
                                                    onChange={(e) => setShareRole(e.target.value)}
                                                    disabled={shareLoading}
                                                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                                >
                                                    <option value="viewer">Lector</option>
                                                    <option value="editor">Editor</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={handleAddToShareQueue}
                                                    disabled={shareLoading}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    <Users size={16} />
                                                    Añadir
                                                </button>
                                            </div>

                                            {shouldShowShareSuggestions && (
                                                <div className="absolute left-0 right-0 top-full mt-1 z-20 p-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-lg">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sugerencias de tu institución</p>
                                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                                        {suggestedEmails.map((email) => (
                                                            <button
                                                                key={email}
                                                                type="button"
                                                                onClick={() => {
                                                                    setShareEmail(email);
                                                                    setShareSuggestionsOpen(false);
                                                                }}
                                                                className="w-full text-left px-2 py-1 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                                            >
                                                                {email}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {shareQueue.length > 0 && (
                                            <div className="mt-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/40">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs text-gray-600 dark:text-gray-300">En espera para compartir ({shareQueue.length})</p>
                                                    <span className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">
                                                        Se aplicará al guardar cambios
                                                    </span>
                                                </div>
                                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                                    {shareQueue.map((entry) => (
                                                        <div key={entry.email} className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                                                            <div>
                                                                <p className="text-sm text-gray-800 dark:text-gray-200">{entry.email}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{entry.role === 'editor' ? 'Editor' : 'Lector'}</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFromShareQueue(entry.email)}
                                                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Error message */}
                                        {shareError && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle size={14} className="flex-shrink-0" />
                                                {shareError}
                                            </div>
                                        )}

                                        {/* Success message */}
                                        {shareSuccess && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                                <CheckCircle size={14} className="flex-shrink-0" />
                                                {shareSuccess}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Shared Users List */}
                                {allSharedEntries.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Compartido con ({allSharedEntries.length})
                                        </h4>
                                        {showShareSearch && (
                                            <input
                                                type="text"
                                                value={shareSearch}
                                                onChange={(e) => setShareSearch(e.target.value)}
                                                placeholder="Buscar usuario compartido..."
                                                className="w-full mb-3 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                            />
                                        )}
                                        <div className="space-y-2">
                                            {displayedSharedList.map((share) => {
                                                const normalizedShareEmail = (share.email || '').toLowerCase();
                                                const isPendingUnshare = pendingUnshares.includes(normalizedShareEmail);
                                                const avatarUrl = getAvatarUrl(share);
                                                const displayName = getDisplayName(share);
                                                const currentRole = pendingPermissionChanges[normalizedShareEmail] || share.role || 'viewer';
                                                return (
                                                <div
                                                    key={share.email}
                                                    className={`flex items-center justify-between p-3 rounded-lg transition-colors border ${
                                                        isPendingUnshare
                                                            ? 'bg-red-50 border-red-200 dark:bg-red-900/25 dark:border-red-800/70'
                                                            : 'bg-gray-50 border-transparent dark:bg-slate-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {avatarUrl ? (
                                                            <img
                                                                src={avatarUrl}
                                                                alt={share.email}
                                                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/35 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-semibold border border-indigo-200 dark:border-indigo-800">
                                                                {getAvatarText(share.email)}
                                                            </div>
                                                        )}
                                                        <div>
                                                        <p className={`text-sm font-semibold ${isPendingUnshare ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>
                                                            {displayName}
                                                        </p>
                                                        <p className={`text-xs mt-0.5 ${isPendingUnshare ? 'text-red-600 dark:text-red-300 line-through' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {share.email}
                                                        </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {share.role === 'owner' ? (
                                                            <span className="text-xs px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
                                                                Propietario
                                                            </span>
                                                        ) : isOwnerManager ? (
                                                            <select
                                                                value={currentRole}
                                                                onChange={(e) => handleUpdatePermission(share.email, e.target.value)}
                                                                disabled={isPendingUnshare}
                                                                className="text-xs px-2 py-1 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 disabled:opacity-70"
                                                            >
                                                                <option value="viewer">Lector</option>
                                                                <option value="editor">Editor</option>
                                                            </select>
                                                        ) : (
                                                            <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                                                                {share.role === 'viewer' ? 'Lector' : 'Editor'}
                                                            </span>
                                                        )}
                                                        {share.role !== 'owner' && canTransferOwnership && (
                                                            <button
                                                                type="button"
                                                                onClick={() => requestTransferOwnership(share.email)}
                                                                disabled={isPendingUnshare || shareLoading}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/45 disabled:opacity-60"
                                                                title="Transferir propiedad"
                                                            >
                                                                Transferir
                                                            </button>
                                                        )}
                                                        {share.role !== 'owner' && !unshareBlockedInSharedFolder && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUnshareAction(share.email)}
                                                                disabled={!canManageSharing}
                                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                                    isPendingUnshare
                                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/45'
                                                                        : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                }`}
                                                                title={isPendingUnshare ? 'Deshacer quitar acceso' : 'Quitar acceso al aplicar cambios'}
                                                                style={{ display: canManageSharing ? 'inline-flex' : 'none' }}
                                                            >
                                                                {isPendingUnshare ? <RotateCcw size={16} /> : <Trash2 size={16} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {allSharedEntries.length === 0 && (
                                    <div className="text-center py-6">
                                        <Users className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Esta asignatura no está compartida con nadie
                                        </p>
                                    </div>
                                )}

                                {isShortcutEditing && !isOwnerManager && !unshareBlockedInSharedFolder && (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={requestRemoveMyShortcutAccess}
                                            className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl font-medium transition-colors"
                                        >
                                            Eliminar acceso para mí
                                        </button>
                                        {showSelfUnshareConfirm && (
                                            <div className="p-3 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                                                <p className="text-sm text-red-800 dark:text-red-200">
                                                    Confirma si deseas eliminar tu acceso. Esta acción solo revocará tu acceso y eliminará tu acceso directo, sin aplicar otros cambios pendientes.
                                                </p>
                                                <div className="mt-3 flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowSelfUnshareConfirm(false)}
                                                        className="px-3 py-1.5 text-sm rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={confirmRemoveMyShortcutAccess}
                                                        className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        Confirmar eliminación
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'classes' && canAccessClassesTab && (
                            <div className="space-y-4">
                                {institutionPolicyLoadError && (
                                    <div className="rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                        {institutionPolicyLoadError}
                                    </div>
                                )}
                                <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/20 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Código de invitación de asignatura</h4>
                                            <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">Úsalo para inscribir estudiantes que no estén asociados a una clase.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCopyInviteCode}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                        >
                                            <Copy className="w-4 h-4" /> Copiar
                                        </button>
                                    </div>
                                    <div className="mt-3 font-mono tracking-[0.2em] text-base text-indigo-900 dark:text-indigo-100 bg-white/80 dark:bg-slate-900/70 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2">
                                        {String(formData?.inviteCode || initialData?.inviteCode || 'NO-DISPONIBLE').toUpperCase()}
                                    </div>
                                    {inviteCodeCopyStatus && (
                                        <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">{inviteCodeCopyStatus}</p>
                                    )}
                                </div>

                                {!canModifyClassAssignments && (
                                    <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-200">
                                        Tienes permiso de lector en esta asignatura. Puedes ver y copiar el código de invitación, pero no modificar la asignación de clases.
                                    </div>
                                )}

                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-4">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Gestión por clases</h4>
                                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                        {canModifyClassAssignments && canDirectAssignClasses
                                            ? 'Selecciona las clases que tendrán acceso a esta asignatura.'
                                            : canModifyClassAssignments
                                                ? 'Selecciona tus clases y envía una solicitud para que administración la apruebe.'
                                                : 'Vista de solo lectura para permisos de lector.'}
                                    </p>
                                </div>

                                {classesActionError && (
                                    <div className="rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                        {classesActionError}
                                    </div>
                                )}

                                {classesActionSuccess && (
                                    <div className="rounded-lg border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                                        {classesActionSuccess}
                                    </div>
                                )}

                                {classesLoadError && (
                                    <div className="rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                        {classesLoadError}
                                    </div>
                                )}

                                {classesLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Cargando clases...
                                    </div>
                                ) : availableClasses.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No hay clases disponibles para asignar.</p>
                                ) : (
                                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                        {availableClasses.map((cl) => (
                                            <label key={cl.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClassIds.includes(cl.id)}
                                                    onChange={() => toggleClassSelection(cl.id)}
                                                    disabled={!canModifyClassAssignments}
                                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{cl.name || 'Clase'}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{(cl.studentIds || []).length} alumno(s)</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors cursor-pointer">Cancelar</button>
                            {activeTab === 'general' && (
                                <button type="submit" className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2 cursor-pointer transition-colors">
                                    <Save className="w-4 h-4" /> {isEditing ? 'Guardar' : 'Crear'}
                                </button>
                            )}
                            {activeTab === 'sharing' && canManageSharing && (
                                <button
                                    type="button"
                                    onClick={handleApplySharingChanges}
                                    disabled={!hasPendingSharingChanges || shareLoading}
                                    className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {shareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Aplicar cambios
                                </button>
                            )}
                            {activeTab === 'classes' && canAccessClassesTab && canModifyClassAssignments && canDirectAssignClasses && (
                                <button
                                    type="button"
                                    onClick={handleSaveClassAssignments}
                                    className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2 transition-colors"
                                >
                                    <Save className="w-4 h-4" /> Guardar clases
                                </button>
                            )}
                            {activeTab === 'classes' && canAccessClassesTab && canModifyClassAssignments && !canDirectAssignClasses && (
                                <button
                                    type="button"
                                    onClick={handleRequestClassAssignments}
                                    disabled={classesActionLoading}
                                    className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {classesActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Solicitar asignación
                                </button>
                            )}
                        </div>
                    </form>

                    {pendingShareAction?.type === 'apply-all' && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="absolute inset-0 bg-black/55" onClick={(e) => { e.stopPropagation(); setPendingShareAction(null); }} />
                            <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Confirmar aplicación de cambios</h4>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Se aplicarán los siguientes cambios de accesibilidad:</p>
                                <ul className="mt-3 list-disc list-inside text-sm text-gray-700 dark:text-gray-200 space-y-1">
                                    {shareQueue.length > 0 && <li>Compartir con {shareQueue.length} usuario(s) nuevos.</li>}
                                    {stagedPermissionEntries.length > 0 && <li>Actualizar permisos de {stagedPermissionEntries.length} usuario(s).</li>}
                                    {pendingUnshares.length > 0 && <li>Quitar acceso a {pendingUnshares.length} usuario(s).</li>}
                                </ul>
                                <div className="mt-3 max-h-32 overflow-y-auto rounded-md border border-gray-200 dark:border-slate-700 p-2 text-xs text-gray-700 dark:text-gray-300">
                                    {shareQueue.map(entry => (
                                        <p key={`add-${entry.email}`}>• {entry.email}: se añadirá como {entry.role === 'editor' ? 'Editor' : 'Lector'}.</p>
                                    ))}
                                    {stagedPermissionEntries.map(([email, role]) => (
                                        <p key={`perm-${email}`}>• {email}: permiso cambiará a {role === 'editor' ? 'Editor' : 'Lector'}.</p>
                                    ))}
                                    {pendingUnshares.map(email => (
                                        <p key={`del-${email}`}>• {email}: perderá acceso a esta asignatura.</p>
                                    ))}
                                </div>

                                <div className="mt-5 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPendingShareAction(null)}
                                        className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmPendingShareAction}
                                        className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {pendingShareAction?.type === 'transfer-ownership' && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="absolute inset-0 bg-black/55" onClick={(e) => { e.stopPropagation(); setPendingShareAction(null); }} />
                            <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Confirmar transferencia de propiedad</h4>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    Esta asignatura dejará de ser tuya y pasará a <span className="font-semibold">{pendingShareAction.email}</span>.
                                </p>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Se conservará un acceso directo para ti y se ajustará la ubicación/estilo según la vista del nuevo propietario.
                                </p>
                                <div className="mt-5 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPendingShareAction(null)}
                                        className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmPendingShareAction}
                                        className="px-3 py-1.5 text-sm rounded-md bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        Transferir propiedad
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showDiscardPendingConfirm && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="absolute inset-0 bg-black/55" onClick={(e) => { e.stopPropagation(); setShowDiscardPendingConfirm(false); }} />
                            <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Descartar cambios sin guardar</h4>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    Tienes cambios pendientes en Compartir. ¿Quieres descartarlos y cerrar la ventana?
                                </p>
                                <div className="mt-5 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowDiscardPendingConfirm(false)}
                                        className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={discardPendingAndClose}
                                        className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        Descartar y cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectFormModal;