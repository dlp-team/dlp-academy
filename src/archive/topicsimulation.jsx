import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, FileText, Download, Play, Loader2, ExternalLink,
    ChevronRight, Calendar, MoreVertical, CheckCircle2, 
    Timer, Sparkles, Home, Trash2, Edit2, Share2, Upload,
    X, BookOpen, Award, Maximize2, Wand2 // Wand2 para el icono de simular
} from 'lucide-react';
import { collection, doc, getDoc, onSnapshot, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/layout/Header';

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
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: '' });

    // Estado para el Visor de Archivos (Modal)
    const [viewingFile, setViewingFile] = useState(null);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const fetchTopicDetails = async () => {
            if (!user || !subjectId || !topicId) return;

            try {
                // 1. Obtener Asignatura
                const subjectDoc = await getDoc(doc(db, "subjects", subjectId));
                if (subjectDoc.exists()) {
                    setSubject({ id: subjectDoc.id, ...subjectDoc.data() });
                }

                // 2. Escuchar cambios en el DOCUMENTO del Tema (Datos IA)
                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                const unsubscribeTopic = onSnapshot(topicRef, (topicDoc) => {
                    if (topicDoc.exists()) {
                        const topicData = { id: topicDoc.id, ...topicDoc.data() };

                        // 3. Escuchar cambios en la SUBCOLECCIÓN (Datos Manuales)
                        const docsRef = collection(db, "subjects", subjectId, "topics", topicId, "documents");
                        const unsubscribeDocs = onSnapshot(docsRef, (querySnapshot) => {
                            const manualDocs = querySnapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));

                            // Recuperar datos
                            const aiPdfs = Array.isArray(topicData.pdfs) ? topicData.pdfs : [];
                            const aiQuizzes = Array.isArray(topicData.quizzes) ? topicData.quizzes : [];
                            const manualUploads = manualDocs.filter(d => d.source === 'manual');

                            setTopic({ 
                                ...topicData, 
                                pdfs: aiPdfs, 
                                quizzes: aiQuizzes, 
                                uploads: manualUploads 
                            });
                            setLoading(false);
                        });

                        return () => unsubscribeDocs();
                    } else {
                        setLoading(false);
                        navigate('/home');
                    }
                });

                return () => unsubscribeTopic();
            } catch (error) {
                console.error("Error loading topic:", error);
                setLoading(false);
            }
        };

        const unsubscribe = fetchTopicDetails();
        return () => {
            if (unsubscribe && typeof unsubscribe.then === 'function') {
                unsubscribe.then(unsub => unsub && unsub());
            }
        };
    }, [user, subjectId, topicId, navigate]);

    // --- HELPERS ---
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const getFileVisuals = (type) => {
        if (!type) return { icon: FileText, label: 'Documento' };
        const t = type.toLowerCase();
        if (t.includes('exam') || t.includes('evaluación')) return { icon: Award, label: 'Examen' };
        if (t.includes('exercise') || t.includes('ejercicio')) return { icon: FileText, label: 'Ejercicios' };
        if (t.includes('summary') || t.includes('resumen')) return { icon: BookOpen, label: 'Resumen' };
        return { icon: FileText, label: 'Documento' };
    };

    const getQuizIcon = (type) => {
        switch(type) {
            case 'basic': return { icon: '📖', color: 'from-blue-400 to-blue-600', level: 'Repaso' };
            case 'advanced': return { icon: '🧪', color: 'from-purple-400 to-purple-600', level: 'Avanzado' };
            case 'final': return { icon: '🏆', color: 'from-amber-400 to-amber-600', level: 'Evaluación' };
            default: return { icon: '📝', color: 'from-gray-400 to-gray-600', level: 'Test' };
        }
    };

    // --- VISOR DE ARCHIVOS ---
    const handleViewFile = (dataUrl) => {
        if (!dataUrl) {
            alert("El archivo no tiene contenido.");
            return;
        }

        try {
            // Si es URL normal (ej: el dummy de W3C), úsala directa
            if (!dataUrl.startsWith('data:')) {
                setViewingFile(dataUrl);
                return;
            }

            // Si es Base64, convertir a Blob
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            const blobUrl = URL.createObjectURL(blob);

            setViewingFile(blobUrl);
        } catch (error) {
            console.error("Error al preparar archivo:", error);
            alert("No se pudo previsualizar.");
        }
    };

    // --- MOCK DATA / SIMULACIÓN IA ---
    const handleSimulateAI = async () => {
        if (!subjectId || !topicId) return;
        
        const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
        
        // Inyectamos datos falsos en Firebase
        await updateDoc(topicRef, {
            status: 'completed',
            pdfs: [
                { 
                    name: 'Resumen: Conceptos Clave.pdf', 
                    type: 'summary', 
                    // PDF real de prueba de W3C para que el visor funcione
                    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
                },
                { 
                    name: 'Ejercicios Prácticos Resueltos.pdf', 
                    type: 'exercises', 
                    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
                },
                { 
                    name: 'Examen Final - Modelo A.pdf', 
                    type: 'exam', 
                    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
                }
            ],
            quizzes: [
                { id: '1', name: 'Repaso Rápido', type: 'basic' },
                { id: '2', name: 'Caso Práctico', type: 'advanced' },
                { id: '3', name: 'Simulacro Examen', type: 'final' }
            ]
        });
        alert("✅ Datos inyectados. Mira las pestañas.");
        setShowMenu(false);
    };

    // --- ACCIONES ---
    const handleManualUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const validFiles = files.filter(file => file.size < 1048576); 
        if (validFiles.length < files.length) alert("⚠️ Algunos archivos pesan más de 1MB y no se guardaron.");
        if (validFiles.length === 0) return;

        setUploading(true);
        try {
            const docsRef = collection(db, "subjects", subjectId, "topics", topicId, "documents");
            const uploadPromises = validFiles.map(async (file) => {
                const base64Url = await convertFileToBase64(file);
                return addDoc(docsRef, {
                    name: file.name,
                    type: file.type.includes('pdf') ? 'pdf' : 'doc',
                    size: file.size,
                    source: 'manual',
                    uploadedAt: serverTimestamp(),
                    url: base64Url,
                    status: 'ready'
                });
            });
            await Promise.all(uploadPromises);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setActiveTab('uploads'); 
        } catch (error) {
            console.error("Error uploading:", error);
            alert("Error al subir archivo.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (docId, docName) => {
        if (!window.confirm(`¿Eliminar "${docName}"?`)) return;
        try {
            const docRef = doc(db, "subjects", subjectId, "topics", topicId, "documents", docId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const handleDeleteTopic = async () => {
        if (!window.confirm("¿Estás seguro de eliminar este tema?")) return;
        try {
            await deleteDoc(doc(db, "subjects", subjectId, "topics", topicId));
            navigate(`/home/subject/${subjectId}`);
        } catch (error) {
            console.error("Error deleting topic:", error);
        }
    };

    const handleSaveTitle = async () => {
        if (!editFormData.title.trim()) return;
        try {
            const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
            await updateDoc(topicRef, { title: editFormData.title });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating title:", error);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;
    if (loading || !topic || !subject) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* 1. BREADCRUMBS & MENU */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                            <button onClick={() => navigate('/home')} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                                <Home className="w-4 h-4" /> Inicio
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <button onClick={() => navigate(`/home/subject/${subjectId}`)} className="hover:text-indigo-600 transition-colors">
                                {subject.name}
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <span className="text-slate-900 font-bold">Tema {topic.number}</span>
                        </div>

                        <div className="relative">
                            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <MoreVertical className="w-5 h-5 text-slate-500" />
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                        <button onClick={() => { setIsEditing(true); setEditFormData({ title: topic.title }); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700">
                                            <Edit2 className="w-4 h-4" /> Renombrar
                                        </button>
                                        
                                        {/* 👇 BOTÓN MÁGICO PARA SIMULAR IA 👇 */}
                                        <button onClick={handleSimulateAI} className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-3 text-purple-600 font-bold">
                                            <Wand2 className="w-4 h-4" /> Simular IA (Test)
                                        </button>
                                        
                                        <div className="border-t border-slate-100 my-1"></div>
                                        <button onClick={() => { handleDeleteTopic(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600">
                                            <Trash2 className="w-4 h-4" /> Eliminar Tema
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 2. HERO HEADER */}
                    <div className="mb-10 pb-8 border-b border-slate-200">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${topic.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-2xl shadow-indigo-500/20`}>
                                <span className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-md">
                                    {topic.number}
                                </span>
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                        {subject.course}
                                    </span>
                                    <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                                        <Calendar className="w-4 h-4" />
                                        <span>Actualizado hoy</span>
                                    </div>
                                </div>
                                
                                {isEditing ? (
                                    <div className="flex gap-2 max-w-lg">
                                        <input type="text" value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} className="flex-1 text-2xl font-bold border border-slate-300 rounded-lg px-3 py-2" autoFocus />
                                        <button onClick={handleSaveTitle} className="bg-indigo-600 text-white px-4 rounded-lg"><CheckCircle2 /></button>
                                        <button onClick={() => setIsEditing(false)} className="bg-slate-200 text-slate-600 px-4 rounded-lg"><X /></button>
                                    </div>
                                ) : (
                                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight capitalize leading-tight">
                                        {topic.title}
                                    </h2>
                                )}

                                <div className="flex items-center gap-4 max-w-md pt-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 ${topic.quizzes?.length > 0 ? 'w-1/2' : 'w-1/12'}`}></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                        {topic.quizzes?.length > 0 ? '50%' : '10%'} Completado
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. TABS */}
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                        <button onClick={() => setActiveTab('materials')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${activeTab === 'materials' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                            <FileText className="w-4 h-4" /> Generados por IA
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'materials' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>{topic.pdfs?.length || 0}</span>
                        </button>
                        <button onClick={() => setActiveTab('uploads')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${activeTab === 'uploads' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                            <Upload className="w-4 h-4" /> Mis Archivos
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'uploads' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>{topic.uploads?.length || 0}</span>
                        </button>
                        <button onClick={() => setActiveTab('quizzes')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${activeTab === 'quizzes' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                            <CheckCircle2 className="w-4 h-4" /> Tests Prácticos
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'quizzes' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>{topic.quizzes?.length || 0}</span>
                        </button>
                    </div>

                    {/* 4. CONTENIDO: MATERIALES IA (Estilo "Topic Card" Grande) */}
                    {activeTab === 'materials' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {topic.status === 'generating' && (
                                <div className="bg-white rounded-3xl border border-blue-200 p-8 shadow-sm flex flex-col justify-center items-center text-center h-64 animate-pulse">
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                    <h4 className="font-bold text-2xl text-slate-800">Generando...</h4>
                                    <p className="text-slate-500 mt-2">La IA está creando tus materiales.</p>
                                </div>
                            )}

                            {topic.pdfs?.map((pdf, idx) => {
                                const { icon: Icon, label } = getFileVisuals(pdf.type);
                                return (
                                    <div key={idx} className="group relative h-64 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default">
                                        {/* FONDO GRADIENTE */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${topic.color || 'from-blue-500 to-indigo-600'} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                                        
                                        <div className="relative h-full p-8 flex flex-col justify-between text-white">
                                            {/* HEADER */}
                                            <div className="flex justify-between items-start">
                                                <Icon className="w-24 h-24 text-white absolute -top-4 -left-4 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                                                <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full ml-auto border border-white/20 z-10">
                                                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                                        <Icon className="w-3 h-3" /> {label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* BODY */}
                                            <div className="z-10 mt-auto">
                                                <h3 className="text-3xl font-extrabold leading-tight line-clamp-2 mb-4" title={pdf.name}>
                                                    {pdf.name || label}
                                                </h3>

                                                {/* BOTONES */}
                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={() => handleViewFile(pdf.url)}
                                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-bold uppercase tracking-wider transition-all text-white border border-white/10"
                                                    >
                                                        <Maximize2 className="w-4 h-4" /> Ver
                                                    </button>
                                                    <a 
                                                        href={pdf.url} 
                                                        download={pdf.name}
                                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-indigo-900 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:bg-indigo-50 shadow-lg"
                                                    >
                                                        <Download className="w-4 h-4" /> Bajar
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {(!topic.pdfs || topic.pdfs.length === 0) && topic.status !== 'generating' && (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                    <FileText className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium">No hay materiales generados todavía.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 5. CONTENIDO: SUBIDAS MANUALES */}
                    {activeTab === 'uploads' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="file" ref={fileInputRef} onChange={handleManualUpload} multiple hidden accept=".pdf,.doc,.docx" />
                            <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="h-64 rounded-3xl border-3 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col justify-center items-center text-center group bg-white">
                                {uploading ? <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" /> : (
                                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Upload className="w-10 h-10 text-indigo-600" /></div>
                                )}
                                <span className="font-bold text-xl text-slate-700">{uploading ? 'Subiendo...' : 'Subir Archivo'}</span>
                                <span className="text-sm text-slate-400 mt-2">PDF, DOCX hasta 1MB</span>
                            </button>

                            {topic.uploads?.map((upload, idx) => (
                                <div key={idx} className="group relative h-64 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default bg-white border border-slate-100">
                                    <button onClick={() => handleDeleteDocument(upload.id, upload.name)} className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors z-20" title="Eliminar"><Trash2 className="w-5 h-5" /></button>
                                    <div className="relative h-full p-8 flex flex-col justify-between">
                                        <FileText className="w-32 h-32 text-slate-100 absolute -bottom-4 -right-4 rotate-12" />
                                        <div className="z-10">
                                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-4">Manual</span>
                                            <h3 className="text-2xl font-bold text-slate-800 leading-tight line-clamp-2" title={upload.name}>{upload.name || "Archivo sin nombre"}</h3>
                                            <p className="text-sm text-slate-400 mt-2">{(upload.size / 1024 / 1024).toFixed(2)} MB • Subido hoy</p>
                                        </div>
                                        <div className="flex gap-3 z-10 mt-4">
                                            <button onClick={() => handleViewFile(upload.url)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors">
                                                <Maximize2 className="w-4 h-4" /> Ver
                                            </button>
                                            <a href={upload.url} download={upload.name} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-indigo-600 transition-colors shadow-lg">
                                                <Download className="w-4 h-4" /> Guardar
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 6. CONTENIDO: QUIZZES */}
                    {activeTab === 'quizzes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {topic.quizzes?.map((quiz, idx) => {
                                const { icon: Icon, level, color } = getQuizIcon(quiz.type);
                                return (
                                    <div key={idx} className="group relative h-64 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default">
                                        <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                                        <div className="relative h-full p-8 flex flex-col justify-between text-white">
                                            <div className="flex justify-between items-start">
                                                <div className="text-6xl opacity-30 absolute -top-2 -left-2 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                                    {level === 'Repaso' ? '📖' : level === 'Avanzado' ? '🧪' : '🏆'}
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full ml-auto border border-white/20 z-10"><span className="text-xs font-bold uppercase tracking-wider">{level}</span></div>
                                            </div>
                                            <div className="z-10 mt-auto">
                                                <h3 className="text-3xl font-extrabold leading-tight mb-2">{quiz.name || "Test Práctico"}</h3>
                                                <div className="flex items-center gap-2 text-white/80 text-sm mb-6 font-medium"><Timer className="w-4 h-4" /> 15 min aprox</div>
                                                <button onClick={() => alert('Próximamente')} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-indigo-900 text-sm font-bold uppercase tracking-wider hover:bg-indigo-50 transition-all shadow-lg"><Play className="w-4 h-4 fill-current" /> Comenzar Test</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!topic.quizzes || topic.quizzes.length === 0) && (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                    <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium">No hay tests generados aún.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* --- VISUALIZADOR MODAL (IFRAME) --- */}
            {viewingFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-6xl h-[90vh] rounded-3xl flex flex-col bg-slate-900 shadow-2xl overflow-hidden border border-slate-700">
                        
                        {/* Cabecera del Visor */}
                        <div className="flex justify-between items-center px-6 py-4 bg-slate-800 border-b border-slate-700">
                            <span className="font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-400" /> Visualizando Documento
                            </span>
                            <button onClick={() => setViewingFile(null)} className="p-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-slate-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Contenido (Iframe) */}
                        <div className="flex-1 bg-slate-100 relative">
                            <iframe src={viewingFile} className="w-full h-full" title="Visor" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Topic;