// src/pages/Subject/components/SubjectTestsPanel.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, ClipboardCheck, BookOpen, Loader2, Pencil, Target } from 'lucide-react';
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../firebase/config';
import SubjectTestModal from '../modals/SubjectTestModal';

const LEVEL_SECTIONS = {
    basico: { title: 'Basico', levelValue: 'Principiante', subtitle: 'Refuerzo de conceptos base', icon: BookOpen },
    intermedio: { title: 'Intermedio', levelValue: 'Intermedio', subtitle: 'Practica aplicada', icon: ClipboardCheck },
    avanzado: { title: 'Avanzado', levelValue: 'Avanzado', subtitle: 'Retos y consolidacion', icon: Target }
};

const getSectionKey = (quiz: any) => {
    const level = String(quiz?.level || quiz?.type || '').toLowerCase();
    if (level.includes('avanzado') || level.includes('final') || level.includes('experto')) return 'avanzado';
    if (level.includes('intermedio') || level.includes('medio') || level.includes('advanced')) return 'intermedio';
    return 'basico';
};

const buildDefaultQuestions = (count: any) => {
    return Array.from({ length: count }).map((_, index: any) => ({
        question: `Pregunta ${index + 1}`,
        options: ['Opcion A', 'Opcion B', 'Opcion C', 'Opcion D'],
        correctIndex: 0
    }));
};

const SubjectTestsPanel = ({ user, subject, topics = [] }: any) => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('basico');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [panelError, setPanelError] = useState('');

    const role = (user?.role || '').toLowerCase();
    const canManage = role !== 'student';

    useEffect(() => {
        if (!subject?.id) {
            setLoading(false);
            return undefined;
        }

        setLoading(true);
        setPanelError('');

        const quizzesQuery = query(collection(db, 'quizzes'), where('subjectId', '==', subject.id));
        const unsubscribe = onSnapshot(quizzesQuery, (snapshot: any) => {
            const allQuizzes = snapshot.docs.map((quizDoc: any) => ({ id: quizDoc.id, ...quizDoc.data() }));
            setQuizzes(allQuizzes);
            setLoading(false);
        }, (error: any) => {
            console.error('Error listening to subject quizzes:', error);
            setPanelError('No se pudieron cargar los tests. Intentalo de nuevo.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [subject?.id]);

    const quizzesBySection = useMemo(() => {
        const grouped: any = { basico: [], intermedio: [], avanzado: [] };
        quizzes.forEach((quiz: any) => {
            grouped[getSectionKey(quiz)].push(quiz);
        });

        Object.keys(grouped).forEach((key: any) => {
            grouped[key].sort((a, b) => String(a.title || a.name || '').localeCompare(String(b.title || b.name || '')));
        });

        return grouped;
    }, [quizzes]);

    const handleCreateQuiz = async (payload: any) => {
        if (!subject?.id) return;
        setPanelError('');
        setCreating(true);

        try {
            const parsedWeight = Number(payload.assignmentWeight);
            const normalizedWeight = Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : 1;
            const now = serverTimestamp();

            const startDate = payload.assignmentStartAt ? new Date(payload.assignmentStartAt) : null;
            const dueDate = payload.assignmentDueAt ? new Date(payload.assignmentDueAt) : null;

            const created = await addDoc(collection(db, 'quizzes'), {
                subjectId: subject.id,
                topicId: payload.topicId,
                institutionId: subject?.institutionId || user?.institutionId || null,
                ownerId: subject?.ownerId || user?.uid || null,
                createdBy: user?.uid || null,
                title: payload.title,
                name: payload.title,
                level: payload.level,
                type: payload.level,
                questions: buildDefaultQuestions(payload.questionCount),
                formulas: [],
                prompt: '',
                isAssignment: Boolean(payload.isAssignment),
                countsForGrade: Boolean(payload.isAssignment && payload.countsForGrade),
                assignmentStartAt: payload.isAssignment ? startDate : null,
                assignmentDueAt: payload.isAssignment ? dueDate : null,
                assignmentWeight: payload.isAssignment && payload.countsForGrade ? normalizedWeight : 0,
                createdAt: now,
                updatedAt: now
            });

            setShowCreateModal(false);
            navigate(`/home/subject/${subject.id}/topic/${payload.topicId}/quiz/${created.id}/edit`);
        } catch (error) {
            console.error(error);
            setPanelError('No se pudo crear el test. Intentalo de nuevo.');
        } finally {
            setCreating(false);
        }
    };

    const renderSectionCards = (sectionKey: any) => {
        const section = LEVEL_SECTIONS[sectionKey];
        const sectionQuizzes = quizzesBySection[sectionKey] || [];

        return (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white">{section.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{section.subtitle}</p>
                    </div>
                    {canManage && (
                        <button
                            onClick={() => {
                                setActiveSection(sectionKey);
                                setShowCreateModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                        >
                            <Plus className="w-4 h-4" /> Anadir test
                        </button>
                    )}
                </div>

                {sectionQuizzes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">
                        Aun no hay tests en esta seccion.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sectionQuizzes.map((quiz: any) => {
                            const topicName = topics.find((topic: any) => topic.id === quiz.topicId)?.name || 'Tema sin nombre';
                            const isAssignment = Boolean(quiz.isAssignment);
                            const targetPath = quiz.topicId
                                ? `/home/subject/${subject.id}/topic/${quiz.topicId}/quiz/${quiz.id}`
                                : '';
                            const editPath = quiz.topicId
                                ? `/home/subject/${subject.id}/topic/${quiz.topicId}/quiz/${quiz.id}/edit`
                                : '';

                            return (
                                <div key={quiz.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-base font-black text-slate-900 dark:text-white line-clamp-2">{quiz.title || quiz.name || 'Test'}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{topicName}</p>
                                        </div>
                                        {isAssignment && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                Tarea
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            {(quiz.questions || []).length} preguntas
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {targetPath && (
                                                <button
                                                    onClick={() => navigate(targetPath)}
                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                                >
                                                    Abrir
                                                </button>
                                            )}
                                            {canManage && editPath && (
                                                <button
                                                    onClick={() => navigate(editPath)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white"
                                                >
                                                    <Pencil className="w-3 h-3" /> Editar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            </div>
        );
    }

    const sectionKeys = Object.keys(LEVEL_SECTIONS);

    return (
        <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2">Tests</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Gestor de tests por seccion</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Crea y organiza tests de forma directa desde la asignatura. Cada seccion tiene su propio boton de creacion.
                </p>
            </div>

            {panelError && (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300">
                    {panelError}
                </div>
            )}

            <div className="grid grid-cols-1 gap-5">
                {sectionKeys.map((key) => renderSectionCards(key))}
            </div>

            <SubjectTestModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateQuiz}
                topics={topics}
                defaultLevel={LEVEL_SECTIONS[activeSection].levelValue}
                isSaving={creating}
                subjectColor={subject?.color || 'from-indigo-500 to-purple-600'}
            />
        </section>
    );
};

export default SubjectTestsPanel;
