import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Loader2, User, Globe, GraduationCap, Check } from 'lucide-react';
// 1. Added updateDoc and getDoc to imports
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

import Header from '../components/layout/Header';
import SubjectModal from '../components/modals/SubjectModal';
import DeleteModal from '../components/modals/DeleteModal';

const Home = ({ user }) => {
    const navigate = useNavigate();
    
    // --- EXISTING STATE ---
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

    // --- 🟢 NEW: ONBOARDING STATE ---
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [missingFields, setMissingFields] = useState([]); // Queue of fields to ask
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [onboardingData, setOnboardingData] = useState({});
    const [isSavingProfile, setIsSavingProfile] = useState(false);

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

    // 1. CHECK USER PROFILE & LOAD SUBJECTS
    useEffect(() => {
        const initData = async () => {
            if (!user) return;

            try {
                // A. Check User Profile Integrity
                const userDocRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userDocRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const requiredKeys = ['role', 'country', 'displayName']; // Fields we need to ask the user
                    
                    // Identify which fields are missing or empty
                    const missing = requiredKeys.filter(key => !userData[key] || userData[key] === "");
                    
                    if (missing.length > 0) {
                        setMissingFields(missing);
                        setShowOnboarding(true);
                        // We continue loading subjects in background, but user is blocked by overlay
                    }
                } else {
                    // Critical: Doc doesn't exist at all (rare, but possible if manual delete)
                    setMissingFields(['displayName', 'role', 'country']);
                    setShowOnboarding(true);
                }

                // B. Load Subjects
                const q = query(collection(db, "subjects"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                
                const loadedSubjects = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSubjects(loadedSubjects);

            } catch (error) {
                console.error("Error initializing home:", error);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [user]);

    // --- 🟢 ONBOARDING LOGIC ---

    const handleOnboardingAnswer = async (key, value) => {
        // 1. Update local buffer
        const updatedData = { ...onboardingData, [key]: value };
        setOnboardingData(updatedData);

        // 2. Check if we have more steps
        if (currentStepIndex < missingFields.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            // 3. Last step? Save everything to Firestore
            await saveCompleteProfile(updatedData);
        }
    };

    const saveCompleteProfile = async (finalData) => {
        setIsSavingProfile(true);
        try {
            const userRef = doc(db, "users", user.uid);
            
            // Prepare the payload
            const payload = {
                ...finalData,
                // Ensure technical fields are present if they were missing
                uid: user.uid,
                email: user.email, 
                lastLogin: serverTimestamp(),
                // Only add createdAt if it doesn't exist (using updateDoc usually merges, but safely handling here)
            };

            // Use setDoc with merge:true or updateDoc. 
            // Since we know the doc exists (or we want to create it), updateDoc is safer if we checked existence,
            // but setDoc with merge is robust.
            await updateDoc(userRef, payload); // Using updateDoc assuming doc exists from check

            setShowOnboarding(false);
            // Optionally reload page or state to reflect changes
            window.location.reload(); 

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Hubo un error guardando tu perfil.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    // --- EXISTING HANDLERS ---
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

    // --- RENDER HELPERS ---
    const renderOnboardingStep = () => {
        const currentField = missingFields[currentStepIndex];

        switch (currentField) {
            case 'role':
                return (
                    <div className="animate-fadeIn">
                        <div className="flex justify-center mb-4"><GraduationCap size={48} className="text-indigo-600"/></div>
                        <h3 className="text-2xl font-bold text-center mb-2">¿Cuál es tu rol?</h3>
                        <p className="text-gray-500 text-center mb-6">Para personalizar tu experiencia.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleOnboardingAnswer('role', 'student')} className="p-4 border-2 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all">
                                <span className="text-3xl block mb-2">👨‍🎓</span>
                                <span className="font-semibold">Estudiante</span>
                            </button>
                            <button onClick={() => handleOnboardingAnswer('role', 'teacher')} className="p-4 border-2 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all">
                                <span className="text-3xl block mb-2">👨‍🏫</span>
                                <span className="font-semibold">Docente</span>
                            </button>
                        </div>
                    </div>
                );
            case 'country':
                return (
                    <div className="animate-fadeIn">
                        <div className="flex justify-center mb-4"><Globe size={48} className="text-emerald-600"/></div>
                        <h3 className="text-2xl font-bold text-center mb-2">¿De dónde eres?</h3>
                        <p className="text-gray-500 text-center mb-6">Te asignaremos contenido regional.</p>
                        <select 
                            className="w-full p-3 border rounded-lg text-lg bg-white"
                            onChange={(e) => handleOnboardingAnswer('country', e.target.value)}
                            value=""
                        >
                            <option value="" disabled>Selecciona tu país...</option>
                            <option value="es">España 🇪🇸</option>
                            <option value="mx">México 🇲🇽</option>
                            <option value="ar">Argentina 🇦🇷</option>
                            <option value="co">Colombia 🇨🇴</option>
                            <option value="cl">Chile 🇨🇱</option>
                            <option value="other">Otro 🌍</option>
                        </select>
                    </div>
                );
            case 'displayName':
                return (
                    <div className="animate-fadeIn">
                        <div className="flex justify-center mb-4"><User size={48} className="text-blue-600"/></div>
                        <h3 className="text-2xl font-bold text-center mb-2">¿Cómo te llamas?</h3>
                        <p className="text-gray-500 text-center mb-6">Así te verán tus compañeros.</p>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const fullName = `${formData.get('fname')} ${formData.get('lname')}`;
                            if(fullName.trim().length > 2) handleOnboardingAnswer('displayName', fullName);
                        }}>
                            <div className="space-y-4">
                                <input name="fname" placeholder="Nombre" className="w-full p-3 border rounded-lg" required />
                                <input name="lname" placeholder="Apellidos" className="w-full p-3 border rounded-lg" required />
                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                                    Continuar
                                </button>
                            </div>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!user || loading) {
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

            {/* --- MODALS --- */}

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

            {/* 🟢 ONBOARDING OVERLAY (Blocker) */}
            {showOnboarding && (
                <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 h-2 bg-indigo-100 w-full">
                            <div 
                                className="h-full bg-indigo-600 transition-all duration-500"
                                style={{ width: `${((currentStepIndex) / missingFields.length) * 100}%` }}
                            />
                        </div>

                        {isSavingProfile ? (
                            <div className="flex flex-col items-center py-8">
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                                <p className="text-lg font-medium text-gray-700">Guardando tu perfil...</p>
                            </div>
                        ) : (
                            renderOnboardingStep()
                        )}
                        
                        <div className="mt-6 text-center text-xs text-gray-400">
                            Paso {currentStepIndex + 1} de {missingFields.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;