import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, BookOpen, Home, ArrowUpDown, CheckCircle2, 
    Clock, RotateCw, ChevronLeft, FileText, Download, Play 
} from 'lucide-react';

// 👇 1. IMPORTAMOS TUS NUEVOS COMPONENTES
import Header from '../components/layout/Header';
import SubjectModal from '../components/modals/SubjectModal';
import TopicModal from '../components/modals/TopicModal';
// Si aún no has creado estos dos, coméntalos para que no falle:
// import PositionModal from '../components/modals/PositionModal';
// import ReorderModal from '../components/modals/ReorderModal';

const N8N_WEBHOOK_URL = 'https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook-test/711e538b-9d63-42bb-8494-873301ffdf39';

const AIClassroom = ({ user }) => {
    const navigate = useNavigate();

    // --- ESTADOS (EL CEREBRO DE LA APP) ---
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);

    // Estados de Modales
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showPositionModal, setShowPositionModal] = useState(false);
    const [showReorderModal, setShowReorderModal] = useState(false);

    // Datos de Formularios
    const [subjectFormData, setSubjectFormData] = useState({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
    const [topicFormData, setTopicFormData] = useState({ title: '', prompt: '' });
    const [pendingTopic, setPendingTopic] = useState(null);
    const [reorderList, setReorderList] = useState([]);

    // UI States
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [activeTab, setActiveTab] = useState('materials');
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

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

    // --- LÓGICA (FUNCIONES) ---
    // (Mantengo tu lógica intacta para que no se rompa nada)

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

    const handleCreateSubject = () => {
        if (!subjectFormData.name.trim() || !subjectFormData.course.trim()) return;
        const newSubject = {
            id: Date.now().toString(),
            name: subjectFormData.name,
            course: subjectFormData.course,
            color: subjectFormData.color,
            topics: []
        };
        setSubjects(prev => [...prev, newSubject]);
        setShowSubjectModal(false);
        setSubjectFormData({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
    };

    const sendToN8N = async (topicId, topicsList, data, attachedFiles) => {
        console.log("🚀 Enviando datos a n8n...");
        const formData = new FormData();
        formData.append('topicId', topicId);
        formData.append('title', data.title);
        formData.append('prompt', data.prompt || '');
        formData.append('subject', selectedSubject.name);
        formData.append('course', selectedSubject.course);
        formData.append('my_value', JSON.stringify(topicsList));
        attachedFiles.forEach((file) => formData.append('files', file));

        try {
            const response = await fetch(N8N_WEBHOOK_URL, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const result = await response.json();
            
            const updatedTopics = topicsList.map(t => 
                t.id === topicId ? { ...t, status: 'completed', pdfs: result.pdfs || [], quizzes: result.quizzes || [] } : t
            );
            updateSubjectTopics(updatedTopics);
        } catch (error) {
            console.error("❌ Error en envío a n8n:", error);
            const updatedTopics = topicsList.map(t => t.id === topicId ? { ...t, status: 'error' } : t);
            updateSubjectTopics(updatedTopics);
        }
    };

    const handleCreateTopic = () => {
        if (!selectedSubject) return;
        const newTopic = {
            id: Date.now().toString(),
            title: topicFormData.title,
            status: 'generating',
            color: selectedSubject.color,
            pdfs: [], quizzes: []
        };

        const currentTopics = selectedSubject.topics || [];
        const currentFiles = [...files];
        const currentPrompt = topicFormData.prompt;
        const currentTitle = topicFormData.title;

        if (currentTopics.length === 0) {
            const updatedTopic = { ...newTopic, number: '01' };
            const newTopicsList = [updatedTopic];
            updateSubjectTopics(newTopicsList);
            setShowTopicModal(false);
            setTopicFormData({ title: '', prompt: '' });
            setFiles([]);
            sendToN8N(updatedTopic.id, newTopicsList, { title: currentTitle, prompt: currentPrompt }, currentFiles);
        } else {
            setPendingTopic({ ...newTopic, tempFiles: currentFiles, tempPrompt: currentPrompt });
            setShowTopicModal(false);
            setShowPositionModal(true);
        }
    };

    const updateSubjectTopics = (newTopics) => {
        setSubjects(prev => prev.map(s => s.id === selectedSubject.id ? { ...s, topics: newTopics } : s));
        setSelectedSubject(prev => ({ ...prev, topics: newTopics }));
        setTopics(newTopics);
    };

    const handleRetryTopic = (e, topic) => {
        e.stopPropagation();
        const updatedTopics = topics.map(t => t.id === topic.id ? { ...t, status: 'generating' } : t);
        updateSubjectTopics(updatedTopics);
        sendToN8N(topic.id, updatedTopics, { title: topic.title, prompt: '' }, []);
    };

    const handleSelectSubject = (subject) => {
        setSelectedSubject(subject);
        setTopics(subject.topics || []);
    };

    const handleBackToSubjects = () => {
        setSelectedSubject(null);
        setSelectedTopic(null);
        setTopics([]);
        setActiveTab('materials');
    };

    const handleBackToTopics = () => {
        setSelectedTopic(null);
        setActiveTab('materials');
    };
    
    const getQuizIcon = (type) => {
        switch(type) {
            case 'basic': return { icon: '📖', color: 'from-blue-400 to-blue-600' };
            case 'advanced': return { icon: '🧪', color: 'from-purple-400 to-purple-600' };
            case 'final': return { icon: '🏆', color: 'from-amber-400 to-amber-600' };
            default: return { icon: '📝', color: 'from-gray-400 to-gray-600' };
        }
    };

    // --- VISTA (RENDER) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
            
            {/* 1. HEADER LIMPIO */}
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
                            <button
                                onClick={() => setShowSubjectModal(true)}
                                className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 flex flex-col items-center justify-center gap-4"
                            >
                                <div className="w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                                    <Plus className="w-10 h-10 text-indigo-600" />
                                </div>
                                <span className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600">Crear Nueva Asignatura</span>
                            </button>

                            {subjects.map((subject) => (
                                <button
                                    key={subject.id}
                                    onClick={() => handleSelectSubject(subject)}
                                    className="group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`}></div>
                                    <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                        <div className="flex justify-between items-start">
                                            <BookOpen className="w-12 h-12 opacity-80" />
                                            <div className="bg-white/30 px-3 py-1 rounded-full"><span className="text-sm font-bold">{(subject.topics || []).length} temas</span></div>
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-90 mb-1">{subject.course}</p>
                                            <h3 className="text-2xl font-bold mb-3">{subject.name}</h3>
                                            <div className="flex items-center gap-2 text-sm opacity-90"><CheckCircle2 className="w-4 h-4" /><span>Listo para usar</span></div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : !selectedTopic ? (
                    /* Vista de Temas */
                    <>
                        <button onClick={handleBackToSubjects} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                            <Home className="w-5 h-5" /> Volver a Asignaturas
                        </button>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSubject.color} flex items-center justify-center`}>
                                        <BookOpen className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">{selectedSubject.course}</p>
                                        <h2 className="text-4xl font-bold text-gray-900">{selectedSubject.name}</h2>
                                    </div>
                                </div>
                                {topics.length > 1 && (
                                    <button onClick={() => setShowReorderModal(true)} className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700 shadow-sm">
                                        <ArrowUpDown className="w-5 h-5" />
                                        <span className="font-semibold hidden sm:inline">Reordenar</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button
                                onClick={() => setShowTopicModal(true)}
                                className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 flex flex-col items-center justify-center gap-4"
                            >
                                <div className="w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                                    <Plus className="w-10 h-10 text-indigo-600" />
                                </div>
                                <span className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600">Crear Nuevo Tema</span>
                            </button>

                            {topics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => topic.status === 'completed' && setSelectedTopic(topic)}
                                    className={`group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 ${
                                        topic.status === 'completed' ? 'hover:scale-105 cursor-pointer' : 
                                        topic.status === 'generating' ? 'cursor-wait' : 'cursor-default'
                                    }`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-90`}></div>
                                    {topic.status === 'error' && (
                                        <div className="absolute inset-0 bg-red-600/10 z-20 flex flex-col items-center justify-center transition-all duration-300">
                                            <div onClick={(e) => handleRetryTopic(e, topic)} className="flex flex-col items-center gap-2 group/btn cursor-pointer">
                                                <div className="bg-white text-red-600 p-3 rounded-full shadow-xl group-hover/btn:scale-110 transition-transform"><RotateCw className="w-6 h-6" /></div>
                                                <span className="text-white font-bold drop-shadow-md text-sm bg-red-600/80 px-3 py-1 rounded-full backdrop-blur-sm">Reintentar</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                        <div className="flex justify-between items-start">
                                            <span className="text-8xl font-black opacity-30">{topic.number}</span>
                                            {topic.status === 'generating' ? <Clock className="w-6 h-6 animate-spin" /> : topic.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : null}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-2">{topic.title}</h3>
                                            <div className="w-full bg-white/30 rounded-full h-2">
                                                <div className={`h-2 rounded-full bg-white transition-all duration-1000 ${topic.status === 'generating' ? 'w-1/3 animate-pulse' : topic.status === 'completed' ? 'w-full' : 'w-0'}`}></div>
                                            </div>
                                            <p className="text-sm mt-2 opacity-90">{topic.status === 'generating' ? 'Generando...' : topic.status === 'completed' ? 'Completado' : 'Error'}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    /* Vista Detalle Tema */
                    <div>
                        <button onClick={handleBackToTopics} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                            <ChevronLeft className="w-5 h-5" /> Volver a Temas
                        </button>
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedTopic.color} flex items-center justify-center`}>
                                    <span className="text-3xl font-black text-white">{selectedTopic.number}</span>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold text-gray-900">{selectedTopic.title}</h2>
                                    <p className="text-gray-600">Tema {selectedTopic.number} - {selectedSubject.name}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-2 flex gap-2 mb-6">
                                <button onClick={() => setActiveTab('materials')} className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${activeTab === 'materials' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>📚 Materiales</button>
                                <button onClick={() => setActiveTab('quizzes')} className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${activeTab === 'quizzes' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>✍️ Tests</button>
                            </div>
                        </div>

                        {activeTab === 'materials' ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedTopic.pdfs?.map((pdf, idx) => (
                                    <div key={idx} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0"><FileText className="w-7 h-7 text-red-600" /></div>
                                            <div className="flex-1 min-w-0"><h4 className="font-semibold text-gray-900 mb-1 truncate">{pdf.name}</h4><p className="text-sm text-gray-500 capitalize">{pdf.type}</p></div>
                                        </div>
                                        <a href={pdf.url} download={`ejerciciosTema${selectedTopic.number}.pdf`} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"><Download className="w-5 h-5" /> Descargar</a>
                                    </div>
                                ))}
                             </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedTopic.quizzes?.map((quiz) => {
                                    const style = getQuizIcon(quiz.type);
                                    return (
                                        <div key={quiz.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className={`h-32 bg-gradient-to-br ${style.color} flex items-center justify-center`}><span className="text-6xl">{style.icon}</span></div>
                                            <div className="p-6">
                                                <h4 className="font-bold text-gray-900 text-lg mb-2">{quiz.name}</h4>
                                                <button onClick={() => alert('Próximamente')} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"><Play className="w-5 h-5" /> Comenzar Test</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* 2. MODALES IMPORTADOS - MUCHO MÁS LIMPIO */}
            <SubjectModal 
                isOpen={showSubjectModal}
                onClose={() => setShowSubjectModal(false)}
                formData={subjectFormData}
                setFormData={setSubjectFormData}
                onSubmit={handleCreateSubject}
                colorOptions={colorOptions}
            />

            <TopicModal 
                isOpen={showTopicModal}
                onClose={() => {
                    setShowTopicModal(false);
                    setTopicFormData({ title: '', prompt: '' });
                    setFiles([]);
                }}
                formData={topicFormData}
                setFormData={setTopicFormData}
                onSubmit={handleCreateTopic}
                isFirstTopic={topics.length === 0}
                files={files}
                onRemoveFile={removeFile}
                dragActive={dragActive}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                handleFileSelect={(e) => handleFiles(e.target.files)}
            />

            {/* Añade aquí PositionModal y ReorderModal cuando los crees */}
        </div>
    );
};

export default AIClassroom;