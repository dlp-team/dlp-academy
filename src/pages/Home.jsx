import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, BookOpen, Home, ArrowUpDown, CheckCircle2, 
    Clock, RotateCw, ChevronLeft, FileText, Download, Play, Trash2, Loader2
} from 'lucide-react';

// 👇 TUS COMPONENTES
import Header from '../components/layout/Header';
import SubjectModal from '../components/modals/SubjectModal';
import TopicModal from '../components/modals/TopicModal';
import DeleteModal from '../components/modals/DeleteModal';
import PositionModal from '../components/modals/PositionModal';
import ReorderModal from '../components/modals/ReorderModal';

import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// ⚠️ REVISA TU URL DE NGROK AQUÍ
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
        // ⏰ 10 MINUTOS DE ESPERA (600,000 ms)
        const timeoutId = setTimeout(() => controller.abort(), 600000);

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
            console.log("✅ ÉXITO:", result);
            
            const completedList = topicsList.map(t => 
                t.id === topicId 
                    ? { ...t, status: 'completed', pdfs: result.pdfs || [], quizzes: result.quizzes || [] } 
                    : t
            );
            updateSubjectTopics(completedList);

        } catch (error) {
            console.error("❌ ERROR DE CONEXIÓN:", error);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa visual

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
        
        // REINTENTO
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

        // NUEVO TEMA
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

    // --- ARCHIVOS Y UI ---
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

    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files); };
    const handleFiles = (fileList) => { const newFiles = Array.from(fileList).filter(f => f.type === 'application/pdf'); setFiles(prev => [...prev, ...newFiles]); };
    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));
    const handleSelectSubject = (subject) => { setSelectedSubject(subject); setTopics(subject.topics || []); };
    const handleBackToSubjects = () => { setSelectedSubject(null); setSelectedTopic(null); setTopics([]); setActiveTab('materials'); };
    const handleBackToTopics = () => { setSelectedTopic(null); setActiveTab('materials'); };
    
    const getQuizIcon = (type) => {
        switch(type) {
            case 'basic': return { icon: '📖', color: 'from-blue-400 to-blue-600' };
            case 'advanced': return { icon: '🧪', color: 'from-purple-400 to-purple-600' };
            case 'final': return { icon: '🏆', color: 'from-amber-400 to-amber-600' };
            default: return { icon: '📝', color: 'from-gray-400 to-gray-600' };
        }
    };

    // --- RENDER ---
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Cargando tu aula...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {!selectedSubject ? (
                    /* 1. VISTA ASIGNATURAS */
                    <>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Asignaturas</h2>
                            <p className="text-gray-600">Gestiona tu contenido educativo</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button onClick={() => setShowSubjectModal(true)} className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors"><Plus className="w-10 h-10 text-indigo-600" /></div>
                                <span className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600">Crear Nueva Asignatura</span>
                            </button>
                            {subjects.map((subject) => (
                                <button key={subject.id} onClick={() => handleSelectSubject(subject)} className="group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer text-left">
                                    <div onClick={(e) => requestDelete(e, subject)} className="absolute top-3 right-3 z-20 p-2 bg-white/20 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></div>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`}></div>
                                    <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                        <div className="flex justify-between items-start"><BookOpen className="w-12 h-12 opacity-80" /><div className="bg-white/30 px-3 py-1 rounded-full"><span className="text-sm font-bold">{(subject.topics || []).length} temas</span></div></div>
                                        <div><p className="text-sm opacity-90">{subject.course}</p><h3 className="text-2xl font-bold">{subject.name}</h3></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : !selectedTopic ? (
                    /* 2. VISTA LISTA DE TEMAS */
                    <>
                        <button onClick={handleBackToSubjects} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><Home className="w-5 h-5" /> Volver a Asignaturas</button>
                        <div className="mb-8 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSubject.color} flex items-center justify-center`}><BookOpen className="w-8 h-8 text-white" /></div>
                                <div><p className="text-sm text-gray-600">{selectedSubject.course}</p><h2 className="text-4xl font-bold text-gray-900">{selectedSubject.name}</h2></div>
                            </div>
                            {topics.length > 1 && <button onClick={() => setShowReorderModal(true)} className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700 shadow-sm"><ArrowUpDown className="w-5 h-5" /> Reordenar</button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button onClick={() => setShowTopicModal(true)} className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors"><Plus className="w-10 h-10 text-indigo-600" /></div>
                                <span className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600">Crear Nuevo Tema</span>
                            </button>
                            {topics.map((topic) => (
                                <button key={topic.id} onClick={() => topic.status === 'completed' && setSelectedTopic(topic)} className={`group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-transform ${topic.status === 'completed' ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-90`}></div>
                                    {topic.status === 'error' && (
                                        <div className="absolute inset-0 bg-red-600/10 z-20 flex flex-col items-center justify-center">
                                            <div onClick={(e) => handleRetryTopic(e, topic)} className="flex flex-col items-center gap-2 group/btn cursor-pointer">
                                                <div className="bg-white text-red-600 p-3 rounded-full shadow-xl group-hover/btn:scale-110 transition-transform"><RotateCw className="w-6 h-6" /></div>
                                                <span className="text-white font-bold drop-shadow-md text-sm bg-red-600/80 px-3 py-1 rounded-full backdrop-blur-sm">Reintentar</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                        <div className="flex justify-between items-start"><span className="text-8xl font-black opacity-30">{topic.number}</span>{topic.status === 'generating' ? <Clock className="w-6 h-6 animate-spin" /> : topic.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : null}</div>
                                        <div><h3 className="text-2xl font-bold mb-2">{topic.title}</h3><p className="text-sm opacity-90">{topic.status === 'generating' ? 'Generando...' : topic.status === 'completed' ? 'Completado' : 'Error'}</p></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    /* 3. VISTA DETALLE TEMA (PROFESIONAL + NÚMERO GRANDE) */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 border-b border-gray-200 pb-6">
                            <button onClick={handleBackToTopics} className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                                <div className="p-1 rounded-full group-hover:bg-indigo-50 transition-colors"><ChevronLeft className="w-5 h-5" /></div>
                                Volver a la lista de temas
                            </button>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${selectedTopic.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg shadow-indigo-500/20 transform -rotate-3 transition-transform hover:rotate-0`}>
                                    <span className="text-5xl font-black text-white tracking-tighter drop-shadow-sm">{selectedTopic.number}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">{selectedSubject.course}</span>
                                        <span className="text-sm text-gray-400 font-medium">{selectedSubject.name}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight capitalize">{selectedTopic.title}</h2>
                                </div>
                                <div className="hidden md:flex gap-6 text-sm text-gray-500 bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
                                    <div className="flex flex-col items-center"><span className="font-bold text-gray-900 text-xl">{selectedTopic.pdfs?.length || 0}</span><span className="text-xs uppercase font-semibold text-gray-400">Archivos</span></div>
                                    <div className="w-px bg-gray-200 h-10"></div>
                                    <div className="flex flex-col items-center"><span className="font-bold text-gray-900 text-xl">{selectedTopic.quizzes?.length || 0}</span><span className="text-xs uppercase font-semibold text-gray-400">Tests</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-xl w-fit mb-8 shadow-inner">
                            <button onClick={() => setActiveTab('materials')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'materials' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}><FileText className="w-4 h-4" /> Materiales</button>
                            <button onClick={() => setActiveTab('quizzes')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'quizzes' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}><CheckCircle2 className="w-4 h-4" /> Tests & Quizzes</button>
                        </div>

                        {activeTab === 'materials' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {selectedTopic.pdfs?.map((pdf, idx) => (
                                    <div key={idx} className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between h-48">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 group-hover:scale-110 transition-transform"><FileText className="w-5 h-5 text-red-500" /></div>
                                                <div className="flex flex-col"><h4 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug" title={pdf.name}>{pdf.name}</h4><span className="text-xs text-gray-400 mt-1 capitalize">{pdf.type || 'Documento PDF'}</span></div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <a href={pdf.url} download className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 hover:bg-indigo-600 text-slate-600 hover:text-white rounded-lg text-sm font-medium transition-all group-hover:shadow-md"><Download className="w-4 h-4" /> Descargar</a>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedTopic.pdfs || selectedTopic.pdfs.length === 0) && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                        <FileText className="w-12 h-12 mb-3 opacity-20" />
                                        <p>No hay materiales disponibles todavía.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedTopic.quizzes?.map((quiz) => {
                                    const style = getQuizIcon(quiz.type);
                                    return (
                                        <div key={quiz.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                            <div className={`h-24 bg-gradient-to-r ${style.color} relative overflow-hidden`}>
                                                <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500"><span className="text-6xl">{style.icon}</span></div>
                                                <div className="absolute bottom-3 left-4 text-white"><span className="text-xs font-bold uppercase tracking-wider opacity-80 bg-black/20 px-2 py-1 rounded">Test</span></div>
                                            </div>
                                            <div className="p-5">
                                                <h4 className="font-bold text-gray-900 text-lg mb-1">{quiz.name}</h4>
                                                <p className="text-xs text-gray-500 mb-4 line-clamp-2">Pon a prueba tus conocimientos sobre {selectedTopic.title}.</p>
                                                <button onClick={() => alert('Próximamente: Sistema de exámenes interactivos')} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-lg shadow-gray-200 group-hover:shadow-indigo-200"><Play className="w-4 h-4 fill-current" /> Comenzar Test</button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!selectedTopic.quizzes || selectedTopic.quizzes.length === 0) && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                        <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
                                        <p>No hay tests generados aún.</p>
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