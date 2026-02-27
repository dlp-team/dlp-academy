// src/pages/Home/components/FolderManager.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Share2, Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { COLORS, MODERN_FILL_COLORS } from '../../../utils/subjectConstants';
import { getPermissionLevel } from '../../../utils/permissionUtils';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const FolderManager = ({
    isOpen, onClose, onSave, initialData, isEditing,
    onShare, onUnshare, onDeleteShortcut, user, initialTab = 'general'
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
    const [pendingShareAction, setPendingShareAction] = useState(null);
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

    useEffect(() => {
        if (!isOpen) return;

        setActiveTab(initialTab);
        setTagInput('');
        setShareEmail('');
        setShareRole('viewer');
        setShareQueue([]);
        setShareSearch('');
        setPendingShareAction(null);
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
            setShareSuccess(`Carpeta compartida con ${successEntries.length} usuario(s).`);
        }

        setShareQueue([]);
        setShareEmail('');
        setShareRole('viewer');
        setTimeout(() => setShareSuccess(''), 4000);
        setShareLoading(false);
    };

    const executeUnshareAction = async (emailToRemove) => {
        try {
            const result = await onUnshare(formData.id, emailToRemove);
            setSharedList(prev => prev.filter(u => u.email !== emailToRemove));

            const failuresCount = Array.isArray(result?.cleanupFailures) ? result.cleanupFailures.length : 0;
            if (failuresCount > 0) {
                setShareError(`Acceso revocado, pero ${failuresCount} elementos no se pudieron limpiar automáticamente por permisos.`);
            }
        } catch (error) {
            setShareError(error?.message || 'No se pudo revocar el acceso.');
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

    const showShareSearch = allSharedEntries.length > 5;
    const normalizedShareSearch = shareSearch.trim().toLowerCase();
    const displayedSharedList = showShareSearch
        ? allSharedEntries.filter(share => (share.email || '').toLowerCase().includes(normalizedShareSearch))
        : allSharedEntries;

    const normalizedTypedEmail = shareEmail.trim().toLowerCase();
    const currentUserEmail = (user?.email || '').toLowerCase();
    const currentDomain = currentUserEmail.includes('@') ? currentUserEmail.split('@')[1] : '';
    const sharedEmailSet = new Set(sharedWithoutOwner.map(entry => (entry.email || '').toLowerCase()));

    const suggestedEmails = normalizedTypedEmail
        ? institutionEmails
            .filter(email =>
                email.includes(normalizedTypedEmail) &&
                email !== currentUserEmail &&
                email !== ownerEmailNormalized &&
                !sharedEmailSet.has(email)
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="relative transform overflow-hidden bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-xl text-left animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800 transition-colors">

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

                    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
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
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                value={shareEmail}
                                                onChange={(e) => { setShareEmail(e.target.value); setShareError(''); }}
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

                                        {suggestedEmails.length > 0 && (
                                            <div className="mt-2 p-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sugerencias de tu institución</p>
                                                <div className="max-h-32 overflow-y-auto space-y-1">
                                                    {suggestedEmails.map((email) => (
                                                        <button
                                                            key={email}
                                                            type="button"
                                                            onClick={() => setShareEmail(email)}
                                                            className="w-full text-left px-2 py-1 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                                        >
                                                            {email}
                                                        </button>
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

                                {pendingShareAction && (
                                    <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            {pendingShareAction.type === 'share-batch' && (
                                                <>Vas a compartir esta carpeta con <strong>{pendingShareAction.entries?.length || 0}</strong> usuario(s) seleccionados.</>
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
                                                <>Vas a dejar de compartir esta carpeta con <strong>{pendingShareAction.email}</strong>.</>
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
                                                    {share.role !== 'owner' && (
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
                                            Esta carpeta no está compartida con nadie
                                        </p>
                                    </div>
                                )}

                                {isShortcutEditing && (
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

export default FolderManager;
