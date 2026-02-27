// src/pages/Subject/modals/SubjectFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Users, Trash2, Share2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { MODERN_FILL_COLORS, EDUCATION_LEVELS } from '../../../utils/subjectConstants';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';

// Sub-components
import BasicInfoFields from './subject-form/BasicInfoFields';
import TagManager from './subject-form/TagManager';
import AppearanceSection from './subject-form/AppearanceSection';
import StyleSelector from './subject-form/StyleSelector';
import { getPermissionLevel } from '../../../utils/permissionUtils';

const SubjectFormModal = ({ isOpen, onClose, onSave, initialData, isEditing, onShare, onUnshare, onDeleteShortcut, user, allFolders = [], initialTab = 'general' }) => {
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
    const [pendingShareAction, setPendingShareAction] = useState(null);
    const [shareLoading, setShareLoading] = useState(false);
    const [shareError, setShareError] = useState('');
    const [shareSuccess, setShareSuccess] = useState('');

    const isShortcutEditing = isEditing && formData?.isShortcut === true;
    const shortcutPermissionLevel = formData?.shortcutPermissionLevel || 'viewer';
    const isShortcutEditor = shortcutPermissionLevel === 'editor' || shortcutPermissionLevel === 'owner';
    const canManageSharing = !isShortcutEditing || isShortcutEditor;
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

    // 1. Initialize Logic
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setShareEmail('');
            setShareError('');
            setShareSuccess('');
            setShareRole('viewer');
            setShareQueue([]);
            setShareSearch('');
            setShareSuggestionsOpen(false);
            setPendingShareAction(null);
            if (isEditing && initialData) {
                setFormData({
                    id: initialData.id,
                    ownerId: initialData.ownerId,
                    shortcutId: initialData.shortcutId || null,
                    isShortcut: initialData.isShortcut === true,
                    shortcutPermissionLevel: initialData.isShortcut
                        ? getPermissionLevel(initialData, user?.uid)
                        : 'owner',
                    name: initialData.name || '',
                    course: initialData.course || '',
                    level: '', grade: '', 
                    color: initialData.color || 'from-blue-400 to-blue-600',
                    icon: initialData.icon || 'book',
                    tags: initialData.tags || [],
                    cardStyle: initialData.cardStyle || 'default',
                    modernFillColor: initialData.fillColor || initialData.modernFillColor || MODERN_FILL_COLORS[0].value
                });
                // Load shared list
                setSharedList(initialData.sharedWith || []);
            } else {
                // When creating new subject, pre-fill course, level, and grade if provided
                // Validate that level exists in EDUCATION_LEVELS
                const prefilledLevel = initialData?.level || '';
                const prefilledGrade = initialData?.grade || '';
                const validLevel = prefilledLevel && EDUCATION_LEVELS[prefilledLevel] ? prefilledLevel : '';
                const validGrade = validLevel && prefilledGrade && EDUCATION_LEVELS[validLevel].includes(prefilledGrade) ? prefilledGrade : '';
                
                setFormData({ 
                    shortcutId: null,
                    isShortcut: false,
                    shortcutPermissionLevel: 'owner',
                    name: '',
                    level: validLevel,
                    grade: validGrade,
                    course: initialData?.course || '',
                    color: 'from-blue-400 to-blue-600',
                    icon: 'book',
                    tags: [],
                    cardStyle: 'default',
                    modernFillColor: MODERN_FILL_COLORS[0].value
                });
                setSharedList([]);
            }
        }
    }, [isOpen, isEditing, initialData, initialTab, user?.uid]);

    useEffect(() => {
        let active = true;

        const loadInstitutionEmails = async () => {
            if (!isOpen || !user?.institutionId) {
                if (active) setInstitutionEmails([]);
                return;
            }

            try {
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
            } catch (error) {
                if (active) setInstitutionEmails([]);
            }
        };

        loadInstitutionEmails();
        return () => { active = false; };
    }, [isOpen, user?.institutionId]);

    // 2. Auto-generate Course Name (only if course is not pre-filled from outside)
    useEffect(() => {
        if (formData.level && formData.grade && !isEditing) {
            // Only auto-generate if we don't already have a manually set course
            // or if the course doesn't match the expected format
            const expectedCourse = `${formData.grade} ${formData.level}`;
            const reversedCourse = `${formData.level} ${formData.grade}`;
            if (formData.course !== expectedCourse && formData.course !== reversedCourse) {
                setFormData(prev => ({ ...prev, course: expectedCourse }));
            }
        }
    }, [formData.level, formData.grade, isEditing]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const executeShareAction = async (emailToShare, roleToShare) => {
        const normalizedEmail = emailToShare.toLowerCase();
        const ownerEmail = (initialData?.ownerEmail || (formData?.ownerId === user?.uid ? user?.email : '') || '').toLowerCase();
        if (ownerEmail && normalizedEmail === ownerEmail) {
            setShareError('No puedes compartir con el propietario.');
            return;
        }
        setShareLoading(true);
        setShareError('');
        setShareSuccess('');
        try {
            const result = await onShare(formData.id, normalizedEmail, roleToShare);
            const updatedEntry = {
                email: normalizedEmail,
                uid: result?.uid,
                role: roleToShare,
                canEdit: roleToShare === 'editor',
                sharedAt: result?.sharedAt || new Date()
            };
            setSharedList(prev => {
                const existingIndex = prev.findIndex(u => u.email?.toLowerCase() === normalizedEmail);
                if (existingIndex >= 0) {
                    const next = [...prev];
                    next[existingIndex] = { ...next[existingIndex], ...updatedEntry };
                    return next;
                }
                return [...prev, updatedEntry];
            });
            setShareEmail('');
            setShareRole('viewer');
            setShareSuccess(result?.roleUpdated
                ? `Permisos actualizados para ${normalizedEmail}.`
                : `Asignatura compartida con ${normalizedEmail}.`
            );
            setTimeout(() => setShareSuccess(''), 4000);
        } catch (error) {
            setShareError(error?.message || 'Error al compartir. Inténtalo de nuevo.');
        } finally {
            setShareLoading(false);
        }
    };

    const executeUnshareAction = async (emailToRemove) => {
        try {
            await onUnshare(formData.id, emailToRemove);
            setSharedList(prev => prev.filter(u => u.email !== emailToRemove));
        } catch (error) {
            console.error('Error unsharing subject:', error);
        }
    };

    const executeBatchShareAction = async (entries) => {
        if (!Array.isArray(entries) || entries.length === 0) {
            setShareError('No hay usuarios seleccionados para compartir.');
            return;
        }

        setShareLoading(true);
        setShareError('');
        setShareSuccess('');

        const successEntries = [];
        const failedEntries = [];

        for (const entry of entries) {
            try {
                const result = await onShare(formData.id, entry.email, entry.role);
                successEntries.push({
                    email: entry.email,
                    uid: result?.uid,
                    role: entry.role,
                    canEdit: entry.role === 'editor',
                    sharedAt: result?.sharedAt || new Date()
                });
            } catch (error) {
                failedEntries.push({
                    email: entry.email,
                    message: error?.message || 'Error al compartir'
                });
            }
        }

        if (successEntries.length > 0) {
            setSharedList(prev => {
                const next = [...prev];
                successEntries.forEach(updatedEntry => {
                    const existingIndex = next.findIndex(u => (u.email || '').toLowerCase() === updatedEntry.email);
                    if (existingIndex >= 0) {
                        next[existingIndex] = { ...next[existingIndex], ...updatedEntry };
                    } else {
                        next.push(updatedEntry);
                    }
                });
                return next;
            });
        }

        if (failedEntries.length > 0) {
            const failedSummary = failedEntries.slice(0, 3).map(item => item.email).join(', ');
            const overflow = failedEntries.length > 3 ? ` y ${failedEntries.length - 3} más` : '';
            setShareError(`Se compartió con ${successEntries.length} usuario(s), pero falló con ${failedEntries.length}: ${failedSummary}${overflow}.`);
        } else {
            setShareSuccess(`Asignatura compartida con ${successEntries.length} usuario(s).`);
        }

        setShareQueue([]);
        setShareEmail('');
        setShareRole('viewer');
        setTimeout(() => setShareSuccess(''), 4000);
        setShareLoading(false);
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

    const handleShareAction = () => {
        if (shareQueue.length === 0) {
            setShareError('Debes añadir al menos un usuario a la lista para compartir.');
            return;
        }

        setPendingShareAction({
            type: 'share-batch',
            entries: [...shareQueue]
        });
    };

    const handleUnshareAction = (emailToRemove) => {
        if (unshareBlockedInSharedFolder) {
            setShareError('No se puede quitar acceso a elementos dentro de carpetas compartidas.');
            return;
        }
        const ownerEmail = (initialData?.ownerEmail || (formData?.ownerId === user?.uid ? user?.email : '') || '').toLowerCase();
        if (ownerEmail && (emailToRemove || '').toLowerCase() === ownerEmail) {
            setShareError('No puedes quitar al propietario.');
            return;
        }
        setPendingShareAction({
            type: 'unshare',
            email: emailToRemove
        });
    };

    const handleUpdatePermission = (emailToUpdate, nextRole) => {
        if (!isOwnerManager) return;
        const ownerEmail = (initialData?.ownerEmail || (formData?.ownerId === user?.uid ? user?.email : '') || '').toLowerCase();
        if (ownerEmail && (emailToUpdate || '').toLowerCase() === ownerEmail) {
            setShareError('No puedes cambiar permisos del propietario.');
            return;
        }
        const currentEntry = sharedList.find(entry => entry.email === emailToUpdate);
        const currentRole = currentEntry?.role || 'viewer';
        if (currentRole === nextRole) return;

        setPendingShareAction({
            type: 'permission',
            email: emailToUpdate,
            currentRole,
            nextRole
        });
    };

    const confirmPendingShareAction = async () => {
        if (!pendingShareAction) return;

        if (pendingShareAction.type === 'share-batch') {
            await executeBatchShareAction(pendingShareAction.entries || []);
            setPendingShareAction(null);
            return;
        }

        if (pendingShareAction.type === 'permission') {
            try {
                await onShare(formData.id, pendingShareAction.email, pendingShareAction.nextRole);
                setSharedList(prev => prev.map(entry =>
                    entry.email === pendingShareAction.email
                        ? { ...entry, role: pendingShareAction.nextRole, canEdit: pendingShareAction.nextRole === 'editor' }
                        : entry
                ));
            } catch (error) {
                setShareError(error?.message || 'No se pudo actualizar el permiso.');
            }
            setPendingShareAction(null);
            return;
        }

        if (pendingShareAction.type === 'unshare') {
            await executeUnshareAction(pendingShareAction.email);
            setPendingShareAction(null);
        }
    };

    const handleRemoveMyShortcutAccess = async () => {
        if (!formData?.shortcutId || !user?.email) return;
        if (!window.confirm('Se eliminará este acceso directo y se revocará el acceso compartido para tu usuario. ¿Continuar?')) {
            return;
        }

        try {
            await onUnshare(formData.id, user.email);
            await onDeleteShortcut(formData.shortcutId);
            onClose();
        } catch (error) {
            setShareError(error?.message || 'No se pudo eliminar tu acceso.');
        }
    };

    const ownerEmailRaw = initialData?.ownerEmail || (formData?.ownerId === user?.uid ? user?.email : '') || '';
    const ownerEmailNormalized = ownerEmailRaw.toLowerCase();
    const ownerEntry = ownerEmailRaw
        ? [{ email: ownerEmailRaw, role: 'owner', isOwnerEntry: true }]
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 pt-28 text-center">
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="relative transform overflow-hidden bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[calc(100vh-8rem)] shadow-xl text-left animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800 transition-colors">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Tabs */}
                    {isEditing && (
                        <div className="px-6 pt-4 border-b border-gray-100 dark:border-slate-800 flex gap-2">
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
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="p-6 pb-20 space-y-5 max-h-[calc(100vh-13rem)] overflow-y-auto custom-scrollbar">
                        
                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <>
                                {canEditOriginalFields && (
                                    <BasicInfoFields formData={formData} setFormData={setFormData} />
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

                        {/* Sharing Tab */}
                        {activeTab === 'sharing' && (
                            <div className="space-y-4">
                                {canManageSharing && (
                                    <div>
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
                                                    <button
                                                        type="button"
                                                        onClick={handleShareAction}
                                                        disabled={shareLoading}
                                                        className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-md font-medium transition-colors disabled:opacity-60"
                                                    >
                                                        Compartir seleccionados
                                                    </button>
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

                                {pendingShareAction && (
                                    <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            {pendingShareAction.type === 'share-batch' && (
                                                <>Vas a compartir esta asignatura con <strong>{pendingShareAction.entries?.length || 0}</strong> usuario(s) seleccionados.</>
                                            )}
                                            {pendingShareAction.type === 'permission' && (
                                                <>
                                                    Vas a cambiar a <strong>{pendingShareAction.email}</strong> de <strong>{pendingShareAction.currentRole === 'editor' ? 'Editor' : 'Lector'}</strong> a <strong>{pendingShareAction.nextRole === 'editor' ? 'Editor' : 'Lector'}</strong>.
                                                    {pendingShareAction.nextRole === 'editor'
                                                        ? ' Podrá editar y mover contenido según permisos de carpeta compartida.'
                                                        : ' Perderá permisos de edición y movimiento de contenido.'}
                                                </>
                                            )}
                                            {pendingShareAction.type === 'unshare' && (
                                                <>Vas a dejar de compartir esta asignatura con <strong>{pendingShareAction.email}</strong>.</>
                                            )}
                                        </p>
                                        <div className="mt-3 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPendingShareAction(null)}
                                                className="px-3 py-1.5 text-sm rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
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
                                )}

                                {/* Shared Users List */}
                                {sharedList.length > 0 && (
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
                                            {displayedSharedList.map((share) => (
                                                <div
                                                    key={share.email}
                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {share.email}
                                                        </p>
                                                        {share.role === 'owner' ? (
                                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">Propietario</p>
                                                        ) : isOwnerManager ? (
                                                            <select
                                                                value={share.role || 'viewer'}
                                                                onChange={(e) => handleUpdatePermission(share.email, e.target.value)}
                                                                className="mt-1 text-xs px-2 py-1 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300"
                                                            >
                                                                <option value="viewer">Lector</option>
                                                                <option value="editor">Editor</option>
                                                            </select>
                                                        ) : (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {share.role === 'viewer' ? 'Lector' : 'Editor'}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {share.role !== 'owner' && !unshareBlockedInSharedFolder && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUnshareAction(share.email)}
                                                            disabled={!canManageSharing}
                                                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                                            title="Dejar de compartir"
                                                            style={{ display: canManageSharing ? 'inline-flex' : 'none' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sharedList.length === 0 && (
                                    <div className="text-center py-6">
                                        <Users className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Esta asignatura no está compartida con nadie
                                        </p>
                                    </div>
                                )}

                                {isShortcutEditing && !unshareBlockedInSharedFolder && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveMyShortcutAccess}
                                        className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl font-medium transition-colors"
                                    >
                                        Eliminar acceso para mí
                                    </button>
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
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubjectFormModal;