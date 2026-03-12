// src/pages/Subject/components/SubjectGradesPanel.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertCircle,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Percent,
    Plus,
    Save,
    Trash2,
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
const getEqualSplitWeight = (count) => (count > 0 ? Number((100 / count).toFixed(2)) : 0);

const SubjectGradesPanel = ({ user, subject, topics = [], classMembers = [] }) => {
    const [evaluationItems, setEvaluationItems] = useState([]);
    const [evaluationGrades, setEvaluationGrades] = useState([]);
    const [mandatoryQuizzes, setMandatoryQuizzes] = useState([]);
    const [assignmentQuizzes, setAssignmentQuizzes] = useState([]);
    const [assignmentReviews, setAssignmentReviews] = useState([]);
    const [quizScoreByQuizUser, setQuizScoreByQuizUser] = useState({});
    const [reviewDrafts, setReviewDrafts] = useState({});
    const [saving, setSaving] = useState(false);
    const [blockFeedback, setBlockFeedback] = useState({ type: '', message: '' });

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
    const topicsKey = useMemo(() => topics.map((t) => t.id).join(','), [topics]);
    const topicsRef = useRef(topics);
    useEffect(() => { topicsRef.current = topics; }, [topics]);

    const studentMembers = useMemo(
        () => classMembers.filter((member) => member.role === 'viewer'),
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

    const mandatoryEqualWeight = useMemo(
        () => getEqualSplitWeight(mandatoryQuizzes.length),
        [mandatoryQuizzes.length]
    );

    const assignmentsEqualWeight = useMemo(
        () => getEqualSplitWeight(assignmentQuizzes.length),
        [assignmentQuizzes.length]
    );

    const getMandatoryWeightForQuiz = (quiz) => {
        if (!mandatoryCustomWeightsEnabled) return mandatoryEqualWeight;
        return clamp(Number(quiz?.mandatoryWeight ?? mandatoryEqualWeight), 0, 100);
    };

    const getAssignmentWeightForQuiz = (quiz) => {
        if (!assignmentCustomWeightsEnabled) return assignmentsEqualWeight;
        return clamp(Number(quiz?.assignmentWeight ?? assignmentsEqualWeight), 0, 100);
    };

    const hasStrict100 = Math.abs(blockWeightTotal - 100) < 0.001;

    useEffect(() => {
        if (!subject?.id) return undefined;

        const quizzesQuery = query(collection(db, 'quizzes'), where('subjectId', '==', subject.id));
        const unsubscribe = onSnapshot(quizzesQuery, (snapshot) => {
            const allQuizzes = snapshot.docs.map((quizDoc) => ({ id: quizDoc.id, ...quizDoc.data() }));
            setMandatoryQuizzes(
                allQuizzes
                    .filter((quiz) => !quiz.isAssignment)
                    .sort((a, b) => String(a.title || a.name || '').localeCompare(String(b.title || b.name || '')))
            );
            setAssignmentQuizzes(
                allQuizzes
                    .filter((quiz) => Boolean(quiz.isAssignment))
                    .sort((a, b) => String(a.title || a.name || '').localeCompare(String(b.title || b.name || '')))
            );
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        if (!subject?.id) return undefined;

        const reviewsQuery = query(
            collection(db, 'subjectAssignmentGradeReviews'),
            where('subjectId', '==', subject.id)
        );

        const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
            setAssignmentReviews(snapshot.docs.map((reviewDoc) => ({ id: reviewDoc.id, ...reviewDoc.data() })));
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        if (!subject?.id) return undefined;

        const itemsQuery = query(
            collection(db, 'subjectEvaluationItems'),
            where('subjectId', '==', subject.id)
        );

        const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
            const items = snapshot.docs
                .map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }))
                .sort((a, b) => {
                    const aOrder = Number(a.order ?? 0);
                    const bOrder = Number(b.order ?? 0);
                    if (aOrder !== bOrder) return aOrder - bOrder;
                    return String(a.title || '').localeCompare(String(b.title || ''));
                });

            setEvaluationItems(items);
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        if (!subject?.id) return undefined;

        const gradesQuery = query(
            collection(db, 'subjectEvaluationGrades'),
            where('subjectId', '==', subject.id)
        );

        const unsubscribe = onSnapshot(gradesQuery, (snapshot) => {
            setEvaluationGrades(snapshot.docs.map((gradeDoc) => ({ id: gradeDoc.id, ...gradeDoc.data() })));
        });

        return () => unsubscribe();
    }, [subject?.id]);

    useEffect(() => {
        const currentTopics = topicsRef.current;
        if (!subject?.id || currentTopics.length === 0) {
            setQuizScoreByQuizUser({});
            return undefined;
        }

        const resultsByTopic = {};

        const recompute = () => {
            const scoreMap = {};
            Object.values(resultsByTopic)
                .flat()
                .forEach((result) => {
                    if (!result?.quizId || !result?.userId || result?.score === undefined || result?.score === null) return;
                    scoreMap[`${result.quizId}:${result.userId}`] = Number((Number(result.score) / 10).toFixed(1));
                });
            setQuizScoreByQuizUser(scoreMap);
        };

        const unsubscribers = currentTopics.map((topic) => {
            const resultsRef = collection(db, 'subjects', subject.id, 'topics', topic.id, 'quiz_results');
            const source = !canManage && user?.uid
                ? query(resultsRef, where('userId', '==', user.uid))
                : resultsRef;

            return onSnapshot(source, (snapshot) => {
                resultsByTopic[topic.id] = snapshot.docs.map((resultDoc) => resultDoc.data());
                recompute();
            });
        });

        return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    // topicsKey is the stable dep — only re-subscribes when topic IDs actually change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subject?.id, topicsKey, canManage, user?.uid]);

    const gradeDocByKey = useMemo(() => {
        const map = {};
        evaluationGrades.forEach((grade) => {
            map[`${grade.itemId}:${grade.userId}`] = grade;
        });
        return map;
    }, [evaluationGrades]);

    const assignmentReviewByKey = useMemo(() => {
        const map = {};
        assignmentReviews.forEach((review) => {
            map[`${review.quizId}:${review.userId}`] = review;
        });
        return map;
    }, [assignmentReviews]);

    const getQuizDecimal = (quizId, userId) => {
        const value = quizScoreByQuizUser[`${quizId}:${userId}`];
        if (value === undefined || value === null) return null;
        return Number(value);
    };

    const getAssignmentDecimal = (quizId, userId) => {
        const review = assignmentReviewByKey[`${quizId}:${userId}`];
        if (review?.overrideDecimal !== undefined && review?.overrideDecimal !== null) {
            return Number(review.overrideDecimal);
        }
        return getQuizDecimal(quizId, userId);
    };

    const getGradeDecimal = (item, userId) => {
        const gradeDoc = gradeDocByKey[`${item.id}:${userId}`];
        if (!gradeDoc || gradeDoc.score === null || gradeDoc.score === undefined) return null;
        const maxScore = Number(item.maxScore || 10);
        if (maxScore <= 0) return null;
        return Number((((Number(gradeDoc.score) / maxScore) * 10)).toFixed(1));
    };

    const calculateSectionDecimal = (items, userId, scoreResolver, weightResolver) => {
        let weightedScore = 0;
        let relativeWeightSum = 0;

        items.forEach((item) => {
            const score = scoreResolver(item, userId);
            if (score === null || score === undefined) return;
            const relativeWeight = clamp(Number(weightResolver(item) || 0), 0, 100);
            if (relativeWeight <= 0) return;

            weightedScore += score * relativeWeight;
            relativeWeightSum += relativeWeight;
        });

        if (relativeWeightSum === 0) return null;
        return Number((weightedScore / relativeWeightSum).toFixed(2));
    };

    const mandatoryInternalWeightTotal = useMemo(
        () => {
            if (!mandatoryCustomWeightsEnabled) return mandatoryQuizzes.length > 0 ? 100 : 0;
            return Number(mandatoryQuizzes.reduce((sum, quiz) => sum + clamp(Number(quiz.mandatoryWeight ?? 0), 0, 100), 0).toFixed(2));
        },
        [mandatoryCustomWeightsEnabled, mandatoryQuizzes]
    );

    const mandatoryInternalDiff = useMemo(
        () => getDiffToTarget(mandatoryInternalWeightTotal, 100),
        [mandatoryInternalWeightTotal]
    );

    const assignmentsInternalWeightTotal = useMemo(
        () => {
            if (!assignmentCustomWeightsEnabled) return assignmentQuizzes.length > 0 ? 100 : 0;
            return Number(assignmentQuizzes.reduce((sum, quiz) => sum + clamp(Number(quiz.assignmentWeight ?? 0), 0, 100), 0).toFixed(2));
        },
        [assignmentCustomWeightsEnabled, assignmentQuizzes]
    );

    const assignmentsInternalDiff = useMemo(
        () => getDiffToTarget(assignmentsInternalWeightTotal, 100),
        [assignmentsInternalWeightTotal]
    );

    const extrasInternalWeightTotal = useMemo(
        () => Number(evaluationItems.reduce((sum, item) => sum + clamp(Number(item.weight || 0), 0, 100), 0).toFixed(2)),
        [evaluationItems]
    );

    const extrasInternalDiff = useMemo(
        () => getDiffToTarget(extrasInternalWeightTotal, 100),
        [extrasInternalWeightTotal]
    );

    const hasMandatoryInternal100 = !mandatoryCustomWeightsEnabled || Math.abs(mandatoryInternalWeightTotal - 100) < 0.001;
    const hasAssignmentsInternal100 = !assignmentCustomWeightsEnabled || Math.abs(assignmentsInternalWeightTotal - 100) < 0.001;
    const hasExtrasInternal100 = Math.abs(extrasInternalWeightTotal - 100) < 0.001;

    const getMandatorySectionDecimal = (userId) =>
        calculateSectionDecimal(
            mandatoryQuizzes,
            userId,
            (quiz, uid) => getQuizDecimal(quiz.id, uid),
            (quiz) => getMandatoryWeightForQuiz(quiz)
        );

    const getAssignmentsSectionDecimal = (userId) =>
        calculateSectionDecimal(
            assignmentQuizzes,
            userId,
            (quiz, uid) => getAssignmentDecimal(quiz.id, uid),
            (quiz) => getAssignmentWeightForQuiz(quiz)
        );

    const getExtrasSectionDecimal = (userId) =>
        calculateSectionDecimal(
            evaluationItems,
            userId,
            (item, uid) => getGradeDecimal(item, uid),
            (item) => Number(item.weight || 0)
        );

    const getFinalForUser = (userId) => {
        if (!hasStrict100) {
            return {
                final: null,
                coveredWeight: 0,
                mandatoryDecimal: getMandatorySectionDecimal(userId),
                assignmentsDecimal: getAssignmentsSectionDecimal(userId),
                extrasDecimal: getExtrasSectionDecimal(userId)
            };
        }

        const mandatoryDecimal = getMandatorySectionDecimal(userId);
        const assignmentsDecimal = getAssignmentsSectionDecimal(userId);
        const extrasDecimal = getExtrasSectionDecimal(userId);

        let weightedSum = 0;
        let coveredWeight = 0;

        if (mandatoryDecimal !== null) {
            weightedSum += mandatoryDecimal * (blockWeights.mandatoryTestsWeight / 100);
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
            return { final: null, coveredWeight: 0, mandatoryDecimal, assignmentsDecimal, extrasDecimal };
        }

        const normalizedFinal = weightedSum * (100 / coveredWeight);
        return {
            final: Number(normalizedFinal.toFixed(2)),
            coveredWeight,
            mandatoryDecimal,
            assignmentsDecimal,
            extrasDecimal
        };
    };

    const studentFinalData = useMemo(() => {
        if (!user?.uid) return { final: null, coveredWeight: 0, mandatoryDecimal: null, assignmentsDecimal: null, extrasDecimal: null };
        return getFinalForUser(user.uid);
    }, [
        user?.uid,
        hasStrict100,
        blockWeights,
        mandatoryQuizzes,
        assignmentQuizzes,
        evaluationItems,
        gradeDocByKey,
        assignmentReviewByKey,
        quizScoreByQuizUser
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
                message: `La suma de Tests obligatorios + Tareas entregables + Extras debe ser exactamente 100%. Sugerencia: deja Extras en ${recommendedBlockExtras.toFixed(2)}%.`
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

    const autoAssignMissingQuizWeights = async (quizzes, field) => {
        if (!subject?.id || quizzes.length === 0) return;

        const missingQuizzes = quizzes.filter((quiz) => quiz?.[field] === undefined || quiz?.[field] === null);
        if (missingQuizzes.length === 0) return;

        const fixedTotal = quizzes
            .filter((quiz) => !(quiz?.[field] === undefined || quiz?.[field] === null))
            .reduce((sum, quiz) => sum + clamp(Number(quiz[field] || 0), 0, 100), 0);

        const remaining = Number((100 - fixedTotal).toFixed(2));
        const distributed = remaining > 0 ? remaining / missingQuizzes.length : 0;
        const nextWeight = clamp(Number(distributed.toFixed(2)), 0, 100);

        await Promise.all(
            missingQuizzes.map((quiz) =>
                updateDoc(doc(db, 'quizzes', quiz.id), {
                    [field]: nextWeight,
                    ...(field === 'assignmentWeight' ? { countsForGrade: true } : {}),
                    updatedAt: serverTimestamp()
                })
            )
        );
    };

    const updateCustomMode = async (key, enabled) => {
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

    useEffect(() => {
        if (!canManage || !mandatoryCustomWeightsEnabled) return;
        autoAssignMissingQuizWeights(mandatoryQuizzes, 'mandatoryWeight');
    }, [canManage, mandatoryCustomWeightsEnabled, mandatoryQuizzes]);

    useEffect(() => {
        if (!canManage || !assignmentCustomWeightsEnabled) return;
        autoAssignMissingQuizWeights(assignmentQuizzes, 'assignmentWeight');
    }, [canManage, assignmentCustomWeightsEnabled, assignmentQuizzes]);

    const updateQuizInternalWeight = async (quizId, patch, section) => {
        const nextValue = clamp(Number(patch?.mandatoryWeight ?? patch?.assignmentWeight ?? 0), 0, 100);
        let nextTotal = 0;

        if (section === 'mandatory') {
            if (!mandatoryCustomWeightsEnabled) return;
            const targetQuiz = mandatoryQuizzes.find((quiz) => quiz.id === quizId);
            if (!targetQuiz) return;
            nextTotal = mandatoryInternalWeightTotal - clamp(Number(targetQuiz.mandatoryWeight ?? 0), 0, 100) + nextValue;
            if (Math.abs(nextTotal - 100) > 0.001) {
                setBlockFeedback({
                    type: 'error',
                    message: 'No se puede guardar: la suma interna de Tests obligatorios debe ser exactamente 100%.'
                });
                return;
            }
        }

        if (section === 'assignments') {
            if (!assignmentCustomWeightsEnabled) return;
            const targetQuiz = assignmentQuizzes.find((quiz) => quiz.id === quizId);
            if (!targetQuiz) return;
            nextTotal = assignmentsInternalWeightTotal - clamp(Number(targetQuiz.assignmentWeight ?? 0), 0, 100) + nextValue;
            if (Math.abs(nextTotal - 100) > 0.001) {
                setBlockFeedback({
                    type: 'error',
                    message: 'No se puede guardar: la suma interna de Tareas entregables debe ser exactamente 100%.'
                });
                return;
            }
        }

        setBlockFeedback({ type: '', message: '' });
        await updateDoc(doc(db, 'quizzes', quizId), {
            ...patch,
            updatedAt: serverTimestamp()
        });
    };

    const createEvaluationItem = async () => {
        if (!newItem.title.trim() || !subject?.id) return;

        const nextTotal = extrasInternalWeightTotal + clamp(Number(newItem.weight || 0), 0, 100);
        if (Math.abs(nextTotal - 100) > 0.001) {
            setBlockFeedback({
                type: 'error',
                message: 'No se puede guardar: al crear un extra, la suma interna de Extras debe quedar en 100% exacto.'
            });
            return;
        }

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

    const updateEvaluationItem = async (itemId, patch) => {
        if (patch?.weight !== undefined) {
            const targetItem = evaluationItems.find((item) => item.id === itemId);
            if (!targetItem) return;
            const oldWeight = clamp(Number(targetItem.weight || 0), 0, 100);
            const newWeight = clamp(Number(patch.weight || 0), 0, 100);
            const nextTotal = extrasInternalWeightTotal - oldWeight + newWeight;
            if (Math.abs(nextTotal - 100) > 0.001) {
                setBlockFeedback({
                    type: 'error',
                    message: 'No se puede guardar: la suma interna de Extras debe ser exactamente 100%.'
                });
                return;
            }
        }

        setBlockFeedback({ type: '', message: '' });
        await updateDoc(doc(db, 'subjectEvaluationItems', itemId), {
            ...patch,
            updatedAt: serverTimestamp()
        });
    };

    const deleteEvaluationItem = async (itemId) => {
        const confirmed = window.confirm('Se eliminara esta evaluacion y sus notas asociadas. Quieres continuar?');
        if (!confirmed) return;

        const relatedGradesQuery = query(
            collection(db, 'subjectEvaluationGrades'),
            where('subjectId', '==', subject.id),
            where('itemId', '==', itemId)
        );

        const relatedGradesSnapshot = await getDocs(relatedGradesQuery);
        const batch = writeBatch(db);

        relatedGradesSnapshot.docs.forEach((gradeDoc) => {
            batch.delete(doc(db, 'subjectEvaluationGrades', gradeDoc.id));
        });

        batch.delete(doc(db, 'subjectEvaluationItems', itemId));
        await batch.commit();
    };

    const saveStudentGrade = async (item, studentUid, rawValue) => {
        const key = `${item.id}:${studentUid}`;
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

    const saveAssignmentReview = async (quiz, studentUid, rawValue) => {
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

    const studentView = (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2">Notas</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Resumen por bloques</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tests obligatorios, tareas entregables y actividades extra.</p>
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
                                <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-slate-200">Tests obligatorios</td>
                                <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{blockWeights.mandatoryTestsWeight}%</td>
                                <td className="py-3 pr-3 text-slate-800 dark:text-slate-200 font-bold">{studentFinalData.mandatoryDecimal !== null ? studentFinalData.mandatoryDecimal.toFixed(2) : '--'}</td>
                                <td className="py-3 text-slate-700 dark:text-slate-300 font-semibold">
                                    {studentFinalData.mandatoryDecimal !== null ? ((studentFinalData.mandatoryDecimal * blockWeights.mandatoryTestsWeight) / 100).toFixed(2) : '--'}
                                </td>
                            </tr>
                            <tr className="border-b border-slate-50 dark:border-slate-800/70">
                                <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-slate-200">Tareas entregables</td>
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
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Divide la nota en tests obligatorios, tareas entregables y extras.</p>
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
                        <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Tests obligatorios</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={blockWeightsDraft.mandatoryTestsWeight}
                            onChange={(event) => setBlockWeightsDraft((prev) => ({ ...prev, mandatoryTestsWeight: clamp(Number(event.target.value || 0), 0, 100) }))}
                            className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        />
                    </label>
                    <label className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 block">
                        <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Tareas entregables</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={blockWeightsDraft.assignmentsWeight}
                            onChange={(event) => setBlockWeightsDraft((prev) => ({ ...prev, assignmentsWeight: clamp(Number(event.target.value || 0), 0, 100) }))}
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
                            onChange={(event) => setBlockWeightsDraft((prev) => ({ ...prev, extrasWeight: clamp(Number(event.target.value || 0), 0, 100) }))}
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
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Ponderacion interna de tests obligatorios (referencia 100%)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Aqui decides cuanto pesa cada test dentro del bloque de tests obligatorios.</p>
                <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Personalizar pesos de tests obligatorios
                    </p>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className={`text-xs font-bold ${mandatoryCustomWeightsEnabled ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
                            {mandatoryCustomWeightsEnabled ? 'Activado' : 'Iguales'}
                        </span>
                        <input
                            type="checkbox"
                            checked={mandatoryCustomWeightsEnabled}
                            onChange={(event) => updateCustomMode('mandatoryCustomWeightsEnabled', event.target.checked)}
                            className="h-4 w-4"
                        />
                    </label>
                </div>
                <div className={`text-sm font-semibold mb-3 ${hasMandatoryInternal100 ? 'text-slate-600 dark:text-slate-300' : 'text-red-600 dark:text-red-300'}`}>
                    Total interno: {mandatoryInternalWeightTotal.toFixed(0)}%
                </div>
                {mandatoryCustomWeightsEnabled && Math.abs(mandatoryInternalWeightTotal - 100) > 0.001 && (
                    <div className="mb-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                        {mandatoryInternalDiff > 0
                            ? `Faltan ${mandatoryInternalDiff.toFixed(2)}% en Tests obligatorios para poder guardar.`
                            : `Te pasas por ${Math.abs(mandatoryInternalDiff).toFixed(2)}% en Tests obligatorios. Ajusta hasta 100%.`}
                    </div>
                )}
                <div className="space-y-3">
                    {mandatoryQuizzes.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">No hay tests obligatorios.</div>
                    )}
                    {mandatoryQuizzes.map((quiz) => (
                        <div key={quiz.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{quiz.title || quiz.name || 'Test'}</p>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    key={`mandatory-${quiz.id}-${mandatoryCustomWeightsEnabled ? 'custom' : 'equal'}`}
                                    defaultValue={getMandatoryWeightForQuiz(quiz)}
                                    onBlur={(event) => updateQuizInternalWeight(quiz.id, { mandatoryWeight: clamp(Number(event.target.value || 0), 0, 100) }, 'mandatory')}
                                    readOnly={!mandatoryCustomWeightsEnabled}
                                    disabled={!mandatoryCustomWeightsEnabled}
                                    className="w-28 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold disabled:opacity-70"
                                />
                                <Percent className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Ponderacion interna de tareas entregables (referencia 100%)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Asigna mas valor a ciertas tareas si lo necesitas.</p>
                <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Personalizar pesos de tareas entregables
                    </p>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className={`text-xs font-bold ${assignmentCustomWeightsEnabled ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
                            {assignmentCustomWeightsEnabled ? 'Activado' : 'Iguales'}
                        </span>
                        <input
                            type="checkbox"
                            checked={assignmentCustomWeightsEnabled}
                            onChange={(event) => updateCustomMode('assignmentCustomWeightsEnabled', event.target.checked)}
                            className="h-4 w-4"
                        />
                    </label>
                </div>
                <div className={`text-sm font-semibold mb-3 ${hasAssignmentsInternal100 ? 'text-slate-600 dark:text-slate-300' : 'text-red-600 dark:text-red-300'}`}>
                    Total interno: {assignmentsInternalWeightTotal.toFixed(0)}%
                </div>
                {assignmentCustomWeightsEnabled && Math.abs(assignmentsInternalWeightTotal - 100) > 0.001 && (
                    <div className="mb-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                        {assignmentsInternalDiff > 0
                            ? `Faltan ${assignmentsInternalDiff.toFixed(2)}% en Tareas entregables para poder guardar.`
                            : `Te pasas por ${Math.abs(assignmentsInternalDiff).toFixed(2)}% en Tareas entregables. Ajusta hasta 100%.`}
                    </div>
                )}
                <div className="space-y-3">
                    {assignmentQuizzes.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">No hay tareas entregables.</div>
                    )}
                    {assignmentQuizzes.map((quiz) => (
                        <div key={quiz.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-indigo-500" /> {quiz.title || quiz.name || 'Tarea'}</p>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    key={`assignment-${quiz.id}-${assignmentCustomWeightsEnabled ? 'custom' : 'equal'}`}
                                    defaultValue={getAssignmentWeightForQuiz(quiz)}
                                    onBlur={(event) => updateQuizInternalWeight(quiz.id, { assignmentWeight: clamp(Number(event.target.value || 0), 0, 100), countsForGrade: true }, 'assignments')}
                                    readOnly={!assignmentCustomWeightsEnabled}
                                    disabled={!assignmentCustomWeightsEnabled}
                                    className="w-28 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold disabled:opacity-70"
                                />
                                <Percent className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Anadir actividad extra</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                        type="text"
                        value={newItem.title}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="Ej: Exposicion oral"
                        className="md:col-span-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                    />
                    <input
                        type="text"
                        value={newItem.category}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, category: event.target.value }))}
                        placeholder="Categoria"
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                    />
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={newItem.weight}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, weight: event.target.value }))}
                        placeholder="Peso interno %"
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                    />
                    <input
                        type="number"
                        min="1"
                        value={newItem.maxScore}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, maxScore: event.target.value }))}
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
                <div className={`text-sm font-semibold mb-3 ${hasExtrasInternal100 ? 'text-slate-600 dark:text-slate-300' : 'text-red-600 dark:text-red-300'}`}>
                    Total interno: {extrasInternalWeightTotal.toFixed(0)}%
                </div>
                {Math.abs(extrasInternalWeightTotal - 100) > 0.001 && (
                    <div className="mb-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                        {extrasInternalDiff > 0
                            ? `Faltan ${extrasInternalDiff.toFixed(2)}% en Extras para poder guardar.`
                            : `Te pasas por ${Math.abs(extrasInternalDiff).toFixed(2)}% en Extras. Ajusta hasta 100%.`}
                    </div>
                )}
                <div className="space-y-3">
                    {evaluationItems.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">Aun no has creado actividades extra.</div>
                    )}
                    {evaluationItems.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                            </div>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                defaultValue={item.weight}
                                onBlur={(event) => updateEvaluationItem(item.id, { weight: clamp(Number(event.target.value || 0), 0, 100) })}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold w-full md:w-28"
                                title="Peso interno %"
                            />
                            <input
                                type="number"
                                min="1"
                                defaultValue={item.maxScore || 10}
                                onBlur={(event) => updateEvaluationItem(item.id, { maxScore: Math.max(1, Number(event.target.value || 10)) })}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold w-full md:w-28"
                                title="Nota maxima"
                            />
                            <button
                                onClick={() => deleteEvaluationItem(item.id)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-semibold"
                            >
                                <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                        </div>
                    ))}
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
                                    <th className="py-3 pr-3 text-left font-bold text-slate-500 dark:text-slate-400">Tests obligatorios</th>
                                    <th className="py-3 pr-3 text-left font-bold text-slate-500 dark:text-slate-400">Tareas entregables</th>
                                    <th className="py-3 pr-3 text-left font-bold text-slate-500 dark:text-slate-400">Extras</th>
                                    <th className="py-3 text-left font-bold text-slate-500 dark:text-slate-400">Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                {targetStudents.map((student) => {
                                    const finalData = getFinalForUser(student.uid);
                                    return (
                                        <tr key={student.uid} className="border-b border-slate-50 dark:border-slate-800/70 align-top">
                                            <td className="py-3 pr-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-3 font-bold text-slate-700 dark:text-slate-200">
                                                {finalData.mandatoryDecimal !== null ? finalData.mandatoryDecimal.toFixed(2) : '--'}
                                            </td>
                                            <td className="py-3 pr-3">
                                                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                                                    {finalData.assignmentsDecimal !== null ? finalData.assignmentsDecimal.toFixed(2) : '--'}
                                                </div>
                                                <div className="space-y-1">
                                                    {assignmentQuizzes.map((quiz) => {
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
                                                                    onChange={(event) => setReviewDrafts((prev) => ({ ...prev, [key]: event.target.value }))}
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
                                                    {evaluationItems.map((item) => {
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
        </div>
    );

    return <section>{canManage ? managerView : studentView}</section>;
};

export default SubjectGradesPanel;
