import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, BookOpen, Home, ArrowUpDown, CheckCircle2, 
    Clock, RotateCw, ChevronLeft, FileText, Download, Play , Trash2, Loader2
} from 'lucide-react';

// 👇 IMPORTAMOS TUS COMPONENTES
import Header from '../components/layout/Header';
import SubjectModal from '../components/modals/SubjectModal';
import TopicModal from '../components/modals/TopicModal';
import DeleteModal from '../components/modals/DeleteModal';
import PositionModal from '../components/modals/PositionModal';
import ReorderModal from '../components/modals/ReorderModal';

import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// ⚠️ REVISA ESTA URL: Si ngrok se reinició, esta dirección ya no sirve. Pon la nueva.
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
    const [loading, setLoading] = useState(true); // Estado de carga inicial

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
                setLoading(false); // Terminó de cargar (bien o mal)
            }
        };

        fetchSubjects();
    }, [user]);

    // --- LÓGICA DE GESTIÓN ---

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
        // 1. Actualización Visual Inmediata
        setSubjects(prev => prev.map(s => 
            s.id === selectedSubject.id ? { ...s, topics: newTopics } : s
        ));
        setSelectedSubject(prev => ({ ...prev, topics: newTopics }));
        setTopics(newTopics);

        // 2. Persistencia en Firebase
        if (selectedSubject?.id) {
            try {
                const subjectRef = doc(db, "subjects", selectedSubject.id);
                await updateDoc(subjectRef, { topics: newTopics });
            } catch (error) {
                console.error("❌ Error guardando en Firebase:", error);
            }
        }
    };

    // --- CONEXIÓN CON N8N (BLINDADA) ---
    const sendToN8N = async (topicId, topicsList, data, attachedFiles) => {
        console.log("🚀 INICIANDO ENVÍO...", topicId);

        if (!topicsList || topicsList.length === 0) {
            console.error("⚠️ Error crítico: Lista vacía.");
            return;
        }

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
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 10s Timeout

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
            
            // 👇 PAUSA VISUAL LARGA (2 SEGUNDOS)
            // Esto asegura que veas la tarjeta azul girando antes de que falle.
            // Así sabrás que el botón "Reintentar" SÍ funcionó, pero el servidor falló.
            await new Promise(resolve => setTimeout(resolve, 2000));

            const errorList = topicsList.map(t => 
                t.id === topicId ? { ...t, status: 'error' } : t
            );
            
            updateSubjectTopics(errorList);

        
        }
    };

    // --- MANEJO DE TEMAS ---
    const handleCreateTopic = (e) => {
        if (e) e.preventDefault();
        
        // 🅰️ REINTENTO
        if (retryTopicId) {
            // Usamos archivos nuevos O los de la memoria caché
            const filesToSend = files.length > 0 ? files : (fileCache[retryTopicId] || []);

            if (filesToSend.length === 0) {
                alert("⚠️ Por favor, vuelve a arrastrar el PDF antes de continuar.");
                return;
            }

            const updatedTopics = topics.map(t => 
                t.id === retryTopicId 
                    ? { ...t, title: topicFormData.title, prompt: topicFormData.prompt, status: 'generating', color: selectedSubject.color } 
                    : t
            );
            
            updateSubjectTopics(updatedTopics);
            setShowTopicModal(false);
            
            // Actualizamos caché por si falla otra vez
            setFileCache(prev => ({...prev, [retryTopicId]: filesToSend}));

            sendToN8N(retryTopicId, updatedTopics, topicFormData, filesToSend);
            
            // Limpieza
            setRetryTopicId(null);
            setTopicFormData({ title: '', prompt: '' });
            setFiles([]);
            return;
        }

        // 🅱️ NUEVO TEMA
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
            // Primer tema (Directo)
            const updatedTopic = { ...newTopic, number: '01' };
            const newTopicsList = [updatedTopic];
            
            updateSubjectTopics(newTopicsList);
            setShowTopicModal(false);
            setTopicFormData({ title: '', prompt: '' });
            setFiles([]);
            
            sendToN8N(updatedTopic.id, newTopicsList, { title: topicFormData.title, prompt: topicFormData.prompt }, currentFiles);
        } else {
            // Siguientes temas (Preguntar Posición)
            setPendingTopic({ ...newTopic, tempFiles: currentFiles, tempPrompt: topicFormData.prompt });
            setShowTopicModal(false);
            setShowPositionModal(true);
        }
    };

    const handleRetryTopic = (e, topic) => {
        e.stopPropagation();
        setTopicFormData({ title: topic.title, prompt: topic.prompt || '' });
        setRetryTopicId(topic.id);
        setFiles([]); // Forzamos limpieza visual para obligar a re-subir si quieren cambiarlo
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
            pendingTopic.id, 
            reorderedList, 
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

    // --- MANEJO DE ARCHIVOS Y UI ---
    const handleCreateSubject = async () => {
        if (!subjectFormData.name.trim() || !subjectFormData.course.trim()) return;
        try {
            const newSubject = {
                name: subjectFormData.name,
                course: subjectFormData.course,
                color: subjectFormData.color,
                topics: [],
                uid: user.uid,
                createdAt: new Date()
            };
            const docRef = await addDoc(collection(db, "subjects"), newSubject);
            setSubjects(prev => [...prev, { id: docRef.id, ...newSubject }]);
            setShowSubjectModal(false);
            setSubjectFormData({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
        } catch (error) {
            console.error("Error guardando asignatura:", error);
            alert("Hubo un error al guardar.");
        }
    };

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (fileList) => {
        const newFiles = Array.from(fileList).filter(f => f.type === 'application/pdf');
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    const handleSelectSubject = (subject) => { setSelectedSubject(subject); setTopics(subject.topics || []); };
    const handleBackToSubjects = () => { setSelectedSubject(null); setSelectedTopic(null); setTopics([]); };
    const handleBackToTopics = () => { setSelectedTopic(null); setActiveTab('materials'); };
    
    const getQuizIcon = (type) => {
        switch(type) {
            case 'basic': return { icon: '📖', color: 'from-blue-400 to-blue-600' };
            case 'advanced': return { icon: '🧪', color: 'from-purple-400 to-purple-600' };
            case 'final': return { icon: '🏆', color: 'from-amber-400 to-amber-600' };
            default: return { icon: '📝', color: 'from-gray-400 to-gray-600' };
        }
    };

    // --- 🛡️ PROTECCIÓN CONTRA PANTALLA BLANCA 🛡️ ---
    // Si el usuario aún no ha cargado, mostramos un loader en vez de intentar pintar la app.
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

    // --- VISTA PRINCIPAL ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {!selectedSubject ? (
                    /* Vista Principal - Asignaturas */
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
                    /* Vista de Temas */
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
                    /* Vista Detalle Tema */
                    <div>
                        <button onClick={handleBackToTopics} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ChevronLeft className="w-5 h-5" /> Volver a Temas</button>
                        <div className="mb-8">
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">{selectedTopic.title}</h2>
                            <div className="bg-white rounded-xl shadow-md p-2 flex gap-2 mb-6">
                                <button onClick={() => setActiveTab('materials')} className={`flex-1 py-3 px-6 rounded-lg font-semibold ${activeTab === 'materials' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>📚 Materiales</button>
                                <button onClick={() => setActiveTab('quizzes')} className={`flex-1 py-3 px-6 rounded-lg font-semibold ${activeTab === 'quizzes' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>✍️ Tests</button>
                            </div>
                        </div>
                        {activeTab === 'materials' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedTopic.pdfs?.map((pdf, idx) => (
                                    <div key={idx} className="bg-white rounded-xl shadow-md p-6">
                                        <div className="flex items-center gap-4 mb-4"><div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0"><FileText className="w-7 h-7 text-red-600" /></div><div className="flex-1 min-w-0"><h4 className="font-semibold truncate">{pdf.name}</h4></div></div>
                                        <a href={pdf.url} download className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Download className="w-5 h-5" /> Descargar</a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedTopic.quizzes?.map((quiz) => {
                                    const style = getQuizIcon(quiz.type);
                                    return (
                                        <div key={quiz.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                                            <div className={`h-32 bg-gradient-to-br ${style.color} flex items-center justify-center`}><span className="text-6xl">{style.icon}</span></div>
                                            <div className="p-6"><h4 className="font-bold text-lg mb-2">{quiz.name}</h4><button onClick={() => alert('Próximamente')} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Play className="w-5 h-5" /> Comenzar</button></div>
                                        </div>
                                    );
                                })}
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