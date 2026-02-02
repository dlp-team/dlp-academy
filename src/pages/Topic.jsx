import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, FileText, Download, Play, Loader2, 
    ChevronRight, Calendar, MoreVertical, CheckCircle2, 
    Timer, Sparkles, Home 
} from 'lucide-react';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

import Header from '../components/layout/Header';

const Topic = ({ user }) => {
    const navigate = useNavigate();
    const { subjectId, topicId } = useParams();
    
    const [subject, setSubject] = useState(null);
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('materials');

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

                            setTopic({ ...topicData, pdfs, quizzes });
                            setLoading(false);
                        });

                        return () => unsubscribeDocs();
                    } else {
                        setLoading(false);
                        navigate('/home'); // Si el tema no existe, volver
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
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8">
                        <button onClick={() => navigate('/home')} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                            <Home className="w-4 h-4" /> Inicio
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        <span className="text-slate-500">{subject.name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        <span className="text-slate-900 font-bold">Tema {topic.number}</span>
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
                                        {/* Calculamos progreso simulado: si hay quizzes, 50%, si no 10% */}
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
                                {topic.pdfs?.length || 0}
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
                                {topic.quizzes?.length || 0}
                            </span>
                        </button>
                    </div>

                    {/* 4. CONTENIDO: MATERIALES */}
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
                                    <p className="font-medium">No hay materiales disponibles todavía.</p>
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
        </div>
    );
};

export default Topic;