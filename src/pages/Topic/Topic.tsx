// src/pages/Topic/Topic.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Eye, GraduationCap, AlertCircle } from 'lucide-react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import TopicSkeleton from './components/TopicSkeleton';
import { useTopicLogic } from './hooks/useTopicLogic';
import { useTopicFailedQuestions } from './hooks/useTopicFailedQuestions';
import { useClassMembers } from '../Subject/hooks/useClassMembers';

// Firebase imports
import {
    collection, query, where, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
    getPreviewMockAssignmentsByTopicId,
    getPreviewMockQuizResultsByTopicId,
    getPreviewMockQuizScoreReviewsByTopicId,
} from '../../utils/previewMockData';

// UI Components
import TopicHeader from './components/TopicHeader';
import TopicTabs from './components/TopicTabs';
import TopicContent from './components/TopicContent';
import TopicModals from './components/TopicModals';
import CategorizFileModal from './components/CategorizFileModal';
import { getActiveRole, getNormalizedRole } from '../../utils/permissionUtils';

// CONFIGURACIÓN N8N
const N8N_WEBHOOK_URL = 'TU_URL_DE_N8N_AQUI'; 

const Topic = ({ user }: any) => {
    // 1. Lógica base
    const logic = useTopicLogic(user);
    useDarkMode();
    const location = useLocation();
    const { activeTab, setActiveTab } = logic;
    const normalizedProfileRole = getNormalizedRole(user);
    const activeRole = getActiveRole(user);
    const isStudentRole = normalizedProfileRole === 'student' && activeRole === 'student';
    const isBinReadOnlyView = useMemo(() => {
        const searchParams = new URLSearchParams(location.search || '');
        return searchParams.get('mode') === 'readonly' || searchParams.get('readonly') === '1';
    }, [location.search]);

    // 2. ESTADOS LOCALES
    const [quizResults, setQuizResults] = useState<any[]>([]);
    const [quizScoreReviews, setQuizScoreReviews] = useState<any[]>([]);
    const [topicAssignments, setTopicAssignments] = useState<any[]>([]);
    const [scoresFeedback, setScoresFeedback] = useState('');
    const [reviewsFeedback, setReviewsFeedback] = useState('');
    const [assignmentsFeedback, setAssignmentsFeedback] = useState('');
    const [previewAsStudent, setPreviewAsStudent] = useState(false);
    const canUsePreview = !isStudentRole && !isBinReadOnlyView;
    const isStudentView = isStudentRole || previewAsStudent;
    const isPreviewMockMode = user?.__previewMockData === true;
    const { failedQuestions } = useTopicFailedQuestions(user, logic.topicId);
    const { members: classMembers = [] } = useClassMembers(logic.subject);
    const topicRealtimeFeedback = assignmentsFeedback || reviewsFeedback || scoresFeedback;

    useEffect(() => {
        if (!isBinReadOnlyView) return;
        setPreviewAsStudent(false);
        sessionStorage.removeItem('dlpPreviewAsStudent');
    }, [isBinReadOnlyView]);

    useEffect(() => {
        if (!canUsePreview) {
            sessionStorage.removeItem('dlpPreviewAsStudent');
            return;
        }

        if (previewAsStudent) {
            sessionStorage.setItem('dlpPreviewAsStudent', '1');
            return;
        }

        sessionStorage.removeItem('dlpPreviewAsStudent');
    }, [previewAsStudent, canUsePreview]);

    useEffect(() => {
        if (isStudentView && activeTab === 'materials') {
            setActiveTab('materiales');
            return;
        }

        if (!isStudentView && activeTab === 'materiales') {
            setActiveTab('materials');
        }
    }, [isStudentView, activeTab, setActiveTab]);

    // 3. EFECTO: Escuchar puntuaciones (Quizzes)
    useEffect(() => {
        if (!user || !logic.subjectId || !logic.topicId) {
            queueMicrotask(() => {
                setQuizResults([]);
                setScoresFeedback('');
            });
            return;
        }

        if (isPreviewMockMode) {
            const mockResults = getPreviewMockQuizResultsByTopicId(logic.topicId);
            let scopedResults = isStudentView
                ? mockResults.filter((result: any) => result.userId === user?.uid)
                : mockResults;

            if (isStudentView && scopedResults.length === 0 && user?.uid && mockResults.length > 0) {
                const fallback = mockResults[0];
                scopedResults = [{
                    ...fallback,
                    id: `${fallback.id}-preview-${user.uid}`,
                    userId: user.uid,
                    userName: user?.displayName || 'Alumno vista previa',
                    userEmail: user?.email || '',
                }];
            }

            queueMicrotask(() => {
                setQuizResults(scopedResults);
                setScoresFeedback('');
            });

            return;
        }

        queueMicrotask(() => {
            setScoresFeedback('');
        });

        const resultsRef = collection(db, "subjects", logic.subjectId, "topics", logic.topicId, "quiz_results");
        const source = isStudentView
            ? query(resultsRef, where("userId", "==", user.uid))
            : resultsRef;

        const unsubscribe = onSnapshot(source, (snapshot: any) => {
            setQuizResults(snapshot.docs.map((resultDoc: any) => ({ id: resultDoc.id, ...resultDoc.data() })));
            setScoresFeedback('');
        }, (error: any) => {
            if (error?.code === 'permission-denied') {
                setQuizResults([]);
                setScoresFeedback('');
                return;
            }
            console.error('[QUIZ_RESULTS] Firestore error:', error);
            setQuizResults([]);
            setScoresFeedback('No se pudieron sincronizar las puntuaciones de tests.');
        });

        return () => unsubscribe();
    }, [user, logic.subjectId, logic.topicId, isStudentView, isPreviewMockMode]);

    useEffect(() => {
        if (!user || !logic.subjectId || !logic.topicId || isStudentView) {
            queueMicrotask(() => {
                setQuizScoreReviews([]);
                setReviewsFeedback('');
            });
            return;
        }

        if (isPreviewMockMode) {
            queueMicrotask(() => {
                setQuizScoreReviews(getPreviewMockQuizScoreReviewsByTopicId(logic.topicId));
                setReviewsFeedback('');
            });
            return;
        }

        queueMicrotask(() => {
            setReviewsFeedback('');
        });

        const reviewsRef = query(
            collection(db, 'topicQuizGradeReviews'),
            where('subjectId', '==', logic.subjectId),
            where('topicId', '==', logic.topicId)
        );

        const unsubscribe = onSnapshot(reviewsRef, (snapshot: any) => {
            setQuizScoreReviews(snapshot.docs.map((reviewDoc: any) => ({ id: reviewDoc.id, ...reviewDoc.data() })));
            setReviewsFeedback('');
        }, (error: any) => {
            if (error?.code === 'permission-denied') {
                setQuizScoreReviews([]);
                setReviewsFeedback('');
                return;
            }
            console.error('[TOPIC_QUIZ_REVIEWS] Firestore error:', error);
            setQuizScoreReviews([]);
            setReviewsFeedback('No se pudieron sincronizar las revisiones de tests.');
        });

        return () => unsubscribe();
    }, [user, logic.subjectId, logic.topicId, isStudentView, isPreviewMockMode]);

    useEffect(() => {
        if (!logic.subjectId || !logic.topicId) {
            queueMicrotask(() => {
                setTopicAssignments([]);
                setAssignmentsFeedback('');
            });
            return undefined;
        }

        if (isPreviewMockMode) {
            const allAssignments = getPreviewMockAssignmentsByTopicId(logic.topicId)
                .sort((a: any, b: any) => {
                    const aDate = a?.dueAt ? new Date(a.dueAt) : null;
                    const bDate = b?.dueAt ? new Date(b.dueAt) : null;
                    if (!aDate && !bDate) return 0;
                    if (!aDate) return 1;
                    if (!bDate) return -1;
                    return aDate.getTime() - bDate.getTime();
                });

            queueMicrotask(() => {
                if (isStudentRole) {
                    setTopicAssignments(allAssignments.filter((assignment: any) => assignment.visibleToStudents !== false));
                    setAssignmentsFeedback('');
                    return;
                }

                setTopicAssignments(allAssignments);
                setAssignmentsFeedback('');
            });

            return undefined;
        }

        queueMicrotask(() => {
            setAssignmentsFeedback('');
        });

        const assignmentsRef = query(
            collection(db, 'topicAssignments'),
            where('topicId', '==', logic.topicId)
        );

        const unsubscribe = onSnapshot(assignmentsRef, (snapshot: any) => {
            const allAssignments = snapshot.docs
                .map((assignmentDoc: any) => ({ id: assignmentDoc.id, ...assignmentDoc.data() }))
                .sort((a, b: any) => {
                    const aDate = a?.dueAt?.toDate ? a.dueAt.toDate() : a?.dueAt ? new Date(a.dueAt) : null;
                    const bDate = b?.dueAt?.toDate ? b.dueAt.toDate() : b?.dueAt ? new Date(b.dueAt) : null;
                    if (!aDate && !bDate) return 0;
                    if (!aDate) return 1;
                    if (!bDate) return -1;
                    return aDate - bDate;
                });

            if (isStudentRole) {
                setTopicAssignments(allAssignments.filter((assignment) => assignment.visibleToStudents !== false));
                setAssignmentsFeedback('');
                return;
            }

            setTopicAssignments(allAssignments);
            setAssignmentsFeedback('');
        }, (error: any) => {
            if (error?.code === 'permission-denied') {
                setTopicAssignments([]);
                setAssignmentsFeedback('');
                return;
            }
            console.error('[TOPIC_ASSIGNMENTS] Firestore error:', error);
            setTopicAssignments([]);
            setAssignmentsFeedback('No se pudieron sincronizar las tareas del tema.');
        });

        return () => unsubscribe();
    }, [logic.subjectId, logic.topicId, isStudentRole, isPreviewMockMode]);

    const quizAnalyticsByQuiz = useMemo(() => {
        const byQuiz: any = {};
        const scoreReviewMap: any = {};

        const excludedTeacherIds = new Set();
        if (!isStudentView) {
            if (user?.uid) excludedTeacherIds.add(user.uid);
            if (logic.subject?.ownerId) excludedTeacherIds.add(logic.subject.ownerId);
            if (Array.isArray(logic.subject?.editorUids)) {
                logic.subject.editorUids.forEach((uid) => excludedTeacherIds.add(uid));
            }
        }

        quizScoreReviews.forEach((review: any) => {
            if (!review?.quizId || !review?.userId) return;
            scoreReviewMap[`${review.quizId}:${review.userId}`] = Number(review.overrideScore);
        });

        const studentMembers = classMembers.filter((member) => member.role === 'viewer');
        const studentMemberMap = new Map(studentMembers.map((member) => [member.uid, member]));
        const allowedStudentIds = new Set(studentMembers.map((member) => member.uid));

        const groupedByQuizUser: any = {};
        quizResults.forEach((result: any) => {
            if (!result?.quizId || !result?.userId) return;
            if (!isStudentView && excludedTeacherIds.has(result.userId)) return;
            if (allowedStudentIds.size > 0 && !allowedStudentIds.has(result.userId)) return;

            const key = `${result.quizId}:${result.userId}`;
            const overrideScore = scoreReviewMap[key];
            const effectiveScore = overrideScore === undefined || overrideScore === null
                ? Number(result.score)
                : Number(overrideScore);

            groupedByQuizUser[key] = {
                ...result,
                overrideScore: overrideScore === undefined || overrideScore === null ? null : Number(overrideScore),
                effectiveScore: Number.isNaN(effectiveScore) ? null : effectiveScore
            };
        });

        const quizIds = new Set([
            ...(logic.topic?.quizzes || []).map((quiz) => quiz.id),
            ...quizResults.map((result) => result.quizId).filter(Boolean)
        ]);

        quizIds.forEach((quizId: any) => {
            const rowsFromMembers = studentMembers.map((member: any) => {
                const result = groupedByQuizUser[`${quizId}:${member.uid}`] || null;
                return {
                    userId: member.uid,
                    userName: member.name || member.email || 'Alumno',
                    userEmail: member.email || '',
                    photoURL: member.photoURL || null,
                    score: result?.effectiveScore ?? null,
                    rawScore: result?.score ?? null,
                    overrideScore: result?.overrideScore ?? null,
                    completedAt: result?.completedAt || null,
                    hasResult: Boolean(result)
                };
            });

            const extraRows: any[] = [];
            Object.values(groupedByQuizUser).forEach((result: any) => {
                if (result.quizId !== quizId) return;
                if (studentMemberMap.has(result.userId)) return;

                extraRows.push({
                    userId: result.userId,
                    userName: result.userName || result.userEmail || 'Alumno',
                    userEmail: result.userEmail || '',
                    photoURL: null,
                    score: result.effectiveScore,
                    rawScore: result.score ?? null,
                    overrideScore: result.overrideScore ?? null,
                    completedAt: result.completedAt || null,
                    hasResult: true
                });
            });

            const rows = [...rowsFromMembers, ...extraRows].sort((a, b: any) => {
                if (a.hasResult && !b.hasResult) return -1;
                if (!a.hasResult && b.hasResult) return 1;
                return String(a.userName || '').localeCompare(String(b.userName || ''), 'es');
            });

            const scoredRows = rows.filter((row) => row.score !== null && row.score !== undefined);
            const averageScore = scoredRows.length > 0
                ? Number((scoredRows.reduce((sum, row) => sum + Number(row.score), 0) / scoredRows.length).toFixed(1))
                : null;

            byQuiz[quizId] = {
                averageScore,
                participants: scoredRows.length,
                students: rows
            };
        });

        return byQuiz;
    }, [logic.topic?.quizzes, quizResults, quizScoreReviews, classMembers, isStudentView, user, logic.subject]);

    const handleSaveQuizScoreOverride = async ({ quizId, userId, overrideScore }: any) => {
        if (!logic.subjectId || !logic.topicId || !quizId || !userId || !user?.uid) return;

        const reviewId = `${logic.topicId}_${quizId}_${userId}`;
        const reviewRef = doc(db, 'topicQuizGradeReviews', reviewId);

        if (overrideScore === null || overrideScore === undefined || String(overrideScore).trim() === '') {
            await deleteDoc(reviewRef);
            return;
        }

        const numericScore = Number(overrideScore);
        if (Number.isNaN(numericScore)) return;
        const boundedScore = Math.max(0, Math.min(100, numericScore));

        const quizResultRef = doc(
            db,
            'subjects', logic.subjectId,
            'topics', logic.topicId,
            'quiz_results',
            `${quizId}_${userId}`
        );

        await setDoc(quizResultRef, {
            quizId,
            subjectId: logic.subjectId,
            topicId: logic.topicId,
            userId,
            score: boundedScore,
            reviewedBy: user.uid,
            reviewedAt: serverTimestamp()
        }, { merge: true });

        await setDoc(reviewRef, {
            subjectId: logic.subjectId,
            topicId: logic.topicId,
            quizId,
            userId,
            overrideScore: boundedScore,
            reviewedBy: user.uid,
            updatedAt: serverTimestamp()
        }, { merge: true });
    };

    // 4. MERGE DE DATOS
    const enrichedTopic = useMemo(() => {
        if (!logic.topic) return null;

        const studentScoreByQuiz = {};
        quizResults.forEach((result: any) => {
            if (!result?.quizId || result?.score === undefined || result?.score === null) return;
            studentScoreByQuiz[result.quizId] = Number(result.score);
        });

        return {
            ...logic.topic,
            pdfs: logic.topic.pdfs || [],
            uploads: logic.topic.uploads || [],
            quizzes: logic.topic.quizzes?.map(q => ({
                ...q,
                score: isStudentView
                    ? (studentScoreByQuiz[q.id] ?? null)
                    : (quizAnalyticsByQuiz[q.id]?.averageScore ?? null)
            })) || [],
            exams: logic.topic.exams || [],
            assignments: topicAssignments
        };
    }, [logic.topic, quizResults, topicAssignments, isStudentView, quizAnalyticsByQuiz]);

    // 5. PROGRESO
    const globalProgress = useMemo(() => {
        if (!enrichedTopic?.quizzes?.length) return { completed: 0, total: 0, percentage: 0 };
        const total = enrichedTopic.quizzes.length;
        const completed = enrichedTopic.quizzes.filter(q => q.score != null).length;
        return { completed, total, percentage: (completed / total) * 100 };
    }, [enrichedTopic]);

    const effectivePermissions = useMemo(() => {
        if (!previewAsStudent && !isBinReadOnlyView) return logic.permissions;
        return {
            ...logic.permissions,
            canEdit: false,
            canDelete: false,
            showEditUI: false,
            showDeleteUI: false,
            isViewer: true
        };
    }, [logic.permissions, previewAsStudent, isBinReadOnlyView]);

    if (!user || logic.loading || !logic.topic || !logic.subject) {
        return <TopicSkeleton />;
    }

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {isBinReadOnlyView && (
                    <div className="mb-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-300">
                        Vista de papelera en modo solo lectura. Puedes revisar contenido sin modificar recursos ni evaluaciones.
                    </div>
                )}

                {canUsePreview && (
                    <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {previewAsStudent ? (
                                <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                                <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            )}
                            <span>{previewAsStudent ? 'Modo Alumno activo (solo lectura temporal)' : 'Modo Profesor activo'}</span>
                        </div>
                        <button
                            onClick={() => setPreviewAsStudent((prev) => !prev)}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${previewAsStudent ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900'}`}
                        >
                            {previewAsStudent ? 'Salir modo alumno' : 'Activar modo alumno'}
                        </button>
                    </div>
                )}

                {topicRealtimeFeedback && (
                    <div className="mb-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{topicRealtimeFeedback}</span>
                    </div>
                )}

                <TopicHeader 
                    {...logic}
                    topic={enrichedTopic} 
                    subject={logic.subject}
                    globalProgress={globalProgress}
                    handleGenerateQuizSubmit={logic.handleGenerateQuizSubmit}
                    permissions={effectivePermissions}
                />
                <div className="mt-8">
                    <TopicTabs 
                        {...logic}
                        permissions={effectivePermissions}
                        topic={enrichedTopic}
                        user={user}
                    />
                </div>
                <div className="mt-8">
                    <TopicContent 
                        {...logic}
                        topic={enrichedTopic}
                        subject={logic.subject}
                        user={user}
                        failedQuestions={failedQuestions}
                        handleManualUpload={logic.handleManualUpload}
                        uploading={logic.uploading}
                        quizAnalyticsByQuiz={quizAnalyticsByQuiz}
                        onSaveQuizScoreOverride={handleSaveQuizScoreOverride}
                        permissions={effectivePermissions}
                    />
                </div>
            </main>

            {!previewAsStudent && !isBinReadOnlyView && (
                <CategorizFileModal
                    isOpen={logic.showCategorizationModal}
                    onClose={() => {
                        logic.setShowCategorizationModal(false);
                        logic.setPendingFiles([]);
                    }}
                    onSubmit={logic.handleFileCategorized}
                    fileName={logic.pendingFiles?.length === 1
                        ? (logic.pendingFiles[0]?.name || '')
                        : `${logic.pendingFiles?.length || 0} archivos seleccionados`}
                    isLoading={logic.categorizingFile}
                />
            )}

            {!isBinReadOnlyView && (
                <TopicModals 
                    {...logic}
                    topic={enrichedTopic}
                    subject={logic.subject}
                    handleGenerateQuizSubmit={logic.handleGenerateQuizSubmit}
                />
            )}
        </div>
        </AnimatedPage>
    );
};

export default Topic;