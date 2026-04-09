// src/pages/Home/hooks/useHomeKeyboardShortcuts.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKeyShortcuts } from '../../../hooks/useKeyShortcuts';
import { canEdit, isShortcutItem } from '../../../utils/permissionUtils';
import { isInvalidFolderMove } from '../../../utils/folderUtils';
import { buildFolderClonePayload, buildSubjectClonePayload } from '../utils/homeKeyboardClipboardUtils';
import { cloneSubjectTopicsAndResources } from '../utils/homeKeyboardDeepCopyUtils';

export const useHomeKeyboardShortcuts = ({
    user,
    logic
}: any) => {
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [clipboard, setClipboard] = useState<any>(null);
    const [undoStack, setUndoStack] = useState<any[]>([]);
    const [undoToast, setUndoToast] = useState<any>(null);
    const [shortcutFeedback, setShortcutFeedback] = useState('');
    const [animatedCard, setAnimatedCard] = useState<any>(null);
    const [cutPendingCard, setCutPendingCard] = useState<any>(null);
    const animationTimeoutRef = useRef<any>(null);
    const undoToastTimeoutRef = useRef<any>(null);

    const isTypingTarget = useCallback((event: any) => {
        const target = event?.target;
        if (!target) return false;
        const tagName = typeof target.tagName === 'string' ? target.tagName.toLowerCase() : '';
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
        if (target.isContentEditable) return true;
        if (typeof target.closest === 'function' && target.closest('[contenteditable="true"]')) return true;
        return false;
    }, []);

    const showFeedback = useCallback((message: any) => {
        setShortcutFeedback(message || '');
    }, []);

    const loadFirestoreDb = useCallback(async () => {
        const firebaseModule: any = await import('../../../firebase/config');
        return firebaseModule?.db;
    }, []);

    const clearUndoToast = useCallback(() => {
        if (undoToastTimeoutRef.current) {
            window.clearTimeout(undoToastTimeoutRef.current);
            undoToastTimeoutRef.current = null;
        }
        setUndoToast(null);
    }, []);

    const pushUndoToast = useCallback((message: any) => {
        const normalizedMessage = String(message || '').trim();
        if (!normalizedMessage) return;

        if (undoToastTimeoutRef.current) {
            window.clearTimeout(undoToastTimeoutRef.current);
        }

        setUndoToast({
            message: normalizedMessage,
            actionLabel: 'Deshacer',
        });

        undoToastTimeoutRef.current = window.setTimeout(() => {
            setUndoToast(null);
            undoToastTimeoutRef.current = null;
        }, 5000);
    }, []);

    const registerUndoAction = useCallback((actionRecord: any, options: any = {}) => {
        if (!actionRecord || typeof actionRecord !== 'object') return;

        setUndoStack(prev => [...prev.slice(-19), actionRecord]);

        const nextLabel = actionRecord?.label || 'el elemento';
        const toastMessage = String(options?.message || '').trim() || `Accion aplicada en ${nextLabel}.`;
        pushUndoToast(toastMessage);
    }, [pushUndoToast]);

    useEffect(() => {
        if (!shortcutFeedback) return;
        const timeoutId = window.setTimeout(() => setShortcutFeedback(''), 3200);
        return () => window.clearTimeout(timeoutId);
    }, [shortcutFeedback]);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                window.clearTimeout(animationTimeoutRef.current);
            }
            if (undoToastTimeoutRef.current) {
                window.clearTimeout(undoToastTimeoutRef.current);
            }
        };
    }, []);

    const triggerCardAnimation = useCallback((id, type: any) => {
        if (!id || !type) return;
        setAnimatedCard({ id, type });

        if (animationTimeoutRef.current) {
            window.clearTimeout(animationTimeoutRef.current);
        }

        animationTimeoutRef.current = window.setTimeout(() => {
            setAnimatedCard(current => (current?.id === id && current?.type === type ? null : current));
        }, 160);
    }, []);

    const getCardVisualState = useCallback((id, type: any) => {
        if (!id || !type) return { isAnimating: false, isCutPending: false };
        return {
            isAnimating: Boolean(animatedCard && animatedCard.id === id && animatedCard.type === type),
            isCutPending: Boolean(
                clipboard?.mode === 'cut'
                && cutPendingCard
                && cutPendingCard.id === id
                && cutPendingCard.type === type
            )
        };
    }, [animatedCard, clipboard?.mode, cutPendingCard]);

    const focusedItem = useMemo(() => {
        if (!selectedCard?.id || !selectedCard?.type) return null;

        if (isShortcutItem(selectedCard?.item)) {
            return selectedCard.item;
        }

        if (selectedCard.type === 'subject') {
            return (logic?.subjects || []).find(subject => subject.id === selectedCard.id) || selectedCard.item || null;
        }

        if (selectedCard.type === 'folder') {
            return (logic?.folders || []).find(folder => folder.id === selectedCard.id) || selectedCard.item || null;
        }

        return null;
    }, [logic?.folders, logic?.subjects, selectedCard]);

    const handleCardFocus = useCallback((item, type: any) => {
        if (!item?.id || !type) return;
        setSelectedCard({ id: item.id, type, item });
    }, []);

    const requireValidSelection = useCallback((event: any) => {
        if (isTypingTarget(event)) return { valid: false, consumed: false };

        if (!focusedItem || !selectedCard?.type) {
            showFeedback('Selecciona una tarjeta de asignatura o carpeta primero.');
            return { valid: false, consumed: true };
        }

        if (isShortcutItem(focusedItem)) {
            showFeedback('Los accesos directos no se pueden copiar ni cortar.');
            return { valid: false, consumed: true };
        }

        if (!canEdit(focusedItem, user?.uid)) {
            showFeedback('Necesitas permisos de edicion para esta accion.');
            return { valid: false, consumed: true };
        }

        return { valid: true, consumed: true };
    }, [focusedItem, isTypingTarget, selectedCard?.type, showFeedback, user?.uid]);

    const onCopy = useCallback((event: any) => {
        const check = requireValidSelection(event);
        if (!check.valid) return check.consumed;

        const selectedType = selectedCard?.type;
        if (!selectedType) return true;

        const parentId = selectedType === 'subject'
            ? (focusedItem.folderId || null)
            : (focusedItem.parentId || null);

        setClipboard({
            mode: 'copy',
            type: selectedType,
            id: focusedItem.id,
            parentId,
            label: focusedItem.name || (selectedType === 'subject' ? 'Asignatura' : 'Carpeta')
        });

        triggerCardAnimation(focusedItem.id, selectedType);
        setCutPendingCard(null);

        showFeedback(`${selectedType === 'subject' ? 'Asignatura' : 'Carpeta'} copiada.`);
        return true;
    }, [focusedItem, requireValidSelection, selectedCard, showFeedback, triggerCardAnimation]);

    const onCut = useCallback((event: any) => {
        const check = requireValidSelection(event);
        if (!check.valid) return check.consumed;

        const selectedType = selectedCard?.type;
        if (!selectedType) return true;

        const parentId = selectedType === 'subject'
            ? (focusedItem.folderId || null)
            : (focusedItem.parentId || null);

        setClipboard({
            mode: 'cut',
            type: selectedType,
            id: focusedItem.id,
            parentId,
            label: focusedItem.name || (selectedType === 'subject' ? 'Asignatura' : 'Carpeta')
        });

        triggerCardAnimation(focusedItem.id, selectedType);
        setCutPendingCard({ id: focusedItem.id, type: selectedType });

        showFeedback(`${selectedType === 'subject' ? 'Asignatura' : 'Carpeta'} lista para mover.`);
        return true;
    }, [focusedItem, requireValidSelection, selectedCard, showFeedback, triggerCardAnimation]);

    const onPaste = useCallback(async (event: any) => {
        if (isTypingTarget(event)) return false;

        if (!clipboard?.id || !clipboard?.type) {
            showFeedback('No hay elementos en el portapapeles.');
            return true;
        }

        const targetFolderId = logic?.currentFolder?.id || null;

        try {
            if (clipboard.mode === 'copy') {
                if (clipboard.type === 'subject') {
                    const source = (logic?.subjects || []).find(subject => subject.id === clipboard.id);
                    if (!source || isShortcutItem(source)) {
                        showFeedback('No se pudo copiar la asignatura seleccionada.');
                        return true;
                    }

                    const clonePayload = buildSubjectClonePayload(source, targetFolderId, user);
                    const createdSubjectId = await logic.addSubject(clonePayload);

                    registerUndoAction(
                        {
                            action: 'create-subject',
                            id: createdSubjectId,
                            label: source.name || 'Asignatura'
                        },
                        {
                            message: `Copia creada: ${source.name || 'Asignatura'}.`
                        }
                    );

                    const hasTopicsToCopy = Array.isArray(source?.topics) && source.topics.length > 0;
                    if (createdSubjectId && hasTopicsToCopy) {
                        try {
                            const db = await loadFirestoreDb();
                            const deepCopySummary = await cloneSubjectTopicsAndResources({
                                db,
                                sourceSubjectId: source.id,
                                targetSubjectId: createdSubjectId,
                                user,
                                institutionId: clonePayload?.institutionId || source?.institutionId || user?.institutionId || null
                            });

                            if (deepCopySummary.topicsCopied > 0 && typeof logic?.updateSubject === 'function') {
                                await logic.updateSubject(createdSubjectId, { topicCount: deepCopySummary.topicsCopied });
                            }

                            if (deepCopySummary.topicsCopied > 0 || deepCopySummary.resourcesCopied > 0) {
                                showFeedback(
                                    `Asignatura creada: ${source.name || 'Copia de asignatura'} (${deepCopySummary.topicsCopied} tema(s), ${deepCopySummary.resourcesCopied} recurso(s) copiados).`
                                );
                                return true;
                            }
                        } catch (deepCopyError: any) {
                            console.error('Error copying nested subject content with Ctrl+V:', deepCopyError);
                            showFeedback(`Asignatura creada: ${source.name || 'Copia de asignatura'} (sin copiar todo el contenido relacionado).`);
                            return true;
                        }
                    }

                    showFeedback(`Asignatura creada: ${source.name || 'Copia de asignatura'}.`);
                    return true;
                }

                const sourceFolder = (logic?.folders || []).find(folder => folder.id === clipboard.id);
                if (!sourceFolder || isShortcutItem(sourceFolder)) {
                    showFeedback('No se pudo copiar la carpeta seleccionada.');
                    return true;
                }

                const folderPayload = buildFolderClonePayload(sourceFolder, targetFolderId);
                const createdFolder = await logic.addFolder(folderPayload);
                if (createdFolder?.id) {
                    await logic.updateFolder(createdFolder.id, {
                        isShared: false,
                        sharedWith: [],
                        sharedWithUids: []
                    });

                    registerUndoAction(
                        {
                            action: 'create-folder',
                            id: createdFolder.id,
                            label: sourceFolder.name || 'Carpeta'
                        },
                        {
                            message: `Copia creada: ${sourceFolder.name || 'Carpeta'}.`
                        }
                    );
                }

                showFeedback(`Carpeta creada: ${sourceFolder.name || 'Copia de carpeta'}.`);
                return true;
            }

            if (clipboard.type === 'subject') {
                await logic.updateSubject(clipboard.id, { folderId: targetFolderId || null });
                registerUndoAction(
                    {
                        action: 'move-subject',
                        id: clipboard.id,
                        fromParentId: clipboard.parentId || null,
                        toParentId: targetFolderId,
                        label: clipboard.label || 'Asignatura'
                    },
                    {
                        message: `Movimiento aplicado: ${clipboard.label || 'Asignatura'}.`
                    }
                );
                setClipboard(null);
                setCutPendingCard(null);
                showFeedback(`Asignatura movida: ${clipboard.label || 'Asignatura'}.`);
                return true;
            }

            if (clipboard.id === targetFolderId) {
                showFeedback('No puedes mover una carpeta dentro de si misma.');
                return true;
            }

            if (isInvalidFolderMove(clipboard.id, targetFolderId || null, logic?.folders || [])) {
                showFeedback('No puedes mover una carpeta dentro de una subcarpeta propia.');
                return true;
            }

            await logic.updateFolder(clipboard.id, { parentId: targetFolderId || null });
            registerUndoAction(
                {
                    action: 'move-folder',
                    id: clipboard.id,
                    fromParentId: clipboard.parentId || null,
                    toParentId: targetFolderId,
                    label: clipboard.label || 'Carpeta'
                },
                {
                    message: `Movimiento aplicado: ${clipboard.label || 'Carpeta'}.`
                }
            );
            setClipboard(null);
            setCutPendingCard(null);
            showFeedback(`Carpeta movida: ${clipboard.label || 'Carpeta'}.`);
            return true;
        } catch (error: any) {
            console.error('Error applying Ctrl+V action:', error);
            showFeedback('No se pudo completar el pegado.');
            return true;
        }
    }, [clipboard, isTypingTarget, logic, showFeedback, user, registerUndoAction, loadFirestoreDb]);

    const onUndo = useCallback(async (event: any) => {
        if (isTypingTarget(event)) return false;

        if (!undoStack.length) {
            try {
                const trashedItems = typeof logic?.getTrashedSubjects === 'function'
                    ? await logic.getTrashedSubjects()
                    : [];

                const toMillis = (value: any) => {
                    if (!value) return 0;
                    if (value instanceof Date) return value.getTime();
                    if (typeof value?.toDate === 'function') return value.toDate().getTime();
                    const parsed = new Date(value);
                    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
                };

                const orderedTrashedSubjects = Array.isArray(trashedItems)
                    ? [...trashedItems].sort((a, b) => toMillis(b?.trashedAt) - toMillis(a?.trashedAt))
                    : [];

                for (const candidate of orderedTrashedSubjects) {
                    if (!candidate?.id) continue;

                    try {
                        if (typeof logic?.restoreSubject === 'function') {
                            await logic.restoreSubject(candidate.id);
                        } else if (typeof logic?.updateSubject === 'function') {
                            await logic.updateSubject(candidate.id, { status: 'active', trashedAt: null });
                        } else {
                            continue;
                        }

                        showFeedback(`Se restauró ${candidate.name || 'la asignatura'} desde la papelera.`);
                        return true;
                    } catch (restoreError: any) {
                        console.error('Error restoring trashed subject candidate with Ctrl+Z:', restoreError);
                    }
                }
            } catch (error: any) {
                console.error('Error restoring latest trashed subject with Ctrl+Z:', error);
            }

            showFeedback('No hay acciones para deshacer.');
            return true;
        }

        const lastAction = undoStack[undoStack.length - 1];

        try {
            if (lastAction.action === 'create-subject') {
                await logic.deleteSubject(lastAction.id);
            } else if (lastAction.action === 'create-folder') {
                await logic.deleteFolder(lastAction.id);
            } else if (lastAction.action === 'move-subject') {
                await logic.updateSubject(lastAction.id, { folderId: lastAction.fromParentId || null });
            } else if (lastAction.action === 'move-folder') {
                await logic.updateFolder(lastAction.id, { parentId: lastAction.fromParentId || null });
            } else if (lastAction.action === 'move-shortcut' && lastAction.shortcutId && typeof logic?.moveShortcut === 'function') {
                await logic.moveShortcut(lastAction.shortcutId, lastAction.fromParentId || null);
            }

            setUndoStack(prev => prev.slice(0, -1));
            clearUndoToast();
            showFeedback(`Se deshizo la ultima accion sobre ${lastAction.label || 'el elemento'}.`);
            return true;
        } catch (error: any) {
            console.error('Error applying Ctrl+Z action:', error);
            showFeedback('No se pudo deshacer la ultima accion.');
            return true;
        }
    }, [isTypingTarget, logic, showFeedback, undoStack, clearUndoToast]);

    const undoLatestActionFromToast = useCallback(async () => {
        await onUndo({ target: null });
    }, [onUndo]);

    useKeyShortcuts({ onCopy, onCut, onPaste, onUndo });

    return {
        handleCardFocus,
        shortcutFeedback,
        getCardVisualState,
        registerUndoAction,
        undoToast,
        undoLatestActionFromToast,
        clearUndoToast
    };
};
