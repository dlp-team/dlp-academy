// src/pages/Subject/components/SubjectGradesPanel.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertCircle,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Lock,
    Percent,
    Plus,
    Save,
    Trash2,
    Unlock,
    User
} from 'lucide-react';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../../../firebase/config';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const DEFAULT_BLOCK_WEIGHTS = {
    mandatoryTestsWeight: 40,
    assignmentsWeight: 30,
    extrasWeight: 30
};

const getDiffToTarget = (total, target = 100) => Number((target - Number(total || 0)).toFixed(2));
const getEqualSplitWeight = (count: any) => (count > 0 ? Number((100 / count).toFixed(2)) : 0);

const SubjectGradesPanel = ({ user, subject, topics = [], classMembers = [] }: any) => {
    const [exams, setExams] = useState<any[]>([]);
    const [evaluationItems, setEvaluationItems] = useState<any[]>([]);
    const [evaluationGrades, setEvaluationGrades] = useState<any[]>([]);
    const [assignmentQuizzes, setAssignmentQuizzes] = useState<any[]>([]);
    const [assignmentReviews, setAssignmentReviews] = useState<any[]>([]);
    const [examReviews, setExamReviews] = useState<any[]>([]);
    const [quizScoreByQuizUser, setQuizScoreByQuizUser] = useState<any>({});
    const [examReviewDrafts, setExamReviewDrafts] = useState<any>({});
    const [reviewDrafts, setReviewDrafts] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [blockFeedback, setBlockFeedback] = useState({ type: '', message: '' });
    const [realtimeErrors, setRealtimeErrors] = useState<any>({});
    const [evaluationDeleteConfirm, setEvaluationDeleteConfirm] = useState({
        isOpen: false,
        itemId: null,
        itemTitle: ''
    });
    const [isDeletingEvaluation, setIsDeletingEvaluation] = useState(false);

    const [blockWeightsDraft, setBlockWeightsDraft] = useState(DEFAULT_BLOCK_WEIGHTS);

    const [newItem, setNewItem] = useState({
        title: '',
        category: 'Actividad extra',
        weight: '10',
        maxScore: '10'
    });

    const role = (user?.role || '').toLowerCase();
    const canManage = role !== 'student';

    // Stable key to avoid re-subscribing listeners when parent re-renders with same topics
    const topicsKey = useMemo(() => topics.map((t: any) => t.id).join(','), [topics]);
    const topicsRef = useRef(topics);
    useEffect(() => { topicsRef.current = topics; }, [topics]);

    const studentMembers = useMemo(
        () => classMembers.filter((member: any) => member.role === 'viewer'),
        [classMembers]
    );

    const targetStudents = useMemo(() => {
        if (canManage) return studentMembers;
        return [
            {
                uid: user?.uid,
                name: user?.name || user?.displayName || user?.email || 'Alumno',
                role: 'viewer'
            }
        ];
    }, [canManage, studentMembers, user]);

    useEffect(() => {
        setBlockWeightsDraft({
            mandatoryTestsWeight: clamp(Number(subject?.gradingConfig?.mandatoryTestsWeight ?? DEFAULT_BLOCK_WEIGHTS.mandatoryTestsWeight), 0, 100),
            assignmentsWeight: clamp(Number(subject?.gradingConfig?.assignmentsWeight ?? DEFAULT_BLOCK_WEIGHTS.assignmentsWeight), 0, 100),
            extrasWeight: clamp(Number(subject?.gradingConfig?.extrasWeight ?? DEFAULT_BLOCK_WEIGHTS.extrasWeight), 0, 100)
        });
    }, [subject?.gradingConfig]);

    useEffect(() => {
        setRealtimeErrors({});
    }, [subject?.id]);

    const blockWeights = useMemo(() => ({
        mandatoryTestsWeight: clamp(Number(subject?.gradingConfig?.mandatoryTestsWeight ?? DEFAULT_BLOCK_WEIGHTS.mandatoryTestsWeight), 0, 100),
        assignmentsWeight: clamp(Number(subject?.gradingConfig?.assignmentsWeight ?? DEFAULT_BLOCK_WEIGHTS.assignmentsWeight), 0, 100),
        extrasWeight: clamp(Number(subject?.gradingConfig?.extrasWeight ?? DEFAULT_BLOCK_WEIGHTS.extrasWeight), 0, 100)
    }), [subject?.gradingConfig]);

    const draftBlockWeightTotal = useMemo(
        () => Number((blockWeightsDraft.mandatoryTestsWeight + blockWeightsDraft.assignmentsWeight + blockWeightsDraft.extrasWeight).toFixed(2)),
        [blockWeightsDraft]
    );

    const draftBlockDiff = useMemo(
        () => getDiffToTarget(draftBlockWeightTotal, 100),
        [draftBlockWeightTotal]
    );

    const recommendedBlockExtras = useMemo(
        () => clamp(Number((100 - (blockWeightsDraft.mandatoryTestsWeight + blockWeightsDraft.assignmentsWeight)).toFixed(2)), 0, 100),
        [blockWeightsDraft.mandatoryTestsWeight, blockWeightsDraft.assignmentsWeight]
    );

    const blockWeightTotal = useMemo(
        () => Number((blockWeights.mandatoryTestsWeight + blockWeights.assignmentsWeight + blockWeights.extrasWeight).toFixed(2)),
        [blockWeights]
    );

    const mandatoryCustomWeightsEnabled = Boolean(subject?.gradingConfig?.mandatoryCustomWeightsEnabled);
    const assignmentCustomWeightsEnabled = Boolean(subject?.gradingConfig?.assignmentCustomWeightsEnabled);
    const extrasCustomWeightsEnabled = Boolean(subject?.gradingConfig?.extrasCustomWeightsEnabled);

    const assignmentsEqualWeight = useMemo(
        () => getEqualSplitWeight(assignmentQuizzes.length),
        [assignmentQuizzes.length]
    );

    const getAssignmentWeightForQuiz = useCallback((quiz: any) => {
        if (!assignmentCustomWeightsEnabled) return assignmentsEqualWeight;
        if (quiz.assignmentWeightLocked) return clamp(Number(quiz.assignmentWeight ?? 0), 0, 100);
        const lockedTotal = assignmentQuizzes
            .filter((q) => q.assignmentWeightLocked)
            .reduce((sum, q) => sum + clamp(Number(q.assignmentWeight ?? 0), 0, 100), 0);
        const unlockedCount = assignmentQuizzes.filter((q) => !q.assignmentWeightLocked).length;
        const remaining = Math.max(0, 100 - lockedTotal);
        return unlockedCount > 0 ? Number((remaining / unlockedCount).toFixed(2)) : 0;
    }, [assignmentCustomWeightsEnabled, assignmentsEqualWeight, assignmentQuizzes]);

    const extrasEqualWeight = useMemo(
        () => getEqualSplitWeight(evaluationItems.length),
        [evaluationItems.length]
    );

    const getExtrasWeightForItem = useCallback((item: any) => {
        if (!extrasCustomWeightsEnabled) return extrasEqualWeight;
        return clamp(Number(item.weight || 0), 0, 100);
    }, [extrasCustomWeightsEnabled, extrasEqualWeight]);

    const hasStrict100 = Math.abs(blockWeightTotal - 100) < 0.001;
    const realtimeFeedback = useMemo(() => String(Object.values(realtimeErrors)[0] || ''), [realtimeErrors]);

    useEffect(() => {
        if (!subject?.id) return undefined;

        const quizzesQuery = query(collection(db, 'quizzes'), where('subjectId', '==', subject.id));
        const unsubscribe = onSnapshot(quizzesQuery, (snapshot: any) => {
            setRealtimeErrors((prev: any) => {
                if (!prev.quizzes) return prev;
                const next = { ...prev };
                delete next.quizzes;
                return next;
            });
            const allQuizzes = snapshot.docs.map((quizDoc: any) => ({ id: quizDoc.id, ...quizDoc.data() }));
            // Tests and tareas are now managed in the same internal block.
            setAssignmentQuizzes(
                allQuizzes
                    .sort((a, b) => String(a.title || a.name || '').localeCompare(String(b.title || b.name || '')))
            );
        }, (error: any) => {
            console.error('Error listening to quizzes:', error);
            setRealtimeErrors((prev: any) => ({
                ...prev,
                quizzes: 'No se pudieron sincronizar las tareas y tests del panel de notas.'
            }));
            setAssignmentQuizzes([]);
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        if (!subject?.id) return undefined;

        const examsQuery = query(collection(db, 'exams'), where('subjectId', '==', subject.id));
        const unsubscribe = onSnapshot(examsQuery, (snapshot: any) => {
            setRealtimeErrors((prev: any) => {
                if (!prev.exams) return prev;
                const next = { ...prev };
                delete next.exams;
                return next;
            });
            const allExams = snapshot.docs.map((examDoc: any) => ({ id: examDoc.id, ...examDoc.data() }));
            setExams(
                allExams
                    .sort((a, b) => String(a.title || a.name || '').localeCompare(String(b.title || b.name || '')))
            );
        }, (error: any) => {
            console.error('Error listening to exams:', error);
            setRealtimeErrors((prev: any) => ({
                ...prev,
                exams: 'No se pudieron sincronizar los examenes del panel de notas.'
            }));
            setExams([]);
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        if (!subject?.id) return undefined;

        const reviewsQuery = query(
            collection(db, 'subjectAssignmentGradeReviews'),
            where('subjectId', '==', subject.id)
        );

        const unsubscribe = onSnapshot(reviewsQuery, (snapshot: any) => {
            setRealtimeErrors((prev: any) => {
                if (!prev.assignmentReviews) return prev;
                const next = { ...prev };
                delete next.assignmentReviews;
                return next;
            });
            setAssignmentReviews(snapshot.docs.map((reviewDoc: any) => ({ id: reviewDoc.id, ...reviewDoc.data() })));
        }, (error: any) => {
            console.error('Error listening to assignment grade reviews:', error);
            setRealtimeErrors((prev: any) => ({
                ...prev,
                assignmentReviews: 'No se pudieron sincronizar las revisiones de tareas del panel de notas.'
            }));
            setAssignmentReviews([]);
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        if (!subject?.id) return undefined;

        const examReviewsQuery = query(
            collection(db, 'subjectExamGradeReviews'),
            where('subjectId', '==', subject.id)
        );

        const unsubscribe = onSnapshot(examReviewsQuery, (snapshot: any) => {
            setRealtimeErrors((prev: any) => {
                if (!prev.examReviews) return prev;
                const next = { ...prev };
                delete next.examReviews;
                return next;
            });
            setExamReviews(snapshot.docs.map((reviewDoc: any) => ({ id: reviewDoc.id, ...reviewDoc.data() })));
        }, (error: any) => {
            console.error('Error listening to exam grade reviews:', error);
            setRealtimeErrors((prev: any) => ({
                ...prev,
                examReviews: 'No se pudieron sincronizar las revisiones de examenes del panel de notas.'
            }));
            setExamReviews([]);
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        if (!subject?.id) return undefined;

        const itemsQuery = query(
            collection(db, 'subjectEvaluationItems'),
            where('subjectId', '==', subject.id)
        );

        const unsubscribe = onSnapshot(itemsQuery, (snapshot: any) => {
            setRealtimeErrors((prev: any) => {
                if (!prev.evaluationItems) return prev;
                const next = { ...prev };
                delete next.evaluationItems;
                return next;
            });
            const items = snapshot.docs
                .map((itemDoc: any) => ({ id: itemDoc.id, ...itemDoc.data() }))
                .sort((a, b: any) => {
                    const aOrder = Number(a.order ?? 0);
                    const bOrder = Number(b.order ?? 0);
                    if (aOrder !== bOrder) return aOrder - bOrder;
                    return String(a.title || '').localeCompare(String(b.title || ''));
                });

            setEvaluationItems(items);
        }, (error: any) => {
            console.error('Error listening to evaluation items:', error);
            setRealtimeErrors((prev: any) => ({
                ...prev,
                evaluationItems: 'No se pudieron sincronizar las actividades extra del panel de notas.'
            }));
            setEvaluationItems([]);
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        if (!subject?.id) return undefined;

        const gradesQuery = query(
            collection(db, 'subjectEvaluationGrades'),
            where('subjectId', '==', subject.id)
        );

        const unsubscribe = onSnapshot(gradesQuery, (snapshot: any) => {
            setRealtimeErrors((prev: any) => {
                if (!prev.evaluationGrades) return prev;
                const next = { ...prev };
                delete next.evaluationGrades;
                return next;
            });
            setEvaluationGrades(snapshot.docs.map((gradeDoc: any) => ({ id: gradeDoc.id, ...gradeDoc.data() })));
        }, (error: any) => {
            console.error('Error listening to evaluation grades:', error);
            setRealtimeErrors((prev: any) => ({
                ...prev,
                evaluationGrades: 'No se pudieron sincronizar las notas de actividades extra.'
            }));
            setEvaluationGrades([]);
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        const currentTopics = topicsRef.current;
        if (!subject?.id || currentTopics.length === 0) {
            setQuizScoreByQuizUser({});
            setRealtimeErrors((prev: any) => {
                if (!prev.quizResults) return prev;
                const next = { ...prev };
                delete next.quizResults;
                return next;
            });
            return undefined;
        }

        const resultsByTopic = {};

        const recompute = () => {
            const scoreMap = {};
            Object.values(resultsByTopic)
                .flat()
                .forEach((result: any) => {
                    if (!result?.quizId || !result?.userId || result?.score === undefined || result?.score === null) return;
                    scoreMap[`${result.quizId}:${result.userId}`] = Number((Number(result.score) / 10).toFixed(1));
                });
            setQuizScoreByQuizUser(scoreMap);
        };

        const unsubscribers = currentTopics.map((topic: any) => {
            const resultsRef = collection(db, 'subjects', subject.id, 'topics', topic.id, 'quiz_results');
            const source = !canManage && user?.uid
                ? query(resultsRef, where('userId', '==', user.uid))
                : resultsRef;

            return onSnapshot(source, (snapshot: any) => {
                setRealtimeErrors((prev: any) => {
                    if (!prev.quizResults) return prev;
                    const next = { ...prev };
                    delete next.quizResults;
                    return next;
                });
                resultsByTopic[topic.id] = snapshot.docs.map((resultDoc) => resultDoc.data());
                recompute();
            }, (error: any) => {
                console.error('Error listening to quiz results for topic:', topic.id, error);
                setRealtimeErrors((prev: any) => ({
                    ...prev,
                    quizResults: 'No se pudieron sincronizar los resultados de tests del panel de notas.'
                }));
                resultsByTopic[topic.id] = [];
                recompute();
            });
        });

        return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    // topicsKey is the stable dep — only re-subscribes when topic IDs actually change
    }, [subject?.id, topicsKey, canManage, user?.uid]);

    const gradeDocByKey = useMemo(() => {
        const map = {};
        evaluationGrades.forEach((grade: any) => {
            map[`${grade.itemId}:${grade.userId}`] = grade;
        });
        return map;
    }, [evaluationGrades]);

    const assignmentReviewByKey = useMemo(() => {
        const map = {};
        assignmentReviews.forEach((review: any) => {
            map[`${review.quizId}:${review.userId}`] = review;
        });
        return map;
    }, [assignmentReviews]);

    const examReviewByKey = useMemo(() => {
        const map = {};
        examReviews.forEach((review: any) => {
            map[`${review.examId}:${review.userId}`] = review;
        });
        return map;
    }, [examReviews]);

    const getQuizDecimal = useCallback((quizId, userId: any) => {
        const value = quizScoreByQuizUser[`${quizId}:${userId}`];
        if (value === undefined || value === null) return null;
        return Number(value);
    }, [quizScoreByQuizUser]);

    const getAssignmentDecimal = useCallback((quizId, userId: any) => {
        const review = assignmentReviewByKey[`${quizId}:${userId}`];
        if (review?.overrideDecimal !== undefined && review?.overrideDecimal !== null) {
            return Number(review.overrideDecimal);
        }
        return getQuizDecimal(quizId, userId);
    }, [assignmentReviewByKey, getQuizDecimal]);

    const getExamDecimal = useCallback((examId, userId: any) => {
        const review = examReviewByKey[`${examId}:${userId}`];
        if (review?.overrideDecimal === undefined || review?.overrideDecimal === null) return null;
        return Number(review.overrideDecimal);
    }, [examReviewByKey]);

    const getGradeDecimal = useCallback((item, userId: any) => {
        const gradeDoc = gradeDocByKey[`${item.id}:${userId}`];
        if (!gradeDoc || gradeDoc.score === null || gradeDoc.score === undefined) return null;
        const maxScore = Number(item.maxScore || 10);
        if (maxScore <= 0) return null;
        return Number((((Number(gradeDoc.score) / maxScore) * 10)).toFixed(1));
    }, [gradeDocByKey]);

    const calculateSectionDecimal = useCallback((items, userId, scoreResolver, weightResolver: any) => {
        let weightedScore = 0;
        let relativeWeightSum = 0;

        items.forEach((item: any) => {
            const score = scoreResolver(item, userId);
            if (score === null || score === undefined) return;
            const relativeWeight = clamp(Number(weightResolver(item) || 0), 0, 100);
            if (relativeWeight <= 0) return;

            weightedScore += score * relativeWeight;
            relativeWeightSum += relativeWeight;
        });

        if (relativeWeightSum === 0) return null;
        return Number((weightedScore / relativeWeightSum).toFixed(2));
    }, []);

    const assignmentsInternalWeightTotal = useMemo(
        () => {
            if (assignmentQuizzes.length === 0) return 0;
            return Number(assignmentQuizzes.reduce((sum, quiz) => sum + getAssignmentWeightForQuiz(quiz), 0).toFixed(2));
        },
        [assignmentQuizzes, getAssignmentWeightForQuiz]
    );

    const assignmentsLockedTotal = useMemo(
        () => assignmentQuizzes.filter((q) => q.assignmentWeightLocked).reduce((sum, q) => sum + clamp(Number(q.assignmentWeight ?? 0), 0, 100), 0),
        [assignmentQuizzes]
    );

    const extrasInternalWeightTotal = useMemo(
        () => {
            if (evaluationItems.length === 0) return 0;
            return Number(evaluationItems.reduce((sum, item) => sum + getExtrasWeightForItem(item), 0).toFixed(2));
        },
        [evaluationItems, getExtrasWeightForItem]
    );

    const getExamsSectionDecimal = useCallback((userId) =>
        calculateSectionDecimal(
            exams,
            userId,
            (exam, uid) => getExamDecimal(exam.id, uid),
            () => 1
        ), [exams, calculateSectionDecimal, getExamDecimal]);

    const getAssignmentsSectionDecimal = useCallback((userId) =>
        calculateSectionDecimal(
            assignmentQuizzes,
            userId,
            (quiz, uid) => getAssignmentDecimal(quiz.id, uid),
            (quiz) => getAssignmentWeightForQuiz(quiz)
        ), [assignmentQuizzes, calculateSectionDecimal, getAssignmentDecimal, getAssignmentWeightForQuiz]);

    const getExtrasSectionDecimal = useCallback((userId) =>
        calculateSectionDecimal(
            evaluationItems,
            userId,
            (item, uid) => getGradeDecimal(item, uid),
            (item) => getExtrasWeightForItem(item)
        ), [evaluationItems, calculateSectionDecimal, getGradeDecimal, getExtrasWeightForItem]);

    const getFinalForUser = useCallback((userId: any) => {
        if (!hasStrict100) {
            return {
                final: null,
                coveredWeight: 0,
                examsDecimal: getExamsSectionDecimal(userId),
                assignmentsDecimal: getAssignmentsSectionDecimal(userId),
                extrasDecimal: getExtrasSectionDecimal(userId)
            };
        }

        const examsDecimal = getExamsSectionDecimal(userId);
        const assignmentsDecimal = getAssignmentsSectionDecimal(userId);
        const extrasDecimal = getExtrasSectionDecimal(userId);

        let weightedSum = 0;
        let coveredWeight = 0;

        if (examsDecimal !== null) {
            weightedSum += examsDecimal * (blockWeights.mandatoryTestsWeight / 100);
            coveredWeight += blockWeights.mandatoryTestsWeight;
        }

        if (assignmentsDecimal !== null) {
            weightedSum += assignmentsDecimal * (blockWeights.assignmentsWeight / 100);
            coveredWeight += blockWeights.assignmentsWeight;
        }

        if (extrasDecimal !== null) {
            weightedSum += extrasDecimal * (blockWeights.extrasWeight / 100);
            coveredWeight += blockWeights.extrasWeight;
        }

        if (coveredWeight === 0) {
            return { final: null, coveredWeight: 0, examsDecimal, assignmentsDecimal, extrasDecimal };
        }

        const normalizedFinal = weightedSum * (100 / coveredWeight);
        return {
            final: Number(normalizedFinal.toFixed(2)),
            coveredWeight,
            examsDecimal,
            assignmentsDecimal,
            extrasDecimal
        };
    }, [hasStrict100, blockWeights, getExamsSectionDecimal, getAssignmentsSectionDecimal, getExtrasSectionDecimal]);

    const studentFinalData = useMemo(() => {
        if (!user?.uid) return { final: null, coveredWeight: 0, examsDecimal: null, assignmentsDecimal: null, extrasDecimal: null };
        return getFinalForUser(user.uid);
    }, [
        user?.uid,
        getFinalForUser
    ]);

    const studentFinalBadge = useMemo(() => {
        if (studentFinalData.final === null) {
            return {
                label: hasStrict100 ? 'Sin datos' : 'Configurar 100%',
                className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            };
        }

        if (studentFinalData.final >= 8.5) {
            return {
                label: 'Sobresaliente',
                className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300'
            };
        }

        if (studentFinalData.final >= 6) {
            return {
                label: 'Aprobado',
                className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300'
            };
        }

        return {
            label: 'Necesita refuerzo',
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300'
        };
    }, [studentFinalData.final, hasStrict100]);

    const saveBlockWeights = async () => {
        setBlockFeedback({ type: '', message: '' });

        if (Math.abs(draftBlockWeightTotal - 100) > 0.001) {
            setBlockFeedback({
                type: 'error',
                message: `La suma de Examenes + Tareas y tests + Extras debe ser exactamente 100%. Sugerencia: deja Extras en ${recommendedBlockExtras.toFixed(2)}%.`
            });
            return;
        }

        await updateDoc(doc(db, 'subjects', subject.id), {
            gradingConfig: {
                ...(subject?.gradingConfig || {}),
                mandatoryTestsWeight: clamp(Number(blockWeightsDraft.mandatoryTestsWeight || 0), 0, 100),
                assignmentsWeight: clamp(Number(blockWeightsDraft.assignmentsWeight || 0), 0, 100),
                extrasWeight: clamp(Number(blockWeightsDraft.extrasWeight || 0), 0, 100),
                updatedAt: serverTimestamp(),
                updatedBy: user?.uid || null
            }
        });

        setBlockFeedback({ type: 'success', message: 'Ponderaciones de bloques guardadas.' });
    };

    const updateCustomMode = async (key, enabled: any) => {
        setBlockFeedback({ type: '', message: '' });
        await updateDoc(doc(db, 'subjects', subject.id), {
            gradingConfig: {
                ...(subject?.gradingConfig || {}),
                [key]: Boolean(enabled),
                updatedAt: serverTimestamp(),
                updatedBy: user?.uid || null
            }
        });
    };

    const updateQuizInternalWeight = async (quizId, patch, section: any) => {
        if (section === 'mandatory' && !mandatoryCustomWeightsEnabled) return;
        if (section === 'assignments' && !assignmentCustomWeightsEnabled) return;

        const lockField = section === 'mandatory' ? 'mandatoryWeightLocked' : 'assignmentWeightLocked';
        setBlockFeedback({ type: '', message: '' });
        await updateDoc(doc(db, 'quizzes', quizId), {
            ...patch,
            [lockField]: true,
            updatedAt: serverTimestamp()
        });
    };

    const unlockQuizWeight = async (quizId, section: any) => {
        const lockField = section === 'mandatory' ? 'mandatoryWeightLocked' : 'assignmentWeightLocked';
        await updateDoc(doc(db, 'quizzes', quizId), {
            [lockField]: false,
            updatedAt: serverTimestamp()
        });
    };

    const createEvaluationItem = async () => {
        if (!newItem.title.trim() || !subject?.id) return;

        setSaving(true);
        try {
            await addDoc(collection(db, 'subjectEvaluationItems'), {
                subjectId: subject.id,
                title: newItem.title.trim(),
                category: newItem.category.trim() || 'Evaluacion',
                weight: clamp(Number(newItem.weight || 0), 0, 100),
                maxScore: Math.max(1, Number(newItem.maxScore || 10)),
                order: evaluationItems.length + 1,
                institutionId: subject?.institutionId || user?.institutionId || null,
                createdBy: user?.uid || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setNewItem({
                title: '',
                category: 'Actividad extra',
                weight: '10',
                maxScore: '10'
            });
        } finally {
            setSaving(false);
        }
    };

    const updateEvaluationItem = async (itemId, patch: any) => {
        setBlockFeedback({ type: '', message: '' });
        await updateDoc(doc(db, 'subjectEvaluationItems', itemId), {
            ...patch,
            updatedAt: serverTimestamp()
        });
    };

    const requestDeleteEvaluationItem = (item: any) => {
        if (!item?.id) return;

        setEvaluationDeleteConfirm({
            isOpen: true,
            itemId: item.id,
            itemTitle: item.title || 'Actividad extra'
        });
    };

    const closeEvaluationDeleteConfirm = () => {
        if (isDeletingEvaluation) return;

        setEvaluationDeleteConfirm({
            isOpen: false,
            itemId: null,
            itemTitle: ''
        });
    };

    const confirmDeleteEvaluationItem = async () => {
        if (!subject?.id || !evaluationDeleteConfirm.itemId || isDeletingEvaluation) return;

        setIsDeletingEvaluation(true);

        const relatedGradesQuery = query(
            collection(db, 'subjectEvaluationGrades'),
            where('subjectId', '==', subject.id),
            where('itemId', '==', evaluationDeleteConfirm.itemId)
        );

        try {
            const relatedGradesSnapshot = await getDocs(relatedGradesQuery);
            const batch = writeBatch(db);

            relatedGradesSnapshot.docs.forEach((gradeDoc: any) => {
                batch.delete(doc(db, 'subjectEvaluationGrades', gradeDoc.id));
            });

            batch.delete(doc(db, 'subjectEvaluationItems', evaluationDeleteConfirm.itemId));
            await batch.commit();
        } finally {
            setIsDeletingEvaluation(false);
            setEvaluationDeleteConfirm({
                isOpen: false,
                itemId: null,
                itemTitle: ''
            });
        }
    };

    const saveStudentGrade = async (item, studentUid, rawValue: any) => {
        const existingDoc = evaluationGrades.find((grade) => grade.itemId === item.id && grade.userId === studentUid);

        const trimmed = String(rawValue ?? '').trim();
        if (!trimmed) {
            if (existingDoc?.id) {
                await deleteDoc(doc(db, 'subjectEvaluationGrades', existingDoc.id));
            }
            return;
        }

        const parsed = Number(trimmed);
        if (Number.isNaN(parsed)) return;

        const bounded = clamp(parsed, 0, Number(item.maxScore || 10));
        const payload = {
            subjectId: subject.id,
            itemId: item.id,
            userId: studentUid,
            score: bounded,
            updatedAt: serverTimestamp(),
            updatedBy: user?.uid || null
        };

        if (existingDoc?.id) {
            await updateDoc(doc(db, 'subjectEvaluationGrades', existingDoc.id), payload);
            return;
        }

        await addDoc(collection(db, 'subjectEvaluationGrades'), {
            ...payload,
            createdAt: serverTimestamp()
        });
    };

    const saveAssignmentReview = async (quiz, studentUid, rawValue: any) => {
        const key = `${quiz.id}:${studentUid}`;
        const existingDoc = assignmentReviewByKey[key];
        const trimmed = String(rawValue ?? '').trim();

        if (!trimmed) {
            if (existingDoc?.id) {
                await deleteDoc(doc(db, 'subjectAssignmentGradeReviews', existingDoc.id));
            }
            return;
        }

        const parsed = Number(trimmed);
        if (Number.isNaN(parsed)) return;

        const bounded = clamp(parsed, 0, 10);
        const payload = {
            subjectId: subject.id,
            quizId: quiz.id,
            userId: studentUid,
            overrideDecimal: bounded,
            reviewedBy: user?.uid || null,
            updatedAt: serverTimestamp()
        };

        if (existingDoc?.id) {
            await updateDoc(doc(db, 'subjectAssignmentGradeReviews', existingDoc.id), payload);
            return;
        }

        await addDoc(collection(db, 'subjectAssignmentGradeReviews'), {
            ...payload,
            createdAt: serverTimestamp()
        });
    };

    const saveExamReview = async (exam, studentUid, rawValue: any) => {
        const key = `${exam.id}:${studentUid}`;
        const existingDoc = examReviewByKey[key];
        const trimmed = String(rawValue ?? '').trim();

        if (!trimmed) {
            if (existingDoc?.id) {
                await deleteDoc(doc(db, 'subjectExamGradeReviews', existingDoc.id));
            }
            return;
        }

        const parsed = Number(trimmed);
        if (Number.isNaN(parsed)) return;

        const bounded = clamp(parsed, 0, 10);
        const payload = {
            subjectId: subject.id,
            examId: exam.id,
            userId: studentUid,
            overrideDecimal: bounded,
            reviewedBy: user?.uid || null,
            updatedAt: serverTimestamp()
        };

        if (existingDoc?.id) {
            await updateDoc(doc(db, 'subjectExamGradeReviews', existingDoc.id), payload);
            return;
        }

        await addDoc(collection(db, 'subjectExamGradeReviews'), {
            ...payload,
            createdAt: serverTimestamp()
        });
    };

    const studentView = (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2">Notas</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Resumen por bloques</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Examenes, tareas con tests y actividades extra.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-right min-w-[10rem]">
                        <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Nota actual</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">
                            {studentFinalData.final !== null ? studentFinalData.final.toFixed(2) : '--'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Cobertura {studentFinalData.coveredWeight.toFixed(0)}%
                        </p>
                        <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${studentFinalBadge.className}`}>
                            {studentFinalBadge.label}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                                <th className="py-3 pr-3 font-bold text-slate-500 dark:text-slate-400">Bloque</th>
                                <th className="py-3 pr-3 font-bold text-slate-500 dark:text-slate-400">Ponderacion</th>
                                <th className="py-3 pr-3 font-bold text-slate-500 dark:text-slate-400">Nota (decimal)</th>
                                <th className="py-3 font-bold text-slate-500 dark:text-slate-400">Aporte</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-50 dark:border-slate-800/70">
                                <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-slate-200">Examenes</td>
                                <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{blockWeights.mandatoryTestsWeight}%</td>
                                <td className="py-3 pr-3 text-slate-800 dark:text-slate-200 font-bold">{studentFinalData.examsDecimal !== null ? studentFinalData.examsDecimal.toFixed(2) : '--'}</td>
                                <td className="py-3 text-slate-700 dark:text-slate-300 font-semibold">
                                    {studentFinalData.examsDecimal !== null ? ((studentFinalData.examsDecimal * blockWeights.mandatoryTestsWeight) / 100).toFixed(2) : '--'}
                                </td>
                            </tr>
                            <tr className="border-b border-slate-50 dark:border-slate-800/70">
                                <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-slate-200">Tareas y tests</td>
                                <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{blockWeights.assignmentsWeight}%</td>
                                <td className="py-3 pr-3 text-slate-800 dark:text-slate-200 font-bold">{studentFinalData.assignmentsDecimal !== null ? studentFinalData.assignmentsDecimal.toFixed(2) : '--'}</td>
                                <td className="py-3 text-slate-700 dark:text-slate-300 font-semibold">
                                    {studentFinalData.assignmentsDecimal !== null ? ((studentFinalData.assignmentsDecimal * blockWeights.assignmentsWeight) / 100).toFixed(2) : '--'}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-slate-200">Extras</td>
                                <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{blockWeights.extrasWeight}%</td>
                                <td className="py-3 pr-3 text-slate-800 dark:text-slate-200 font-bold">{studentFinalData.extrasDecimal !== null ? studentFinalData.extrasDecimal.toFixed(2) : '--'}</td>
                                <td className="py-3 text-slate-700 dark:text-slate-300 font-semibold">
                                    {studentFinalData.extrasDecimal !== null ? ((studentFinalData.extrasDecimal * blockWeights.extrasWeight) / 100).toFixed(2) : '--'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {!hasStrict100 && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4" />
                        El sistema de notas no esta configurado al 100%. Pide al profesor ajustar las ponderaciones.
                    </div>
                )}
            </div>
        </div>
    );

    const managerView = (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2">Configuracion</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Bloques de nota (100% obligatorio)</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Divide la nota en examenes, tareas con tests y extras.</p>
                    </div>
                    <div className={`rounded-2xl px-4 py-3 border ${
                        Math.abs(draftBlockWeightTotal - 100) > 0.001
                            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
                    }`}>
                        <p className="text-[11px] uppercase tracking-[0.16em] font-bold">Total bloques</p>
                        <p className="text-2xl font-black">{draftBlockWeightTotal.toFixed(0)}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 block">
                        <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Examenes</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={blockWeightsDraft.mandatoryTestsWeight}
                            onChange={(event) => setBlockWeightsDraft((prev: any) => ({ ...prev, mandatoryTestsWeight: clamp(Number(event.target.value || 0), 0, 100) }))}
                            className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        />
                    </label>
                    <label className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 block">
                        <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Tareas + tests</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={blockWeightsDraft.assignmentsWeight}
                            onChange={(event) => setBlockWeightsDraft((prev: any) => ({ ...prev, assignmentsWeight: clamp(Number(event.target.value || 0), 0, 100) }))}
                            className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        />
                    </label>
                    <label className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 block">
                        <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Extras</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={blockWeightsDraft.extrasWeight}
                            onChange={(event) => setBlockWeightsDraft((prev: any) => ({ ...prev, extrasWeight: clamp(Number(event.target.value || 0), 0, 100) }))}
                            className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        />
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">No se puede operar correctamente si no suma exactamente 100%.</p>
                    <button
                        onClick={saveBlockWeights}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold"
                    >
                        <Save className="w-4 h-4" /> Guardar bloques
                    </button>
                </div>

                {Math.abs(draftBlockWeightTotal - 100) > 0.001 && (
                    <div className="mt-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                        {draftBlockDiff > 0
                            ? `Faltan ${draftBlockDiff.toFixed(2)}%. Recomendado: ajusta Extras a ${recommendedBlockExtras.toFixed(2)}%.`
                            : `Te pasas por ${Math.abs(draftBlockDiff).toFixed(2)}%. Recomendado: ajusta Extras a ${recommendedBlockExtras.toFixed(2)}%.`}
                    </div>
                )}

                {blockFeedback.message && (
                    <div className={`mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${blockFeedback.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'}`}>
                        {blockFeedback.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {blockFeedback.message}
                    </div>
                )}
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Examenes</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Los examenes se califican de forma manual (0-10) en la tabla por estudiante.</p>
                <div className="space-y-3">
                    {exams.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">No hay examenes creados.</div>
                    )}
                    {exams.map((exam: any) => (
                        <div key={exam.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between gap-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{exam.title || exam.name || 'Examen'}</p>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{Array.isArray(exam.questions) ? exam.questions.length : 0} preguntas</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Ponderacion interna de tareas entregables y tests (referencia 100%)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Aqui decides cuanto pesa cada tarea o test dentro del mismo bloque.</p>
                <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Pesos de tareas y tests
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${!assignmentCustomWeightsEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>Automatico</span>
                        <button
                            type="button"
                            onClick={() => updateCustomMode('assignmentCustomWeightsEnabled', !assignmentCustomWeightsEnabled)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${assignmentCustomWeightsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${assignmentCustomWeightsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-xs font-bold ${assignmentCustomWeightsEnabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>Manual</span>
                    </div>
                </div>
                <div className="text-sm font-semibold mb-3 text-slate-600 dark:text-slate-300">
                    Total interno: {assignmentsInternalWeightTotal.toFixed(0)}%
                </div>
                {assignmentCustomWeightsEnabled && assignmentsLockedTotal > 100 && (
                    <div className="mb-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                        Los pesos bloqueados suman {assignmentsLockedTotal.toFixed(0)}% (superan el 100%). Desbloquea o reduce algun peso.
                    </div>
                )}
                <div className="space-y-3">
                    {assignmentQuizzes.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">No hay tareas ni tests.</div>
                    )}
                    {assignmentQuizzes.map((quiz: any) => {
                        const isLocked = assignmentCustomWeightsEnabled && quiz.assignmentWeightLocked;
                        const effectiveWeight = getAssignmentWeightForQuiz(quiz);
                        return (
                            <div key={quiz.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-indigo-500" /> {quiz.title || quiz.name || 'Tarea'}</p>
                                {assignmentCustomWeightsEnabled && (
                                    <button
                                        onClick={() => isLocked ? unlockQuizWeight(quiz.id, 'assignments') : null}
                                        className={`p-2 rounded-lg transition-colors ${isLocked ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30' : 'text-slate-400 dark:text-slate-500'}`}
                                        title={isLocked ? 'Desbloquear (volver a distribucion automatica)' : 'Automatico'}
                                    >
                                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    </button>
                                )}
                                <div className="relative">
                                    {assignmentCustomWeightsEnabled && !isLocked ? (
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            key={`assignment-${quiz.id}-auto`}
                                            defaultValue={effectiveWeight.toFixed(1)}
                                            onBlur={(event) => updateQuizInternalWeight(quiz.id, { assignmentWeight: clamp(Number(event.target.value || 0), 0, 100) }, 'assignments')}
                                            className="w-28 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            key={`assignment-${quiz.id}-${isLocked ? 'locked' : 'equal'}`}
                                            defaultValue={isLocked ? clamp(Number(quiz.assignmentWeight ?? 0), 0, 100) : effectiveWeight.toFixed(1)}
                                            onBlur={isLocked ? (event) => updateQuizInternalWeight(quiz.id, { assignmentWeight: clamp(Number(event.target.value || 0), 0, 100) }, 'assignments') : undefined}
                                            readOnly={!isLocked}
                                            disabled={!assignmentCustomWeightsEnabled}
                                            className="w-28 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold disabled:opacity-70"
                                        />
                                    )}
                                    <Percent className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Anadir actividad extra</h4>
                <div className={`grid grid-cols-1 ${extrasCustomWeightsEnabled ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-3`}>
                    <input
                        type="text"
                        value={newItem.title}
                        onChange={(event) => setNewItem((prev: any) => ({ ...prev, title: event.target.value }))}
                        placeholder="Ej: Exposicion oral"
                        className="md:col-span-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                    />
                    <input
                        type="text"
                        value={newItem.category}
                        onChange={(event) => setNewItem((prev: any) => ({ ...prev, category: event.target.value }))}
                        placeholder="Categoria"
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                    />
                    {extrasCustomWeightsEnabled && (
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={newItem.weight}
                            onChange={(event) => setNewItem((prev: any) => ({ ...prev, weight: event.target.value }))}
                            placeholder="Peso interno %"
                            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                        />
                    )}
                    <input
                        type="number"
                        min="1"
                        value={newItem.maxScore}
                        onChange={(event) => setNewItem((prev: any) => ({ ...prev, maxScore: event.target.value }))}
                        placeholder="Nota maxima"
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={createEvaluationItem}
                        disabled={saving || !newItem.title.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" /> Anadir actividad
                    </button>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Extras activos</h4>
                <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Pesos de actividades extra
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${!extrasCustomWeightsEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>Automatico</span>
                        <button
                            type="button"
                            onClick={() => updateCustomMode('extrasCustomWeightsEnabled', !extrasCustomWeightsEnabled)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${extrasCustomWeightsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${extrasCustomWeightsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-xs font-bold ${extrasCustomWeightsEnabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>Manual</span>
                    </div>
                </div>
                <div className="text-sm font-semibold mb-3 text-slate-600 dark:text-slate-300">
                    Total interno: {extrasInternalWeightTotal.toFixed(0)}%
                </div>
                <div className="space-y-3">
                    {evaluationItems.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">Aun no has creado actividades extra.</div>
                    )}
                    {evaluationItems.map((item: any) => {
                        const effectiveWeight = getExtrasWeightForItem(item);
                        return (
                            <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        key={`extra-${item.id}-${extrasCustomWeightsEnabled ? 'manual' : 'auto'}`}
                                        defaultValue={extrasCustomWeightsEnabled ? item.weight : effectiveWeight.toFixed(1)}
                                        onBlur={extrasCustomWeightsEnabled ? (event) => updateEvaluationItem(item.id, { weight: clamp(Number(event.target.value || 0), 0, 100) }) : undefined}
                                        readOnly={!extrasCustomWeightsEnabled}
                                        disabled={!extrasCustomWeightsEnabled}
                                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold w-full md:w-28 disabled:opacity-70"
                                        title="Peso interno %"
                                    />
                                    <Percent className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    defaultValue={item.maxScore || 10}
                                    onBlur={(event) => updateEvaluationItem(item.id, { maxScore: Math.max(1, Number(event.target.value || 10)) })}
                                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold w-full md:w-28"
                                    title="Nota maxima"
                                />
                                <button
                                    onClick={() => requestDeleteEvaluationItem(item)}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-semibold"
                                >
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Registro por estudiante (bloques + revision de tareas)</h4>

                {targetStudents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-5 text-sm text-slate-500 dark:text-slate-400">
                        No hay estudiantes disponibles para calificar.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[64rem] text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="py-3 pr-3 text-left font-bold text-slate-500 dark:text-slate-400">Alumno</th>
                                    <th className="py-3 pr-3 text-left font-bold text-slate-500 dark:text-slate-400">Examenes</th>
                                    <th className="py-3 pr-3 text-left font-bold text-slate-500 dark:text-slate-400">Tareas y tests</th>
                                    <th className="py-3 pr-3 text-left font-bold text-slate-500 dark:text-slate-400">Extras</th>
                                    <th className="py-3 text-left font-bold text-slate-500 dark:text-slate-400">Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                {targetStudents.map((student: any) => {
                                    const finalData = getFinalForUser(student.uid);
                                    return (
                                        <tr key={student.uid} className="border-b border-slate-50 dark:border-slate-800/70 align-top">
                                            <td className="py-3 pr-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-3">
                                                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                                                    {finalData.examsDecimal !== null ? finalData.examsDecimal.toFixed(2) : '--'}
                                                </div>
                                                <div className="space-y-1">
                                                    {exams.map((exam: any) => {
                                                        const key = `${exam.id}:${student.uid}`;
                                                        const reviewDoc = examReviewByKey[key];
                                                        const draftValue = examReviewDrafts[key] ?? (reviewDoc?.overrideDecimal ?? '');
                                                        return (
                                                            <div key={key} className="flex items-center gap-1">
                                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 w-24 truncate">{exam.title || exam.name || 'Examen'}</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="10"
                                                                    step="0.1"
                                                                    value={draftValue}
                                                                    onChange={(event) => setExamReviewDrafts((prev: any) => ({ ...prev, [key]: event.target.value }))}
                                                                    className="w-16 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                                                                    title="Revision manual examen"
                                                                />
                                                                <button
                                                                    onClick={() => saveExamReview(exam, student.uid, draftValue)}
                                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/25 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
                                                                    title="Guardar revision examen"
                                                                >
                                                                    <Save className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-3">
                                                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                                                    {finalData.assignmentsDecimal !== null ? finalData.assignmentsDecimal.toFixed(2) : '--'}
                                                </div>
                                                <div className="space-y-1">
                                                    {assignmentQuizzes.map((quiz: any) => {
                                                        const key = `${quiz.id}:${student.uid}`;
                                                        const reviewDoc = assignmentReviewByKey[key];
                                                        const draftValue = reviewDrafts[key] ?? (reviewDoc?.overrideDecimal ?? '');
                                                        const baseValue = getQuizDecimal(quiz.id, student.uid);
                                                        return (
                                                            <div key={key} className="flex items-center gap-1">
                                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 w-24 truncate">{quiz.title || quiz.name || 'Tarea'}</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="10"
                                                                    step="0.1"
                                                                    value={draftValue}
                                                                    onChange={(event) => setReviewDrafts((prev: any) => ({ ...prev, [key]: event.target.value }))}
                                                                    className="w-16 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                                                                    title="Revision manual"
                                                                />
                                                                <button
                                                                    onClick={() => saveAssignmentReview(quiz, student.uid, draftValue)}
                                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/25 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
                                                                    title="Guardar revision"
                                                                >
                                                                    <Save className="w-3 h-3" />
                                                                </button>
                                                                <span className="text-[10px] text-slate-400">Base {baseValue !== null ? baseValue.toFixed(1) : '--'}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-3">
                                                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                                                    {finalData.extrasDecimal !== null ? finalData.extrasDecimal.toFixed(2) : '--'}
                                                </div>
                                                <div className="space-y-1">
                                                    {evaluationItems.map((item: any) => {
                                                        const grade = gradeDocByKey[`${item.id}:${student.uid}`];
                                                        return (
                                                            <div key={`${item.id}-${student.uid}`} className="flex items-center gap-1">
                                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 w-24 truncate">{item.title}</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={Number(item.maxScore || 10)}
                                                                    defaultValue={grade?.score ?? ''}
                                                                    onBlur={(event) => saveStudentGrade(item, student.uid, event.target.value)}
                                                                    className="w-16 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                                                                    title={`Nota sobre ${item.maxScore || 10}`}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    <BarChart3 className="w-4 h-4 text-slate-500" />
                                                    <span className="font-black text-slate-800 dark:text-slate-200">
                                                        {finalData.final !== null ? finalData.final.toFixed(2) : '--'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!hasStrict100 && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4" />
                        El total de bloques no suma 100%. Corrigelo para habilitar un calculo final consistente.
                    </div>
                )}
            </div>

            {evaluationDeleteConfirm.isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/55"
                        onClick={closeEvaluationDeleteConfirm}
                    />
                    <div className="relative w-full max-w-md rounded-2xl border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900 shadow-xl p-5">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Eliminar actividad extra</h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Se eliminara "{evaluationDeleteConfirm.itemTitle || 'esta actividad'}" y sus notas asociadas. Esta accion no se puede deshacer.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeEvaluationDeleteConfirm}
                                disabled={isDeletingEvaluation}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-60"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteEvaluationItem}
                                disabled={isDeletingEvaluation}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-60"
                            >
                                {isDeletingEvaluation ? 'Eliminando...' : 'Eliminar actividad'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <section className="space-y-4">
            {realtimeFeedback && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    {realtimeFeedback}
                </div>
            )}
            {canManage ? managerView : studentView}
        </section>
    );
};

export default SubjectGradesPanel;
