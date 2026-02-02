import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, BookOpen, Trophy, TrendingUp, 
  LayoutDashboard, Award 
} from 'lucide-react';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

// 👇 Import your standardized Header component
import Header from '../components/layout/Header';

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load user subjects from Firebase
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
        console.error("Error loading subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  // 2. Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // App detects auth change and redirects to Login automatically
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      {/* --- STANDARDIZED HEADER --- */}
      {/* This ensures the header is exactly the same height as in Home.jsx */}
      <Header user={user} />

      {/* --- MAIN CONTENT --- */}
      {/* pt-24 (96px) ensures content starts exactly below the h-20 (80px) header */}
      <main className="max-w-5xl mx-auto px-6 pt-24">
        
        {/* --- USER CARD AND LOGOUT --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
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
          
          {/* --- LEFT COLUMN: SUBJECTS SUMMARY --- */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text