import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, FileText, Download, Play, Loader2, ExternalLink,
    ChevronRight, Calendar, MoreVertical, CheckCircle2, 
    Timer, Sparkles, Home, Trash2, Edit2, Share2, Upload,
    X, BookOpen, Award, Maximize2, Wand2, FileEdit, Check, MoreHorizontal, Plus, Sigma,
    Zap, Brain, Trophy, Target
} from 'lucide-react';
import { collection, doc, getDoc, onSnapshot, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/layout/Header';
import QuizModal from './QuizzModal';

const Topic = ({ user }) => {
    const navigate = useNavigate();
    const { subjectId, topicId } = useParams();
    const fileInputRef = useRef(null);
    
    // Estados de Datos
    const [subject, setSubject] = useState(null);
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados de UI
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('materials');
    
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

    // --- CARGA DE DATOS ---
    useEffect(() => {
        let unsubscribeTopic = () => {};
        let unsubscribeDocs = () => {};
        let unsubscribeQuizzes = () => {};

        const fetchTopicDetails = async () => {
            if (!user || !subjectId || !topicId) return;

            try {
                // 1. Asignatura
                const subjectDoc = await getDoc(doc(db, "subjects", subjectId));
                if (subjectDoc.exists()) setSubject({ id: subjectDoc.id, ...subjectDoc.data() });

                // 2. Tema
                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                unsubscribeTopic = onSnapshot(topicRef, (topicDoc) => {
                    if (topicDoc.exists()) {
                        const topicData = { id: topicDoc.id, ...topicDoc.data() };
                        
                        // Inicializamos con arrays vacíos para evitar errores si no existen campos
                        setTopic(prev => ({ 
                            ...prev, 
                            ...topicData,
                            pdfs: prev?.pdfs || [],
                            uploads: prev?.uploads || [],
                            quizzes: prev?.quizzes || []
                        }));

                        // 3. Documentos
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

                        // 4. QUIZZES
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

    const getQuizIcon = (type) => {
        const t = (type || 'basic').toLowerCase();
        if (t.includes('basic') || t.includes('repaso')) return { icon: Zap, color: 'from-sky-400 to-blue-600', level: 'Repaso Rápido' };
        if (t.includes('intermediate') || t.includes('práctica')) return { icon: Target, color: 'from-violet-400 to-purple-600', level: 'Práctica' };
        if (t.includes('advanced') || t.includes('avanzado')) return { icon: Brain, color: 'from-fuchsia-500 to-pink-600', level: 'Avanzado' };
        if (t.includes('final') || t.includes('simulacro')) return { icon: Trophy, color: 'from-amber-400 to-orange-600', level: 'Examen Final' };
        return { icon: FileText, color: 'from-slate-400 to-slate-600', level: 'Test General' };
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

    // --- NUEVO: ELIMINAR QUIZ ---
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

    // --- ACCIONES TEMA ---
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

    // --- UPLOAD ---
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

    // --- IA GENERATION ---
    const handleGenerateQuizSubmit = async (e) => {
        e.preventDefault();
        setIsGeneratingQuiz(true);
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
            setShowQuizModal(false);
            alert("✅ Solicitud enviada a la IA.");
        } catch (error) { console.error(error); alert("Error de conexión"); } finally { setIsGeneratingQuiz(false); }
    };

    const handleCreateCustomPDF = () => { alert("✨ Crear nuevo PDF personalizado"); };
    const handleCreateCustomQuiz = () => {
        setQuizFormData({ title: `Test: ${topic?.title}`, level: 'Intermedio', numQuestions: 5, prompt: '' });
        setShowQuizModal(true);
    };

    const handleSimulateAI = async () => {
        // ... (Simulación existente)
        alert("Simulación desactivada para producción"); 
    };

    // --- RENDER FILE CARD (MATERIALES) ---
    const renderFileCard = (file, idx) => {
        const { icon: Icon, label } = getFileVisuals(file.type);
        const isRenaming = renamingId === file.id;
        const isMenuOpen = activeMenuId === file.id;
        const cardColor = topic.color || 'from-blue-500 to-indigo-600';

        return (
            <div key={file.id || idx} className="group relative h-64 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default bg-white border border-slate-100">
                {file.origin === 'AI' && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${cardColor} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                )}
                
                {/* LOGO DE FONDO */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    {file.origin === 'AI' ? (
                        <Icon className="w-32 h-32 text-white absolute -top-6 -left-6 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                    ) : (
                        <FileText className="w-32 h-32 text-slate-100 absolute -bottom-4 -right-4 rotate-12" />
                    )}
                </div>

                {/* ICONO PEQUEÑO */}
                <div className="absolute top-6 left-6 z-20">
                    <div className={`p-2.5 rounded-xl border shadow-sm backdrop-blur-md ${file.origin === 'AI' ? 'bg-white/20 border-white/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        {file.origin === 'AI' ? <Icon className="w-6 h-6 text-white" /> : <FileText className="w-6 h-6 text-indigo-600" />}
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-30">
                    <button onClick={(e) => handleMenuClick(e, file.id)} className={`p-1.5 rounded-full transition-colors ${file.origin === 'AI' ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
                        <MoreHorizontal className="w-6 h-6" />
                    </button>
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 text-slate-700 animate-in fade-in zoom-in-95">
                                <button onClick={() => startRenaming(file)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 flex items-center gap-2"><FileEdit className="w-4 h-4 text-indigo-600" /> Cambiar nombre</button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button onClick={() => deleteFile(file)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Eliminar</button>
                            </div>
                        </>
                    )}
                </div>
                <div className="relative h-full p-8 flex flex-col justify-end text-white z-10">
                    <div className="mt-auto">
                        {file.origin === 'AI' && <span className="absolute top-6 right-16 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">{label}</span>}
                        {isRenaming ? (
                            <div className="mb-4 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 flex flex-col gap-2">
                                <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-white/90 text-slate-900 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none" autoFocus />
                                <div className="flex gap-2">
                                    <button onClick={() => saveRename(file)} className="flex-1 bg-green-500 rounded-lg py-1 flex justify-center"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setRenamingId(null)} className="flex-1 bg-red-500 rounded-lg py-1 flex justify-center"><X className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ) : (
                            <h3 className={`text-3xl font-extrabold leading-tight mb-6 uppercase tracking-tight line-clamp-2 ${file.origin === 'AI' ? 'text-white' : 'text-slate-800'}`} title={file.name}>{file.name || label}</h3>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => handleViewFile(file)} className={`flex-1 flex items-center justify-center gap-2 py-3 backdrop-blur-sm rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${file.origin === 'AI' ? 'bg-white/20 hover:bg-white/30 text-white border border-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Maximize2 className="w-4 h-4" /> Ver</button>
                            <a href={file.url} download={file.name} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${file.origin === 'AI' ? 'bg-white text-indigo-900' : 'bg-slate-900 text-white'}`}><Download className="w-4 h-4" /> Bajar</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!user || loading || !topic || !subject) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* BREADCRUMBS */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                            <button onClick={() => navigate('/home')} className="hover:text-indigo-600 flex items-center gap-1"><Home className="w-4 h-4" /> Inicio</button>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <button onClick={() => navigate(`/home/subject/${subjectId}`)} className="hover:text-indigo-600">{subject.name}</button>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <span className="text-slate-900 font-bold">Tema {topic.number}</span>
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 rounded-lg"><MoreVertical className="w-5 h-5 text-slate-500" /></button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                        <button onClick={() => { setIsEditingTopic(true); setEditTopicData({ title: topic.title }); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"><Edit2 className="w-4 h-4" /> Renombrar Tema</button>
                                        <button onClick={handleGenerateQuizSubmit} className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-3 text-purple-600 font-bold"><Wand2 className="w-4 h-4" /> Generar con IA</button>
                                        <div className="border-t border-slate-100 my-1"></div>
                                        <button onClick={() => { handleDeleteTopic(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600"><Trash2 className="w-4 h-4" /> Eliminar Tema</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* HERO HEADER */}
                    <div className="mb-10 pb-8 border-b border-slate-200">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${topic.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-2xl shadow-indigo-500/20`}>
                                <span className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-md">{topic.number || '#'}</span>
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">{subject.course}</span>
                                    <div className="flex items-center gap-1 text-slate-400 text-sm font-medium"><Calendar className="w-4 h-4" /><span>Actualizado hoy</span></div>
                                </div>
                                {isEditingTopic ? (
                                    <div className="flex gap-2 max-w-lg">
                                        <input type="text" value={editTopicData.title} onChange={(e) => setEditTopicData({ ...editTopicData, title: e.target.value })} className="flex-1 text-2xl font-bold border border-slate-300 rounded-lg px-3 py-2" autoFocus />
                                        <button onClick={handleSaveTopicTitle} className="bg-indigo-600 text-white px-4 rounded-lg"><CheckCircle2 /></button>
                                        <button onClick={() => setIsEditingTopic(false)} className="bg-slate-200 text-slate-600 px-4 rounded-lg"><X /></button>
                                    </div>
                                ) : (
                                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight capitalize leading-tight">{topic.title}</h2>
                                )}
                                <div className="flex items-center gap-4 max-w-md pt-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 ${topic.quizzes?.length > 0 ? 'w-1/2' : 'w-1/12'}`}></div></div>
                                    <span className="text-xs font-bold text-slate-500">{topic.quizzes?.length > 0 ? '50%' : '10%'} Completado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                        {['materials', 'uploads', 'quizzes'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                                {tab === 'materials' && <><FileText className="w-4 h-4" /> Generados por IA</>}
                                {tab === 'uploads' && <><Upload className="w-4 h-4" /> Mis Archivos</>}
                                {tab === 'quizzes' && <><CheckCircle2 className="w-4 h-4" /> Tests Prácticos</>}
                                {tab !== 'uploads' && activeTab === tab && (
                                    <div role="button" onClick={(e) => { e.stopPropagation(); tab === 'materials' ? handleCreateCustomPDF() : handleCreateCustomQuiz(); }} className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-all z-10"><Plus className="w-3 h-3" /></div>
                                )}
                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                                    {tab === 'materials' ? topic.pdfs?.length || 0 : tab === 'uploads' ? topic.uploads?.length || 0 : topic.quizzes?.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* CONTENIDO MATERIALS */}
                    {activeTab === 'materials' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {topic.status === 'generating' && (
                                <div className="bg-white rounded-3xl border border-blue-200 p-8 shadow-sm flex flex-col justify-center items-center h-64 animate-pulse">
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" /><h4 className="font-bold text-2xl">Generando...</h4>
                                </div>
                            )}
                            {topic.pdfs?.map((pdf, idx) => renderFileCard(pdf, idx))}
                            {(!topic.pdfs || topic.pdfs.length === 0) && topic.status !== 'generating' && (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50"><FileText className="w-12 h-12 mb-3 opacity-20" /><p className="font-medium">Sin materiales</p></div>
                            )}
                        </div>
                    )}

                    {/* CONTENIDO UPLOADS */}
                    {activeTab === 'uploads' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="file" ref={fileInputRef} onChange={handleManualUpload} multiple hidden accept=".pdf,.doc,.docx" />
                            <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="h-64 rounded-3xl border-3 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 flex flex-col justify-center items-center text-center group bg-white">
                                {uploading ? <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" /> : <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110"><Upload className="w-10 h-10 text-indigo-600" /></div>}
                                <span className="font-bold text-xl text-slate-700">{uploading ? 'Subiendo...' : 'Subir Archivo'}</span>
                            </button>
                            {topic.uploads?.map((upload, idx) => renderFileCard(upload, idx))}
                        </div>
                    )}

                    {/* CONTENIDO QUIZZES (CON MENÚ DE EDICIÓN AÑADIDO) */}
                    {activeTab === 'quizzes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {topic.quizzes?.map((quiz, idx) => {
                                const { icon: Icon, level, color } = getQuizIcon(quiz.type);
                                const isMenuOpen = activeMenuId === quiz.id;

                                return (
                                    <div key={idx} className="group relative h-64 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default bg-white border border-slate-100">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                                        
                                        {/* LOGO GRANDE FONDO */}
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                                            <Icon className="w-48 h-48 text-white absolute -top-8 -left-8 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                                        </div>

                                        {/* Icono pequeño */}
                                        <div className="absolute top-6 left-6 z-20">
                                            <div className="p-2.5 rounded-xl border shadow-sm backdrop-blur-md bg-white/20 border-white/20">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>

                                        {/* --- BOTÓN DE MENÚ (3 PUNTITOS) --- */}
                                        <div className="absolute top-4 right-4 z-30">
                                            <button 
                                                onClick={(e) => handleMenuClick(e, quiz.id)} 
                                                className="p-1.5 rounded-full transition-colors text-white hover:bg-white/20"
                                            >
                                                <MoreHorizontal className="w-6 h-6" />
                                            </button>
                                            
                                            {isMenuOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 text-slate-700 animate-in fade-in zoom-in-95">
                                                        <button 
                                                            onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}/edit`)} 
                                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 flex items-center gap-2 font-medium"
                                                        >
                                                            <Edit2 className="w-4 h-4 text-indigo-600" /> Editar Test
                                                        </button>
                                                        <div className="border-t border-slate-100 my-1"></div>
                                                        <button 
                                                            onClick={() => deleteQuiz(quiz.id)} 
                                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Eliminar
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="relative h-full p-8 flex flex-col justify-end text-white z-10">
                                            <div className="mt-auto">
                                                <span className="absolute top-6 right-16 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                                    {level}
                                                </span>
                                                <h3 className="text-3xl font-extrabold leading-tight mb-2 text-white">{quiz.name || "Test Práctico"}</h3>
                                                <div className="flex items-center gap-2 text-white/80 text-sm mb-6 font-medium"><Timer className="w-4 h-4" /> 15 min aprox</div>
                                                
                                                <button 
                                                    onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`)} 
                                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-indigo-900 text-sm font-bold uppercase tracking-wider hover:bg-indigo-50 transition-all shadow-lg cursor-pointer"
                                                >
                                                    <Play className="w-4 h-4 fill-current" /> Comenzar Test
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!topic.quizzes || !topic.quizzes.length) && (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50"><Sparkles className="w-12 h-12 mb-3 opacity-20" /><p className="font-medium">Sin tests generados</p></div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <QuizModal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} onSubmit={handleGenerateQuizSubmit} formData={quizFormData} setFormData={setQuizFormData} isGenerating={isGeneratingQuiz} themeColor={topic?.color} />

            {viewingFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-6xl h-[90vh] rounded-3xl p-1 shadow-2xl flex flex-col bg-gradient-to-br ${topic.color || 'from-indigo-500 to-purple-600'}`}>
                        <div className="flex-1 w-full h-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
                            <div className={`flex justify-between items-center px-6 py-4 bg-gradient-to-r ${topic.color || 'from-indigo-500 to-purple-600'}`}>
                                <span className="font-bold text-white flex items-center gap-2 text-lg tracking-tight">
                                    {(() => { const { icon: HeaderIcon } = getFileVisuals(viewingFile.type); return <><HeaderIcon className="w-5 h-5 text-white/90" /> {viewingFile.name}</>; })()}
                                </span>
                                <button onClick={() => setViewingFile(null)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 bg-white relative"><iframe src={viewingFile.url} className="w-full h-full" title="Visor" /></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Topic;