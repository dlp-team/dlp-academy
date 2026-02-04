import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, BookOpen, Trophy, TrendingUp, 
  LayoutDashboard, Award, Edit2, MapPin, X, Save, Loader2, Camera 
} from 'lucide-react';

// 1. Import storage functions
import { auth, db } from '../firebase/config'; 
import { signOut, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
// bimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import Header from '../components/layout/Header';

const Profile = ({ user }) => {
  const navigate = useNavigate();
  
  // Data State
  const [subjects, setSubjects] = useState([]);
  const [userProfile, setUserProfile] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Image Upload State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    displayName: '',
    role: 'student',
    country: ''
  });

  const countries = {
    es: { name: "España", flag: "🇪🇸" },
    mx: { name: "México", flag: "🇲🇽" },
    ar: { name: "Argentina", flag: "🇦🇷" },
    co: { name: "Colombia", flag: "🇨🇴" },
    cl: { name: "Chile", flag: "🇨🇱" },
    other: { name: "Otro", flag: "🌍" }
  };

    /* Temporal for profile picture storage */
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserProfile(data);
          setFormData({
            displayName: data.displayName || '',
            role: data.role || 'student',
            country: data.country || ''
          });
        }

        const q = query(collection(db, "subjects"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const subjectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubjects(subjectsData);

      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Handle Image Selection
  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
        setPhotoFile(e.target.files[0]);
        // Create a fake local URL just for preview
        setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalPhotoData = userProfile?.photoURL || "";

      // If a new file was selected, convert it to a Base64 string
      if (photoFile) {
        finalPhotoData = await convertToBase64(photoFile);
      }

      // Update Firestore with the string (it will treat it like a long URL)
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        country: formData.country,
        role: formData.role,
        photoURL: finalPhotoData 
      });

      setUserProfile(prev => ({ ...prev, ...formData, photoURL: finalPhotoData }));
      setIsEditing(false);
      setPhotoFile(null);

    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
    );
  }

  // Helper to render Avatar
  const renderAvatar = (url, name, size = "w-24 h-24", textSize = "text-3xl") => {
    if (url) {
        return (
            <img 
                src={url} 
                alt="Profile" 
                className={`${size} rounded-full object-cover border-4 border-indigo-50 shadow-inner`}
            />
        );
    }
    return (
        <div className={`${size} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white ${textSize} font-bold shadow-inner`}>
            {(name || "U").charAt(0).toUpperCase()}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Header user={user} />

      <main className="max-w-5xl mx-auto px-6 pt-24">
        
        {/* --- USER CARD --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                
                {/* LEFT SIDE: Avatar + Info */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        {renderAvatar(userProfile?.photoURL, userProfile?.displayName)}
                        <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                    </div>
                    
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                             <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                {userProfile?.displayName || user?.displayName || "Usuario"}
                            </h1>
                            {/* Edit Button next to name (Subtle) */}
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Editar perfil"
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>
                       
                        
                        <div className="flex flex-col md:flex-row items-center gap-3 text-gray-500 mb-3">
                            <span>{user?.email}</span>
                            {userProfile?.country && countries[userProfile.country] && (
                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-sm">
                                    <MapPin size={14} /> {countries[userProfile.country].name} {countries[userProfile.country].flag}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2 justify-center md:justify-start">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                {userProfile?.role === 'teacher' ? '👨‍🏫 Docente' : '👨‍🎓 Estudiante'}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                <LayoutDashboard className="w-3 h-3" />
                                Plan Gratuito
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Big Logout Button (Restored) */}
                <button 
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Cerrar Sesión
                </button>
            </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SUBJECTS LIST */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-500" />
                Mis Asignaturas
              </h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                Total: {subjects.length}
              </span>
            </div>

            {subjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map((sub) => (
                  <div key={sub.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sub.color || 'from-gray-400 to-gray-500'} mb-4 flex items-center justify-center text-white`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 truncate">{sub.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{sub.course}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
                      <span>{(sub.topics || []).length} Temas generados</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">Aún no has creado asignaturas.</p>
              </div>
            )}
          </div>

          {/* MOCKUPS */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                <h2 className="text-lg font-bold text-gray-800">Tu Progreso</h2>
              </div>
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg mb-2">Próximamente</div>
                <p className="text-sm font-semibold text-gray-800">Las estadísticas aparecerán aquí</p>
              </div>
              <div className="space-y-4 opacity-50 blur-[1px]">
                <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full w-2/3"></div></div>
              </div>
            </div>
            {/* Global Ranking Card (Mockup) */}
             <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6 relative z-0">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-lg font-bold">Ranking Global</h2>
                </div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg mb-2">En Construcción</div>
                </div>
                <Award className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
            </div>
          </div>
        </div>
      </main>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Editar Perfil</h3>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSaveChanges} className="p-6 space-y-4">
                    
                    {/* 🟢 IMAGE UPLOAD SECTION */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer">
                            {/* Show Preview OR Current URL OR Initials */}
                            {renderAvatar(
                                photoPreview || userProfile?.photoURL, 
                                formData.displayName, 
                                "w-28 h-28", 
                                "text-4xl"
                            )}
                            
                            {/* Overlay Camera Icon */}
                            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                <Camera size={32} />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handlePhotoChange}
                                />
                            </label>
                            
                            {/* Small edit badge */}
                            <div className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white border-4 border-white">
                                <Edit2 size={14} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Click para cambiar foto</p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input 
                            type="text" 
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                        <select 
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            {Object.entries(countries).map(([key, val]) => (
                                <option key={key} value={key}>{val.name} {val.flag}</option>
                            ))}
                        </select>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition-all ${formData.role === 'student' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="role" value="student" checked={formData.role === 'student'} onChange={handleInputChange} className="hidden" />
                                <span className="text-2xl mb-1">👨‍🎓</span>
                                <span className="text-sm font-bold">Estudiante</span>
                            </label>
                            <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition-all ${formData.role === 'teacher' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="role" value="teacher" checked={formData.role === 'teacher'} onChange={handleInputChange} className="hidden" />
                                <span className="text-2xl mb-1">👨‍🏫</span>
                                <span className="text-sm font-bold">Docente</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Profile;