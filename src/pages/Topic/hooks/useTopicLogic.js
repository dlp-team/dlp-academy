// src/hooks/useTopicLogic.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FileText, Award, Sigma, BookOpen, NotebookPen, Pencil, Target, Trophy 
} from 'lucide-react';
import { collection, doc, getDoc, onSnapshot, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const useTopicLogic = (user) => {
    const navigate = useNavigate();
    const { subjectId, topicId } = useParams();
    const fileInputRef = useRef(null);
    const toastTimerRef = useRef(null);
    
    // Estados de Datos
    const [subject, setSubject] = useState(null);
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados de UI
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('materials');
    
    // Notificaciones
    const [toast, setToast] = useState({ show: false, message: '' });
    
    // Menús y Edición
    const [showMenu, setShowMenu] = useState(false);
    const [isEditingTopic, setIsEditingTopic] = useState(false);
    const [editTopicData, setEditTopicData] = useState({ title: '' });

    // Gestión Archivos y Menús
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [renamingId, setRenamingId] = useState(null);
    const [tempName, setTempName] = useState("");
    const [viewingFile, setViewingFile] = useState(null);

    // --- ESTADOS PARA EL MODAL DE TESTS ---
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizFormData, setQuizFormData] = useState({ 
        title: '', 
        level: 'Intermedio', 
        numQuestions: 5, 
        prompt: '' 
    });

    // --- ESTADOS PARA EL MODAL DE CONTENIDO ---
    const [showContentModal, setShowContentModal] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [contentFormData, setContentFormData] = useState({ 
        title: '', 
        type: 'summary', 
        prompt: '' 
    });

    // Función auxiliar para notificaciones
    const showNotification = (msg, duration = 5000) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ show: true, message: msg });
        toastTimerRef.current = setTimeout(() => {
            setToast({ show: false, message: '' });
        }, duration);
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        let unsubscribeTopic = () => {};
        let unsubscribeDocs = () => {};
        let unsubscribeQuizzes = () => {};

        const fetchTopicDetails = async () => {
            if (!user || !subjectId || !topicId) return;

            try {
                const subjectDoc = await getDoc(doc(db, "subjects", subjectId));
                if (subjectDoc.exists()) setSubject({ id: subjectDoc.id, ...subjectDoc.data() });

                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                unsubscribeTopic = onSnapshot(topicRef, (topicDoc) => {
                    if (topicDoc.exists()) {
                        const topicData = { id: topicDoc.id, ...topicDoc.data() };
                        setTopic(prev => ({ 
                            ...prev, 
                            ...topicData,
                            pdfs: prev?.pdfs || [],
                            uploads: prev?.uploads || [],
                            quizzes: prev?.quizzes || []
                        }));

                        const docsRef = collection(db, "subjects", subjectId, "topics", topicId, "documents");
                        unsubscribeDocs = onSnapshot(docsRef, (docsSnap) => {
                            const manualDocs = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                            const aiPdfs = Array.isArray(topicData.pdfs) ? topicData.pdfs.map((p, i) => ({ ...p, id: p.id || `ai-${i}`, origin: 'AI' })) : [];
                            const manualUploads = manualDocs.filter(d => d.source === 'manual').map(d => ({ ...d, origin: 'manual' }));

                            setTopic(prev => ({ 
                                ...prev, 
                                pdfs: aiPdfs, 
                                uploads: manualUploads 
                            }));
                        });

                        const quizzesRef = collection(db, "subjects", subjectId, "topics", topicId, "quizzes");
                        unsubscribeQuizzes = onSnapshot(quizzesRef, (quizzesSnap) => {
                            const realQuizzes = quizzesSnap.docs.map(q => ({ id: q.id, ...q.data() }));
                            setTopic(prev => ({ 
                                ...prev, 
                                quizzes: realQuizzes 
                            }));
                            setLoading(false);
                        });
                    } else {
                        setLoading(false);
                        navigate('/home');
                    }
                });
            } catch (error) {
                console.error("Error general:", error);
                setLoading(false);
            }
        };

        fetchTopicDetails();

        return () => {
            if (unsubscribeTopic) unsubscribeTopic();
            if (unsubscribeDocs) unsubscribeDocs();
            if (unsubscribeQuizzes) unsubscribeQuizzes();
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, [user, subjectId, topicId, navigate]);

    // --- HELPERS VISUALES ---
    const getFileVisuals = (type) => {
        if (!type) return { icon: FileText, label: 'Documento' };
        const t = type.toLowerCase();
        if (t.includes('exam') || t.includes('evaluación')) return { icon: Award, label: 'Examen' };
        if (t.includes('exercise') || t.includes('ejercicio')) return { icon: FileText, label: 'Ejercicios' };
        if (t.includes('formula') || t.includes('fórmula')) return { icon: Sigma, label: 'Fórmulas' };
        if (t.includes('summary') || t.includes('resumen') || t.includes('formulario')) return { icon: BookOpen, label: 'Resumen' };
        return { icon: FileText, label: 'Documento' };
    };

    const getQuizVisuals = (type) => {
        const t = (type || 'basic').toLowerCase();
        if (t.includes('basic') || t.includes('repaso')) return { icon: NotebookPen, bgFade: 'bg-sky-50', textAccent: 'text-sky-600', iconBg: 'bg-sky-100', border: 'border-sky-100', level: 'Repaso' };
        if (t.includes('intermediate') || t.includes('práctica')) return { icon: Pencil, bgFade: 'bg-indigo-50', textAccent: 'text-indigo-600', iconBg: 'bg-indigo-100', border: 'border-indigo-100', level: 'Práctica' };
        if (t.includes('advanced') || t.includes('avanzado')) return { icon: Target, bgFade: 'bg-emerald-50', textAccent: 'text-emerald-600', iconBg: 'bg-emerald-100', border: 'border-emerald-100', level: 'Avanzado' };
        if (t.includes('final') || t.includes('simulacro') || t.includes('exam')) return { icon: Trophy, bgFade: 'bg-amber-50', textAccent: 'text-amber-600', iconBg: 'bg-amber-100', border: 'border-amber-100', level: 'Simulacro' };
        return { icon: BookOpen, bgFade: 'bg-slate-50', textAccent: 'text-slate-600', iconBg: 'bg-slate-200', border: 'border-slate-100', level: 'Test' };
    };

    // --- GESTIÓN ARCHIVOS ---
    const handleMenuClick = (e, fileId) => { e.stopPropagation(); setActiveMenuId(activeMenuId === fileId ? null : fileId); };
    
    const startRenaming = (file) => {
        setRenamingId(file.id);
        setTempName(file.name);
        setActiveMenuId(null);
    };

    const saveRename = async (file) => {
        if (!tempName.trim()) return;
        try {
            if (file.origin === 'manual') {
                const docRef = doc(db, "subjects", subjectId, "topics", topicId, "documents", file.id);
                await updateDoc(docRef, { name: tempName });
            } else {
                const updatedPdfs = topic.pdfs.map(pdf => {
                    if (pdf.id === file.id) return { ...pdf, name: tempName };
                    return pdf;
                });
                const cleanPdfsForDb = updatedPdfs.map(p => ({ name: p.name, type: p.type, url: p.url, id: p.id }));
                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                await updateDoc(topicRef, { pdfs: cleanPdfsForDb });
            }
            setRenamingId(null);
        } catch (error) { console.error(error); alert("Error al renombrar."); }
    };

    const deleteFile = async (file) => {
        if (!window.confirm(`¿Eliminar "${file.name}"?`)) return;
        try {
            if (file.origin === 'manual') {
                await deleteDoc(doc(db, "subjects", subjectId, "topics", topicId, "documents", file.id));
            } else {
                const updatedPdfs = topic.pdfs.filter(pdf => pdf.id !== file.id).map(pdf => ({ name: pdf.name, type: pdf.type, url: pdf.url, id: pdf.id }));
                await updateDoc(doc(db, "subjects", subjectId, "topics", topicId), { pdfs: updatedPdfs });
            }
            setActiveMenuId(null);
        } catch (error) { console.error(error); alert("Error al eliminar."); }
    };

    const deleteQuiz = async (quizId) => {
        if (!window.confirm("¿Eliminar este test permanentemente?")) return;
        try {
            await deleteDoc(doc(db, "subjects", subjectId, "topics", topicId, "quizzes", quizId));
            setActiveMenuId(null);
        } catch (error) { console.error(error); alert("Error al eliminar test"); }
    };

    const handleViewFile = (file) => {
        if (!file.url) { alert("Archivo vacío."); return; }
        setViewingFile(file);
    };

    const handleDeleteTopic = async () => {
        if (!window.confirm("¿Eliminar tema completo?")) return;
        try {
            await deleteDoc(doc(db, "subjects", subjectId, "topics", topicId));
            navigate(`/home/subject/${subjectId}`);
        } catch (error) { console.error(error); }
    };

    const handleSaveTopicTitle = async () => {
        if (!editTopicData.title.trim()) return;
        try {
            await updateDoc(doc(db, "subjects", subjectId, "topics", topicId), { title: editTopicData.title });
            setIsEditingTopic(false);
        } catch (error) { console.error(error); }
    };

    const handleManualUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const validFiles = files.filter(file => file.size < 1048576); 
        if (validFiles.length === 0) return;

        setUploading(true);
        try {
            const convert = (f) => new Promise((r) => { const fr = new FileReader(); fr.readAsDataURL(f); fr.onload = () => r(fr.result); });
            await Promise.all(validFiles.map(async (file) => {
                const base64Url = await convert(file);
                return addDoc(collection(db, "subjects", subjectId, "topics", topicId, "documents"), {
                    name: file.name, type: file.type.includes('pdf') ? 'pdf' : 'doc', size: file.size, 
                    source: 'manual', uploadedAt: serverTimestamp(), url: base64Url, status: 'ready'
                });
            }));
            if (fileInputRef.current) fileInputRef.current.value = '';
            setActiveTab('uploads'); 
        } catch (error) { alert("Error al subir."); } finally { setUploading(false); }
    };

    // --- IA GENERATION: QUIZZES ---
    const handleGenerateQuizSubmit = async (e) => {
        e.preventDefault();
        setShowQuizModal(false);
        setIsGeneratingQuiz(false); 
        showNotification("⏳ La IA está diseñando tu test...", 6000);

        try {
            const formData = new FormData();
            formData.append('title', quizFormData.title);
            formData.append('level', quizFormData.level);
            formData.append('numQuestions', quizFormData.numQuestions);
            formData.append('prompt', quizFormData.prompt || '');
            formData.append('userId', user?.uid);
            formData.append('subjectId', subjectId);
            formData.append('topicId', topicId);
            formData.append('subjectName', subject?.name);
            formData.append('topicTitle', topic?.title);
            if (quizFormData.file) formData.append('files', quizFormData.file); 

            const res = await fetch('https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook/711e538b-9d63-42bb-8494-873301ffdf39', {
                method: 'POST', body: formData 
            });
            
            if (!res.ok) throw new Error("Error servidor");
            showNotification("✅ ¡Test generado con éxito!");

        } catch (error) { 
            console.error(error); 
            showNotification("❌ Error de conexión con la IA"); 
        }
    };

    // --- NUEVO: IA GENERATION: CONTENIDO (MATERIALS) ---
    const handleGenerateContentSubmit = async (e) => {
        e.preventDefault();
        setShowContentModal(false);
        setIsGeneratingContent(false);
        showNotification("⏳ Redactando tu material de estudio...", 6000);

        try {
            const formData = new FormData();
            formData.append('title', contentFormData.title);
            formData.append('type', contentFormData.type); // 'summary', 'formulas', etc.
            formData.append('prompt', contentFormData.prompt || '');
            // NOTA: Ajusta esta acción si tu n8n lo requiere para diferenciar tests de materiales
            formData.append('action', 'generate_study_material'); 
            
            formData.append('userId', user?.uid);
            formData.append('subjectId', subjectId);
            formData.append('topicId', topicId);
            formData.append('subjectName', subject?.name);
            formData.append('topicTitle', topic?.title);
            
            if (contentFormData.file) formData.append('files', contentFormData.file);

            // Reutilizamos el mismo webhook (tu n8n debe saber diferenciar por 'action' o estructura)
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
            title: `Resumen: ${topic?.title}`, 
            type: 'summary', 
            prompt: '' 
        });
        setShowContentModal(true);
    };

    const handleCreateCustomQuiz = () => {
        setQuizFormData({ 
            title: `Test: ${topic?.title}`, 
            level: 'Intermedio', 
            numQuestions: 5, 
            prompt: '' 
        });
        setShowQuizModal(true);
    };

    return {
        // Data
        subject,
        topic,
        loading,
        uploading,
        activeTab, setActiveTab,
        
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
        deleteQuiz,
        handleViewFile,
        handleDeleteTopic,
        handleSaveTopicTitle,
        handleManualUpload,
        handleGenerateQuizSubmit,
        handleGenerateContentSubmit,
        handleCreateCustomPDF,
        handleCreateCustomQuiz,
        subjectId,
        topicId
    };
};