// src/pages/Topic/hooks/useTopicLogic.js
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FileText, Award, Sigma, BookOpen, NotebookPen, Pencil, Target, Trophy 
} from 'lucide-react';
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { canEdit, canView, canDelete, shouldShowEditUI, shouldShowDeleteUI } from '../../../utils/permissionUtils';
import { canUserAccessSubject } from '../../../utils/subjectAccessUtils';
import {
    DEFAULT_TOPIC_CASCADE_COLLECTIONS,
    cascadeDeleteTopicResources,
} from '../../../utils/topicDeletionUtils';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { buildUserScopedPersistenceKey } from '../../../utils/pagePersistence';

const EMPTY_CONFIRM_DIALOG = {
    isOpen: false,
    type: null,
    itemId: null,
    itemCollection: null,
    itemName: '',
    title: '',
    description: '',
    confirmLabel: 'Eliminar'
};

export const useTopicLogic = (user: any) => {
    const navigate = useNavigate();
    const { subjectId, topicId } = useParams();
    const fileInputRef = useRef<any>(null);
    const toastTimerRef = useRef<any>(null);
    const docsFromDocumentsRef = useRef<any[]>([]);
    const docsFromResumenRef = useRef<any[]>([]);
    const pendingQuizSyncRef = useRef(false);
    const previousQuizCountRef = useRef(0);
    
    // Estados de Datos
    const [subject, setSubject] = useState<any>(null);
    const [topic, setTopic] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Estados de UI
    const [uploading] = useState(false);
    const activeTabKey = buildUserScopedPersistenceKey('topic-page', user, `${subjectId || 'no-subject'}:${topicId || 'no-topic'}:active-tab`);
    const [activeTab, setActiveTab] = usePersistentState(activeTabKey, 'materials');
    
    // Notificaciones
    const [toast, setToast] = useState({ show: false, message: '' });
    
    // Menús y Edición
    const [showMenu, setShowMenu] = useState(false);
    const [isEditingTopic, setIsEditingTopic] = useState(false);
    const [editTopicData, setEditTopicData] = useState({ name: '' });

    // Gestión Archivos y Menús
    const [activeMenuId, setActiveMenuId] = useState<any>(null);
    const [renamingId, setRenamingId] = useState<any>(null);
    const [tempName, setTempName] = useState("");
    const [viewingFile, setViewingFile] = useState<any>(null);

    // --- ESTADOS PARA EL MODAL DE TESTS ---
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizFormData, setQuizFormData] = useState<any>({ 
        title: '', 
        level: 'Intermedio', 
        numQuestions: 5, 
        prompt: '' 
    });

    // --- ESTADOS PARA EL MODAL DE CONTENIDO ---
    const [showContentModal, setShowContentModal] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [contentFormData, setContentFormData] = useState<any>({ 
        title: '', 
        type: 'summary', 
        prompt: '' 
    });

    // --- ESTADOS PARA EL MODAL DE CATEGORIZACIÓN DE ARCHIVOS ---
    const [showCategorizationModal, setShowCategorizationModal] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<any[]>([]);
    const [categorizingFile, setCategorizingFile] = useState(false);

    // --- ESTADOS PARA CONFIRMACIONES DE BORRADO ---
    const [confirmDialog, setConfirmDialog] = useState(EMPTY_CONFIRM_DIALOG);
    const [isConfirmingAction, setIsConfirmingAction] = useState(false);

    // Función auxiliar para notificaciones
    const showNotification = (msg: any, duration = 5000) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ show: true, message: msg });
        toastTimerRef.current = setTimeout(() => {
            setToast({ show: false, message: '' });
        }, duration);
    };

    const closeConfirmDialog = () => {
        if (isConfirmingAction) return;
        setConfirmDialog(EMPTY_CONFIRM_DIALOG);
    };

    const openConfirmDialog = ({
        type,
        itemId,
        itemCollection = null,
        itemName = '',
        title = '',
        description = '',
        confirmLabel = 'Eliminar'
    }) => {
        setConfirmDialog({
            isOpen: true,
            type,
            itemId,
            itemCollection,
            itemName,
            title,
            description,
            confirmLabel
        });
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        let unsubscribeTopic = () => {};
        let unsubscribeDocs = () => {};
        let unsubscribeQuizzes = () => {};
        let unsubscribeResumen = () => {};
        let unsubscribeExams = () => {};
        let unsubscribeExamns = () => {};
        let examsFromExams: any[] = [];
        let examsFromExamns: any[] = [];

        const syncMergedExams = () => {
            const mergedById = new Map();
            [...examsFromExams, ...examsFromExamns].forEach((exam: any) => {
                if (!exam?.id) return;
                mergedById.set(exam.id, exam);
            });

            setTopic(prev => ({
                ...prev,
                exams: Array.from(mergedById.values())
            }));
        };

        const teardownTopicChildListeners = () => {
            if (unsubscribeDocs) unsubscribeDocs();
            if (unsubscribeResumen) unsubscribeResumen();
            if (unsubscribeQuizzes) unsubscribeQuizzes();
            unsubscribeDocs = () => {};
            unsubscribeResumen = () => {};
            unsubscribeQuizzes = () => {};
        };

        const fetchTopicDetails = async () => {
            if (!user || !subjectId || !topicId) return;

            try {
                const subjectDoc = await getDoc(doc(db, "subjects", subjectId));
                if (!subjectDoc.exists()) {
                    setLoading(false);
                    navigate('/home');
                    return;
                }

                const subjectData = { id: subjectDoc.id, ...subjectDoc.data() };
                const hasSubjectAccess = await canUserAccessSubject({ subject: subjectData, user });
                if (!hasSubjectAccess) {
                    setLoading(false);
                    navigate('/home');
                    return;
                }

                setSubject(subjectData);

                const topicRef = doc(db, "topics", topicId);
                unsubscribeTopic = onSnapshot(topicRef, (topicDoc: any) => {
                    if (topicDoc.exists()) {
                        teardownTopicChildListeners();

                        const topicData = { id: topicDoc.id, ...topicDoc.data() };
                        setTopic(prev => ({
                            ...prev,
                            ...topicData,
                            pdfs: prev?.pdfs || [],
                            uploads: prev?.uploads || [],
                            quizzes: prev?.quizzes || [],
                            exams: prev?.exams || []
                        }));

                        const docsRef = query(collection(db, "documents"), where("topicId", "==", topicId));
                        unsubscribeDocs = onSnapshot(docsRef, (docsSnap: any) => {
                            const allDocs = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                            const manualUploads = allDocs
                                .filter(d => d.source === 'manual')
                                .map(d => ({ ...d, origin: 'manual', _collection: 'documents' }));
                            docsFromDocumentsRef.current = allDocs
                                .filter(d => d.source !== 'manual')
                                .map(d => ({ ...d, origin: 'AI', _collection: 'documents' }));

                            setTopic(prev => ({
                                ...prev,
                                pdfs: [...docsFromDocumentsRef.current, ...docsFromResumenRef.current],
                                uploads: manualUploads
                            }));
                        }, (error: any) => {
                            console.error("[DOCUMENTS] Firestore error:", error);
                            if (error?.code !== 'permission-denied') {
                                showNotification('No se pudieron sincronizar los materiales del tema.');
                            }
                            docsFromDocumentsRef.current = [];
                            setTopic(prev => ({
                                ...prev,
                                pdfs: [...docsFromResumenRef.current],
                                uploads: []
                            }));
                        });

                        const resumenRef = query(collection(db, 'resumen'), where('topicId', '==', topicId));
                        unsubscribeResumen = onSnapshot(resumenRef, (resumenSnap: any) => {
                            docsFromResumenRef.current = resumenSnap.docs.map(d => ({
                                id: d.id,
                                ...d.data(),
                                origin: 'AI',
                                _collection: 'resumen',
                                type: d.data().type || 'summary',
                                name: d.data().name || d.data().title || 'Sin título'
                            }));
                            setTopic(prev => ({
                                ...prev,
                                pdfs: [...docsFromDocumentsRef.current, ...docsFromResumenRef.current],
                            }));
                        }, (error: any) => {
                            console.error("[RESUMEN] Firestore error:", error);
                            if (error?.code !== 'permission-denied') {
                                showNotification('No se pudieron sincronizar los resumenes del tema.');
                            }
                            docsFromResumenRef.current = [];
                            setTopic(prev => ({
                                ...prev,
                                pdfs: [...docsFromDocumentsRef.current],
                            }));
                        });

                        const quizzesRef = query(collection(db, "quizzes"), where("topicId", "==", topicId));
                        unsubscribeQuizzes = onSnapshot(quizzesRef, (quizzesSnap: any) => {
                            const realQuizzes = quizzesSnap.docs.map(q => ({ id: q.id, ...q.data() }));

                            if (pendingQuizSyncRef.current && realQuizzes.length > previousQuizCountRef.current) {
                                pendingQuizSyncRef.current = false;
                                showNotification("✅ Test guardado y sincronizado correctamente.");
                            }

                            setTopic(prev => ({
                                ...prev,
                                quizzes: realQuizzes
                            }));
                            setLoading(false);
                        }, (error: any) => {
                            console.error("[QUIZZES] Firestore error:", error);
                            if (error?.code !== 'permission-denied') {
                                showNotification('No se pudieron sincronizar los tests del tema.');
                            }
                            pendingQuizSyncRef.current = false;
                            setTopic(prev => ({
                                ...prev,
                                quizzes: []
                            }));
                            setLoading(false);
                        });

                    } else {
                        teardownTopicChildListeners();
                        docsFromDocumentsRef.current = [];
                        docsFromResumenRef.current = [];
                        pendingQuizSyncRef.current = false;
                        setLoading(false);
                        navigate('/home');
                    }
                }, (error: any) => {
                    console.error("[TOPIC] Firestore error:", error);
                    teardownTopicChildListeners();
                    docsFromDocumentsRef.current = [];
                    docsFromResumenRef.current = [];
                    pendingQuizSyncRef.current = false;
                    setLoading(false);
                    navigate('/home');
                });
            } catch (error) {
                console.error("Error general:", error);
                setLoading(false);
            }
        };

        fetchTopicDetails();

        // Carga de exams/examns por lectura puntual para evitar ruido de watch
        // cuando las reglas bloquean listeners en algunos roles.
        if (user && topicId && user?.role !== 'student') {
            const loadExams = async () => {
                try {
                    const examsQ = query(collection(db, "exams"), where("topicId", "==", topicId));
                    const examsSnap = await getDocs(examsQ);
                    examsFromExams = examsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                } catch (error: any) {
                    if (error?.code !== 'permission-denied') {
                        console.error("[EXAMS] Firestore error:", error);
                    }
                    examsFromExams = [];
                }

                try {
                    const examnsQ = query(collection(db, "examns"), where("topicId", "==", topicId));
                    const examnsSnap = await getDocs(examnsQ);
                    examsFromExamns = examnsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                } catch (error: any) {
                    if (error?.code !== 'permission-denied') {
                        console.error("[EXAMNS] Firestore error:", error);
                    }
                    examsFromExamns = [];
                }

                syncMergedExams();
            };

            loadExams();
        }

        return () => {
            if (unsubscribeTopic) unsubscribeTopic();
            teardownTopicChildListeners();
            if (unsubscribeExams) unsubscribeExams();
            if (unsubscribeExamns) unsubscribeExamns();
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, [user, subjectId, topicId, navigate]);

    // --- HELPERS VISUALES ---
    const getFileVisuals = (type: any) => {
        if (!type) return { icon: FileText, label: 'Documento' };
        const t = type.toLowerCase();
        if (t.includes('exam') || t.includes('evaluación')) return { icon: Award, label: 'Examen' };
        if (t.includes('exercise') || t.includes('ejercicio')) return { icon: FileText, label: 'Ejercicios' };
        if (t.includes('formula') || t.includes('fórmula')) return { icon: Sigma, label: 'Fórmulas' };
        if (t.includes('summary') || t.includes('resumen') || t.includes('formulario')) return { icon: BookOpen, label: 'Resumen' };
        return { icon: FileText, label: 'Documento' };
    };

    const getQuizVisuals = (type: any) => {
        const t = (type || 'basic').toLowerCase();
        if (t.includes('basic') || t.includes('repaso')) return { icon: NotebookPen, bgFade: 'bg-sky-50', textAccent: 'text-sky-600', iconBg: 'bg-sky-100', border: 'border-sky-100', level: 'Repaso' };
        if (t.includes('intermediate') || t.includes('práctica')) return { icon: Pencil, bgFade: 'bg-indigo-50', textAccent: 'text-indigo-600', iconBg: 'bg-indigo-100', border: 'border-indigo-100', level: 'Práctica' };
        if (t.includes('advanced') || t.includes('avanzado')) return { icon: Target, bgFade: 'bg-emerald-50', textAccent: 'text-emerald-600', iconBg: 'bg-emerald-100', border: 'border-emerald-100', level: 'Avanzado' };
        if (t.includes('final') || t.includes('simulacro') || t.includes('exam')) return { icon: Trophy, bgFade: 'bg-amber-50', textAccent: 'text-amber-600', iconBg: 'bg-amber-100', border: 'border-amber-100', level: 'Simulacro' };
        return { icon: BookOpen, bgFade: 'bg-slate-50', textAccent: 'text-slate-600', iconBg: 'bg-slate-200', border: 'border-slate-100', level: 'Test' };
    };

    // --- GESTIÓN ARCHIVOS ---
    const handleMenuClick = (e, fileId: any) => { e.stopPropagation(); setActiveMenuId(activeMenuId === fileId ? null : fileId); };
    
    const startRenaming = (file: any) => {
        setRenamingId(file.id);
        setTempName(file.name || file.title || '');
        setActiveMenuId(null);
    };

    const saveRename = async (fileOrId: any) => {
        if (!tempName.trim()) return;

        const file = typeof fileOrId === 'string'
            ? [...(topic?.pdfs || []), ...(topic?.uploads || [])].find((entry) => entry.id === fileOrId)
            : fileOrId;

        if (!file?.id) return;

        try {
            const collectionName = file._collection || 'documents';
            const docRef = doc(db, collectionName, file.id);
            const updateData = collectionName === 'resumen'
                ? { name: tempName, title: tempName }
                : { name: tempName };
            await updateDoc(docRef, updateData);
            setRenamingId(null);
        } catch (error) {
            console.error(error);
            showNotification('No se pudo renombrar el archivo.');
        }
    };

    const performDeleteFile = async (fileId, collectionName = 'documents') => {
        try {
            await deleteDoc(doc(db, collectionName, fileId));
            setActiveMenuId(null);
        } catch (error) {
            console.error(error);
            showNotification('No se pudo eliminar el archivo.');
        }
    };

    const deleteFile = (file: any) => {
        if (!file?.id) return;
        const resolvedName = file.name || file.title || 'este archivo';

        setActiveMenuId(null);
        openConfirmDialog({
            type: 'file',
            itemId: file.id,
            itemCollection: file._collection || 'documents',
            itemName: resolvedName,
            title: 'Eliminar archivo',
            description: `Se eliminará "${resolvedName}". Esta acción no se puede deshacer.`,
            confirmLabel: 'Eliminar archivo'
        });
    };

    const handleChangeFileCategory = async (file, category: any) => {
        if (!file?.id || !category) return;

        try {
            const collectionName = file._collection || 'documents';
            await updateDoc(doc(db, collectionName, file.id), { fileCategory: category });

            const categoryLabel = category === 'material-teorico'
                ? 'Material teórico'
                : category === 'ejercicios'
                    ? 'Ejercicios'
                    : 'Exámenes';

            showNotification(`✅ Tipo actualizado a ${categoryLabel}`);
            setActiveMenuId(null);
        } catch (error) {
            console.error(error);
            showNotification('No se pudo actualizar el tipo de archivo.');
        }
    };

    const performDeleteQuiz = async (quizId: any) => {
        try {
            await deleteDoc(doc(db, "quizzes", quizId));
            setActiveMenuId(null);
        } catch (error) {
            console.error(error);
            showNotification('No se pudo eliminar el test.');
        }
    };

    const deleteQuiz = (quizId: any) => {
        if (!quizId) return;

        setActiveMenuId(null);
        openConfirmDialog({
            type: 'quiz',
            itemId: quizId,
            itemName: 'este test',
            title: 'Eliminar test',
            description: 'Se eliminará este test permanentemente. Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar test'
        });
    };

    const handleViewFile = (file: any) => {
        if (!file.url) {
            showNotification('El archivo no tiene contenido disponible.');
            return;
        }
        setViewingFile(file);
    };

    const performDeleteTopic = async () => {
        if (!canDelete(topic, user) || !topicId) return;

        try {
            await cascadeDeleteTopicResources({
                db,
                topicId,
                collections: DEFAULT_TOPIC_CASCADE_COLLECTIONS,
            });
            await deleteDoc(doc(db, "topics", topicId));
            navigate(`/home/subject/${subjectId}`);
        } catch (error) {
            console.error(error);
            showNotification('No se pudo eliminar el tema.');
        }
    };

    const handleDeleteTopic = () => {
        if (!canDelete(topic, user)) return;

        setShowMenu(false);
        openConfirmDialog({
            type: 'topic',
            itemId: topicId,
            itemName: topic?.name || topic?.title || 'este tema',
            title: 'Eliminar tema',
            description: 'Se eliminará el tema junto con sus materiales, tests y exámenes asociados. Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar tema'
        });
    };

    const confirmDeleteAction = async () => {
        if (!confirmDialog?.isOpen || !confirmDialog?.type) return;

        setIsConfirmingAction(true);
        try {
            if (confirmDialog.type === 'file') {
                await performDeleteFile(confirmDialog.itemId, confirmDialog.itemCollection || 'documents');
                return;
            }

            if (confirmDialog.type === 'quiz') {
                await performDeleteQuiz(confirmDialog.itemId);
                return;
            }

            if (confirmDialog.type === 'topic') {
                await performDeleteTopic();
            }
        } finally {
            setIsConfirmingAction(false);
            setConfirmDialog(EMPTY_CONFIRM_DIALOG);
        }
    };

    const handleSaveTopicTitle = async () => {
        if (!editTopicData.name.trim() || !topicId) return;
        try {
            await updateDoc(doc(db, "topics", topicId), { name: editTopicData.name });
            setIsEditingTopic(false);
        } catch (error) { console.error(error); }
    };

    const handleManualUpload = async (e: any) => {
        const files = Array.from((e.target.files || []) as any[]);
        if (files.length === 0) return;
        const validFiles = files.filter((file: any) => file.size < 1048576); 
        if (validFiles.length === 0) return;

        // Always ask the category before persisting uploads.
        setPendingFiles(validFiles);
        setShowCategorizationModal(true);
    };

    // Handle file categorization from modal
    const handleFileCategorized = async (category: any) => {
        if (!pendingFiles.length) return;

        setCategorizingFile(true);
        try {
            const convert = (f) => new Promise((r: any) => { const fr = new FileReader(); fr.readAsDataURL(f); fr.onload = () => r(fr.result); });
            await Promise.all(pendingFiles.map(async (pendingFile: any) => {
                const base64Url = await convert(pendingFile);

                await addDoc(collection(db, "documents"), {
                    name: pendingFile.name,
                    type: pendingFile.type.includes('pdf') ? 'pdf' : 'doc',
                    size: pendingFile.size,
                    source: 'manual',
                    uploadedAt: serverTimestamp(),
                    url: base64Url,
                    status: 'ready',
                    topicId: topicId,
                    subjectId: subjectId,
                    ownerId: topic?.ownerId || subject?.ownerId || user?.uid,
                    institutionId: topic?.institutionId || subject?.institutionId || user?.institutionId || null,
                    fileCategory: category
                });
            }));

            if (fileInputRef.current) fileInputRef.current.value = '';
            setShowCategorizationModal(false);
            const uploadedCount = pendingFiles.length;
            setPendingFiles([]);

            const categoryLabel = category === 'material-teorico'
                ? 'Material teórico'
                : category === 'ejercicios'
                    ? 'Ejercicios'
                    : 'Exámenes';

            showNotification(`✅ ${uploadedCount} archivo${uploadedCount === 1 ? '' : 's'} guardado${uploadedCount === 1 ? '' : 's'} como ${categoryLabel}`);
            setActiveTab('uploads');
        } catch (error) { 
            console.error(error); 
            showNotification('No se pudo categorizar el archivo.'); 
        } finally { 
            setCategorizingFile(false); 
        }
    };

    // --- IA GENERATION: QUIZZES ---
    const handleGenerateQuizSubmit = async (e: any) => {
        e.preventDefault();
        previousQuizCountRef.current = topic?.quizzes?.length || 0;
        pendingQuizSyncRef.current = true;
        setShowQuizModal(false);
        setIsGeneratingQuiz(false); 
        showNotification("⏳ La IA está diseñando tu test...", 6000);

        try {
            const formData = new FormData();
            formData.append('title', String(quizFormData.title || ''));
            formData.append('level', String(quizFormData.level || 'Intermedio'));
            formData.append('numQuestions', String(quizFormData.numQuestions || 5));
            formData.append('prompt', quizFormData.prompt || '');
            formData.append('userId', String(user?.uid || ''));
            formData.append('subjectId', String(subjectId || ''));
            formData.append('topicId', String(topicId || ''));
            formData.append('subjectName', String(subject?.name || ''));
            formData.append('topicName', String(topic?.name || topic?.title || ''));
            if (quizFormData.file) formData.append('files', quizFormData.file); 

            const res = await fetch('https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook/711e538b-9d63-42bb-8494-873301ffdf39', {
                method: 'POST', body: formData 
            });
            
            if (!res.ok) throw new Error("Error servidor");
            showNotification("✅ ¡Test generado con éxito!");

        } catch (error) { 
            console.error(error); 
            pendingQuizSyncRef.current = false;
            showNotification("❌ Error de conexión con la IA"); 
        }
    };

    // --- NUEVO: IA GENERATION: CONTENIDO (MATERIALS) ---
    const handleGenerateContentSubmit = async (e: any) => {
        e.preventDefault();
        setShowContentModal(false);
        setIsGeneratingContent(false);
        showNotification("⏳ Redactando tu material de estudio...", 6000);

        try {
            const formData = new FormData();
            formData.append('title', String(contentFormData.title || ''));
            formData.append('type', String(contentFormData.type || 'summary'));
            formData.append('prompt', contentFormData.prompt || '');
            formData.append('action', 'generate_study_material');

            formData.append('userId', String(user?.uid || ''));
            formData.append('subjectId', String(subjectId || ''));
            formData.append('topicId', String(topicId || ''));
            formData.append('subjectName', String(subject?.name || ''));
            formData.append('topicName', String(topic?.name || topic?.title || ''));

            // Type-specific options for n8n customization
            const optionKeys = [
                'includeExamples', 'includeFormulas',
                'formulaFormat', 'includeDerivations',
                'difficulty', 'numExercises', 'includeSolutions',
                'numQuestions', 'examFormat', 'includeAnswerKey',
                'examDuration', 'examMode', 'showResultsToStudents'
            ];
            optionKeys.forEach(key => {
                if (contentFormData[key] !== undefined && contentFormData[key] !== null) {
                    formData.append(key, String(contentFormData[key]));
                }
            });

            if (contentFormData.file) formData.append('files', contentFormData.file);

            const res = await fetch('https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook/711e538b-9d63-42bb-8494-873301ffdf39', {
                method: 'POST', body: formData
            });

            if (!res.ok) throw new Error("Error servidor");
            showNotification("✅ ¡Material creado! Aparecerá en breve.");

        } catch (error) {
            console.error(error);
            showNotification("❌ Error al generar el material.");
        }
    };

    // --- HANDLERS PARA ABRIR MODALES ---
    const handleCreateCustomPDF = () => {
        setContentFormData({
            title: '',
            type: 'summary',
            prompt: '',
            file: null
        });
        setShowContentModal(true);
    };

    const handleCreateCustomQuiz = () => {
        setQuizFormData({ 
            title: `Test: ${topic?.name || topic?.title}`,
            level: 'Intermedio', 
            numQuestions: 5, 
            prompt: '' 
        });
        setShowQuizModal(true);
    };

    // --- PERMISSION CHECKS ---
    const topicPermissions = useMemo(() => {
        if (!topic || !user) return {
            canEdit: false,
            canView: false,
            canDelete: false,
            showEditUI: false,
            showDeleteUI: false,
            isViewer: false
        };

        // Students never get edit/delete permissions
        if (user?.role === 'student') {
            return {
                canEdit: false,
                canView: true,
                canDelete: false,
                showEditUI: false,
                showDeleteUI: false,
                isViewer: true
            };
        }

        // Teachers: use resource-level checks
        const hasEditPermission = canEdit(topic, user.uid);
        const hasViewPermission = canView(topic, user.uid);
        const hasDeletePermission = canDelete(topic, user.uid);
        const isViewerOnly = hasViewPermission && !hasEditPermission;

        return {
            canEdit: hasEditPermission,
            canView: hasViewPermission,
            canDelete: hasDeletePermission,
            showEditUI: shouldShowEditUI(topic, user.uid),
            showDeleteUI: shouldShowDeleteUI(topic, user.uid),
            isViewer: isViewerOnly
        };
    }, [topic, user]);

    return {
        // Data
        subject,
        topic,
        loading,
        uploading,
        activeTab, setActiveTab,
        
        // Permissions
        permissions: topicPermissions,
        
        // UI State
        toast, setToast,
        showMenu, setShowMenu,
        isEditingTopic, setIsEditingTopic,
        editTopicData, setEditTopicData,
        activeMenuId, setActiveMenuId,
        renamingId, setRenamingId,
        tempName, setTempName,
        viewingFile, setViewingFile,
        
        // Modals State
        showQuizModal, setShowQuizModal,
        isGeneratingQuiz, setIsGeneratingQuiz,
        quizFormData, setQuizFormData,
        showContentModal, setShowContentModal,
        isGeneratingContent, setIsGeneratingContent,
        contentFormData, setContentFormData,
        
        // Categorization Modal State
        showCategorizationModal, setShowCategorizationModal,
        pendingFiles, setPendingFiles,
        categorizingFile,

        // Delete Confirm State
        confirmDialog,
        isConfirmingAction,
        closeConfirmDialog,
        confirmDeleteAction,
        
        // Refs
        fileInputRef,
        
        // Helpers
        getFileVisuals,
        getQuizVisuals,
        
        // Handlers
        navigate,
        handleMenuClick,
        startRenaming,
        saveRename,
        deleteFile,
        handleChangeFileCategory,
        deleteQuiz,
        handleViewFile,
        handleDeleteTopic,
        handleSaveTopicTitle,
        handleManualUpload,
        handleGenerateQuizSubmit,
        handleGenerateContentSubmit,
        handleCreateCustomPDF,
        handleCreateCustomQuiz,
        handleFileCategorized,
        subjectId,
        topicId
    };
};