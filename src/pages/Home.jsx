import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, FileText, Download, CheckCircle2, Clock, Upload, X, ChevronLeft, GripVertical, Play, BookOpen, Home, ArrowUpDown, AlertCircle, RotateCw } from 'lucide-react';
import { auth, db, provider } from '../firebase/config'; 

const N8N_WEBHOOK_URL = 'https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook-test/711e538b-9d63-42bb-8494-873301ffdf39';

const AIClassroom = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  
  // Modales
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Formularios y datos temporales
  const [subjectFormData, setSubjectFormData] = useState({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
  const [topicFormData, setTopicFormData] = useState({ title: '', prompt: '' });
  const [pendingTopic, setPendingTopic] = useState(null);
  const [reorderList, setReorderList] = useState([]); 
  
  // UI States
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('materials');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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

  // --- Lógica de Archivos ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- Gestión de Asignaturas ---
  const handleCreateSubject = () => {
    if (!subjectFormData.name.trim() || !subjectFormData.course.trim()) return;

    const newSubject = {
      id: Date.now().toString(),
      name: subjectFormData.name,
      course: subjectFormData.course,
      color: subjectFormData.color,
      topics: []
    };

    setSubjects(prev => [...prev, newSubject]);
    setShowSubjectModal(false);
    setSubjectFormData({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
  };

  // --- 📡 LÓGICA DE CONEXIÓN CON N8N ---
  const sendToN8N = async (topicId, topicsList, data, attachedFiles) => {
    console.log("🚀 Enviando datos a n8n...");

    const formData = new FormData();
    // Datos del Tema
    formData.append('topicId', topicId);
    formData.append('title', data.title);
    formData.append('prompt', data.prompt || '');
    
    // Datos de la Asignatura
    formData.append('subject', selectedSubject.name);
    formData.append('course', selectedSubject.course); 

    // Lista completa de temas
    formData.append('my_value', JSON.stringify(topicsList));

    // Archivos PDF
    attachedFiles.forEach((file) => {
      formData.append('files', file); 
    });

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData, 
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Respuesta de n8n:", result);

      // Actualizamos el estado con la respuesta real de n8n
      const updatedTopics = topicsList.map(t => 
        t.id === topicId 
          ? {
              ...t,
              status: 'completed',
              pdfs: result.pdfs || [],      
              quizzes: result.quizzes || [] 
            }
          : t
      );
      updateSubjectTopics(updatedTopics);

    } catch (error) {
      console.error("❌ Error en envío a n8n:", error);
      // Estado de error visual
      const updatedTopics = topicsList.map(t => 
        t.id === topicId ? { ...t, status: 'error' } : t
      );
      updateSubjectTopics(updatedTopics);
    }
  };

  // --- Gestión de Temas ---
  const handleCreateTopic = () => {
    if (!selectedSubject) return;

    const newTopic = {
      id: Date.now().toString(),
      title: topicFormData.title,
      status: 'generating',
      color: selectedSubject.color,
      pdfs: [],
      quizzes: []
    };

    const currentTopics = selectedSubject.topics || [];
    
    // Guardamos copias locales antes de limpiar el estado
    const currentFiles = [...files];
    const currentPrompt = topicFormData.prompt;
    const currentTitle = topicFormData.title;

    if (currentTopics.length === 0) {
      // Primer tema (directo)
      const updatedTopic = { ...newTopic, number: '01' };
      const newTopicsList = [updatedTopic];
      
      updateSubjectTopics(newTopicsList);
      setShowTopicModal(false);
      setTopicFormData({ title: '', prompt: '' });
      setFiles([]);
      
      // Llamada a n8n
      sendToN8N(updatedTopic.id, newTopicsList, { title: currentTitle, prompt: currentPrompt }, currentFiles);
    } else {
      // Tema adicional (requiere elegir posición)
      setPendingTopic({ 
        ...newTopic, 
        tempFiles: currentFiles, 
        tempPrompt: currentPrompt 
      });
      setShowTopicModal(false);
      setShowPositionModal(true);
    }
  };

  // --- Reintentar Tema Fallido ---
  const handleRetryTopic = (e, topic) => {
    e.stopPropagation(); // Evita que se intente abrir el tema al hacer clic
    
    // 1. Ponemos el estado en 'generating' visualmente
    const updatedTopics = topics.map(t => 
      t.id === topic.id ? { ...t, status: 'generating' } : t
    );
    updateSubjectTopics(updatedTopics);

    // 2. Reenviamos a n8n (usando el título del tema existente)
    sendToN8N(topic.id, updatedTopics, { title: topic.title, prompt: '' }, []);
  };

  const updateSubjectTopics = (newTopics) => {
    setSubjects(prev => prev.map(s => 
      s.id === selectedSubject.id 
        ? { ...s, topics: newTopics }
        : s
    ));
    setSelectedSubject(prev => ({ ...prev, topics: newTopics }));
    setTopics(newTopics);
  };

  // --- Lógica de Drag & Drop (Creación y Reordenamiento) ---
  const handleTopicDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTopicDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null) {
      setDragOverIndex(index);
    }
  };

  const handleTopicDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    const targetIndex = index;

    if (draggedIndex !== null && pendingTopic) {
      // Extraemos datos temporales
      const filesToSend = pendingTopic.tempFiles || [];
      const promptToSend = pendingTopic.tempPrompt || '';
      const { tempFiles, tempPrompt, ...cleanTopic } = pendingTopic;

      const currentTopics = [...topics];
      currentTopics.splice(targetIndex, 0, cleanTopic);
      
      const renumberedTopics = currentTopics.map((topic, idx) => ({
        ...topic,
        number: String(idx + 1).padStart(2, '0')
      }));
      
      updateSubjectTopics(renumberedTopics);
      setShowPositionModal(false);
      setPendingTopic(null);
      setTopicFormData({ title: '', prompt: '' });
      setFiles([]);
      setDraggedIndex(null);
      setDragOverIndex(null);

      // Llamada a n8n
      sendToN8N(cleanTopic.id, renumberedTopics, { title: cleanTopic.title, prompt: promptToSend }, filesToSend);
    }
  };

  const handleTopicDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Reordenar (Lista existente)
  const openReorderModal = () => {
    setReorderList([...topics]); 
    setShowReorderModal(true);
  };

  const handleReorderDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleReorderDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleReorderDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const newList = [...reorderList];
    const [movedItem] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, movedItem);
    const renumberedList = newList.map((topic, idx) => ({
      ...topic,
      number: String(idx + 1).padStart(2, '0')
    }));
    setReorderList(renumberedList);
    setDraggedIndex(null);
  };

  const saveReorder = () => {
    updateSubjectTopics(reorderList);
    setShowReorderModal(false);
  };

  const confirmPosition = () => {
    const currentTopics = selectedSubject.topics || [];
    
    // Extraemos datos temporales
    const filesToSend = pendingTopic.tempFiles || [];
    const promptToSend = pendingTopic.tempPrompt || '';
    const { tempFiles, tempPrompt, ...cleanTopic } = pendingTopic;

    const newTopics = [...currentTopics, cleanTopic];
    const renumberedTopics = newTopics.map((topic, index) => ({
      ...topic,
      number: String(index + 1).padStart(2, '0')
    }));
    
    updateSubjectTopics(renumberedTopics);
    setShowPositionModal(false);
    setPendingTopic(null);
    setTopicFormData({ title: '', prompt: '' });
    setFiles([]);
    
    // Llamada a n8n
    sendToN8N(cleanTopic.id, renumberedTopics, { title: cleanTopic.title, prompt: promptToSend }, filesToSend);
  };

  const cancelPosition = () => {
    setShowPositionModal(false);
    setPendingTopic(null);
    setTopicFormData({ title: '', prompt: '' });
    setFiles([]);
  };

  const getQuizIcon = (type) => {
    switch(type) {
      case 'basic': return { icon: '📖', color: 'from-blue-400 to-blue-600' };
      case 'advanced': return { icon: '🧪', color: 'from-purple-400 to-purple-600' };
      case 'final': return { icon: '🏆', color: 'from-amber-400 to-amber-600' };
      default: return { icon: '📝', color: 'from-gray-400 to-gray-600' };
    }
  };

  const handleStartQuiz = (quizId) => {
    console.log('Iniciando test:', quizId);
    alert('Esta funcionalidad se conectará con n8n próximamente');
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setTopics(subject.topics || []);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setTopics([]);
    setActiveTab('materials');
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setActiveTab('materials');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      {/* Header Minimalista */}
      <header className="fixed top-0 w-full bg-white shadow-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          
          {/* Logo Minimalista Izquierda */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">AI Classroom</h1>
          </div>
          
          {/* Perfil Derecha */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <h2 className="font-semibold text-sm text-gray-900">Juan Docente</h2>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {!selectedSubject ? (
          /* Vista Principal - Asignaturas */
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Asignaturas</h2>
              <p className="text-gray-600">Gestiona tu contenido educativo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Botón Crear Nueva Asignatura */}
              <button
                onClick={() => setShowSubjectModal(true)}
                className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                  <Plus className="w-10 h-10 text-indigo-600" />
                </div>
                <span className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600">
                  Crear Nueva Asignatura
                </span>
              </button>

              {/* Tarjetas de Asignaturas */}
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSelectSubject(subject)}
                  className="group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`}></div>
                  
                  <div className="relative h-full p-6 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                      <BookOpen className="w-12 h-12 opacity-80" />
                      <div className="bg-white/30 px-3 py-1 rounded-full">
                        <span className="text-sm font-bold">{(subject.topics || []).length} temas</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm opacity-90 mb-1">{subject.course}</p>
                      <h3 className="text-2xl font-bold mb-3">{subject.name}</h3>
                      <div className="flex items-center gap-2 text-sm opacity-90">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Listo para usar</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : !selectedTopic ? (
          /* Vista de Temas (dentro de una asignatura) */
          <>
            <button
              onClick={handleBackToSubjects}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <Home className="w-5 h-5" />
              Volver a Asignaturas
            </button>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSubject.color} flex items-center justify-center`}>
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{selectedSubject.course}</p>
                    <h2 className="text-4xl font-bold text-gray-900">{selectedSubject.name}</h2>
                  </div>
                </div>

                {/* BOTÓN DE REORDENAR TEMAS */}
                {topics.length > 1 && (
                  <button
                    onClick={openReorderModal}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 text-gray-700 shadow-sm"
                    title="Reordenar temas"
                  >
                    <ArrowUpDown className="w-5 h-5" />
                    <span className="font-semibold hidden sm:inline">Reordenar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grid de Temas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Botón Crear Nuevo Tema */}
              <button
                onClick={() => setShowTopicModal(true)}
                className="group relative h-64 border-3 border-dashed border-gray-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                  <Plus className="w-10 h-10 text-indigo-600" />
                </div>
                <span className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600">
                  Crear Nuevo Tema
                </span>
              </button>

              {/* Tarjetas de Temas */}
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => topic.status === 'completed' && setSelectedTopic(topic)}
                  className={`group relative h-64 rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 ${
                    topic.status === 'completed' ? 'hover:scale-105 cursor-pointer' : 
                    topic.status === 'generating' ? 'cursor-wait' : 'cursor-default'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-90`}></div>
                  
                  {/* Overlay Error - DISEÑO SUTIL (TRANSPARENTE 10%) */}
                  {topic.status === 'error' && (
                    <div className="absolute inset-0 bg-red-600/10 z-20 flex flex-col items-center justify-center transition-all duration-300">
                        {/* Botón Reintentar */}
                        <button 
                          onClick={(e) => handleRetryTopic(e, topic)}
                          className="flex flex-col items-center gap-2 group/btn"
                        >
                          <div className="bg-white text-red-600 p-3 rounded-full shadow-xl group-hover/btn:scale-110 transition-transform">
                            <RotateCw className="w-6 h-6" />
                          </div>
                          <span className="text-white font-bold drop-shadow-md text-sm bg-red-600/80 px-3 py-1 rounded-full backdrop-blur-sm">
                            Reintentar
                          </span>
                        </button>
                    </div>
                  )}

                  <div className="relative h-full p-6 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                      <span className="text-8xl font-black opacity-30">{topic.number}</span>
                      {topic.status === 'generating' ? (
                        <Clock className="w-6 h-6 animate-spin" />
                      ) : topic.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : null}
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{topic.title}</h3>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-white transition-all duration-1000 ${
                            topic.status === 'generating' ? 'w-1/3 animate-pulse' : 
                            topic.status === 'completed' ? 'w-full' : 'w-0'
                          }`}
                        ></div>
                      </div>
                      
                      <p className="text-sm mt-2 opacity-90">
                        {topic.status === 'generating' ? 'Generando el temario...' : 
                         topic.status === 'completed' ? 'Completado' : 
                         topic.status === 'error' ? 'Falló la conexión' : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Vista de Detalle del Tema */
          <div>
            <button
              onClick={handleBackToTopics}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver a Temas
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedTopic.color} flex items-center justify-center`}>
                  <span className="text-3xl font-black text-white">{selectedTopic.number}</span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900">{selectedTopic.title}</h2>
                  <p className="text-gray-600">Tema {selectedTopic.number} - {selectedSubject.name}</p>
                </div>
              </div>

              {/* Menú de Navegación */}
              <div className="bg-white rounded-xl shadow-md p-2 flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    activeTab === 'materials'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📚 Materiales
                </button>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    activeTab === 'quizzes'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ✍️ Tests
                </button>
              </div>
            </div>

            {/* Contenido según pestaña activa */}
            {activeTab === 'materials' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedTopic.pdfs && selectedTopic.pdfs.length > 0 ? selectedTopic.pdfs.map((pdf, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-7 h-7 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 truncate">{pdf.name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{pdf.type}</p>
                      </div>
                    </div>
                    {/* 👇 NOMBRE DE DESCARGA CONFIGURADO 👇 */}
                    <a 
                      href={pdf.url} 
                      download={`ejerciciosTema${selectedTopic.number}(${selectedTopic.title})${selectedSubject.name}.pdf`}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Descargar
                    </a>
                  </div>
                )) : (
                  <div className="col-span-3 py-12 text-center text-gray-500 bg-white rounded-xl shadow-sm">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300"/>
                    <p>No se han generado materiales para este tema.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedTopic.quizzes && selectedTopic.quizzes.length > 0 ? selectedTopic.quizzes.map((quiz) => {
                  const quizStyle = getQuizIcon(quiz.type);
                  return (
                    <div key={quiz.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className={`h-32 bg-gradient-to-br ${quizStyle.color} flex items-center justify-center`}>
                        <span className="text-6xl">{quizStyle.icon}</span>
                      </div>
                      
                      <div className="p-6">
                        <h4 className="font-bold text-gray-900 text-lg mb-2">{quiz.name}</h4>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Preguntas:</span>
                            <span className="font-semibold text-gray-900">{quiz.questionCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Duración:</span>
                            <span className="font-semibold text-gray-900">{quiz.duration}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                            quiz.type === 'basic' ? 'bg-blue-100 text-blue-800' :
                            quiz.type === 'advanced' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {quiz.type === 'basic' ? 'Nivel Básico' : 
                             quiz.type === 'advanced' ? 'Nivel Avanzado' : 
                             'Evaluación Final'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Comenzar Test
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-3 py-12 text-center text-gray-500 bg-white rounded-xl shadow-sm">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300"/>
                      <p>No se han generado tests para este tema.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Creación de Asignatura */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Crear Nueva Asignatura</h3>
              <button
                onClick={() => {
                  setShowSubjectModal(false);
                  setSubjectFormData({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  value={subjectFormData.name}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Matemáticas"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Curso
                </label>
                <input
                  type="text"
                  value={subjectFormData.course}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, course: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="1º ESO"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tema de Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSubjectFormData({ ...subjectFormData, color: color.value })}
                      className={`relative h-20 rounded-xl bg-gradient-to-br ${color.value} transition-all ${
                        subjectFormData.color === color.value 
                          ? 'ring-4 ring-indigo-500 scale-105' 
                          : 'hover:scale-105'
                      }`}
                    >
                      {subjectFormData.color === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      )}
                      <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-semibold text-white drop-shadow">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateSubject}
                disabled={!subjectFormData.name.trim() || !subjectFormData.course.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
              >
                Crear Asignatura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Creación de Tema */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {topics.length === 0 ? 'Crear Primer Tema' : 'Crear Nuevo Tema'}
              </h3>
              <button
                onClick={() => {
                  setShowTopicModal(false);
                  setTopicFormData({ title: '', prompt: '' });
                  setFiles([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {topics.length === 0 && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                  <p className="text-indigo-900 font-semibold">
                    ℹ️ Este será tu primer tema. Se asignará automáticamente como Tema 01.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título del Tema
                </label>
                <input
                  type="text"
                  value={topicFormData.title}
                  onChange={(e) => setTopicFormData({ ...topicFormData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Física Cuántica"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instrucciones Adicionales (Prompt)
                </label>
                <textarea
                  value={topicFormData.prompt}
                  onChange={(e) => setTopicFormData({ ...topicFormData, prompt: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                  rows="3"
                  placeholder="Enfócate en ejemplos prácticos..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subir PDFs (Teoría y Ejemplos)
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-3 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    Arrastra archivos PDF aquí o haz clic para seleccionar
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleCreateTopic}
                disabled={!topicFormData.title.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
              >
                {topics.length === 0 ? 'Crear Tema 01' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selección de Posición con Drag & Drop (NUEVO TEMA) */}
      {showPositionModal && pendingTopic && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Organiza el orden de los temas</h3>
              <p className="text-gray-600">
                Arrastra el nuevo tema "{pendingTopic.title}" a la posición deseada
              </p>
            </div>

            <div className="p-8">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <GripVertical className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Arrastra el tema nuevo</strong> sobre cualquier tema existente para insertarlo en esa posición. 
                    Los temas que queden a la derecha se renumerarán automáticamente (+1).
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-6 overflow-x-auto pb-4 min-h-[220px]">
                {topics.map((topic, index) => (
                  <React.Fragment key={topic.id}>
                    {/* Zona de drop antes del tema */}
                    <div
                      onDragOver={(e) => handleTopicDragOver(e, index)}
                      onDrop={(e) => handleTopicDrop(e, index)}
                      onDragLeave={() => setDragOverIndex(null)}
                      className={`flex-shrink-0 transition-all duration-200 ${
                        dragOverIndex === index ? 'w-48' : 'w-2'
                      }`}
                    >
                      {dragOverIndex === index && (
                        <div className="pointer-events-none w-48 h-48 border-4 border-dashed border-indigo-500 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📍</div>
                            <p className="text-sm font-bold text-indigo-600">Soltar aquí</p>
                            <p className="text-xs text-indigo-500 mt-1">Posición {index + 1}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tema existente */}
                    <div 
                      onDragOver={(e) => handleTopicDragOver(e, index)}
                      onDrop={(e) => handleTopicDrop(e, index)}
                      className="flex-shrink-0 w-40 h-48 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center shadow-md relative"
                    >
                      <span className="text-5xl font-black text-gray-400">{topic.number}</span>
                      <span className="text-sm text-gray-600 text-center px-3 mt-2 font-semibold line-clamp-2">
                        {topic.title}
                      </span>
                      {dragOverIndex === index && draggedIndex !== null && (
                        <div className="absolute -top-2 -left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                          Insertando antes
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                ))}

                {/* Zona de drop al final */}
                <div
                  onDragOver={(e) => handleTopicDragOver(e, topics.length)}
                  onDrop={(e) => handleTopicDrop(e, topics.length)}
                  onDragLeave={() => setDragOverIndex(null)}
                  className={`flex-shrink-0 transition-all duration-200 ${
                    dragOverIndex === topics.length ? 'w-48' : 'w-2'
                  }`}
                >
                  {dragOverIndex === topics.length && (
                    <div className="pointer-events-none w-48 h-48 border-4 border-dashed border-indigo-500 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📍</div>
                        <p className="text-sm font-bold text-indigo-600">Soltar aquí</p>
                        <p className="text-xs text-indigo-500 mt-1">Posición {topics.length + 1}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nuevo tema arrastrable */}
                <div
                  draggable
                  onDragStart={(e) => handleTopicDragStart(e, topics.length)}
                  onDragEnd={handleTopicDragEnd}
                  className={`relative flex-shrink-0 w-40 h-48 rounded-xl shadow-lg cursor-move transition-all duration-200 ${
                    draggedIndex === topics.length ? 'opacity-30 scale-95' : 'hover:scale-105'
                  }`}
                >
                  <div className={`h-full rounded-xl bg-gradient-to-br ${pendingTopic.color} flex flex-col items-center justify-center p-4 relative`}>
                    <div className="absolute top-2 right-2 bg-white/30 rounded-lg p-1">
                      <GripVertical className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-5xl font-black text-white opacity-80">
                      {String(topics.length + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-white text-center mt-2 font-bold line-clamp-2">
                      {pendingTopic.title}
                    </span>
                    <div className="mt-2 bg-white/30 px-3 py-1 rounded-full">
                      <span className="text-xs text-white font-semibold">NUEVO ⬅ ARRASTRA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-green-900 text-sm">
                    <strong>Vista previa:</strong> Si insertas el nuevo tema en la posición {dragOverIndex !== null ? dragOverIndex + 1 : topics.length + 1}, 
                    {dragOverIndex !== null && dragOverIndex < topics.length 
                      ? ` los temas ${dragOverIndex + 1} al ${topics.length} se convertirán en ${dragOverIndex + 2} al ${topics.length + 1}.`
                      : ' quedará al final como Tema ' + String(topics.length + 1).padStart(2, '0') + '.'}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={confirmPosition}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Confirmar Posición Actual
                  </button>
                  <button
                    onClick={cancelPosition}
                    className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reordenar Temas (EXISTENTES) */}
      {showReorderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Reordenar Temas</h3>
              <button
                onClick={() => setShowReorderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Arrastra los temas para cambiar su orden. La numeración se actualizará automáticamente al guardar.
              </p>
              
              <div className="space-y-3">
                {reorderList.map((topic, index) => (
                  <div
                    key={topic.id}
                    draggable
                    onDragStart={(e) => handleReorderDragStart(e, index)}
                    onDragOver={(e) => handleReorderDragOver(e, index)}
                    onDrop={(e) => handleReorderDrop(e, index)}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm cursor-move transition-all ${
                      draggedIndex === index ? 'opacity-50 bg-gray-50 border-dashed border-gray-400' : 'hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${topic.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {topic.number}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{topic.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={saveReorder}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Guardar Nuevo Orden
                </button>
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="px-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AIClassroom;