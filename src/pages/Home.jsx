import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, BookOpen, Home, ArrowUpDown, CheckCircle2, 
    Clock, RotateCw, ChevronRight, FileText, Download, Play, Trash2, Loader2,
    MoreVertical, Calendar, BarChart3, Timer, Sparkles
} from 'lucide-react';

import Header from '../components/layout/Header';
import SubjectModal from '../components/modals/SubjectModal';
import TopicModal from '../components/modals/TopicModal';
import DeleteModal from '../components/modals/DeleteModal';
import PositionModal from '../components/modals/PositionModal';
import ReorderModal from '../components/modals/ReorderModal';

import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// ⚠️ REVISA TU URL DE NGROK
const N8N_WEBHOOK_URL = 'https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook-test/711e538b-9d63-42bb-8494-873301ffdf39';

const AIClassroom = ({ user }) => {
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [retryTopicId, setRetryTopicId] = useState(null);
    const [fileCache, setFileCache] = useState({});
    const [showPositionModal, setShowPositionModal] = useState(false);
    const [pendingTopic, setPendingTopic] = useState(null);
    
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modales
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showReorderModal, setShowReorderModal] = useState(false);

    // Formularios
    const [subjectFormData, setSubjectFormData] = useState({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
    const [topicFormData, setTopicFormData] = useState({ title: '', prompt: '' });

    // UI
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [activeTab, setActiveTab] = useState('materials');

    const colorOptions = [
        { name: 'Azul', value: 'from-blue-400 to-blue-600' },
        { name: 'Púrpura', value: 'from-purple-400 to-purple-600' },
        { name: 'Verde', value: 'from-emerald-400 to-emerald-600' },
        { name: 'Rosa', value: 'from-rose-400 to-rose-600' },
        { name: 'Ámbar', value: 'from-amber-400 to-amber-600' },
        { name: 'Cian', value: 'from-cyan-400 to-cyan-600' },
        { name: 'Índigo', value: 'from-indigo-400 to-indigo-600' },
        { name: 'Rosa Fucsia', value: 'from-pink-400 to-pink-600' }
    ];

    // --- CARGA INICIAL ---
    useEffect(() => {
        const fetchSubjects = async () => {
            if (!user) return; 
            try {
                const q = query(collection(db, "subjects"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const loadedSubjects = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSubjects(loadedSubjects);
            } catch (error) {
                console.error("Error cargando asignaturas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, [user]);

    // --- LÓGICA ---
    const requestDelete = (e, subject) => {
        e.stopPropagation();
        setSubjectToDelete(subject);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!subjectToDelete) return;
        try {
            await deleteDoc(doc(db, "subjects", subjectToDelete.id));
            setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
            setShowDeleteModal(false);
            setSubjectToDelete(null);
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar la asignatura.");
        }
    };

    const updateSubjectTopics = async (newTopics) => {
        setSubjects(prev => prev.map(s => 
            s.id === selectedSubject.id ? { ...s, topics: newTopics } : s
        ));
        setSelectedSubject(prev => ({ ...prev, topics: newTopics }));
        setTopics(newTopics);

        if (selectedSubject?.id) {
            try {
                const subjectRef = doc(db, "subjects", selectedSubject.id);
                await updateDoc(subjectRef, { topics: newTopics });
            } catch (error) {
                console.error("❌ Error guardando en Firebase:", error);
            }
        }
    };

    // --- N8N (10 MINUTOS TIMEOUT) ---
    const sendToN8N = async (topicId, topicsList, data, attachedFiles) => {
        console.log("🚀 INICIANDO ENVÍO...", topicId);

        if (!topicsList || topicsList.length === 0) return;

        const formData = new FormData();
        formData.append('topicId', topicId);
        formData.append('title', data.title);
        formData.append('prompt', data.prompt || '');
        formData.append('subject', selectedSubject.name);
        formData.append('course', selectedSubject.course);
        formData.append('my_value', JSON.stringify(topicsList));
        
        if (attachedFiles && attachedFiles.length > 0) {
            attachedFiles.forEach((file) => formData.append('files', file));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 Minutos

        try {
            console.log("⏳ Conectando con IA...");
            const response = await fetch(N8N_WEBHOOK_URL, { 
                method: 'POST', 
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Status: ${response.status}`);

            const result = await response.json();
            
            const completedList = topicsList.map(t => 
                t.id === topicId 
                    ? { ...t, status: 'completed', pdfs: result.pdfs || [], quizzes: result.quizzes || [] } 
                    : t
            );
            updateSubjectTopics(completedList);

        } catch (error) {
            console.error("❌ ERROR:", error);
            await new Promise(resolve => setTimeout(resolve, 2000));

            const errorList = topicsList.map(t => 
                t.id === topicId ? { ...t, status: 'error' } : t
            );
            updateSubjectTopics(errorList);

            if (error.name === 'AbortError') {
                alert("⏳ Se ha superado el tiempo de espera (10 min).");
            }
        }
    };

    // --- GESTIÓN DE TEMAS ---
    const handleCreateTopic = (e) => {
        if (e) e.preventDefault();
        
        if (retryTopicId) {
            const filesToSend = files.length > 0 ? files : (fileCache[retryTopicId] || []);
            if (filesToSend.length === 0) {
                alert("⚠️ Por favor, vuelve a arrastrar el PDF.");
                return;
            }

            const updatedTopics = topics.map(t => 
                t.id === retryTopicId 
                    ? { ...t, title: topicFormData.title, prompt: topicFormData.prompt, status: 'generating', color: selectedSubject.color } 
                    : t
            );
            
            updateSubjectTopics(updatedTopics);
            setShowTopicModal(false);
            setFileCache(prev => ({...prev, [retryTopicId]: filesToSend}));
            sendToN8N(retryTopicId, updatedTopics, topicFormData, filesToSend);
            
            setRetryTopicId(null);
            setTopicFormData({ title: '', prompt: '' });
            setFiles([]);
            return;
        }

        const newTopic = {
            id: Date.now().toString(),
            title: topicFormData.title,
            prompt: topicFormData.prompt,
            status: 'generating',
            color: selectedSubject.color,
            pdfs: [], quizzes: []
        };

        const currentFiles = [...files];
        setFileCache(prev => ({...prev, [newTopic.id]: currentFiles}));

        const currentTopics = selectedSubject.topics || [];

        if (currentTopics.length === 0) {
            const updatedTopic = { ...newTopic, number: '01' };
            const newTopicsList = [updatedTopic];
            
            updateSubjectTopics(newTopicsList);
            setShowTopicModal(false);
            setTopicFormData({ title: '', prompt: '' });
            setFiles([]);
            
            sendToN8N(updatedTopic.id, newTopicsList, { title: topicFormData.title, prompt: topicFormData.prompt }, currentFiles);
        } else {
            setPendingTopic({ ...newTopic, tempFiles: currentFiles, tempPrompt: topicFormData.prompt });
            setShowTopicModal(false);
            setShowPositionModal(true);
        }
    };

    const handleRetryTopic = (e, topic) => {
        e.stopPropagation();
        setTopicFormData({ title: topic.title, prompt: topic.prompt || '' });
        setRetryTopicId(topic.id);
        setFiles([]); 
        setShowTopicModal(true);
    };

    const handlePositionConfirm = (insertIndex) => {
        if (!pendingTopic || !selectedSubject) return;

        const currentTopics = selectedSubject.topics || [];
        const newTopicsList = [
            ...currentTopics.slice(0, insertIndex),
            pendingTopic,
            ...currentTopics.slice(insertIndex)
        ];

        const reorderedList = newTopicsList.map((t, index) => ({
            ...t, number: (index + 1).toString().padStart(2, '0')
        }));

        updateSubjectTopics(reorderedList);
        
        sendToN8N(
            pendingTopic.id, reorderedList, 
            { title: pendingTopic.title, prompt: pendingTopic.tempPrompt }, 
            pendingTopic.tempFiles
        );

        setShowPositionModal(false);
        setPendingTopic(null);
    };

    const handleReorderConfirm = (reorderedList) => {
        const updatedList = reorderedList.map((topic, index) => ({
            ...topic, number: (index + 1).toString().padStart(2, '0')
        }));
        updateSubjectTopics(updatedList);
        setShowReorderModal(false);
    };

    const handleCreateSubject = async () => {
        if (!subjectFormData.name.trim() || !subjectFormData.course.trim()) return;
        try {
            const newSubject = {
                name: subjectFormData.name, course: subjectFormData.course, color: subjectFormData.color,
                topics: [], uid: user.uid, createdAt: new Date()
            };
            const docRef = await addDoc(collection(db, "subjects"), newSubject);
            setSubjects(prev => [...prev, { id: docRef.id, ...newSubject }]);
            setShowSubjectModal(false);
            setSubjectFormData({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
        } catch (error) {
            console.error("Error guardando asignatura:", error);
        }
    };

    // --- UI HELPERS ---
    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files); };
    const handleFiles = (fileList) => { const newFiles = Array.from(fileList).filter(f => f.type === 'application/pdf'); setFiles(prev => [...prev, ...newFiles]); };
    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    const handleSelectSubject = async (subject) => {
        setSelectedSubject(subject);
        setLoading(true); // Optional: show a loader while fetching topics

        try {
            // Path: subjects/{subjectId}/topics
            const topicsRef = collection(db, "subjects", subject.id, "topics");
            
            // We order them by the 'order' field we created earlier
            const q = query(topicsRef); 
            const querySnapshot = await getDocs(q);
            
            const loadedTopics = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort locally by order (or add orderBy to your query)
            const sortedTopics = loadedTopics.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            setTopics(sortedTopics);
        } catch (error) {
            console.error("Error fetching topics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTopic = async (topic) => {
        setSelectedTopic(topic);
        
        try {
            // Path: subjects/{sId}/topics/{tId}/documents
            const docsRef = collection(db, "subjects", selectedSubject.id, "topics", topic.id, "documents");
            const querySnapshot = await getDocs(docsRef);
            
            const allDocs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Separate them by type for your UI tabs
            const pdfs = allDocs.filter(d => d.type === 'pdf' || d.type === 'summary');
            const quizzes = allDocs.filter(d => d.type === 'quiz');

            // Update the selectedTopic state with its nested documents
            setSelectedTopic(prev => ({
                ...prev,
                pdfs,
                quizzes
            }));
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };


    const handleBackToSubjects = () => { setSelectedSubject(null); setSelectedTopic(null); setTopics([]); };
    const handleBackToTopics = () => { setSelectedTopic(null); setActiveTab('materials'); };
    
    const getQuizIcon = (type) => {
        switch(type) {
            case 'basic': return { icon: '📖', color: 'from-blue-400 to-blue-600', level: 'Básico' };
            case 'advanced': return { icon: '🧪', color: 'from-purple-400 to-purple-600', level: 'Avanzado' };
            case 'final': return { icon: '🏆', color: 'from-amber-400 to-amber-600', level: 'Examen' };
            default: return { icon: '📝', color: 'from-gray-400 to-gray-600', level: 'Test' };
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {!selectedSubject ? (
                    /* 1. VISTA ASIGNATURAS */
                    <>
                        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Mis Asignaturas</h2>
                            <p className="text-slate-500 text-lg">Gestiona tu contenido educativo de forma inteligente.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button onClick={() => setShowSubjectModal(true)} className="group relative h-64 border-2 border-dashed border-slate-300 rounded-3xl bg-white hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-100 group-hover:bg-indigo-200 group-hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-sm"><Plus className="w-8 h-8 text-indigo-600" /></div>
                                <span className="text-lg font-bold text-slate-700 group-hover:text-indigo-700">Crear Asignatura</span>
                            </button>
                            {subjects.map((subject) => (
                                <button key={subject.id} onClick={() => handleSelectSubject(subject)} className="group relative h-64 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer text-left">
                                    <div onClick={(e) => requestDelete(e, subject)} className="absolute top-4 right-4 z-20 p-2.5 bg-white/20 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm"><Trash2 className="w-4 h-4" /></div>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                                    <div className="relative h-full p-8 flex flex-col justify-between text-white">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl"><BookOpen className="w-8 h-8 text-white" /></div>
                                            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full"><span className="text-xs font-bold uppercase tracking-wider">{(subject.topics || []).length} Temas</span></div>
                                        </div>
                                        <div><p className="text-sm font-medium opacity-90 mb-1 uppercase tracking-wide">{subject.course}</p><h3 className="text-3xl font-extrabold tracking-tight">{subject.name}</h3></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : !selectedTopic ? (
                    /* 2. VISTA LISTA DE TEMAS */
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8">
                            <button onClick={handleBackToSubjects} className="hover:text-indigo-600 transition-colors">Mis Asignaturas</button>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-slate-900 font-bold">{selectedSubject.name}</span>
                        </div>

                        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="flex items-center gap-5">
                                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${selectedSubject.color} flex items-center justify-center shadow-lg shadow-indigo-500/10`}><BookOpen className="w-10 h-10 text-white" /></div>
                                <div><p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{selectedSubject.course}</p><h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">{selectedSubject.name}</h2></div>
                            </div>
                            {topics.length > 1 && <button onClick={() => setShowReorderModal(true)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold shadow-sm transition-all"><ArrowUpDown className="w-4 h-4" /> Reordenar</button>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button onClick={() => setShowTopicModal(true)} className="group relative h-72 border-2 border-dashed border-slate-300 rounded-3xl bg-white hover:bg-white hover:border-indigo-400 transition-all duration-300 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-indigo-50 group-hover:bg-indigo-100 group-hover:scale-110 flex items-center justify-center transition-all duration-300"><Plus className="w-8 h-8 text-indigo-600" /></div>
                                <span className="text-lg font-bold text-slate-600 group-hover:text-indigo-600">Nuevo Tema</span>
                            </button>
                            {topics.map((topic) => (
                                <button key={topic.id} onClick={() => topic.status === 'completed' && setSelectedTopic(topic)} className={`group relative h-72 rounded-3xl shadow-md shadow-slate-200 overflow-hidden transition-all duration-300 ${topic.status === 'completed' ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : 'cursor-default'}`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                                    
                                    {topic.status === 'error' && (
                                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in">
                                            <div onClick={(e) => handleRetryTopic(e, topic)} className="flex flex-col items-center gap-3 group/btn cursor-pointer">
                                                <div className="bg-red-500 text-white p-4 rounded-full shadow-lg group-hover/btn:scale-110 transition-transform"><RotateCw className="w-8 h-8" /></div>
                                                <span className="text-white font-bold text-lg">Reintentar Generación</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative h-full p-8 flex flex-col justify-between text-white">
                                        <div className="flex justify-between items-start">
                                            <span className="text-7xl font-black opacity-20 -ml-2">{topic.number}</span>
                                            {topic.status === 'generating' ? 
                                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /><span className="text-xs font-bold">Procesando</span></div> 
                                            : topic.status === 'completed' ? 
                                                <div className="bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-emerald-400/30"><CheckCircle2 className="w-4 h-4" /><span className="text-xs font-bold">Completado</span></div> 
                                            : null}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-3 leading-tight">{topic.title}</h3>
                                            <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                                                <div className={`h-full bg-white transition-all duration-1000 ${topic.status === 'generating' ? 'w-1/3 animate-pulse' : topic.status === 'completed' ? 'w-full' : 'w-0'}`}></div>
                                            </div>
                                            <p className="text-xs mt-3 opacity-80 font-medium tracking-wide">
                                                {topic.status === 'generating' ? 'La IA está trabajando...' : topic.status === 'completed' ? 'Click para ver contenidos' : 'Hubo un error'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* 3. VISTA DETALLE TEMA (PREMIUM SAAS) */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Breadcrumbs de Navegación */}
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8">
                            <button onClick={handleBackToSubjects} className="hover:text-indigo-600 transition-colors">Mis Asignaturas</button>
                            <ChevronRight className="w-4 h-4" />
                            <button onClick={handleBackToTopics} className="hover:text-indigo-600 transition-colors">{selectedSubject.name}</button>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-slate-900 font-bold">Tema {selectedTopic.number}</span>
                        </div>

                        {/* Header del Tema */}
                        <div className="mb-10 pb-8 border-b border-slate-200">
                            <div className="flex flex-col md:flex-row items-start gap-8">
                                {/* Número Grande con Gradiente */}
                                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${selectedTopic.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform -rotate-2 transition-transform hover:rotate-0`}>
                                    <span className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-md">{selectedTopic.number}</span>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                            {selectedSubject.course}
                                        </span>
                                        <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                                            <Calendar className="w-4 h-4" />
                                            <span>Actualizado hoy</span>
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight capitalize leading-tight">
                                        {selectedTopic.title}
                                    </h2>

                                    {/* Barra de Progreso Simulada */}
                                    <div className="flex items-center gap-4 max-w-md pt-2">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-1/4 rounded-full"></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">25% Completado</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs de Navegación Estilo Segmentado */}
                        <div className="flex items-center gap-2 mb-8">
                            <button 
                                onClick={() => setActiveTab('materials')} 
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border ${
                                    activeTab === 'materials' 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                Documentos
                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'materials' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                                    {selectedTopic.pdfs?.length || 0}
                                </span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('quizzes')} 
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border ${
                                    activeTab === 'quizzes' 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Tests Prácticos
                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'quizzes' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                                    {selectedTopic.quizzes?.length || 0}
                                </span>
                            </button>
                        </div>

                        {/* Contenido */}
                        {activeTab === 'materials' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {selectedTopic.pdfs?.map((pdf, idx) => (
                                    <div key={idx} className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between h-52 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 group-hover:scale-110 transition-transform shadow-sm">
                                                <FileText className="w-6 h-6 text-red-500" />
                                            </div>
                                            <div className="flex-1 pr-6">
                                                <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug mb-1" title={pdf.name}>
                                                    {pdf.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                    <span className="uppercase bg-slate-100 px-1.5 rounded text-[10px] tracking-wide text-slate-500">{pdf.type || 'PDF'}</span>
                                                    <span>• 2.4 MB</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
                                            <a href={pdf.url} download className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                                                <Download className="w-4 h-4" /> Descargar
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedTopic.pdfs || selectedTopic.pdfs.length === 0) && (
                                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                        <FileText className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="font-medium">No hay materiales disponibles todavía.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedTopic.quizzes?.map((quiz) => {
                                    const style = getQuizIcon(quiz.type);
                                    return (
                                        <div key={quiz.id} className="group bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
                                            <div className={`h-28 bg-gradient-to-r ${style.color} relative overflow-hidden flex flex-col justify-between p-5`}>
                                                <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500"><span className="text-7xl">{style.icon}</span></div>
                                                <div className="flex justify-between items-start relative z-10">
                                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-white/10">{style.level}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-white/90 text-xs font-medium relative z-10">
                                                    <Timer className="w-3 h-3" />
                                                    <span>15 min aprox</span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-slate-900 text-lg mb-1">{quiz.name}</h4>
                                                    <p className="text-xs text-slate-500 line-clamp-2">Pon a prueba tus conocimientos sobre {selectedTopic.title}.</p>
                                                </div>
                                                <button onClick={() => alert('Próximamente: Sistema de exámenes interactivos')} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg group-hover:shadow-indigo-200">
                                                    <Play className="w-4 h-4 fill-current" /> Comenzar Test
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!selectedTopic.quizzes || selectedTopic.quizzes.length === 0) && (
                                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                        <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="font-medium">No hay tests generados aún.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <SubjectModal isOpen={showSubjectModal} onClose={() => setShowSubjectModal(false)} formData={subjectFormData} setFormData={setSubjectFormData} onSubmit={handleCreateSubject} colorOptions={colorOptions} />
            <TopicModal isOpen={showTopicModal} onClose={() => { setShowTopicModal(false); setTopicFormData({ title: '', prompt: '' }); setFiles([]); }} formData={topicFormData} setFormData={setTopicFormData} onSubmit={handleCreateTopic} isFirstTopic={topics.length === 0} files={files} onRemoveFile={removeFile} dragActive={dragActive} handleDrag={handleDrag} handleDrop={handleDrop} handleFileSelect={(e) => handleFiles(e.target.files)} />
            <DeleteModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={confirmDelete} itemName={subjectToDelete?.name} />
            <PositionModal isOpen={showPositionModal} onClose={() => setShowPositionModal(false)} onConfirm={handlePositionConfirm} topics={selectedSubject?.topics || []} newTopicTitle={pendingTopic?.title} />
            <ReorderModal isOpen={showReorderModal} onClose={() => setShowReorderModal(false)} onConfirm={handleReorderConfirm} topics={topics} />
        </div>
    );
};

export default AIClassroom;