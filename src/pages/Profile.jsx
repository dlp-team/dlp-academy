import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, BookOpen, Trophy, TrendingUp, 
  Star, ChevronLeft, LayoutDashboard, Award 
} from 'lucide-react';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar las asignaturas reales del usuario desde Firebase
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;
      
      try {
        const q = query(collection(db, "subjects"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubjects(data);
      } catch (error) {
        console.error("Error cargando asignaturas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  // 2. Función para Cerrar Sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // La app detectará el cambio de auth y te llevará al Login automáticamente
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      {/* --- HEADER SIMPLE --- */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver al Aula
          </button>
          <span className="text-gray-400 text-sm font-medium tracking-wider">MI PERFIL</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        
        {/* --- TARJETA DE USUARIO Y LOGOUT --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 shadow-inner"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{user?.displayName || "Estudiante"}</h1>
              <p className="text-gray-500 mb-3">{user?.email}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                <LayoutDashboard className="w-3 h-3" />
                Plan Gratuito
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="group flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition-all duration-300"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- COLUMNA IZQUIERDA: RESUMEN DE ASIGNATURAS --- */}
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

            {loading ? (
              <div className="p-10 text-center text-gray-400">Cargando datos...</div>
            ) : subjects.length > 0 ? (
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

          {/* --- COLUMNA DERECHA: PROGRESO Y RANKING (FUTURO) --- */}
          <div className="space-y-8">
            
            {/* 1. SECCIÓN DE PROGRESO (MOCKUP) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                <h2 className="text-lg font-bold text-gray-800">Tu Progreso</h2>
              </div>
              
              {/* Overlay de "Próximamente" */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg mb-2">
                  Próximamente
                </div>
                <p className="text-sm font-semibold text-gray-800">Las estadísticas de tus tests aparecerán aquí</p>
              </div>

              {/* Contenido Simulado (Fondo) */}
              <div className="space-y-4 opacity-50 blur-[1px]">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">Tests Completados</span>
                    <span>8/12</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-2/3"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">Precisión Promedio</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SECCIÓN DE RANKING (MOCKUP) */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
               <div className="flex items-center gap-2 mb-6 relative z-0">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-lg font-bold">Mejores Asignaturas</h2>
              </div>

               {/* Overlay de "Próximamente" */}
               <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg mb-2">
                  En Construcción
                </div>
                <p className="text-sm font-medium text-white/90">Compite contigo mismo pronto</p>
              </div>

              {/* Lista Simulada */}
              <div className="space-y-3 opacity-40">
                {[1, 2, 3].map((pos) => (
                  <div key={pos} className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      pos === 1 ? 'bg-yellow-400 text-yellow-900' : 
                      pos === 2 ? 'bg-gray-300 text-gray-800' : 
                      'bg-amber-700 text-amber-100'
                    }`}>
                      {pos}
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-white/30 rounded w-20 mb-1"></div>
                      <div className="h-2 bg-white/10 rounded w-12"></div>
                    </div>
                    <div className="text-yellow-400 font-bold text-sm">-- pts</div>
                  </div>
                ))}
              </div>

              {/* Decoración de fondo */}
              <Award className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;