import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Plus, Home, ArrowUpDown, CheckCircle2, 
    Clock, RotateCw, Loader2, Save, X, GripVertical,
    Pencil, Trash2, AlertTriangle 
} from 'lucide-react';
import { 
    collection, addDoc, query, doc, 
    updateDoc, serverTimestamp, getDoc, onSnapshot, writeBatch, deleteDoc, increment 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Layout & Modals
import Header from '../components/layout/Header';

// Helpers & Constants
import { ICON_MAP, ICON_KEYS, COLORS } from '../utils/subjectConstants';
import SubjectIcon from '../components/modals/SubjectIcon';

const N8N_WEBHOOK_URL = 'https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook-test/711e538b-9d63-42bb-8494-873301ffdf39';

const Subject = ({ user }) => {
    const navigate = useNavigate();
    const { subjectId } = useParams();
    
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals State
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showReorderModal, setShowReorderModal] = useState(false);
    
    // --- EDIT/DELETE STATE ---
    const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
    const [showDeleteSubjectModal, setShowDeleteSubjectModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [editSubjectData, setEditSubjectData] = useState({ 
        name: '', 
        course: '', 
        color: '', 
        icon: 'book' 
    });

    const [topicFormData, setTopicFormData] = useState({ title: '', prompt: '' });
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    
    const [retryTopicId, setRetryTopicId] = useState(null);
    const [fileCache, setFileCache] = useState({});
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
                    const data = subjectDoc.data();
                    setSubject({ id: subjectDoc.id, ...data });
                    setEditSubjectData({ 
                        name: data.name, 
                        course: data.course, 
                        color: data.color,
                        icon: data.icon || 'book'
                    });
                } else {
                    console.error("Subject not found");
                    return;
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
        return () => {
            if (unsubscribe && typeof unsubscribe.then === 'function') {
                unsubscribe.then(unsub => unsub && unsub());
            }
        };
    }, [user, subjectId]);

    // --- SCROLL LOCKING LOGIC ---
    useEffect(() => {
        if (showEditSubjectModal || showDeleteSubjectModal || showTopicModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showEditSubjectModal, showDeleteSubjectModal, showTopicModal]);

    // --- HANDLERS FOR EDIT & DELETE SUBJECT ---

    const handleUpdateSubject = async (e) => {
        e.preventDefault();
        try {
            const subjectRef = doc(db, "subjects", subjectId);
            await updateDoc(subjectRef, {
                name: editSubjectData.name,
                course: editSubjectData.course,
                color: editSubjectData.color,
                icon: editSubjectData.icon 
            });
            
            setSubject(prev => ({ ...prev, ...editSubjectData }));
            setShowEditSubjectModal(false);
        } catch (error) {
            console.error("Error updating subject:", error);
            alert("Error al actualizar la asignatura");
        }
    };

    const handleDeleteSubject = async () => {
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, "subjects", subjectId));
            navigate('/home');
        } catch (error) {
            console.error("Error deleting subject:", error);
            alert("Error al eliminar la asignatura");
            setIsDeleting(false);
        }
    };
    
    // --------------------------------------

    const updateTopicDocument = async (topicId, data) => {
        try {
            const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
            await updateDoc(topicRef, data);
        } catch (error) {
            console.error("❌ Error updating topic document:", error);
        }
    };

    const sendToN8N = async (topicId, topicsList, data, attachedFiles) => {
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
        const timeoutId = setTimeout(() => controller.abort(), 600000); 

        try {
            const response = await fetch(N8N_WEBHOOK_URL, { 
                method: 'POST', 
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const result = await response.json();
            await updateTopicDocument(topicId, {
                status: 'completed',
                pdfs: result.pdfs || [],
                quizzes: result.quizzes || []
            });
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await updateTopicDocument(topicId, { status: 'error' });
        }
    };

    const handleCreateTopic = async (e) => {
        if (e) e.preventDefault();
        
        if (retryTopicId) {
             const filesToSend = files.length > 0 ? files : (fileCache[retryTopicId] || []);
            if (filesToSend.length === 0) {
                alert("⚠️ Please drag the PDF again.");
                return;
            }
            await updateTopicDocument(retryTopicId, {
                title: topicFormData.title,
                prompt: topicFormData.prompt,
                status: 'generating'
            });
            setShowTopicModal(false);
            setFileCache(prev => ({...prev, [retryTopicId]: filesToSend}));
            sendToN8N(retryTopicId, topics, topicFormData, filesToSend);
            setRetryTopicId(null);
            setTopicFormData({ title: '', prompt: '' });
            setFiles([]);
            return;
        }

        try {
            const nextOrder = topics.length + 1;
            const newTopicData = {
                title: topicFormData.title,
                prompt: topicFormData.prompt,
                status: 'generating',
                color: subject.color,
                createdAt: serverTimestamp(),
                order: nextOrder,
                number: nextOrder.toString().padStart(2, '0'), 
                pdfs: [],
                quizzes: []
            };

            const topicsRef = collection(db, "subjects", subjectId, "topics");
            const docRef = await addDoc(topicsRef, newTopicData);
            const topicId = docRef.id;

            // --- UPDATE SUBJECT TOPIC COUNT (INCREMENT) ---
            const subjectRef = doc(db, "subjects", subjectId);
            await updateDoc(subjectRef, {
                topicCount: increment(1)
            });
            
            if (files.length > 0) {
                const docsRef = collection(db, "subjects", subjectId, "topics", topicId, "documents");
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

            const currentFiles = [...files];
            setFileCache(prev => ({...prev, [topicId]: currentFiles}));
            sendToN8N(topicId, topics, topicFormData, files);
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

    // --- NEW: HANDLE DELETE TOPIC ---
    const handleDeleteTopic = async (e, topicId) => {
        e.stopPropagation(); // Prevent opening the topic
        if (!window.confirm("¿Estás seguro de que quieres eliminar este tema?")) return;

        try {
            // Delete the topic document
            await deleteDoc(doc(db, "subjects", subjectId, "topics", topicId));
            
            // --- UPDATE SUBJECT TOPIC COUNT (DECREMENT) ---
            const subjectRef = doc(db, "subjects", subjectId);
            await updateDoc(subjectRef, {
                topicCount: increment(-1)
            });

        } catch (error) {
            console.error("Error deleting topic:", error);
            alert("No se pudo eliminar el tema");
        }
    };

    // Reorder Logic
    const startReordering = () => { setIsReordering(true); setReorderList([...topics]); };
    const cancelReordering = () => { setIsReordering(false); setReorderList([]); };
    const saveReordering = async () => {
        const updatedList = reorderList.map((topic, index) => ({
            ...topic, 
            number: (index + 1).toString().padStart(2, '0'),
            order: index + 1
        }));
        try {
            const batch = writeBatch(db);
            updatedList.forEach((topic) => {
                const topicRef = doc(db, "subjects", subjectId, "topics", topic.id);
                batch.update(topicRef, { number: topic.number, order: topic.order });
            });
            await batch.commit();
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

    const handleSelectTopic = (topic) => {
        navigate(`/home/subject/${subjectId}/topic/${topic.id}`);
    };

    // Drag and drop for upload
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

    if (!user || loading || !subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Cargando...</p>
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
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
                >
                    <Home className="w-5 h-5" /> Volver a Asignaturas
                </button>

                <div className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center`}>
                            <SubjectIcon iconName={subject.icon} className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{subject.course}</p>
                            <h2 className="text-4xl font-bold text-gray-900">{subject.name}</h2>
                            {/* Optional: Show count here if desired */}
                            {/* <p className="text-sm text-gray-500">{subject.topicCount || 0} Temas</p> */}
                        </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                        {!isReordering && (
                            <button
                                onClick={() => setShowEditSubjectModal(true)}
                                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700 shadow-sm transition-colors cursor-pointer"
                                title="Editar Asignatura"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                        )}

                        {!isReordering && (
                            <button
                                onClick={() => setShowDeleteSubjectModal(true)}
                                className="p-3 bg-white border border-red-200 rounded-xl hover:bg-red-50 flex items-center gap-2 text-red-600 shadow-sm transition-colors cursor-pointer"
                                title="Eliminar Asignatura"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}

                        {!isReordering && <div className="h-8 w-px bg-gray-300 mx-1"></div>}

                        {topics.length > 1 && !isReordering && (
                            <button 
                                onClick={startReordering} 
                                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700 shadow-sm cursor-pointer"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Topic Card */}
                    {!isReordering && (
                        <button 
                            onClick={() => setShowTopicModal(true)} 
                            className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
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
                             <div 
                                onClick={() => !isReordering && handleSelectTopic(topic)}
                                className="w-full h-full text-left"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-90`}></div>
                                
                                {/* New Delete Button for specific Topic */}
                                {!isReordering && (
                                    <button
                                        onClick={(e) => handleDeleteTopic(e, topic.id)}
                                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors z-10 opacity-0 group-hover:opacity-100"
                                        title="Eliminar este tema"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

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
                                
                                {isReordering && (
                                    <div className="absolute inset-0 bg-black/30 z-20 flex items-center justify-center gap-2">
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); moveTopicUp(index); }}
                                            className={`p-3 bg-white rounded-full shadow-lg cursor-pointer ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                        >
                                            <ArrowUpDown className="w-5 h-5 rotate-180 text-gray-700" />
                                        </div>
                                        <div className="p-3 bg-white rounded-full shadow-lg cursor-move">
                                            <GripVertical className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div
                                            onClick={(e) => { e.stopPropagation(); moveTopicDown(index); }}
                                            className={`p-3 bg-white rounded-full shadow-lg cursor-pointer ${index === reorderList.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                        >
                                            <ArrowUpDown className="w-5 h-5 text-gray-700" />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                    <div className="flex justify-between items-start">
                                        <span className="text-8xl font-black opacity-30">
                                            {isReordering 
                                                ? (index + 1).toString().padStart(2, '0') 
                                                : (topic.number || (index + 1).toString().padStart(2, '0'))}
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
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* --- EDIT SUBJECT MODAL (UPDATED STRUCTURE) --- */}
            {showEditSubjectModal && (
                // 1. Outer container handles position and SCROLL capability (overflow-y-auto)
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* 2. Flex container ensures the modal stays centered but allows expansion */}
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        
                        {/* 3. Backdrop - fixed behind the modal content */}
                        <div 
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                            onClick={() => setShowEditSubjectModal(false)}
                        />
                        
                        {/* 4. Modal Content - Relative so it sits on top, with entrance animations */}
                        <div className="relative transform overflow-hidden bg-white rounded-2xl w-full max-w-md shadow-xl text-left transition-all animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">Editar Asignatura</h3>
                                <button 
                                    onClick={() => setShowEditSubjectModal(false)}
                                    className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpdateSubject} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={editSubjectData.name}
                                        onChange={(e) => setEditSubjectData({...editSubjectData, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                                    <input
                                        type="text"
                                        value={editSubjectData.course}
                                        onChange={(e) => setEditSubjectData({...editSubjectData, course: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {ICON_KEYS.map((key) => {
                                            const Icon = ICON_MAP[key];
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setEditSubjectData({...editSubjectData, icon: key})}
                                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                                        editSubjectData.icon === key 
                                                            ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500' 
                                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setEditSubjectData({...editSubjectData, color})}
                                                className={`w-full aspect-square rounded-full bg-gradient-to-br ${color} relative transition-transform hover:scale-105 ${
                                                    editSubjectData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' : ''
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditSubjectModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-indigo-200"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DELETE SUBJECT MODAL --- */}
            {showDeleteSubjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Asignatura?</h3>
                            <p className="text-gray-500 mb-6">
                                Estás a punto de eliminar <strong>{subject.name}</strong>. Esta acción no se puede deshacer y perderás todos los temas asociados.
                            </p>
                            
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowDeleteSubjectModal(false)}
                                    disabled={isDeleting}
                                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteSubject}
                                    disabled={isDeleting}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-200 transition-colors flex items-center gap-2"
                                >
                                    {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Topic Modal - reusing your existing structure (truncated for brevity but logic is in handleCreateTopic) */}
            {showTopicModal && (
                 <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTopicModal(false)} />
                        <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            {/* ... (Your existing modal UI content) ... */}
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {retryTopicId ? 'Reintentar Generación' : 'Crear Nuevo Tema'}
                                </h3>
                                <button onClick={() => setShowTopicModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTopic} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título del Tema</label>
                                    <input 
                                        type="text" 
                                        value={topicFormData.title} 
                                        onChange={e => setTopicFormData({...topicFormData, title: e.target.value})} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        placeholder="Ej: La Segunda Guerra Mundial" 
                                        required 
                                        readOnly={!!retryTopicId}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Personalizado (Opcional)</label>
                                    <textarea 
                                        value={topicFormData.prompt} 
                                        onChange={e => setTopicFormData({...topicFormData, prompt: e.target.value})} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" 
                                        placeholder="Instrucciones específicas para la IA..." 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Documentos PDF</label>
                                    <div 
                                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                                    >
                                        <p className="text-gray-500">Arrastra tus archivos aquí o haz clic para subir</p>
                                        <input type="file" multiple accept="application/pdf" onChange={e => handleFiles(e.target.files)} className="hidden" id="file-upload" />
                                        <label htmlFor="file-upload" className="mt-2 inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Seleccionar Archivos</label>
                                    </div>
                                    {files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {files.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-sm text-gray-600 truncate">{file.name}</span>
                                                    <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowTopicModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200">
                                        {retryTopicId ? 'Reintentar' : 'Crear Tema'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subject;