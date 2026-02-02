import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText, Download, Play, Loader2 } from 'lucide-react';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
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
                // Get subject
                const subjectDoc = await getDoc(doc(db, "subjects", subjectId));
                if (subjectDoc.exists()) {
                    setSubject({ id: subjectDoc.id, ...subjectDoc.data() });
                }

                // Get topic with real-time listener
                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                
                // Set up real-time listener for topic
                const unsubscribeTopic = onSnapshot(topicRef, (topicDoc) => {
                    if (topicDoc.exists()) {
                        const topicData = { id: topicDoc.id, ...topicDoc.data() };

                        // Get documents for this topic with real-time listener
                        const docsRef = collection(db, "subjects", subjectId, "topics", topicId, "documents");
                        
                        const unsubscribeDocs = onSnapshot(docsRef, (querySnapshot) => {
                            const allDocs = querySnapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));

                            // Separate by type
                            const pdfs = allDocs.filter(d => d.type === 'pdf' || d.type === 'summary');
                            const quizzes = allDocs.filter(d => d.type === 'quiz');

                            setTopic({ ...topicData, pdfs, quizzes });
                            setLoading(false);
                        });

                        // Store the documents unsubscribe function
                        return () => unsubscribeDocs();
                    } else {
                        setLoading(false);
                    }
                });

                // Cleanup function
                return () => {
                    unsubscribeTopic();
                };
            } catch (error) {
                console.error("Error loading topic:", error);
                setLoading(false);
            }
        };

        const unsubscribe = fetchTopicDetails();
        
        // Cleanup on unmount
        return () => {
            if (unsubscribe && typeof unsubscribe.then === 'function') {
                unsubscribe.then(unsub => unsub && unsub());
            }
        };
    }, [user, subjectId, topicId]);

    const getQuizIcon = (type) => {
        switch(type) {
            case 'basic': return { icon: '📖', color: 'from-blue-400 to-blue-600' };
            case 'advanced': return { icon: '🧪', color: 'from-purple-400 to-purple-600' };
            case 'final': return { icon: '🏆', color: 'from-amber-400 to-amber-600' };
            default: return { icon: '📝', color: 'from-gray-400 to-gray-600' };
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Cargando...</p>
                </div>
            </div>
        );
    }

    if (loading || !topic) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Cargando tema...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <button 
                    onClick={() => navigate(`/home/subject/${subjectId}`)} 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ChevronLeft className="w-5 h-5" /> Volver a Temas
                </button>

                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">{topic.title}</h2>
                    
                    <div className="bg-white rounded-xl shadow-md p-2 flex gap-2 mb-6">
                        <button 
                            onClick={() => setActiveTab('materials')} 
                            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                                activeTab === 'materials' 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            📚 Materiales
                        </button>
                        <button 
                            onClick={() => setActiveTab('quizzes')} 
                            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                                activeTab === 'quizzes' 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            ✍️ Tests
                        </button>
                    </div>
                </div>

                {activeTab === 'materials' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Show generating placeholder if topic is still generating */}
                        {topic.status === 'generating' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-700">Generando materiales...</h4>
                                        <p className="text-sm text-gray-500">La IA está procesando tus documentos</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 text-gray-400 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
                                </div>
                            </div>
                        )}
                        
                        {/* Show actual PDFs */}
                        {topic.pdfs && topic.pdfs.length > 0 ? (
                            topic.pdfs.map((pdf, idx) => (
                                <div key={idx} className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-7 h-7 text-red-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate">{pdf.name}</h4>
                                        </div>
                                    </div>
                                    <a 
                                        href={pdf.url} 
                                        download 
                                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                                    >
                                        <Download className="w-5 h-5" /> Descargar
                                    </a>
                                </div>
                            ))
                        ) : topic.status !== 'generating' ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No hay materiales disponibles todavía
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Show generating placeholder if topic is still generating */}
                        {topic.status === 'generating' && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                                </div>
                                <div className="p-6">
                                    <h4 className="font-bold text-lg mb-2 text-gray-700">Generando tests...</h4>
                                    <p className="text-sm text-gray-500 mb-4">La IA está creando evaluaciones personalizadas</p>
                                    <div className="w-full bg-gray-200 text-gray-400 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Show actual quizzes */}
                        {topic.quizzes && topic.quizzes.length > 0 ? (
                            topic.quizzes.map((quiz) => {
                                const style = getQuizIcon(quiz.type);
                                return (
                                    <div key={quiz.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                                        <div className={`h-32 bg-gradient-to-br ${style.color} flex items-center justify-center`}>
                                            <span className="text-6xl">{style.icon}</span>
                                        </div>
                                        <div className="p-6">
                                            <h4 className="font-bold text-lg mb-2">{quiz.name}</h4>
                                            <button 
                                                onClick={() => alert('Próximamente')} 
                                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                                            >
                                                <Play className="w-5 h-5" /> Comenzar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : topic.status !== 'generating' ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No hay tests disponibles todavía
                            </div>
                        ) : null}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Topic;