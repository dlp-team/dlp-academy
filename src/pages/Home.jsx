import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, MoreVertical, Edit2, Trash2, Loader2, X, Save,
    ChevronRight, ArrowLeft, Tag, LayoutGrid, Clock, Folder, Filter
} from 'lucide-react';
import { 
    collection, addDoc, query, where, getDocs, 
    deleteDoc, doc, getDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Layout
import Header from '../components/layout/Header';

// Helpers & Constants
import { ICON_MAP, ICON_KEYS, COLORS, EDUCATION_LEVELS } from '../utils/subjectConstants';
import SubjectIcon from '../components/modals/SubjectIcon';



const Home = ({ user }) => {
    const navigate = useNavigate();
    
    // --- STATE ---
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [flippedSubjectId, setFlippedSubjectId] = useState(null); 
    const [activeMenu, setActiveMenu] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // View Mode State: 'grid' | 'usage' | 'courses' | 'tags'
    const [viewMode, setViewMode] = useState('grid');

    // Modals
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    
    // Form State
    const [subjectFormData, setSubjectFormData] = useState({ 
        name: '', 
        level: '',    // New separate field for dropdown logic
        grade: '',    // New separate field for dropdown logic
        course: '',   // Constructed string for display/backward compatibility
        color: 'from-blue-400 to-blue-600',
        icon: 'book',
        tags: []      // New array for tags
    });
    const [tagInput, setTagInput] = useState(''); // Temp state for typing a tag

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

                // B. Load Subjects
                const q = query(collection(db, "subjects"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                
                const tempSubjects = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Load Topics Subcollection
                const subjectsWithTopics = await Promise.all(tempSubjects.map(async (subject) => {
                    const topicsRef = collection(db, "subjects", subject.id, "topics");
                    const topicsSnap = await getDocs(topicsRef);
                    const topicsList = topicsSnap.docs.map(t => ({ id: t.id, ...t.data() }));
                    
                    return { 
                        ...subject, 
                        topics: topicsList 
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

    // --- VIEW LOGIC (GROUPING) ---
    const groupedSubjects = useMemo(() => {
        if (viewMode === 'grid') return { 'Todas': subjects };
        
        if (viewMode === 'usage') {
            // Sort by updatedAt descending (mock logic if updatedAt missing, use createAt or index)
            const sorted = [...subjects].sort((a, b) => {
                const dateA = a.updatedAt?.seconds || 0;
                const dateB = b.updatedAt?.seconds || 0;
                return dateB - dateA;
            });
            return { 'Recientes': sorted };
        }

        if (viewMode === 'courses') {
            const groups = {};
            subjects.forEach(sub => {
                const key = sub.course || 'Sin Curso';
                if (!groups[key]) groups[key] = [];
                groups[key].push(sub);
            });
            return groups;
        }

        if (viewMode === 'tags') {
            const groups = {};
            let hasTags = false;
            
            subjects.forEach(sub => {
                if (sub.tags && sub.tags.length > 0) {
                    sub.tags.forEach(tag => {
                        if (!groups[tag]) groups[tag] = [];
                        groups[tag].push(sub);
                        hasTags = true;
                    });
                } else {
                    if (!groups['Sin Etiquetas']) groups['Sin Etiquetas'] = [];
                    groups['Sin Etiquetas'].push(sub);
                }
            });
            
            // Sort keys alphabetically
            return Object.keys(groups).sort().reduce(
                (obj, key) => { 
                    obj[key] = groups[key]; 
                    return obj;
                }, 
                {}
            );
        }
        return { 'Todas': subjects };
    }, [subjects, viewMode]);


    // --- HANDLERS ---

    // Form Handlers
    const handleOpenCreate = () => {
        setIsEditing(false);
        setSubjectFormData({ 
            name: '', level: '', grade: '', course: '', 
            color: 'from-blue-400 to-blue-600', icon: 'book', tags: [] 
        });
        setTagInput('');
        setShowSubjectModal(true);
    };

    const handleOpenEdit = (e, subject) => {
        e.stopPropagation();
        setIsEditing(true);
        
        // Try to parse level/grade from existing string if needed, 
        // or rely on stored fields if you add them to DB later.
        // For now, we allow the user to re-select or just keep the course string.
        setSubjectFormData({
            id: subject.id,
            name: subject.name,
            course: subject.course, // Keep existing string
            level: '', // Reset selectors
            grade: '', 
            color: subject.color,
            icon: subject.icon || 'book',
            tags: subject.tags || []
        });
        setTagInput('');
        setShowSubjectModal(true);
        setActiveMenu(null);
    };

    // Tag Input Handler
    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!subjectFormData.tags.includes(tagInput.trim())) {
                setSubjectFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()]
                }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setSubjectFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove)
        }));
    };

    // Update the 'course' string whenever level or grade changes
    useEffect(() => {
        if (subjectFormData.level && subjectFormData.grade) {
            setSubjectFormData(prev => ({
                ...prev,
                course: `${prev.grade} ${prev.level}`
            }));
        }
    }, [subjectFormData.level, subjectFormData.grade]);

    const handleSaveSubject = async (e) => {
        if(e) e.preventDefault();
        // Allow saving if 'course' string exists (editing legacy) OR new selection made
        if (!subjectFormData.name.trim() || !subjectFormData.course.trim()) return;
        
        try {
            const payload = {
                name: subjectFormData.name,
                course: subjectFormData.course,
                color: subjectFormData.color,
                icon: subjectFormData.icon || 'book',
                tags: subjectFormData.tags,
                updatedAt: new Date(), // For usage sorting
                uid: user.uid,
            };

            if (isEditing) {
                await updateDoc(doc(db, "subjects", subjectFormData.id), payload);
                setSubjects(prev => prev.map(s => s.id === subjectFormData.id ? { ...s, ...payload } : s));
            } else {
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

    // Navigation & Interaction
    const handleSelectSubject = async (subjectId) => {
        // Update Usage stats (optional local update, ideally fire-and-forget DB update)
        try {
            // Fire and forget update
            updateDoc(doc(db, "subjects", subjectId), { updatedAt: new Date() });
        } catch(e) {}
        navigate(`/home/subject/${subjectId}`);
    };

    const handleSelectTopic = (subjectId, topicId) => {
        navigate(`/home/subject/${subjectId}/topic/${topicId}`);
    };

    const toggleFlip = (e, subjectId) => {
        e.stopPropagation();
        setFlippedSubjectId(flippedSubjectId === subjectId ? null : subjectId);
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
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
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Asignaturas</h2>
                        <p className="text-gray-600">Gestiona tu contenido educativo</p>
                    </div>

                    {/* VIEW MODE SWITCHER */}
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <LayoutGrid size={16} /> <span className="hidden sm:inline">Manual</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('usage')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'usage' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Clock size={16} /> <span className="hidden sm:inline">Uso</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('courses')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'courses' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Folder size={16} /> <span className="hidden sm:inline">Cursos</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('tags')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'tags' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Tag size={16} /> <span className="hidden sm:inline">Etiquetas</span>
                        </button>
                    </div>
                </div>

                {/* GROUPS RENDERER */}
                {Object.entries(groupedSubjects).map(([groupName, groupSubjects]) => (
                    <div key={groupName} className="mb-10">
                        {/* Section Header if in specific modes */}
                        {(viewMode === 'courses' || viewMode === 'tags') && (
                            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                                {viewMode === 'courses' ? <Folder className="text-indigo-500" /> : <Tag className="text-pink-500" />}
                                <h3 className="text-xl font-bold text-gray-800">{groupName}</h3>
                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{groupSubjects.length}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Create New Subject Card (Only show in 'grid' or 'usage' mode or first group) */}
                            {viewMode === 'grid' && groupName === 'Todas' && (
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
                            )}

                            {/* Subject Cards */}
                            {groupSubjects.map((subject) => {
                                const isFlipped = flippedSubjectId === subject.id;
                                const topicCount = subject.topics ? subject.topics.length : 0;

                                return (
                                    <div 
                                        key={`${groupName}-${subject.id}`} // Unique key for tags view duplicates
                                        className="group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-all hover:scale-105"
                                    >
                                        {/* --- FRONT OF CARD --- */}
                                        {!isFlipped && (
                                            <div 
                                                className="absolute inset-0 cursor-pointer"
                                                onClick={() => handleSelectSubject(subject.id)}
                                            >
                                                {/* Gradient BG */}
                                                <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`}></div>

                                                {/* !!! IMPORTANT: BADGE ANIMATION PRESERVATION !!!
                                                    The class `group-hover:-translate-x-12` below is CRITICAL for the sliding interaction.
                                                    The logic relies on the hover state of the parent .group container.
                                                    DO NOT CHANGE OR REMOVE THIS ANIMATION LOGIC.
                                                */}
                                                <div className={`absolute top-6 right-6 z-20 transition-all duration-300 ease-out group-hover:-translate-x-12 ${
                                                    activeMenu === subject.id ? '-translate-x-12' : ''
                                                }`}>

                                                    {/* This inner div stays mostly the same, just keeping your styling */}
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

                                                {/* Top Controls (Dots) - Appear on Hover */}
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
                                                        <p className="text-sm opacity-90 font-medium tracking-wide flex items-center gap-1">
                                                            {subject.course}
                                                        </p>
                                                        <h3 className="text-2xl font-bold tracking-tight mb-2">{subject.name}</h3>
                                                        
                                                        {/* Display Tags on Card */}
                                                        {subject.tags && subject.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {subject.tags.slice(0, 3).map(tag => (
                                                                    <span key={tag} className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                                {subject.tags.length > 3 && <span className="text-[10px] text-white/80">+{subject.tags.length - 3}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* --- BACK OF CARD (Topic List) --- */}
                                        {isFlipped && (
                                            <div className="absolute inset-0 bg-white flex flex-col z-40 animate-in fade-in duration-200">
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
                    </div>
                ))}
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
                                
                                {/* New Course Selector (Level + Grade) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Curso Académico</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            value={subjectFormData.level}
                                            onChange={(e) => setSubjectFormData({ ...subjectFormData, level: e.target.value, grade: '' })}
                                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        >
                                            <option value="">Nivel</option>
                                            {Object.keys(EDUCATION_LEVELS).map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={subjectFormData.grade}
                                            onChange={(e) => setSubjectFormData({ ...subjectFormData, grade: e.target.value })}
                                            disabled={!subjectFormData.level}
                                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-gray-100"
                                        >
                                            <option value="">Curso</option>
                                            {subjectFormData.level && EDUCATION_LEVELS[subjectFormData.level].map(grade => (
                                                <option key={grade} value={grade}>{grade}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Actual: {subjectFormData.course || 'Selecciona nivel y curso'}</p>
                                </div>

                                {/* Tags Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (Opcional)</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Escribe y pulsa Enter (ej: Difícil)"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => { if(tagInput) handleAddTag({ key: 'Enter', preventDefault: ()=>{} }) }}
                                            className="px-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    {/* Tag Pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {subjectFormData.tags.map(tag => (
                                            <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-indigo-100">
                                                #{tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
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