import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Plus, BookOpen, Home, ArrowUpDown, CheckCircle2, 
    Clock, RotateCw, Loader2, GripVertical, Save, X
} from 'lucide-react';
import { 
    collection, addDoc, query, getDocs, doc, 
    updateDoc, serverTimestamp, getDoc, onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';

import Header from '../components/layout/Header';
import TopicModal from '../components/modals/TopicModal';
import ReorderModal from '../components/modals/ReorderModal';
import PositionModal from '../components/modals/PositionModal';

const N8N_WEBHOOK_URL = 'https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook-test/711e538b-9d63-42bb-8494-873301ffdf39';

const Subject = ({ user }) => {
    const navigate = useNavigate();
    const { subjectId } = useParams();
    
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [showPositionModal, setShowPositionModal] = useState(false);
    
    const [topicFormData, setTopicFormData] = useState({ title: '', prompt: '' });
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    
    const [retryTopicId, setRetryTopicId] = useState(null);
    const [fileCache, setFileCache] = useState({});
    const [pendingTopic, setPendingTopic] = useState(null);
    const [isReordering, setIsReordering] = useState(false);
    const [reorderList, setReorderList] = useState([]);

    // Load subject and topics
    useEffect(() => {
        const fetchSubjectAndTopics = async () => {
            if (!user || !subjectId) return;

            try {
                // Get subject
                const subjectDoc = await getDoc(doc(db, "subjects", subjectId));
                if (subjectDoc.exists()) {
                    setSubject({ id: subjectDoc.id, ...subjectDoc.data() });
                }

                // Set up real-time listener for topics
                const topicsRef = collection(db, "subjects", subjectId, "topics");
                const q = query(topicsRef);
                
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const loadedTopics = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    const sortedTopics = loadedTopics.sort((a, b) => (a.order || 0) - (b.order || 0));
                    setTopics(sortedTopics);
                    setLoading(false);
                });

                return unsubscribe;
            } catch (error) {
                console.error("Error loading subject/topics:", error);
                setLoading(false);
            }
        };

        const unsubscribe = fetchSubjectAndTopics();
        
        // Cleanup on unmount
        return () => {
            if (unsubscribe && typeof unsubscribe.then === 'function') {
                unsubscribe.then(unsub => unsub && unsub());
            }
        };
    }, [user, subjectId]);

    const updateSubjectTopics = async (newTopics) => {
        setTopics(newTopics);

        if (subjectId) {
            try {
                const subjectRef = doc(db, "subjects", subjectId);
                await updateDoc(subjectRef, { topics: newTopics });
            } catch (error) {
                console.error("❌ Error saving to Firebase:", error);
            }
        }
    };

    const sendToN8N = async (topicId, topicsList, data, attachedFiles) => {
        console.log("🚀 SENDING TO N8N...", topicId);

        if (!topicsList || topicsList.length === 0) {
            console.error("⚠️ Critical error: Empty list.");
            return;
        }

        const formData = new FormData();
        formData.append('topicId', topicId);
        formData.append('title', data.title);
        formData.append('prompt', data.prompt || '');
        formData.append('subject', subject.name);
        formData.append('course', subject.course);
        formData.append('my_value', JSON.stringify(topicsList));
        
        if (attachedFiles && attachedFiles.length > 0) {
            attachedFiles.forEach((file) => formData.append('files', file));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            console.log("⏳ Connecting to AI...");
            const response = await fetch(N8N_WEBHOOK_URL, { 
                method: 'POST', 
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Status: ${response.status}`);

            const result = await response.json();
            console.log("✅ SUCCESS:", result);
            
            const completedList = topicsList.map(t => 
                t.id === topicId 
                    ? { ...t, status: 'completed', pdfs: result.pdfs || [], quizzes: result.quizzes || [] } 
                    : t
            );
            updateSubjectTopics(completedList);

        } catch (error) {
            console.error("❌ CONNECTION ERROR:", error);
            
            await new Promise(resolve => setTimeout(resolve, 2000));

            const errorList = topicsList.map(t => 
                t.id === topicId ? { ...t, status: 'error' } : t
            );
            
            updateSubjectTopics(errorList);
        }
    };

    const handleCreateTopic = async (e) => {
        if (e) e.preventDefault();
        if (!selectedSubject?.id) return;

        // --- 🅰️ RETRY LOGIC ---
        if (retryTopicId) {
            const filesToSend = files.length > 0 ? files : (fileCache[retryTopicId] || []);

            if (filesToSend.length === 0) {
                alert("⚠️ Por favor, vuelve a arrastrar el PDF antes de continuar.");
                return;
            }

            const updatedTopics = topics.map(t => 
                t.id === retryTopicId 
                    ? { ...t, status: 'generating' } 
                    : t
            );
            
            setTopics(updatedTopics);
            setShowTopicModal(false);
            setFileCache(prev => ({...prev, [retryTopicId]: filesToSend}));

            // Trigger n8n with both IDs
            sendToN8N(selectedSubject.id, retryTopicId, topicFormData, filesToSend);
            
            setRetryTopicId(null);
            setTopicFormData({ title: '', prompt: '' });
            setFiles([]);
            return;
        }

        // --- 🅱️ NEW TOPIC LOGIC ---
        try {
            const topicsRef = collection(db, "subjects", selectedSubject.id, "topics");

            const newTopic = {
                title: topicFormData.title,
                prompt: topicFormData.prompt,
                status: 'generating',
                color: selectedSubject.color,
                createdAt: serverTimestamp(),
                order: topics.length + 1
            };

            const docRef = await addDoc(topicsRef, newTopic);
            const topicId = docRef.id;
            
            // Save manually uploaded files
            if (files.length > 0) {
                const docsRef = collection(db, "subjects", selectedSubject.id, "topics", topicId, "documents");
                
                const uploadPromises = files.map(file => {
                    return addDoc(docsRef, {
                        name: file.name,
                        type: 'pdf',
                        size: file.size,
                        source: 'manual',
                        uploadedAt: serverTimestamp(),
                        status: 'ready' 
                    });
                });
                await Promise.all(uploadPromises);
            }

            const finalTopic = { id: topicId, ...newTopic };
            setTopics(prev => [...prev, finalTopic]); 
            
            // Notify n8n
            sendToN8N(selectedSubject.id, topicId, topicFormData, files);

            setShowTopicModal(false);
            setTopicFormData({ title: '', prompt: '' });
            setFiles([]);
        } catch (error) {
            console.error("Error creating topic:", error);
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
        if (!pendingTopic || !subject) return;

        const currentTopics = subject.topics || [];
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

    const startReordering = () => {
        setIsReordering(true);
        setReorderList([...topics]);
    };

    const cancelReordering = () => {
        setIsReordering(false);
        setReorderList([]);
    };

    const saveReordering = async () => {
        const updatedList = reorderList.map((topic, index) => ({
            ...topic, 
            number: (index + 1).toString().padStart(2, '0'),
            order: index + 1
        }));
        
        // Update each topic's order in Firebase
        try {
            const updatePromises = updatedList.map((topic) => {
                const topicRef = doc(db, "subjects", subjectId, "topics", topic.id);
                return updateDoc(topicRef, { 
                    number: topic.number,
                    order: topic.order 
                });
            });
            
            await Promise.all(updatePromises);
            updateSubjectTopics(updatedList);
            setIsReordering(false);
            setReorderList([]);
        } catch (error) {
            console.error("Error saving order:", error);
            alert("No se pudo guardar el orden");
        }
    };

    const moveTopicUp = (index) => {
        if (index === 0) return;
        const newList = [...reorderList];
        [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
        setReorderList(newList);
    };

    const moveTopicDown = (index) => {
        if (index === reorderList.length - 1) return;
        const newList = [...reorderList];
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        setReorderList(newList);
    };

    const handleDrag = (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (fileList) => {
        const newFiles = Array.from(fileList).filter(f => f.type === 'application/pdf');
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    const handleSelectTopic = (topic) => {
        navigate(`/home/subject/${subjectId}/topic/${topic.id}`);
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

    if (loading || !subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Cargando asignatura...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <button 
                    onClick={() => navigate('/home')} 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <Home className="w-5 h-5" /> Volver a Asignaturas
                </button>

                <div className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center`}>
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{subject.course}</p>
                            <h2 className="text-4xl font-bold text-gray-900">{subject.name}</h2>
                        </div>
                    </div>
                    
                    {topics.length > 1 && !isReordering && (
                        <button 
                            onClick={startReordering} 
                            className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700 shadow-sm"
                        >
                            <ArrowUpDown className="w-5 h-5" /> Reordenar
                        </button>
                    )}
                    
                    {isReordering && (
                        <div className="flex gap-2">
                            <button 
                                onClick={cancelReordering} 
                                className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700 shadow-sm"
                            >
                                <X className="w-5 h-5" /> Cancelar
                            </button>
                            <button 
                                onClick={saveReordering} 
                                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                            >
                                <Save className="w-5 h-5" /> Guardar Orden
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Topic Card */}
                    {!isReordering && (
                        <button 
                            onClick={() => setShowTopicModal(true)} 
                            className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-4"
                        >
                            <div className="w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                                <Plus className="w-10 h-10 text-indigo-600" />
                            </div>
                            <span className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600">
                                Crear Nuevo Tema
                            </span>
                        </button>
                    )}

                    {/* Topic Cards */}
                    {(isReordering ? reorderList : topics).map((topic, index) => (
                        <div
                            key={topic.id} 
                            className={`group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-all ${
                                isReordering ? 'cursor-move' : 'hover:scale-105 cursor-pointer'
                            }`}
                        >
                            <button 
                                onClick={() => !isReordering && handleSelectTopic(topic)}
                                disabled={isReordering}
                                className="w-full h-full"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-90`}></div>
                                
                                {topic.status === 'error' && !isReordering && (
                                    <div className="absolute inset-0 bg-red-600/10 z-20 flex flex-col items-center justify-center">
                                        <div 
                                            onClick={(e) => handleRetryTopic(e, topic)} 
                                            className="flex flex-col items-center gap-2 group/btn cursor-pointer"
                                        >
                                            <div className="bg-white text-red-600 p-3 rounded-full shadow-xl group-hover/btn:scale-110 transition-transform">
                                                <RotateCw className="w-6 h-6" />
                                            </div>
                                            <span className="text-white font-bold drop-shadow-md text-sm bg-red-600/80 px-3 py-1 rounded-full backdrop-blur-sm">
                                                Reintentar
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Reorder Controls */}
                                {isReordering && (
                                    <div className="absolute inset-0 bg-black/30 z-20 flex items-center justify-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveTopicUp(index);
                                            }}
                                            disabled={index === 0}
                                            className={`p-3 bg-white rounded-full shadow-lg ${
                                                index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            <ArrowUpDown className="w-5 h-5 rotate-180" />
                                        </button>
                                        <div className="p-3 bg-white rounded-full shadow-lg cursor-move">
                                            <GripVertical className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveTopicDown(index);
                                            }}
                                            disabled={index === reorderList.length - 1}
                                            className={`p-3 bg-white rounded-full shadow-lg ${
                                                index === reorderList.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            <ArrowUpDown className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                
                                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                    <div className="flex justify-between items-start">
                                        <span className="text-8xl font-black opacity-30">
                                            {isReordering ? (index + 1).toString().padStart(2, '0') : topic.number}
                                        </span>
                                        {!isReordering && (
                                            topic.status === 'generating' ? (
                                                <div className="flex flex-col items-center">
                                                    <Clock className="w-6 h-6 animate-spin" />
                                                    <span className="text-xs mt-1 opacity-75">Procesando</span>
                                                </div>
                                            ) : topic.status === 'completed' ? (
                                                <CheckCircle2 className="w-6 h-6" />
                                            ) : null
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">{topic.title}</h3>
                                        {!isReordering && (
                                            <p className="text-sm opacity-90">
                                                {topic.status === 'generating' ? 'Haz clic para ver el progreso' : 
                                                 topic.status === 'completed' ? 'Completado' : 'Error'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </main>

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

            <PositionModal 
                isOpen={showPositionModal} 
                onClose={() => setShowPositionModal(false)} 
                onConfirm={handlePositionConfirm} 
                topics={subject?.topics || []} 
                newTopicTitle={pendingTopic?.title} 
            />

            <ReorderModal 
                isOpen={showReorderModal} 
                onClose={() => setShowReorderModal(false)} 
                onConfirm={handleReorderConfirm} 
                topics={topics} 
            />
        </div>
    );
};

export default Subject;