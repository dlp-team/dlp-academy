import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Loader2 } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

import Header from '../components/layout/Header';
import SubjectModal from '../components/modals/SubjectModal';
import DeleteModal from '../components/modals/DeleteModal';

const Home = ({ user }) => {
    const navigate = useNavigate();
    
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [subjectFormData, setSubjectFormData] = useState({ 
        name: '', 
        course: '', 
        color: 'from-blue-400 to-blue-600' 
    });

    const colorOptions = [
        { name: 'Azul', value: 'from-blue-400 to-blue-600' },
        { name: 'Púrpura', value: 'from-purple-400 to-purple-600' },
        { name: 'Verde', value: 'from-emerald-400 to-emerald-600' },
        { name: 'Rosa', value: 'from-rose-400 to-rose-600' },
        { name: 'Ámbar', value: 'from-amber-400 to-amber-600' },
        { name: 'Cian', value: 'from-cyan-400 to-cyan-600' },
        { name: 'Índigo', value: 'from-indigo-400 to-indigo-600' },
        { name: 'Rosa Fucsia', value: 'from-pink-400 to-pink-600' }
    ];

    // Load subjects on mount
    useEffect(() => {
        const fetchSubjects = async () => {
            if (!user) return;

            try {
                const q = query(collection(db, "subjects"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                
                const loadedSubjects = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSubjects(loadedSubjects);
            } catch (error) {
                console.error("Error loading subjects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [user]);

    const handleCreateSubject = async () => {
        if (!subjectFormData.name.trim() || !subjectFormData.course.trim()) return;
        
        try {
            const newSubject = {
                name: subjectFormData.name,
                course: subjectFormData.course,
                color: subjectFormData.color,
                uid: user.uid,
                createdAt: new Date()
            };
            
            const docRef = await addDoc(collection(db, "subjects"), newSubject);
            setSubjects(prev => [...prev, { id: docRef.id, ...newSubject }]);
            setShowSubjectModal(false);
            setSubjectFormData({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
        } catch (error) {
            console.error("Error saving subject:", error);
            alert("Error al guardar la asignatura.");
        }
    };

    const requestDelete = (e, subject) => {
        e.stopPropagation();
        setSubjectToDelete(subject);
        setShowDeleteModal(true);
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
            alert("No se pudo eliminar la asignatura.");
        }
    };

    const handleSelectSubject = (subject) => {
        navigate(`/home/subject/${subject.id}`);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Cargando tu aula...</p>
                </div>
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
                        onClick={() => setShowSubjectModal(true)} 
                        className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-4"
                    >
                        <div className="w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                            <Plus className="w-10 h-10 text-indigo-600" />
                        </div>
                        <span className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600">
                            Crear Nueva Asignatura
                        </span>
                    </button>

                    {/* Subject Cards */}
                    {subjects.map((subject) => (
                        <button 
                            key={subject.id} 
                            onClick={() => handleSelectSubject(subject)} 
                            className="group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer text-left"
                        >
                            <div 
                                onClick={(e) => requestDelete(e, subject)} 
                                className="absolute top-3 right-3 z-20 p-2 bg-white/20 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </div>
                            
                            <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`}></div>
                            
                            <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                <div className="flex justify-between items-start">
                                    <BookOpen className="w-12 h-12 opacity-80" />
                                    <div className="bg-white/30 px-3 py-1 rounded-full">
                                        <span className="text-sm font-bold">
                                            {(subject.topics || []).length} temas
                                        </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm opacity-90">{subject.course}</p>
                                    <h3 className="text-2xl font-bold">{subject.name}</h3>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            <SubjectModal 
                isOpen={showSubjectModal} 
                onClose={() => setShowSubjectModal(false)} 
                formData={subjectFormData} 
                setFormData={setSubjectFormData} 
                onSubmit={handleCreateSubject} 
                colorOptions={colorOptions} 
            />
            
            <DeleteModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
                onConfirm={confirmDelete} 
                itemName={subjectToDelete?.name} 
            />
        </div>
    );
};

export default Home;