// src/pages/Home/components/FolderManager.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Share2, Users, Loader2, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { COLORS, MODERN_FILL_COLORS } from '../../../utils/subjectConstants';
import { getPermissionLevel } from '../../../utils/permissionUtils';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const FolderManager = ({
    isOpen, onClose, onSave, initialData, isEditing,
    onShare, onUnshare, onDeleteShortcut, user, allFolders = [], initialTab = 'general'
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: 'from-amber-400 to-amber-600',
        tags: [],
        cardStyle: 'default',
        modernFillColor: MODERN_FILL_COLORS[0].value
    });

    const [activeTab, setActiveTab] = useState('general');
    const [tagInput, setTagInput] = useState('');

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
    const [pendingPermissionChanges, setPendingPermissionChanges] = useState({});
    const [pendingUnshares, setPendingUnshares] = useState([]);
    const [shareLoading, setShareLoading] = useState(false);
    const [shareError, setShareError] = useState('');
    const [shareSuccess, setShareSuccess] = useState('');

    const [showModernFillOptions, setShowModernFillOptions] = useState(false);

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

    const folderParentId = formData?.shortcutParentId ?? formData?.parentId ?? initialData?.shortcutParentId ?? initialData?.parentId ?? null;
    const unshareBlockedInSharedFolder = isInsideSharedFolderTree(folderParentId);

    useEffect(() => {
        if (!isOpen) return;

        setActiveTab(initialTab);
        setTagInput('');
        setShareEmail('');
        setShareRole('viewer');
        setShareQueue([]);
        setShareSearch('');
        setShareSuggestionsOpen(false);
        setOwnerEmailResolved('');
        setPendingShareAction(null);
        setShowSelfUnshareConfirm(false);
        setPendingPermissionChanges({});
        setPendingUnshares([]);
        setShareError('');
        setShareSuccess('');
        setShowModernFillOptions(false);

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
                description: initialData.description || '',
                color: initialData.color || 'from-amber-400 to-amber-600',
                tags: initialData.tags || [],
                cardStyle: initialData.cardStyle || 'default',
                modernFillColor: initialData.fillColor || initialData.modernFillColor || MODERN_FILL_COLORS[0].value
            });
            setSharedList(initialData.sharedWith || []);
            setShareQueue([]);
            return;
        }

        setFormData({
            shortcutId: null,
            isShortcut: false,
            shortcutPermissionLevel: 'owner',
            name: '',
            description: '',
            color: 'from-amber-400 to-amber-600',
            tags: [],
            cardStyle: 'default',
            modernFillColor: MODERN_FILL_COLORS[0].value
        });
        setSharedList([]);
        setShareQueue([]);
    }, [isOpen, initialData, isEditing, initialTab, user?.uid]);

    useEffect(() => {
        let active = true;

        const resolveOwnerEmail = async () => {
            if (!isOpen || !isEditing || !initialData?.ownerId) {
                if (active) setOwnerEmailResolved('');
                return;
            }

            if (initialData?.ownerEmail) {
                if (active) setOwnerEmailResolved(initialData.ownerEmail);
                return;
            }

            try {
                const ownerDoc = await getDoc(doc(db, 'users', initialData.ownerId));
                const ownerEmailFromDoc = ownerDoc.exists() ? (ownerDoc.data()?.email || '') : '';
                if (ownerEmailFromDoc) {
                    if (active) setOwnerEmailResolved(ownerEmailFromDoc);
                    return;
                }

                const usersRef = collection(db, 'users');
                const ownerQuery = query(usersRef, where('uid', '==', initialData.ownerId));
                const ownerSnapshot = await getDocs(ownerQuery);
                const ownerEmailFromQuery = ownerSnapshot.docs[0]?.data()?.email || '';
                if (active) setOwnerEmailResolved(ownerEmailFromQuery);
            } catch (error) {
                if (active) setOwnerEmailResolved('');
            }
        };

        resolveOwnerEmail();
        return () => { active = false; };
    }, [isOpen, isEditing, initialData?.ownerId, initialData?.ownerEmail]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(e);
        }
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
                : `Carpeta compartida con ${normalizedEmail}.`
            );
            setTimeout(() => setShareSuccess(''), 4000);
        } catch (error) {
            setShareError(error?.message || 'Error al compartir. Inténtalo de nuevo.');
        } finally {
            setShareLoading(false);
        }
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
        if (unshareBlockedInSharedFolder) {
            setShareError('No se puede quitar acceso a elementos dentro de carpetas compartidas.');
            return;
        }
        const ownerEmail = (initialData?.ownerEmail || (formData?.ownerId === user?.uid ? user?.email : '') || '').toLowerCase();
        if (ownerEmail && (emailToRemove || '').toLowerCase() === ownerEmail) {
            setShareError('No puedes quitar al propietario.');
            return;
        }
        setPendingUnshares(prev => (
            prev.includes(emailToRemove)
                ? prev.filter(email => email !== emailToRemove)
                : [...prev, emailToRemove]
        ));
        setPendingPermissionChanges(prev => {
            if (!prev[emailToRemove]) return prev;
            const next = { ...prev };
            delete next[emailToRemove];
            return next;
        });
        setShareError('');
        setShareSuccess('');
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

        setPendingPermissionChanges(prev => {
            const next = { ...prev };
            if (nextRole === currentRole) {
                delete next[emailToUpdate];
            } else {
                next[emailToUpdate] = nextRole;
            }
            return next;
        });
        setPendingUnshares(prev => prev.filter(email => email !== emailToUpdate));
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

    const confirmRemoveMyShortcutAccess = async () => {
        if (!formData?.shortcutId || !user?.email) return;

        try {
            setShareLoading(true);
            await onUnshare(formData.id, user.email);
            await onDeleteShortcut(formData.shortcutId);
            setShowSelfUnshareConfirm(false);
            setShareLoading(false);
            onClose();
        } catch (error) {
            setShareLoading(false);
            setShareError(error?.message || 'No se pudo eliminar tu acceso.');
        }
    };

    const confirmPendingShareAction = async () => {
        if (!pendingShareAction) return;

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
                failures.push(`No se pudo compartir con ${entry.email}`);
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
                failures.push(`No se pudo actualizar permiso de ${email}`);
            }
        }

        for (const email of pendingUnshares) {
            try {
                await onUnshare(formData.id, email);
                localSharedList = localSharedList.filter(entry => (entry.email || '').toLowerCase() !== (email || '').toLowerCase());
            } catch (error) {
                failures.push(`No se pudo quitar acceso a ${email}`);
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
            setShareSuccess('Cambios de compartición aplicados correctamente.');
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
        return entry?.photoURL || entry?.photoUrl || entry?.avatarUrl || entry?.avatar || '';
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

    const showShareSearch = allSharedEntries.length > 5;
    const normalizedShareSearch = shareSearch.trim().toLowerCase();
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
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" onClick={onClose} />
                <div className="relative transform overflow-hidden bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[calc(100vh-8rem)] shadow-xl text-left animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800 transition-colors">

                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Carpeta' : 'Nueva Carpeta'}</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

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
                        {activeTab === 'general' && (
                            <>
                                {canEditOriginalFields && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                                            <input
                                                type="text"
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etiquetas (Opcional)</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagInputKeyDown}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors text-sm"
                                            placeholder="Añadir etiqueta..."
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            disabled={!tagInput.trim()}
                                            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map(tag => (
                                                <div
                                                    key={tag}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                                                >
                                                    <span>#{tag}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color del Tema</label>
                                    <div className="grid grid-cols-6 gap-3">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                className={`w-full aspect-square rounded-full bg-gradient-to-br ${color} transition-transform hover:scale-105 ${
                                                    formData.color === color
                                                        ? 'ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-indigo-500 dark:ring-indigo-400 scale-105'
                                                        : 'cursor-pointer'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estilo de Tarjeta</label>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, cardStyle: 'default' }))}
                                            className={`relative p-3 rounded-xl border transition-all duration-200 group ${
                                                formData.cardStyle === 'default'
                                                    ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                                            }`}
                                        >
                                            <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${formData.color} shadow-sm mb-2`}></div>
                                            <span className={`text-sm font-medium ${
                                                formData.cardStyle === 'default' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'
                                            }`}>Clásico</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, cardStyle: 'modern' }))}
                                            className={`relative p-3 rounded-xl border transition-all duration-200 group ${
                                                formData.cardStyle === 'modern'
                                                    ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                                            }`}
                                        >
                                            <div className={`w-full h-12 rounded-lg p-[2px] bg-gradient-to-br ${formData.color} shadow-sm mb-2`}>
                                                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[6px]"></div>
                                            </div>
                                            <span className={`text-sm font-medium ${
                                                formData.cardStyle === 'modern' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'
                                            }`}>Moderno</span>
                                        </button>
                                    </div>

                                    {formData.cardStyle === 'modern' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <button
                                                type="button"
                                                onClick={() => setShowModernFillOptions(prev => !prev)}
                                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color de Fondo (Moderno)</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{showModernFillOptions ? 'Ocultar' : 'Mostrar'}</span>
                                            </button>

                                            {showModernFillOptions && (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {MODERN_FILL_COLORS.map((fillColor) => (
                                                        <button
                                                            key={fillColor.value}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, modernFillColor: fillColor.value }))}
                                                            className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                                                                formData.modernFillColor === fillColor.value
                                                                    ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20'
                                                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 cursor-pointer'
                                                            }`}
                                                        >
                                                            <div className={`h-12 ${fillColor.value} transition-transform group-hover:scale-105`}></div>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-[9px] font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                                    {fillColor.name}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

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

                                        {shareError && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle size={14} className="flex-shrink-0" />
                                                {shareError}
                                            </div>
                                        )}

                                        {shareSuccess && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                                <CheckCircle size={14} className="flex-shrink-0" />
                                                {shareSuccess}
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                                const isPendingUnshare = pendingUnshares.includes(share.email);
                                                const avatarUrl = getAvatarUrl(share);
                                                const displayName = getDisplayName(share);
                                                const currentRole = pendingPermissionChanges[share.email] || share.role || 'viewer';
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
                                                                className="mt-1 text-xs px-2 py-1 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 disabled:opacity-70"
                                                            >
                                                                <option value="viewer">Lector</option>
                                                                <option value="editor">Editor</option>
                                                            </select>
                                                        ) : (
                                                            <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                                                                {share.role === 'viewer' ? 'Lector' : 'Editor'}
                                                            </span>
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
                                            Esta carpeta no está compartida con nadie
                                        </p>
                                    </div>
                                )}

                                {isShortcutEditing && !unshareBlockedInSharedFolder && (
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
                        </div>
                    </form>

                    {pendingShareAction?.type === 'apply-all' && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/55" onClick={() => setPendingShareAction(null)} />
                            <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-2xl">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Confirmar aplicación de cambios</h4>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Se aplicarán los siguientes cambios de compartición:</p>
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
                                        <p key={`del-${email}`}>• {email}: perderá acceso a esta carpeta.</p>
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
                </div>
            </div>
        </div>
    );
};

export default FolderManager;
