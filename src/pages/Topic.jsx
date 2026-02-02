import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, FileText, Download, Play, Loader2, 
    ChevronRight, Calendar, MoreVertical, CheckCircle2, 
    Timer, Sparkles, Home, Trash2, Edit2, Share2, Upload,
    X, GripVertical
} from 'lucide-react';
import { collection, doc, getDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

import Header from '../components/layout/Header';

const Topic = ({ user }) => {
    const navigate = useNavigate();
    const { subjectId, topicId } = useParams();
    
    const [subject, setSubject] = useState(null);
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('materials');
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: '', prompt: '' });

    useEffect(() => {
        const fetchTopicDetails = async () => {
            if (!user || !subjectId || !topicId) return;

            try {
                // 1. Obtener datos de la asignatura (solo una vez)
                const subjectDoc = await getDoc(doc(db, "subjects", subjectId));
                if (subjectDoc.exists()) {
                    setSubject({ id: subjectDoc.id, ...subjectDoc.data() });
                }

                // 2. Escuchar cambios en el documento del Tema
                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                
                const unsubscribeTopic = onSnapshot(topicRef, (topicDoc) => {
                    if (topicDoc.exists()) {
                        const topicData = { id: topicDoc.id, ...topicDoc.data() };

                        // 3. Escuchar cambios en la subcolección de documentos
                        const docsRef = collection(db, "subjects", subjectId, "topics", topicId, "documents");
                        
                        const unsubscribeDocs = onSnapshot(docsRef, (querySnapshot) => {
                            const allDocs = querySnapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));

                            // Separar por tipo
                            const pdfs = allDocs.filter(d => d.type === 'pdf' || d.type === 'summary');
                            const quizzes = allDocs.filter(d => d.type === 'quiz');
                            const uploads = allDocs.filter(d => d.type === 'upload');

                            setTopic({ ...topicData, pdfs, quizzes, uploads });
                            setLoading(false);
                        });

                        return () => unsubscribeDocs();
                    } else {
                        setLoading(false);
                        navigate('/home');
                    }
                });

                return () => {
                    unsubscribeTopic();
                };
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

    const handleEditTopic = async (e) => {
        e.preventDefault();
        
        try {
            const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
            await updateDoc(topicRef, {
                title: editFormData.title,
                prompt: editFormData.prompt
            });
            
            setShowEditModal(false);
            setShowMenu(false);
        } catch (error) {
            console.error("Error updating topic:", error);
            alert("No se pudo actualizar el tema.");
        }
    };

    const handleDeleteTopic = async () => {
        try {
            await deleteDoc(doc(db, "subjects", subjectId, "topics", topicId));
            navigate(`/home/subject/${subjectId}`);
        } catch (error) {
            console.error("Error deleting topic:", error);
            alert("No se pudo eliminar el tema.");
        }
    };

    const openEditModal = () => {
        setEditFormData({ title: topic.title, prompt: topic.prompt || '' });
        setShowEditModal(true);
        setShowMenu(false);
    };

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

    if (loading || !topic || !subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Cargando contenido...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* 1. BREADCRUMBS (Navegación Superior) */}
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

                        {/* Three Dots Menu */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <MoreVertical className="w-5 h-5 text-slate-500" />
                            </button>

                            {showMenu && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setShowMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                        <button
                                            onClick={openEditModal}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDeleteModal(true);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </button>
                                        <button
                                            onClick={() => {
                                                alert('Función de compartir próximamente');
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            Compartir
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 2. HERO HEADER (Título y Progreso) */}
                    <div className="mb-10 pb-8 border-b border-slate-200">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            
                            {/* Número Grande */}
                            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${topic.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform -rotate-2 transition-transform hover:rotate-0`}>
                                <span className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-md">
                                    {topic.number}
                                </span>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                        {subject.course}
                                    </span>
                                    <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                                        <Calendar className="w-4 h-4" />
                                        <span>Última actualización hoy</span>
                                    </div>
                                </div>
                                
                                <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight capitalize leading-tight">
                                    {topic.title}
                                </h2>

                                {/* Barra de Progreso Visual */}
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

                    {/* 3. TABS DE NAVEGACIÓN */}
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('materials')} 
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${
                                activeTab === 'materials' 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            Generados por IA
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'materials' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                                {topic.pdfs?.length || 0}
                            </span>
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('uploads')} 
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${
                                activeTab === 'uploads' 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <Upload className="w-4 h-4" />
                            Mis Archivos
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'uploads' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                                {topic.uploads?.length || 0}
                            </span>
                        </button>

                        <button 
                            onClick={() => setActiveTab('quizzes')} 
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${
                                activeTab === 'quizzes' 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Tests Prácticos
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'quizzes' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                                {topic.quizzes?.length || 0}
                            </span>
                        </button>
                    </div>

                    {/* 4. CONTENIDO: MATERIALES GENERADOS */}
                    {activeTab === 'materials' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {topic.status === 'generating' && (
                                <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm flex flex-col justify-center items-center text-center h-52">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                                    <h4 className="font-bold text-slate-800">Generando...</h4>
                                    <p className="text-xs text-slate-500 mt-1">La IA está creando tus materiales.</p>
                                </div>
                            )}

                            {topic.pdfs?.map((pdf, idx) => (
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
                                        <a 
                                            href={pdf.url} 
                                            download 
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                        >
                                            <Download className="w-4 h-4" /> 
                                            Descargar
                                        </a>
                                    </div>
                                </div>
                            ))}

                            {(!topic.pdfs || topic.pdfs.length === 0) && topic.status !== 'generating' && (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                    <FileText className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium">No hay materiales generados todavía.</p>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'uploads' ? (
                        /* 4B. CONTENIDO: ARCHIVOS SUBIDOS MANUALMENTE */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Upload Area */}
                            <button 
                                onClick={() => alert('Función de subida de archivos próximamente')}
                                className="group border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 h-52 bg-white hover:bg-indigo-50/50 transition-all"
                            >
                                <div className="w-16 h-16 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                                    <Upload className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-700 group-hover:text-indigo-600 mb-1">Subir archivo</p>
                                    <p className="text-xs text-slate-500">PDF, DOCX, hasta 10MB</p>
                                </div>
                            </button>

                            {topic.uploads?.map((upload, idx) => (
                                <div key={idx} className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-green-300 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 flex flex-col justify-between h-52 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100 group-hover:scale-110 transition-transform shadow-sm">
                                            <FileText className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="flex-1 pr-6">
                                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug mb-1" title={upload.name}>
                                                {upload.name}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                <span className="uppercase bg-green-100 text-green-700 px-1.5 rounded text-[10px] tracking-wide">MANUAL</span>
                                                <span>• {upload.size || '2.4 MB'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
                                        <a 
                                            href={upload.url} 
                                            download 
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 group-hover:bg-green-600 group-hover:text-white text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                        >
                                            <Download className="w-4 h-4" /> 
                                            Descargar
                                        </a>
                                    </div>
                                </div>
                            ))}

                            {(!topic.uploads || topic.uploads.length === 0) && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
                                    <Upload className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium">No has subido archivos manualmente.</p>
                                    <p className="text-xs text-slate-400 mt-1">Haz clic en "Subir archivo" para añadir tus propios documentos</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* 5. CONTENIDO: QUIZZES */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topic.quizzes?.map((quiz) => {
                                const style = getQuizIcon(quiz.type);
                                return (
                                    <div key={quiz.id} className="group bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
                                        <div className={`h-28 bg-gradient-to-r ${style.color} relative overflow-hidden flex flex-col justify-between p-5`}>
                                            <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
                                                <span className="text-7xl">{style.icon}</span>
                                            </div>
                                            <div className="flex justify-between items-start relative z-10">
                                                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-white/10">
                                                    {style.level}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-white/90 text-xs font-medium relative z-10">
                                                <Timer className="w-3 h-3" />
                                                <span>15 min aprox</span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6">
                                            <div className="mb-4">
                                                <h4 className="font-bold text-slate-900 text-lg mb-1">{quiz.name}</h4>
                                                <p className="text-xs text-slate-500 line-clamp-2">Pon a prueba tus conocimientos sobre {topic.title}.</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => alert('Próximamente: Sistema de exámenes interactivos')} 
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg group-hover:shadow-indigo-200"
                                            >
                                                <Play className="w-4 h-4 fill-current" /> 
                                                Comenzar Test
                                            </button>
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

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">Editar Tema</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditTopic} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Título del Tema
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Ej: Introducción a las derivadas"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Instrucciones para la IA (opcional)
                                </label>
                                <textarea
                                    value={editFormData.prompt}
                                    onChange={(e) => setEditFormData({ ...editFormData, prompt: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24 resize-none"
                                    placeholder="Personaliza cómo quieres que la IA genere el contenido..."
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">¿Eliminar tema?</h3>
                            <p className="text-slate-600">
                                Esta acción no se puede deshacer. Se eliminarán todos los materiales y tests asociados.
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteTopic}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Topic;