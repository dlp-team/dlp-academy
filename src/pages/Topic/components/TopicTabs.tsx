// src/pages/Topic/components/TopicTabs.tsx
import React, { useEffect, useState } from 'react';
import { FileText, Upload, CheckCircle2, Plus, ClipboardList, BookOpen, ClipboardCheck } from 'lucide-react';
import { getActiveRole, getNormalizedRole } from '../../../utils/permissionUtils';

const TopicTabs = ({
    activeTab,
    setActiveTab,
    topic,
    handleCreateCustomStudyGuide,
    handleCreateCustomExam,
    handleCreateCustomQuiz,
    permissions,
    user
}: any) => {
    const [showMaterialsCreateMenu, setShowMaterialsCreateMenu] = useState(false);
    const normalizedProfileRole = getNormalizedRole(user);
    const activeRole = getActiveRole(user);
    const isStudentRole = normalizedProfileRole === 'student' && activeRole === 'student';

    const handleAssignmentsCreate = (event: any) => {
        event.stopPropagation();
        setActiveTab('assignments');
        window.dispatchEvent(new CustomEvent('topic-assignments-create-requested'));
    };

    useEffect(() => {
        if (activeTab !== 'materials') {
            setShowMaterialsCreateMenu(false);
        }
    }, [activeTab]);

    const handleToggleMaterialsCreateMenu = (event: any) => {
        event.stopPropagation();
        setShowMaterialsCreateMenu((prev) => !prev);
    };

    const handleCreateStudyGuide = (event: any) => {
        event.stopPropagation();
        setShowMaterialsCreateMenu(false);
        handleCreateCustomStudyGuide();
    };

    const handleCreateExam = (event: any) => {
        event.stopPropagation();
        setShowMaterialsCreateMenu(false);
        handleCreateCustomExam();
    };

    // Estudiantes reales o en preview ven: Materiales, Quizzes, Tareas
    // Profesores ven: Generados por IA, Mis Archivos, Tests Prácticos, Tareas
    const isStudent = isStudentRole || permissions?.isViewer;
    const tabs = isStudent 
        ? ['materiales', 'quizzes', 'assignments']
        : ['materials', 'uploads', 'quizzes', 'assignments'];

    return (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {tab === 'materials' && <><FileText className="w-4 h-4" /> Generados por IA</>}
                    {tab === 'materiales' && <><FileText className="w-4 h-4" /> Materiales</>}
                    {tab === 'uploads' && <><Upload className="w-4 h-4" /> Mis Archivos</>}
                    {tab === 'quizzes' && <><CheckCircle2 className="w-4 h-4" /> Tests Prácticos</>}
                    {tab === 'assignments' && <><ClipboardList className="w-4 h-4" /> Tareas</>}
                    {activeTab === tab && permissions?.canEdit && (tab === 'materials' || tab === 'quizzes' || tab === 'assignments') && (
                        <>
                            {tab === 'materials' ? (
                                <div className="relative ml-2" data-topic-materials-create-menu>
                                    <div
                                        role="button"
                                        onClick={handleToggleMaterialsCreateMenu}
                                        className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-all z-10"
                                        title="Crear guía o examen"
                                        aria-label="Crear guía o examen"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </div>

                                    {showMaterialsCreateMenu && (
                                        <div
                                            role="menu"
                                            className="absolute top-7 right-0 min-w-[12rem] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-1.5 z-20"
                                            onClick={(event: any) => event.stopPropagation()}
                                        >
                                            <div
                                                role="button"
                                                onClick={handleCreateStudyGuide}
                                                className="w-full px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                                            >
                                                <BookOpen className="w-3.5 h-3.5" />
                                                Crear guía de estudio
                                            </div>
                                            <div
                                                role="button"
                                                onClick={handleCreateExam}
                                                className="w-full px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                                            >
                                                <ClipboardCheck className="w-3.5 h-3.5" />
                                                Crear examen
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    role="button"
                                    onClick={(e: any) => {
                                        if (tab === 'quizzes') {
                                            e.stopPropagation();
                                            handleCreateCustomQuiz();
                                            return;
                                        }
                                        handleAssignmentsCreate(e);
                                    }}
                                    className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-all z-10"
                                    title={tab === 'assignments' ? 'Crear tarea' : 'Crear test'}
                                >
                                    <Plus className="w-3 h-3" />
                                </div>
                            )}
                        </>
                    )}
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {tab === 'materials'
                            ? topic.pdfs?.length || 0
                            : tab === 'materiales'
                                ? (topic.pdfs?.filter(f => f.type === 'summary' || f.type === 'resumen')?.length || 0)
                                    + (topic.uploads?.filter(u => {
                                        const category = (u?.fileCategory || '').toLowerCase();
                                        return !category || category === 'resumen' || category === 'material-teorico' || category === 'ejercicios';
                                    })?.length || 0)
                                    + (topic.uploads?.filter(u => {
                                        const category = (u?.fileCategory || '').toLowerCase();
                                        return category === 'examen' || category === 'examenes';
                                    })?.length || 0)
                                    + (topic.exams?.length || 0)
                                : tab === 'uploads'
                                    ? topic.uploads?.length || 0
                                    : tab === 'quizzes'
                                        ? topic.quizzes?.length || 0
                                        : topic.assignments?.length || 0}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default TopicTabs;