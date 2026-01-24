import React, { useState } from 'react';
import { GraduationCap, Plus, FileText, Download, CheckCircle2, Clock, Upload, X, ChevronLeft, GripVertical, Play, BookOpen, Home } from 'lucide-react';

const AIClassroom = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [subjectFormData, setSubjectFormData] = useState({ name: '', course: '', color: 'from-blue-400 to-blue-600' });
  const [topicFormData, setTopicFormData] = useState({ title: '', prompt: '' });
  const [pendingTopic, setPendingTopic] = useState(null);
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

    if (currentTopics.length === 0) {
      const updatedTopic = { ...newTopic, number: '01' };
      const newTopicsList = [updatedTopic]; // Lista explícita para evitar stale closure
      
      updateSubjectTopics(newTopicsList);
      setShowTopicModal(false);
      setTopicFormData({ title: '', prompt: '' });
      setFiles([]);
      
      // Pasamos la lista explícitamente
      simulateGeneration(updatedTopic.id, newTopicsList);
    } else {
      setPendingTopic(newTopic);
      setShowTopicModal(false);
      setShowPositionModal(true);
    }
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
    
    if (draggedIndex !== null && pendingTopic) {
      const currentTopics = selectedSubject.topics || [];
      const newTopics = [...currentTopics];
      newTopics.splice(index, 0, pendingTopic);
      
      const renumberedTopics = newTopics.map((topic, idx) => ({
        ...topic,
        number: String(idx + 1).padStart(2, '0')
      }));
      
      updateSubjectTopics(renumberedTopics);
      setShowPositionModal(false);
      setPendingTopic(null);
      setTopicFormData({ title: '', prompt: '' });
      setFiles([]);
      
      // Pasamos la lista explícitamente
      simulateGeneration(pendingTopic.id, renumberedTopics);
      
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  };

  const handleTopicDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const confirmPosition = () => {
    const currentTopics = selectedSubject.topics || [];
    const newTopics = [...currentTopics, pendingTopic];
    const renumberedTopics = newTopics.map((topic, index) => ({
      ...topic,
      number: String(index + 1).padStart(2, '0')
    }));
    
    updateSubjectTopics(renumberedTopics);
    setShowPositionModal(false);
    setPendingTopic(null);
    setTopicFormData({ title: '', prompt: '' });
    setFiles([]);
    
    // Pasamos la lista explícitamente
    simulateGeneration(pendingTopic.id, renumberedTopics);
  };

  const cancelPosition = () => {
    setShowPositionModal(false);
    setPendingTopic(null);
    setTopicFormData({ title: '', prompt: '' });
    setFiles([]);
  };

  // CORRECCIÓN PRINCIPAL: Acepta topicsList como argumento
  const simulateGeneration = (topicId, topicsList) => {
    setTimeout(() => {
      // Usamos topicsList en lugar de selectedSubject.topics para evitar closures obsoletos
      const updatedTopics = topicsList.map(t => 
        t.id === topicId 
          ? {
              ...t,
              status: 'completed',
              pdfs: [
                { name: 'Formulario y Resumen.pdf', url: '#', type: 'summary' },
                { name: 'Ejercicios Resueltos.pdf', url: '#', type: 'exercises' },
                { name: 'Examen de Prueba.pdf', url: '#', type: 'exam' }
              ],
              quizzes: [
                { 
                  id: 1, 
                  name: 'Test de Comprensión Básica',
                  type: 'basic',
                  questionCount: 15,
                  duration: '20 min'
                },
                { 
                  id: 2, 
                  name: 'Test Avanzado de Aplicación',
                  type: 'advanced',
                  questionCount: 25,
                  duration: '35 min'
                },
                { 
                  id: 3, 
                  name: 'Evaluación Final',
                  type: 'final',
                  questionCount: 40,
                  duration: '60 min'
                }
              ]
            }
          : t
      );
      updateSubjectTopics(updatedTopics);
    }, 3000);
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
      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              JD
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Juan Docente</h2>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <GraduationCap className="w-10 h-10 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Colegio San José</h1>
              <p className="text-xs text-gray-500">Excelencia Educativa</p>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Classroom</h2>
              <p className="text-gray-600">Gestiona tus asignaturas y contenido educativo</p>
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
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSubject.color} flex items-center justify-center`}>
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{selectedSubject.course}</p>
                  <h2 className="text-4xl font-bold text-gray-900">{selectedSubject.name}</h2>
                </div>
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
                    topic.status === 'completed' ? 'hover:scale-105 cursor-pointer' : 'cursor-wait'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-90`}></div>
                  
                  <div className="relative h-full p-6 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                      <span className="text-8xl font-black opacity-30">{topic.number}</span>
                      {topic.status === 'generating' ? (
                        <Clock className="w-6 h-6 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{topic.title}</h3>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-white transition-all duration-1000 ${
                            topic.status === 'generating' ? 'w-1/3' : 'w-full'
                          }`}
                        ></div>
                      </div>
                      <p className="text-sm mt-2 opacity-90">
                        {topic.status === 'generating' ? 'Generando contenido...' : 'Completado'}
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
                {selectedTopic.pdfs.map((pdf, idx) => (
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
                    <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedTopic.quizzes.map((quiz) => {
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
                })}
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

      {/* Modal de Selección de Posición con Drag & Drop */}
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
                        <div className="w-48 h-48 border-4 border-dashed border-indigo-500 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📍</div>
                            <p className="text-sm font-bold text-indigo-600">Soltar aquí</p>
                            <p className="text-xs text-indigo-500 mt-1">Posición {index + 1}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tema existente */}
                    <div className="flex-shrink-0 w-40 h-48 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center shadow-md relative">
                      <span className="text-5xl font-black text-gray-400">{topic.number}</span>
                      <span className="text-sm text-gray-600 text-center px-3 mt-2 font-semibold line-clamp-2">
                        {topic.title}
                      </span>
                      {dragOverIndex === index && draggedIndex !== null && (
                        <div className="absolute -top-2 -left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
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
                    <div className="w-48 h-48 border-4 border-dashed border-indigo-500 bg-indigo-50 rounded-xl flex items-center justify-center">
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
    </div>
  );
};

export default AIClassroom;