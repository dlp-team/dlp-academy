import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, MoreVertical, Edit2, Trash2, Loader2, X, Save,
    ChevronRight, ArrowLeft
} from 'lucide-react';
import { 
    collection, addDoc, query, where, getDocs, 
    deleteDoc, doc, getDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Layout
import Header from '../components/layout/Header';

// Helpers & Constants
import { ICON_MAP, ICON_KEYS, COLORS } from '../utils/subjectConstants';
import SubjectIcon from '../components/modals/SubjectIcon';

const Home = ({ user }) => {
    const navigate = useNavigate();
    
    // --- STATE ---
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [flippedSubjectId, setFlippedSubjectId] = useState(null); // Controls which card shows topics
    const [activeMenu, setActiveMenu] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Modals
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    
    // Form State
    const [subjectFormData, setSubjectFormData] = useState({ 
        name: '', 
        course: '', 
        color: 'from-blue-400 to-blue-600',
        icon: 'book'
    });

    // Onboarding State
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [missingFields, setMissingFields] = useState([]);

    // 1. CHECK USER PROFILE & LOAD SUBJECTS + TOPICS
    useEffect(() => {
        const initData = async () => {
            if (!user) return;
            try {
                // A. Check User Profile
                const userDocRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userDocRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const requiredKeys = ['role', 'country', 'displayName'];
                    const missing = requiredKeys.filter(key => !userData[key] || userData[key] === "");
                    if (missing.length > 0) {
                        setMissingFields(missing);
                        setShowOnboarding(true);
                    }
                } else {
                    setMissingFields(['displayName', 'role', 'country']);
                    setShowOnboarding(true);
                }

                // B. Load Subjects AND their Subcollection Topics
                const q = query(collection(db, "subjects"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                
                // Fetch subjects first
                const tempSubjects = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Now fetch the 'topics' subcollection for EACH subject
                const subjectsWithTopics = await Promise.all(tempSubjects.map(async (subject) => {
                    const topicsRef = collection(db, "subjects", subject.id, "topics");
                    const topicsSnap = await getDocs(topicsRef);
                    const topicsList = topicsSnap.docs.map(t => ({ id: t.id, ...t.data() }));
                    
                    return { 
                        ...subject, 
                        topics: topicsList // Attach real topics
                    };
                }));

                setSubjects(subjectsWithTopics);

            } catch (error) {
                console.error("Error initializing home:", error);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [user]);

    // --- HANDLERS ---

    // Subject CRUD
    const handleOpenCreate = () => {
        setIsEditing(false);
        setSubjectFormData({ name: '', course: '', color: 'from-blue-400 to-blue-600', icon: 'book' });
        setShowSubjectModal(true);
    };

    const handleOpenEdit = (e, subject) => {
        e.stopPropagation();
        setIsEditing(true);
        setSubjectFormData({
            id: subject.id,
            name: subject.name,
            course: subject.course,
            color: subject.color,
            icon: subject.icon || 'book'
        });
        setShowSubjectModal(true);
        setActiveMenu(null);
    };

    const handleSaveSubject = async (e) => {
        if(e) e.preventDefault();
        if (!subjectFormData.name.trim() || !subjectFormData.course.trim()) return;
        
        try {
            const payload = {
                name: subjectFormData.name,
                course: subjectFormData.course,
                color: subjectFormData.color,
                icon: subjectFormData.icon || 'book',
                uid: user.uid,
            };

            if (isEditing) {
                // UPDATE
                await updateDoc(doc(db, "subjects", subjectFormData.id), payload);
                setSubjects(prev => prev.map(s => s.id === subjectFormData.id ? { ...s, ...payload } : s));
            } else {
                // CREATE
                payload.createdAt = new Date();
                const docRef = await addDoc(collection(db, "subjects"), payload);
                setSubjects(prev => [...prev, { id: docRef.id, ...payload, topics: [] }]);
            }
            
            setShowSubjectModal(false);
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving subject:", error);
        }
    };

    const requestDelete = (e, subject) => {
        e.stopPropagation();
        setSubjectToDelete(subject);
        setShowDeleteModal(true);
        setActiveMenu(null);
    };

    const confirmDelete = async () => {
        if (!subjectToDelete) return;
        try {
            await deleteDoc(doc(db, "subjects", subjectToDelete.id));
            setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
            setShowDeleteModal(false);
            setSubjectToDelete(null);
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    // Navigation Handlers
    const handleSelectSubject = (subjectId) => {
        navigate(`/home/subject/${subjectId}`);
    };

    const handleSelectTopic = (subjectId, topicId) => {
        navigate(`/home/subject/${subjectId}/topic/${topicId}`);
    };

    // Toggle the "Back" of the card
    const toggleFlip = (e, subjectId) => {
        e.stopPropagation();
        if (flippedSubjectId === subjectId) {
            setFlippedSubjectId(null);
        } else {
            setFlippedSubjectId(subjectId);
        }
    };

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveMenu(null);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    if (!user || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Asignaturas</h2>
                    <p className="text-gray-600">Gestiona tu contenido educativo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Subject Card */}
                    <button 
                        onClick={handleOpenCreate} 
                        className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
                    >
                        <div className="w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                            <Plus className="w-10 h-10 text-indigo-600" />
                        </div>
                        <span className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600">
                            Crear Nueva Asignatura
                        </span>
                    </button>

                    {/* Subject Cards */}
                    {subjects.map((subject) => {
                        const isFlipped = flippedSubjectId === subject.id;
                        const topicCount = subject.topics ? subject.topics.length : 0;

                        return (
                            <div 
                                key={subject.id} 
                                className="group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-all hover:scale-105"
                            >
                                {/* --- FRONT OF CARD (Default View) --- */}
                                {!isFlipped && (
                                    <div 
                                        className="absolute inset-0 cursor-pointer"
                                        onClick={() => handleSelectSubject(subject.id)}
                                    >
                                        {/* Gradient BG */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`}></div>

                                        {/* TOPICS BADGE (Interactive) 
                                            Features:
                                            1. Starts at top-right (right-6).
                                            2. On group-hover, slides left (-translate-x-12) to reveal dots.
                                        */}
                                        <div className="absolute top-6 right-6 z-20 transition-all duration-300 ease-out group-hover:-translate-x-12">
                                            <div 
                                                onClick={(e) => toggleFlip(e, subject.id)}
                                                className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full text-white cursor-pointer hover:bg-white/40 hover:scale-105 flex items-center gap-2 shadow-sm"
                                                title="Ver temas"
                                            >
                                                <span className="text-sm font-bold whitespace-nowrap">
                                                    {topicCount} {topicCount === 1 ? 'tema' : 'temas'}
                                                </span>
                                                <ChevronRight size={14} className="opacity-70" />
                                            </div>
                                        </div>

                                        {/* Top Controls (Dots) - Appear on Hover in the space vacated by the badge */}
                                        <div className="absolute top-6 right-6 z-30">
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setActiveMenu(activeMenu === subject.id ? null : subject.id); 
                                                }}
                                                className={`p-2 bg-white/20 backdrop-blur-md rounded-lg text-white transition-opacity duration-200 hover:bg-white/30 cursor-pointer ${
                                                    activeMenu === subject.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                }`}
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            
                                            {/* Dropdown */}
                                            {activeMenu === subject.id && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                                    <button 
                                                        onClick={(e) => handleOpenEdit(e, subject)}
                                                        className="w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-100 rounded-lg text-gray-700 transition-colors"
                                                    >
                                                        <Edit2 size={14} /> Editar
                                                    </button>
                                                    <button 
                                                        onClick={(e) => requestDelete(e, subject)}
                                                        className="w-full flex items-center gap-2 p-2 text-sm hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={14} /> Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Info */}
                                        <div className="relative h-full p-6 flex flex-col justify-between text-white pointer-events-none">
                                            <div className="flex justify-between items-start">
                                                <SubjectIcon iconName={subject.icon} className="w-12 h-12 opacity-80" />
                                            </div>
                                            <div>
                                                <p className="text-sm opacity-90 font-medium tracking-wide">{subject.course}</p>
                                                <h3 className="text-2xl font-bold tracking-tight">{subject.name}</h3>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- BACK OF CARD (Topic List View) --- */}
                                {isFlipped && (
                                    <div className="absolute inset-0 bg-white flex flex-col z-40 animate-in fade-in duration-200">
                                        {/* Header of "Back" side */}
                                        <div className={`p-4 bg-gradient-to-r ${subject.color} flex items-center justify-between text-white shadow-sm`}>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={(e) => toggleFlip(e, subject.id)}
                                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                >
                                                    <ArrowLeft size={18} />
                                                </button>
                                                <span className="font-bold text-sm truncate max-w-[150px]">Temas de {subject.name}</span>
                                            </div>
                                            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                                                {topicCount}
                                            </span>
                                        </div>

                                        {/* Scrollable List */}
                                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                            {topicCount > 0 ? (
                                                subject.topics.map((topic) => (
                                                    <button
                                                        key={topic.id}
                                                        onClick={() => handleSelectTopic(subject.id, topic.id)}
                                                        className="w-full text-left p-3 hover:bg-slate-50 rounded-lg group border border-transparent hover:border-slate-100 transition-all flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span className="text-sm text-gray-700 font-medium truncate pr-2">
                                                            {topic.title}
                                                        </span>
                                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-500" />
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                                    <SubjectIcon iconName={subject.icon} className="w-8 h-8 mb-2 opacity-20" />
                                                    <p className="text-sm">Aún no hay temas</p>
                                                    <button 
                                                        onClick={() => handleSelectSubject(subject.id)}
                                                        className="mt-2 text-xs text-indigo-600 font-medium hover:underline"
                                                    >
                                                        Crear uno ahora
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* --- MODALS --- */}
            {showSubjectModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowSubjectModal(false)} />
                        
                        <div className="relative transform overflow-hidden bg-white rounded-2xl w-full max-w-md shadow-xl text-left transition-all animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">{isEditing ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
                                <button onClick={() => setShowSubjectModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={subjectFormData.name}
                                        onChange={(e) => setSubjectFormData({...subjectFormData, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Ej: Matemáticas"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                                    <input
                                        type="text"
                                        value={subjectFormData.course}
                                        onChange={(e) => setSubjectFormData({...subjectFormData, course: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Ej: 2º Bachillerato"
                                        required
                                    />
                                </div>

                                {/* Icon Picker */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {ICON_KEYS.map((key) => {
                                            const Icon = ICON_MAP[key];
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setSubjectFormData({...subjectFormData, icon: key})}
                                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                                        subjectFormData.icon === key 
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

                                {/* Color Picker */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setSubjectFormData({...subjectFormData, color})}
                                                className={`w-full aspect-square rounded-full bg-gradient-to-br ${color} relative transition-transform hover:scale-105 ${
                                                    subjectFormData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' : ''
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSubjectModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-indigo-200 flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isEditing ? 'Guardar Cambios' : 'Crear Asignatura'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Asignatura?</h3>
                            <p className="text-gray-500 mb-6">
                                Estás a punto de eliminar <strong>{subjectToDelete?.name}</strong>. 
                                <br/>Se eliminarán todos los temas asociados.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-200 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Sí, Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showOnboarding && (
                <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 text-white">
                    <div>Por favor completa tu perfil...</div>
                </div>
            )}
        </div>
    );
};

export default Home;