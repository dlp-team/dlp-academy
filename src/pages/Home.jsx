// src/pages/Home.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Loader2, LayoutGrid, Clock, Folder, Tag, Trash2
} from 'lucide-react';

// Layout & Logic
import Header from '../components/layout/Header';
import { useSubjects } from '../hooks/useSubjects';

// Sub-Components created above
import SubjectCard from '../components/home/SubjectCard'; 
import SubjectFormModal from '../components/modals/SubjectFormModal';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';

const Home = ({ user }) => {
    const navigate = useNavigate();
    
    // Data Logic
    const { subjects, loading, addSubject, updateSubject, deleteSubject, touchSubject } = useSubjects(user);

    // UI State
    const [viewMode, setViewMode] = useState('grid');
    const [flippedSubjectId, setFlippedSubjectId] = useState(null); 
    const [activeMenu, setActiveMenu] = useState(null);
    
    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, isEditing: false, data: null });
    const [deleteConfig, setDeleteConfig] = useState({ isOpen: false, subject: null });

    // --- VIEW GROUPING LOGIC ---
    const groupedSubjects = useMemo(() => {
        if (viewMode === 'grid') return { 'Todas': subjects };
        if (viewMode === 'usage') {
            const sorted = [...subjects].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
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
            subjects.forEach(sub => {
                if (sub.tags?.length > 0) {
                    sub.tags.forEach(tag => {
                        if (!groups[tag]) groups[tag] = [];
                        groups[tag].push(sub);
                    });
                } else {
                    if (!groups['Sin Etiquetas']) groups['Sin Etiquetas'] = [];
                    groups['Sin Etiquetas'].push(sub);
                }
            });
            return Object.keys(groups).sort().reduce((obj, key) => { obj[key] = groups[key]; return obj; }, {});
        }
        return { 'Todas': subjects };
    }, [subjects, viewMode]);

    // --- HANDLERS ---
    const handleSave = async (formData) => {
        // 1. ADDED cardStyle HERE so it saves to Firestore
        const payload = {
            name: formData.name,
            course: formData.course,
            color: formData.color,
            icon: formData.icon || 'book',
            tags: formData.tags,
            cardStyle: formData.cardStyle || 'default',
            fillColor: formData.modernFillColor || null,
            updatedAt: new Date(),
            uid: user.uid,
        };

        if (modalConfig.isEditing) {
            await updateSubject(formData.id, payload);
        } else {
            payload.createdAt = new Date();
            await addSubject(payload);
        }
        setModalConfig({ isOpen: false, isEditing: false, data: null });
    };

    const handleDelete = async () => {
        if (deleteConfig.subject) {
            await deleteSubject(deleteConfig.subject.id);
            setDeleteConfig({ isOpen: false, subject: null });
        }
    };

    // Card Actions
    const handleSelectSubject = (id) => {
        touchSubject(id); // Updates 'Usage' sort
        navigate(`/home/subject/${id}`);
    };
    
    // Close menus on outside click
    useEffect(() => {
        const closeMenu = () => setActiveMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    if (!user || loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors"><Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors">
            <Header user={user} />
            <OnboardingWizard user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Header & Controls */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Asignaturas</h2>
                        <p className="text-gray-600 dark:text-gray-400">Gestiona tu contenido educativo</p>
                    </div>
                    {/* View Switcher */}
                    <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 inline-flex transition-colors">
                        {[
                            { id: 'grid', icon: LayoutGrid, label: 'Manual' },
                            { id: 'usage', icon: Clock, label: 'Uso' },
                            { id: 'courses', icon: Folder, label: 'Cursos' },
                            { id: 'tags', icon: Tag, label: 'Etiquetas' }
                        ].map(mode => (
                            <button 
                                key={mode.id}
                                onClick={() => setViewMode(mode.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === mode.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'}`}
                            >
                                <mode.icon size={16} /> <span className="hidden sm:inline">{mode.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Grid */}
                {Object.entries(groupedSubjects).map(([groupName, groupSubjects]) => (
                    <div key={groupName} className="mb-10">
                        {(viewMode === 'courses' || viewMode === 'tags') && (
                            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 transition-colors">
                                {viewMode === 'courses' ? <Folder className="text-indigo-500 dark:text-indigo-400" /> : <Tag className="text-pink-500 dark:text-pink-400" />}
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{groupName}</h3>
                                <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full transition-colors">{groupSubjects.length}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Create Button (Grid Mode only) */}
                            {viewMode === 'grid' && groupName === 'Todas' && (
                                <button 
                                    onClick={() => setModalConfig({ isOpen: true, isEditing: false, data: null })} 
                                    className="group relative h-64 border-3 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
                                >
                                    <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60 flex items-center justify-center transition-colors">
                                        <Plus className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Crear Nueva Asignatura</span>
                                </button>
                            )}

                            {/* Cards */}
                            {groupSubjects.map((subject) => (
                                <SubjectCard
                                    key={`${groupName}-${subject.id}`}
                                    subject={subject}
                                    isFlipped={flippedSubjectId === subject.id}
                                    onFlip={(id) => setFlippedSubjectId(flippedSubjectId === id ? null : id)}
                                    activeMenu={activeMenu}
                                    onToggleMenu={(id) => setActiveMenu(activeMenu === id ? null : id)}
                                    onSelect={handleSelectSubject}
                                    onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                                    onEdit={(e, s) => { e.stopPropagation(); setModalConfig({ isOpen: true, isEditing: true, data: s }); setActiveMenu(null); }}
                                    onDelete={(e, s) => { e.stopPropagation(); setDeleteConfig({ isOpen: true, subject: s }); setActiveMenu(null); }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </main>

            {/* Modals */}
            <SubjectFormModal 
                isOpen={modalConfig.isOpen}
                isEditing={modalConfig.isEditing}
                initialData={modalConfig.data}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onSave={handleSave}
            />

            {deleteConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors"><Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" /></div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar Asignatura?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Se eliminarán <strong>{deleteConfig.subject?.name}</strong> y sus temas.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteConfig({ isOpen: false, subject: null })} className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">Cancelar</button>
                            <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"><Trash2 className="w-4 h-4" /> Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;